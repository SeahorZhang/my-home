#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import * as prompts from "@clack/prompts";
const execPromise = util.promisify(exec);

// 固定配置选项
const OUTPUT_DIR = path.join(process.cwd(), "toolSoftware", "icons");
const ICON_SIZE = 64;
const DATA_PATH = path.join(process.cwd(), "toolSoftware", "data.js");

// 默认处理模式 - 处理所有应用
let ONLY_MISSING_ICONS = false;

/**
 * 显示交互式菜单供用户选择
 * @returns {Promise<boolean>} 是否只处理缺失图标
 */
async function showMenu() {
  try {
    // 初始化提示
    prompts.intro("Mac应用图标提取工具");

    // 创建菜单选择项
    const mode = await prompts.select({
      message: "请选择处理模式",
      options: [
        { label: "处理所有应用", value: false },
        { label: "只处理缺少图标的应用", value: true },
      ],
    });

    // 用户按Ctrl+C取消
    if (prompts.isCancel(mode)) {
      prompts.cancel("操作已取消");
      process.exit(0);
    }

    prompts.log.success(
      `已选择: ${mode ? "只处理缺少图标的应用" : "处理所有应用"}`
    );

    // 结束交互
    prompts.outro("开始处理应用...");

    return mode;
  } catch (error) {
    console.error("无法显示交互菜单:", error.message);
    console.log("请安装 @clack/prompts: npm install @clack/prompts");
    process.exit(1);
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  let showMenuNeeded = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--only-missing" || args[i] === "-m") {
      ONLY_MISSING_ICONS = true;
      showMenuNeeded = false;
      console.log("模式: 只处理缺少图标的应用");
    } else if (args[i] === "--all" || args[i] === "-a") {
      ONLY_MISSING_ICONS = false;
      showMenuNeeded = false;
      console.log("模式: 处理所有应用");
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log(`
Mac应用图标提取工具

用法:
  macAppIconFetcher.js [选项]

选项:
  --only-missing, -m   只处理缺少图标的应用
  --all, -a            处理所有应用 (默认)
  --help, -h           显示此帮助信息

说明:
  此工具会从Mac系统中查找应用程序并提取其图标，
  保存到toolSoftware/icons目录中，并更新data.js文件。
  
  如果不提供选项，将显示交互式菜单供选择。
      `);
      process.exit(0);
    }
  }

  return showMenuNeeded;
}

/**
 * 根据应用名称查找应用路径
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 应用路径
 */
async function findAppPath(appName) {
  try {
    // 使用mdfind查找应用路径，优先完全匹配
    const { stdout } = await execPromise(
      `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '${appName}'" | head -1`
    );

    let appPath = stdout.trim();

    // 如果没有完全匹配，尝试部分匹配
    if (!appPath) {
      const { stdout: fuzzyStdout } = await execPromise(
        `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '*${appName}*'" | head -1`
      );
      appPath = fuzzyStdout.trim();
    }

    if (!appPath) {
      throw new Error(`找不到应用 "${appName}"`);
    }

    return appPath;
  } catch (error) {
    throw new Error(`查找应用路径出错: ${error.message}`);
  }
}

/**
 * 从应用提取图标并更新应用数据
 * @param {string} appPath 应用路径
 * @param {string} outputPath 输出路径
 * @param {number} size 图标大小
 * @param {Object} app 应用对象
 * @returns {Promise<string>} 图标保存路径
 */
