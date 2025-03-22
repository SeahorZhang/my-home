#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { fileURLToPath } from "node:url";
const execPromise = util.promisify(exec);

// 固定配置选项
const OUTPUT_DIR = path.join(process.cwd(), "toolSoftware", "icons");
const ICON_SIZE = 64;
const DATA_PATH = path.join(process.cwd(), "toolSoftware", "data.js");

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
    
    // 更新应用对象的icon属性
    const relativePath = path.relative(process.cwd(), iconPath).replace(/\\/g, '/');
    app.icon = `./icons/${path.basename(iconPath)}`;
    
    return iconPath;
  } catch (error) {
    throw new Error(`提取图标出错: ${error.message}`);
  }
}

/**
 * 保存更新后的数据到文件
 * @param {string} filePath 文件路径
 * @param {Array} data 更新后的数据数组
 */
async function saveDataToFile(filePath, data) {
  try {
    // 读取原始文件内容
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 将数据转换为格式化的字符串
    const dataStr = JSON.stringify(data, null, 2)
      // 将JSON格式转换为JS格式
      .replace(/"([^"]+)":/g, '$1:')
      // 将双引号转换为单引号
      .replace(/"/g, "'");
    
    // 查找原始数据部分
    const exportMatch = content.match(/(export\s+(?:const|let|var)\s+data\s*=\s*)\[[\s\S]*?\](;?)/);
    
    if (!exportMatch) {
      throw new Error('无法找到data导出声明');
    }
    
    // 替换数据部分，保留导出声明
    const updatedContent = content.replace(
      exportMatch[0],
      `${exportMatch[1]}${dataStr}${exportMatch[2]}`
    );
    
    // 写入文件
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`已更新数据文件: ${filePath}`);
  } catch (error) {
    throw new Error(`保存数据文件失败: ${error.message}`);
  }
}

/**
 * 主函数 - 直接处理数据文件中的所有应用
 */
async function main() {
  try {
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

    // 遍历所有类别
    for (const category of data) {
      if (!Array.isArray(category.items)) continue;
      
      console.log(`处理类别: ${category.text}`);
      
      // 遍历类别中的所有应用
      for (const app of category.items) {
        if (!app.text) continue;
        
        try {
          console.log(`处理应用: ${app.text}`);
          // 查找应用路径
          const appPath = await findAppPath(app.text);
          
          // 获取实际应用名称
          const actualAppName = path.basename(appPath, ".app");
          if (actualAppName !== app.text) {
            console.log(`  应用名称差异: "${app.text}" -> "${actualAppName}"`);
            // 更新应用名称为实际名称
            app.text = actualAppName;
            dataUpdated = true;
          }
          
          // 提取图标并更新应用对象
          await extractIconAndUpdateApp(appPath, OUTPUT_DIR, ICON_SIZE, app);
          dataUpdated = true;
        } catch (error) {
          console.error(`  处理应用"${app.text}"出错: ${error.message}`);
          // 记录失败的应用
          failedApps.push({
            name: app.text,
            error: error.message
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
    
    // 显示失败的应用
    if (failedApps.length > 0) {
      console.log(`\n以下 ${failedApps.length} 个应用处理失败:`);
      failedApps.forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.name}: ${app.error}`);
      });
    } else {
      console.log("所有应用处理成功!");
    }
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 直接运行主函数
console.log("Mac应用图标提取工具 - 开始处理");
main();