async function extractIconAndUpdateApp(appPath, outputPath, size, app) {
  try {
    const appName = app.text;
    const iconPath = path.join(outputPath, `${appName}.png`);

    // 创建输出目录（如果不存在）
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 查找应用中的图标路径
    const { stdout: iconName } = await execPromise(
      `defaults read "${appPath}/Contents/Info" CFBundleIconFile || echo ""`
    );
    let iconFile = iconName.trim();

    // 有些图标没有扩展名，需要添加.icns
    if (iconFile && !iconFile.endsWith(".icns")) {
      iconFile += ".icns";
    }

    if (!iconFile) {
      // 如果Info.plist中没有指定图标，查找Resources目录中的.icns文件
      const { stdout } = await execPromise(
        `find "${appPath}/Contents/Resources" -name "*.icns" | head -1`
      );
      iconFile = stdout.trim();

      if (!iconFile) {
        throw new Error(`无法找到应用 "${appName}" 的图标`);
      }
    } else {
      iconFile = path.join(appPath, "Contents", "Resources", iconFile);
    }

    // 使用sips提取图标并转换为PNG
    await execPromise(
      `sips -s format png "${iconFile}" --out "${iconPath}" --resampleHeightWidth ${size} ${size}`
    );

    // 更新应用对象的icon属性 - 只存储文件名，不带路径
    app.icon = path.basename(iconPath);

    return iconPath;
  } catch (error) {
    throw new Error(`提取图标出错: ${error.message}`);
  }
}

/**
 * 保存更新后的数据到文件
 * @param {string} filePath 文件路径
 * @param {Array} updatedData 更新后的数据数组
 */
async function saveDataToFile(filePath, updatedData) {
  try {
    // 读取原始文件内容
    const content = fs.readFileSync(filePath, "utf-8");
    // 重新导入原始数据以进行比较
    const originalModule = await import(`${filePath}?t=${Date.now()}`);
    const originalData = originalModule.data || originalModule.default;

    // 创建一个修改后的内容副本
    let modifiedContent = content;

    // 对每个类别进行处理
    for (let i = 0; i < originalData.length; i++) {
      const originalCategory = originalData[i];
      const updatedCategory = updatedData[i];

      // 跳过没有 items 的类别
      if (
        !Array.isArray(originalCategory.items) ||
        !Array.isArray(updatedCategory.items)
      ) {
        continue;
      }

      // 对每个应用进行处理
      for (let j = 0; j < originalCategory.items.length; j++) {
        if (j >= updatedCategory.items.length) break;

        const originalApp = originalCategory.items[j];
        const updatedApp = updatedCategory.items[j];

        // 只更新 text 字段
        if (originalApp.text !== updatedApp.text) {
          // 更新 text 字段 - 精确匹配以避免错误替换
          const textRegex = new RegExp(
            `(text\\s*:\\s*)['"]${escapeRegExp(originalApp.text)}['"]`,
            "g"
          );
          modifiedContent = modifiedContent.replace(
            textRegex,
            `$1'${updatedApp.text}'`
          );
          console.log(
            `更新应用名称: ${originalApp.text} -> ${updatedApp.text}`
          );
        }

        // 更新 icon 字段
        if (updatedApp.icon && originalApp.icon !== updatedApp.icon) {
          if (originalApp.icon) {
            // 替换现有的 icon 字段 - 精确匹配以避免错误替换
            const iconRegex = new RegExp(
              `(icon\\s*:\\s*)['"]${escapeRegExp(originalApp.icon)}['"]`,
              "g"
            );
            modifiedContent = modifiedContent.replace(
              iconRegex,
              `$1'${updatedApp.icon}'`
            );
            console.log(
              `更新图标名称: ${originalApp.text} -> ${updatedApp.icon}`
            );
          } else {
            // 如果原来没有 icon 字段，在 text 字段后添加
            const appRegex = new RegExp(
              `(text\\s*:\\s*['"]${escapeRegExp(
                updatedApp.text
              )}['"])([,\\s]*?)`,
              "g"
            );
            modifiedContent = modifiedContent.replace(
              appRegex,
              `$1,\n      icon: '${updatedApp.icon}'$2`
            );
            console.log(
              `添加图标名称: ${updatedApp.text} -> ${updatedApp.icon}`
            );
          }
        }
      }
    }

    // 如果内容没有变化，不需要写入
    if (modifiedContent === content) {
      console.log("文件内容没有变化，跳过写入");
      return;
    }

    // 写入文件
    fs.writeFileSync(filePath, modifiedContent, "utf-8");
    console.log(`已更新数据文件: ${filePath}`);
  } catch (error) {
    console.error(`保存数据文件错误详情: ${error.stack}`);
    throw new Error(`保存数据文件失败: ${error.message}`);
  }
}

/**
 * 转义正则表达式中的特殊字符
 * @param {string} string 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 检查应用是否缺少图标
 * @param {Object} app 应用对象
 * @returns {boolean} 是否缺少图标
 */
function isIconMissing(app) {
  // 如果没有icon字段，则认为缺少图标
  if (!app.icon) {
    return true;
  }

  // 如果有icon字段，检查对应的图片文件是否存在
  const iconPath = path.join(OUTPUT_DIR, app.icon);
  if (!fs.existsSync(iconPath)) {
    console.log(`图标文件不存在: ${iconPath}`);
    return true;
  }

  // 图标文件存在，不缺少图标
  return false;
}

/**
 * 主函数 - 直接处理数据文件中的所有应用
 */
async function main() {
  try {
    // 解析命令行参数，判断是否需要显示菜单
    const needMenu = parseArgs();

    // 如果没有通过命令行指定处理模式，显示交互式菜单
    if (needMenu) {
      ONLY_MISSING_ICONS = await showMenu();
    }

    console.log("导入数据文件...");

    // 导入data.js
    const dataModule = await import(DATA_PATH);
    const data = dataModule.data || dataModule.default;

    // 记录是否有数据更新
    let dataUpdated = false;

    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 记录失败的应用
    const failedApps = [];
    // 记录跳过的应用
    const skippedApps = [];

    // 遍历所有类别
    for (const category of data) {
      if (!Array.isArray(category.items)) continue;

      console.log(`========== 处理类别: ${category.text} ==========`);

      // 遍历类别中的所有应用
      for (const app of category.items) {
        if (!app.text) continue;

        // 检查应用是否缺少图标
        const iconMissing = isIconMissing(app);

        // 如果只处理缺少图标的应用，则跳过已有图标的应用
        if (ONLY_MISSING_ICONS && !iconMissing) {
          skippedApps.push(app.text);
          continue;
        }

        try {
          console.log(
            `处理应用: ${app.text}${iconMissing ? " (缺少图标)" : ""}`
          );
          // 查找应用路径
          const appPath = await findAppPath(app.text);

          // 获取应用的实际显示名称（而不是文件系统名称）
          const displayName = path.basename(appPath, ".app");

          // 使用文件系统名称作为备用
          const fsName = path.basename(appPath, ".app");

          // 只使用data.js中的原始名称或者UI显示名称，不使用文件系统名称
          if (displayName !== app.text && displayName !== fsName) {
            console.log(
              `应用名称差异: "${app.text}" -> "${displayName}" (文件系统: "${fsName}")`
            );

            // 确认使用哪个名称 - 优先使用显示名称，除非它看起来不正确
            if (displayName.length > 0 && displayName.length < 50) {
              // 更新为显示名称
              app.text = displayName;
              dataUpdated = true;
              console.log(`  更新为显示名称: "${displayName}"`);
            } else {
              // 保留原名称
              console.log(`  保留原名称: "${app.text}"`);
            }
          }

          // 提取图标并更新应用对象
          await extractIconAndUpdateApp(appPath, OUTPUT_DIR, ICON_SIZE, app);
          dataUpdated = true;
        } catch (error) {
          console.error(`处理应用"${app.text}"出错: ${error.message}`);
          // 记录失败的应用
          failedApps.push({
            name: app.text,
            error: error.message,
          });
        }
      }
    }

    // 如果有数据更新，保存到文件
    if (dataUpdated) {
      await saveDataToFile(DATA_PATH, data);
    }

    // 输出处理结果
    console.log("\n处理完成!");

    // 显示跳过的应用数量
    if (ONLY_MISSING_ICONS && skippedApps.length > 0) {
      console.log(`\n已跳过 ${skippedApps.length} 个已有图标的应用`);
    }

    // 显示失败的应用
    if (failedApps.length > 0) {
      console.log(`\n以下 ${failedApps.length} 个应用处理失败:`);
      failedApps.forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.name}: ${app.error}`);
      });
    } else {
      console.log("所有处理的应用均成功!");
    }
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 直接运行主函数
console.log("Mac应用图标提取工具 - 开始处理");
main();
