#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import * as prompts from "@clack/prompts";
const execPromise = util.promisify(exec);

// ===== 配置和常量 =====
const CONFIG = {
  outputDir: path.join(process.cwd(), "toolSoftware", "icons"),
  iconSize: 64,
  dataPath: path.join(process.cwd(), "toolSoftware", "data.js"),
  onlyMissingIcons: false,
  concurrency: 10, // 增加并发数以提高性能
  retryAttempts: 2, // 失败操作的重试次数
  batchSize: 50,    // 批处理大小
  debug: false,     // 调试模式
  verbose: false   // 详细模式
};

// 添加缓存机制
const CACHE = {
  appPaths: new Map(), // 缓存应用路径查询结果
  displayNames: new Map() // 缓存应用显示名称
};

// 颜色常量
const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m"
};

// ===== 工具函数 =====

/**
 * 用颜色包装文本
 * @param {string} text 要显示的文本
 * @param {string} color 颜色代码
 * @returns {string} 带颜色的文本
 */
function colorize(text, color) {
  return `${color}${text}${COLORS.reset}`;
}

/**
 * 打印日志消息
 */
const logger = {
  info: (message) => console.log(message),
  success: (message) => console.log(colorize(message, COLORS.green)),
  warn: (message) => console.log(colorize(message, COLORS.yellow)),
  error: (message) => console.error(colorize(`错误: ${message}`, COLORS.red)),
  section: (title) => console.log(`\n${colorize("=".repeat(10) + " " + title + " " + "=".repeat(10), COLORS.cyan)}`)
};

/**
 * 移除字符串中的.app后缀
 * @param {string} name 应用名称
 * @returns {string} 处理后的名称
 */
function removeAppSuffix(name) {
  return name.replace(/\.app$/i, "");
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
 * 包装命令执行并处理错误
 * @param {string} command 要执行的命令
 * @param {string} errorMessage 错误消息
 * @returns {Promise<string>} 命令输出
 */
async function safeExec(command, errorMessage) {
  try {
    const { stdout } = await execPromise(command);
    return stdout.trim();
  } catch (error) {
    if (errorMessage) {
      throw new Error(`${errorMessage}: ${error.message}`);
    }
    return "";
  }
}

// ===== 核心功能 =====

/**
 * 检查环境和文件是否存在
 */
async function checkEnvironment() {
  // 检查是否在macOS上运行
  if (process.platform !== "darwin") {
    throw new Error("此工具仅支持macOS系统");
  }

  // 检查数据文件是否存在
  if (!fs.existsSync(CONFIG.dataPath)) {
    throw new Error(`数据文件不存在: ${CONFIG.dataPath}`);
  }

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    logger.info(`已创建输出目录: ${CONFIG.outputDir}`);
  }
}

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
        { label: "只处理缺少图标的应用", value: true },
        { label: "处理所有应用", value: false }
      ],
    });

    // 用户按Ctrl+C取消
    if (prompts.isCancel(mode)) {
      prompts.cancel("操作已取消");
      process.exit(0);
    }

    const modeText = mode ? "只处理缺少图标的应用" : "处理所有应用";
    prompts.log.success(`已选择: ${modeText}`);

    // 结束交互
    prompts.outro("开始处理应用...");

    return mode;
  } catch (error) {
    logger.error(`无法显示交互菜单: ${error.message}`);
    logger.info("请安装 @clack/prompts: npm install @clack/prompts");
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 * @returns {boolean} 是否需要显示菜单
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let showMenuNeeded = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--only-missing" || args[i] === "-m") {
      CONFIG.onlyMissingIcons = true;
      showMenuNeeded = false;
      logger.info(colorize("模式: 只处理缺少图标的应用", COLORS.cyan));
    } else if (args[i] === "--all" || args[i] === "-a") {
      CONFIG.onlyMissingIcons = false;
      showMenuNeeded = false;
      logger.info(colorize("模式: 处理所有应用", COLORS.cyan));
    } else if (args[i] === "--help" || args[i] === "-h") {
      showHelp();
      process.exit(0);
    } else if (args[i] === "--verbose" || args[i] === "-v") {
      CONFIG.verbose = true;
      logger.info(colorize("模式: 详细输出", COLORS.cyan));
    }
  }

  return showMenuNeeded;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
${colorize("Mac应用图标提取工具", COLORS.cyan)}

用法:
  macAppIconFetcher.js [选项]

选项:
  --only-missing, -m   只处理缺少图标的应用
  --all, -a            处理所有应用 (默认)
  --help, -h           显示此帮助信息
  --verbose, -v        详细输出模式，默认关闭

说明:
  此工具会从Mac系统中查找应用程序并提取其图标，
  保存到toolSoftware/icons目录中，并更新data.js文件。
  
  如果不提供选项，将显示交互式菜单供选择。
  `);
}

/**
 * 限制并发执行Promise的辅助函数
 * @param {Array} items 需要处理的项目
 * @param {Function} fn 处理函数
 * @param {number} concurrency 最大并发数
 * @returns {Promise<Array>} 处理结果
 */
async function promisePool(items, fn, concurrency) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

/**
 * 根据应用名称查找应用路径 (优化版)
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 应用路径
 */
async function findAppPath(appName) {
  try {
    // 检查缓存
    if (CACHE.appPaths.has(appName)) {
      return CACHE.appPaths.get(appName);
    }

    // 优化查询 - 一次性查找并缓存多个应用
    const exactQuery = `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '${appName}'" | head -1`;
    let appPath = await safeExec(exactQuery);

    if (!appPath) {
      const fuzzyQuery = `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '*${appName}*'" | head -1`;
      appPath = await safeExec(fuzzyQuery);
    }

    if (!appPath) {
      throw new Error(`找不到应用 "${appName}"`);
    }

    // 保存到缓存
    CACHE.appPaths.set(appName, appPath);
    return appPath;
  } catch (error) {
    throw new Error(`查找应用路径出错: ${error.message}`);
  }
}

/**
 * 使用多种方法获取应用的真实显示名称 (优化版)
 * @param {string} appPath 应用路径
 * @returns {Promise<string>} 应用显示名称
 */
async function getAppDisplayName(appPath) {
  try {
    // 检查缓存
    if (CACHE.displayNames.has(appPath)) {
      return CACHE.displayNames.get(appPath);
    }

    // 优化: 减少查询方法数量，只使用最可靠的方法
    // 1. 从Finder获取显示名称 (最可靠)
    try {
      const appleScript = `tell application "Finder" to get displayed name of (POSIX file "${appPath}" as alias)`;
      const displayedName = await safeExec(`osascript -e '${appleScript}'`);
      
      if (displayedName) {
        const result = removeAppSuffix(displayedName);
        CACHE.displayNames.set(appPath, result);
        return result;
      }
    } catch (e) {
      // 忽略错误，尝试下一个方法
    }
    
    // 2. 使用文件名（去掉.app后缀）作为备选
    const basename = path.basename(appPath, ".app");
    const result = removeAppSuffix(basename);
    CACHE.displayNames.set(appPath, result);
    return result;
  } catch (error) {
    // 出错时使用文件名
    const basename = path.basename(appPath, ".app");
    return removeAppSuffix(basename);
  }
}

/**
 * 从应用包中查找图标文件
 * @param {string} appPath 应用路径
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 图标文件路径
 */
async function findAppIconFile(appPath, appName) {
  try {
    // 首先尝试从Info.plist读取CFBundleIconFile
    const iconName = await safeExec(
      `defaults read "${appPath}/Contents/Info" CFBundleIconFile || echo ""`,
      `读取应用"${appName}"的图标名称信息出错`
    );
    
    // 处理图标名称
    let iconFile = iconName;
    
    // 检查图标名称是否为空
    if (!iconFile || iconFile.trim() === "") {
      // 如果Info.plist没有图标信息，尝试使用通用图标命名规则查找
      if (CONFIG.verbose) {
        logger.warn(`应用 "${appName}" 的Info.plist中没有定义图标名称`);
      }
      
      // 尝试使用常见图标命名方式
      const possibleIconNames = [
        "AppIcon.icns",
        `${appName}.icns`,
        "Icon.icns"
      ];
      
      // 检查Resources目录中是否存在这些图标文件
      for (const name of possibleIconNames) {
        const possiblePath = path.join(appPath, "Contents", "Resources", name);
        if (fs.existsSync(possiblePath)) {
          iconFile = name;
          if (CONFIG.verbose) {
            logger.info(`找到备选图标: ${name}`);
          }
          break;
        }
      }
      
      // 如果仍未找到图标，尝试在Resources目录中查找任何.icns文件
      if (!iconFile) {
        try {
          const resourcesDir = path.join(appPath, "Contents", "Resources");
          const files = fs.readdirSync(resourcesDir);
          const icnsFile = files.find(file => file.endsWith('.icns'));
          
          if (icnsFile) {
            iconFile = icnsFile;
            if (CONFIG.verbose) {
              logger.info(`找到备选图标: ${icnsFile}`);
            }
          }
        } catch (e) {
          // 忽略读取目录的错误
        }
      }
      
      // 如果仍未找到任何图标，使用应用本身作为图标源
      if (!iconFile) {
        if (CONFIG.verbose) {
          logger.warn(`未找到图标文件，将使用应用本身作为图标源`);
        }
        return appPath;
      }
    }

    // 有些图标没有扩展名，需要添加.icns
    if (iconFile && !iconFile.endsWith(".icns")) {
      iconFile = `${iconFile}.icns`;
    }

    // 构建完整的图标路径
    const fullIconPath = path.join(appPath, "Contents", "Resources", iconFile);
    
    // 检查图标文件是否存在
    if (!fs.existsSync(fullIconPath)) {
      // 如果图标文件不存在，使用应用本身作为图标源
      if (CONFIG.verbose) {
        logger.warn(`图标文件不存在: ${fullIconPath}，将使用应用本身作为图标源`);
      }
      return appPath;
    }

    return fullIconPath;
  } catch (error) {
    // 出错时使用应用本身作为图标源
    if (CONFIG.verbose) {
      logger.warn(`查找图标出错: ${error.message}，将使用应用本身作为图标源`);
    }
    return appPath;
  }
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
  const iconPath = path.join(CONFIG.outputDir, app.icon);
  if (!fs.existsSync(iconPath)) {
    return true;
  }

  // 图标文件存在，不缺少图标
  return false;
}

/**
 * 计时器函数
 * @returns {Object} 计时器对象
 */
function createTimer() {
  const startTime = Date.now();
  return {
    elapsed: () => (Date.now() - startTime) / 1000,
    reset: () => startTime = Date.now()
  };
}

// 添加进度条组件
const progress = {
  total: 0,
  current: 0,
  timer: createTimer(),
  start: (total) => {
    progress.total = total;
    progress.current = 0;
    progress.timer = createTimer();
    logger.info(`\n准备处理 ${total} 个应用...`);
  },
  update: (increment = 1) => {
    progress.current += increment;
    const percent = Math.floor((progress.current / progress.total) * 100);
    const elapsed = progress.timer.elapsed();
    const estimatedTotal = (elapsed / progress.current) * progress.total;
    const remaining = estimatedTotal - elapsed;
    
    // 每10%更新一次进度，避免过多输出
    if (progress.current === 1 || progress.current === progress.total || percent % 10 === 0) {
      logger.info(colorize(
        `进度: ${percent}% (${progress.current}/${progress.total}) - 已用时间: ${elapsed.toFixed(1)}秒 - 预计剩余: ${remaining.toFixed(1)}秒`,
        COLORS.blue
      ));
    }
  },
  finish: () => {
    const elapsed = progress.timer.elapsed();
    logger.success(`完成！总耗时: ${elapsed.toFixed(2)}秒，平均每个应用 ${(elapsed / progress.total).toFixed(2)}秒`);
  }
};

/**
 * 带重试的执行函数
 * @param {Function} fn 要执行的函数
 * @param {number} retries 重试次数
 * @param {number} delay 重试延迟(ms)
 * @returns {Promise<any>} 函数结果
 */
async function withRetry(fn, retries = CONFIG.retryAttempts, delay = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    if (CONFIG.debug) {
      logger.warn(`操作失败，${retries}秒后重试: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
}

/**
 * 从应用提取图标并更新应用数据 (优化版)
 * @param {string} appPath 应用路径
 * @param {Object} app 应用对象
 * @returns {Promise<string>} 图标保存路径
 */
async function extractIconAndUpdateApp(appPath, app) {
  // 预检查以避免重复工作
  if (app.icon) {
    const iconPath = path.join(CONFIG.outputDir, app.icon);
    if (fs.existsSync(iconPath)) {
      // 检查文件大小，确保不是空文件或损坏文件
      const stats = fs.statSync(iconPath);
      if (stats.size > 1000) { // 一个有效图标至少应该有1KB
        return iconPath; // 静默跳过，不再输出日志
      }
      // 出现问题时不打印警告，只在最后汇总展示
    }
  }

  try {
    // 使用应用名称作为图标文件名，确保不含.app后缀
    const appName = removeAppSuffix(app.text);
    const iconFileName = `${appName}.png`;
    const iconPath = path.join(CONFIG.outputDir, iconFileName);

    // 查找应用中的图标
    await withRetry(async () => {
      // 更高效的图标提取方式
      const iconFile = await findAppIconFile(appPath, appName);
      
      // 根据不同情况使用不同的提取命令
      if (iconFile === appPath) {
        // 如果图标源是应用本身，使用两步提取方法
        // 第一步: 尝试使用macOS系统自带方法提取图标
        try {
          // 使用临时文件而不是进程替换
          const tempIconPath = path.join(CONFIG.outputDir, `temp_${Date.now()}.png`);
          
          // 首先尝试使用sips直接从应用程序获取图标
          await safeExec(
            `sips -s format png "${appPath}/Contents/Resources/AppIcon.icns" --out "${tempIconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize} 2>/dev/null`,
            ""
          );
          
          // 检查临时文件是否成功创建
          if (fs.existsSync(tempIconPath) && fs.statSync(tempIconPath).size > 1000) {
            // 成功创建临时文件，移动到目标位置
            fs.renameSync(tempIconPath, iconPath);
          } else {
            // 尝试从系统获取应用图标
            await safeExec(
              `sips -s format png "${appPath}" --out "${iconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize}`,
              "提取应用图标失败"
            );
          }
        } catch (e) {
          // 如果上述方法都失败，尝试最后的方法
          await safeExec(
            `sips -s format png "${appPath}" --out "${iconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize}`,
            "提取应用图标失败"
          );
        }
      } else {
        // 正常情况，从图标文件提取
        await safeExec(
          `sips -s format png "${iconFile}" --out "${iconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize}`,
          "提取图标失败"
        );
      }
    });

    // 验证图标是否有效
    if (!fs.existsSync(iconPath)) {
      throw new Error("图标提取失败，文件未创建");
    }
    
    const stats = fs.statSync(iconPath);
    if (stats.size < 1000) {
      throw new Error(`图标可能损坏，文件过小 (${stats.size} 字节)`);
    }

    // 更新应用对象的icon属性 - 只存储文件名，不带路径
    app.icon = path.basename(iconPath);
    return iconPath;
  } catch (error) {
    throw new Error(`提取图标出错: ${error.message}`);
  }
}

/**
 * 更新应用的字段
 * @param {Object} originalApp 原始应用对象
 * @param {Object} updatedApp 更新后的应用对象
 * @param {string} content 文件内容
 * @param {Function} updateContent 内容更新回调
 * @returns {number} 更新的字段数量
 */
function updateAppFields(originalApp, updatedApp, content, updateContent) {
  let count = 0;
  let newContent = content;

  // 更新 text 字段
  if (originalApp.text !== updatedApp.text) {
    const textRegex = new RegExp(
      `(text\\s*:\\s*)['"]${escapeRegExp(originalApp.text)}['"]`,
      "g"
    );
    newContent = newContent.replace(textRegex, `$1'${updatedApp.text}'`);
    logger.success(`更新应用名称: ${originalApp.text} -> ${updatedApp.text}`);
    count++;
  }

  // 更新 icon 字段
  if (updatedApp.icon && originalApp.icon !== updatedApp.icon) {
    if (originalApp.icon) {
      // 替换现有的 icon 字段
      const iconRegex = new RegExp(
        `(icon\\s*:\\s*)['"]${escapeRegExp(originalApp.icon)}['"]`,
        "g"
      );
      newContent = newContent.replace(iconRegex, `$1'${updatedApp.icon}'`);
      logger.success(`更新图标名称: ${updatedApp.text} -> ${updatedApp.icon}`);
      count++;
    } else {
      // 如果原来没有 icon 字段，在 text 字段后添加
      const appRegex = new RegExp(
        `(text\\s*:\\s*['"]${escapeRegExp(updatedApp.text)}['"])([,\\s]*?)`,
        "g"
      );
      newContent = newContent.replace(
        appRegex,
        `$1,\n      icon: '${updatedApp.icon}'$2`
      );
      logger.success(`添加图标名称: ${updatedApp.text} -> ${updatedApp.icon}`);
      count++;
    }
  }

  updateContent(newContent);
  return count;
}

/**
 * 保存更新后的数据到文件
 * @param {string} filePath 文件路径
 * @param {Array} updatedData 更新后的数据
 * @returns {Promise<number>} 更新的字段数量
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
    let updateCount = 0;

    // 对每个类别进行处理
    for (let i = 0; i < originalData.length; i++) {
      const originalCategory = originalData[i];
      const updatedCategory = updatedData[i];

      // 跳过没有 items 的类别
      if (!Array.isArray(originalCategory?.items) || !Array.isArray(updatedCategory?.items)) {
        continue;
      }

      // 对每个应用进行处理
      for (let j = 0; j < originalCategory.items.length; j++) {
        if (j >= updatedCategory.items.length) break;

        const originalApp = originalCategory.items[j];
        const updatedApp = updatedCategory.items[j];

        // 更新字段
        updateCount += updateAppFields(
          originalApp,
          updatedApp,
          modifiedContent,
          (newContent) => {
            modifiedContent = newContent;
          }
        );
      }
    }

    // 只有在内容发生变化时才写入文件
    if (updateCount > 0) {
      fs.writeFileSync(filePath, modifiedContent, "utf-8");
      logger.success(`已保存数据文件，更新了 ${updateCount} 个字段`);
    } else {
      logger.info("数据文件没有变化，跳过保存");
    }

    return updateCount;
  } catch (error) {
    throw new Error(`保存数据文件出错: ${error.message}`);
  }
}

/**
 * 处理单个应用
 * @param {Object} app 应用对象
 * @returns {Promise<{success: boolean, updated: boolean, skipped?: boolean, error?: string}>} 处理结果
 */
async function processApp(app) {
  try {
    // 检查应用是否缺少图标
    const iconMissing = isIconMissing(app);

    // 如果只处理缺少图标的应用，则跳过已有图标的应用
    if (CONFIG.onlyMissingIcons && !iconMissing) {
      return { success: true, updated: false, skipped: true };
    }

    // 简化输出，减少频繁日志
    if (CONFIG.verbose) {
      logger.info(`处理应用: ${app.text}${iconMissing ? colorize(" (缺少图标)", COLORS.yellow) : ""}`);
    }

    // 查找应用路径
    const appPath = await findAppPath(app.text);
    // 获取应用的真实显示名称
    const displayName = await getAppDisplayName(appPath);

    // 检查名称差异
    if (displayName !== app.text) {
      // 确认使用哪个名称 - 优先使用真实显示名称，除非它看起来不正确
      const shouldUpdate = displayName.length > 0 && 
                          displayName.length < 50 &&
                          !/^[0-9.]+$/.test(displayName); // 避免纯数字和版本号
      
      if (shouldUpdate) {
        // 更新为显示名称，但只在verbose模式输出
        if (CONFIG.verbose) {
          logger.success(`更新为显示名称: "${app.text}" -> "${displayName}"`);
        }
        app.text = removeAppSuffix(displayName);
      }
    }

    // 提取图标并更新应用对象
    await extractIconAndUpdateApp(appPath, app);

    return { success: true, updated: true };
  } catch (error) {
    return { success: false, updated: false, error: error.message };
  }
}

/**
 * 并行处理应用类别
 * @param {Array} categories 应用类别数组
 * @returns {Promise<{dataUpdated: boolean, failedApps: Array, skippedApps: Array}>}
 */
async function processCategories(categories) {
  // 收集所有需要处理的应用
  const allApps = [];
  
  // 先遍历所有类别，收集需要处理的应用
  for (const category of categories) {
    if (!Array.isArray(category.items)) continue;
    
    for (const app of category.items) {
      if (!app.text) continue;
      
      // 预先检查是否需要处理
      const iconMissing = isIconMissing(app);
      if (CONFIG.onlyMissingIcons && !iconMissing) {
        continue; // 跳过已有图标的应用
      }
      
      allApps.push({
        app,
        category,
        iconMissing
      });
    }
  }
  
  // 启动进度跟踪
  progress.start(allApps.length);
  
  let dataUpdated = false;
  const failedApps = [];
  const skippedApps = [];
  
  // 分批处理应用以避免内存压力
  for (let i = 0; i < allApps.length; i += CONFIG.batchSize) {
    const batch = allApps.slice(i, i + CONFIG.batchSize);
    
    // 并行处理当前批次
    const results = await promisePool(batch, async ({app, category, iconMissing}) => {
      try {
        const result = await withRetry(() => processApp(app));
        
        if (result.success) {
          if (result.updated) {
            dataUpdated = true;
          } else if (result.skipped) {
            skippedApps.push(app.text);
          }
        } else {
          // 不再输出错误信息，只收集起来
          failedApps.push({
            name: app.text,
            error: result.error,
          });
        }
        
        progress.update();
        return result;
      } catch (error) {
        progress.update();
        // 不再输出错误信息，只收集起来
        failedApps.push({
          name: app.text,
          error: error.message,
        });
        return { success: false, error: error.message };
      }
    }, CONFIG.concurrency);
  }
  
  // 完成进度
  progress.finish();
  
  return { dataUpdated, failedApps, skippedApps };
}

/**
 * 主函数 - 应用入口点 (优化版)
 */
async function main() {
  const mainTimer = createTimer();
  
  try {
    // 检查环境和解析参数
    await checkEnvironment();
    const needMenu = parseArgs();
    
    if (needMenu) {
      CONFIG.onlyMissingIcons = await showMenu();
    }
    
    // 引入预加载技术
    logger.info("加载数据文件...");
    const dataPromise = import(CONFIG.dataPath);
    
    // 预热文件系统缓存
    logger.info("准备输出目录...");
    const preWarmPromise = preWarmFileSystem();
    
    // 等待所有预加载完成
    const [dataModule] = await Promise.all([dataPromise, preWarmPromise]);
    const data = dataModule.data || dataModule.default;
    
    // 使用优化后的类别处理
    const { dataUpdated, failedApps, skippedApps } = 
      await processCategories(data);
    
    // 如果有数据更新，保存到文件
    if (dataUpdated) {
      await saveDataToFile(CONFIG.dataPath, data);
    }
    
    // 输出详细统计信息
    const totalTime = mainTimer.elapsed();
    logger.success(colorize(`\n处理完成! 总耗时: ${totalTime.toFixed(2)}秒`, COLORS.green));
    
    // 显示统计信息
    const stats = {
      total: data.reduce((sum, cat) => sum + (cat.items?.length || 0), 0),
      processed: data.reduce((sum, cat) => sum + (cat.items?.filter(i => i.icon)?.length || 0), 0),
      skipped: skippedApps.length,
      failed: failedApps.length,
      updatedTexts: 0, // 这个需要在处理过程中计数
      updatedIcons: 0  // 这个需要在处理过程中计数
    };
    
    logger.info("\n" + colorize("===== 统计信息 =====", COLORS.cyan));
    logger.info(`总应用数: ${stats.total}`);
    logger.info(`已处理应用: ${stats.processed} (${((stats.processed/stats.total)*100).toFixed(1)}%)`);
    
    if (CONFIG.onlyMissingIcons && skippedApps.length > 0) {
      logger.info(`已跳过应用: ${skippedApps.length}`);
    }
    
    if (failedApps.length > 0) {
      logger.error(`\n以下 ${failedApps.length} 个应用处理失败:`);
      
      // 错误类型分类改进
      const errorsByType = {};
      failedApps.forEach(app => {
        let errorType = "其他错误";
        
        if (app.error.includes("提取图标出错")) {
          errorType = "图标提取错误";
        } else if (app.error.includes("找不到应用") || app.error.includes("查找应用路径出错")) {
          errorType = "应用路径错误";
        } else if (app.error.includes("无法获取显示名称")) {
          errorType = "名称获取错误";
        }
        
        errorsByType[errorType] = errorsByType[errorType] || [];
        errorsByType[errorType].push(app);
      });
      
      // 按错误类型分组显示
      Object.entries(errorsByType).forEach(([type, apps]) => {
        logger.info(colorize(`\n【${type}】(${apps.length}个)`, COLORS.yellow));
        
        apps.forEach((app, index) => {
          if (index < 10 || apps.length < 20) {
            logger.error(`  ${index + 1}. ${app.name}: ${app.error}`);
          } else if (index === 10) {
            logger.error(`  ... 以及 ${apps.length - 10} 个其他应用`);
          }
        });
      });
    } else {
      logger.success("所有处理的应用均成功!");
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

/**
 * 预热文件系统缓存
 */
async function preWarmFileSystem() {
  try {
    // 读取输出目录内容到缓存
    if (fs.existsSync(CONFIG.outputDir)) {
      const files = fs.readdirSync(CONFIG.outputDir);
      for (const file of files.slice(0, 10)) {
        try {
          // 只读取前几个文件的元数据，足以激活文件系统缓存
          fs.statSync(path.join(CONFIG.outputDir, file));
        } catch (e) {
          // 忽略单个文件的错误
        }
      }
    }
  } catch (e) {
    // 忽略预热错误
  }
}

// 直接运行主函数
logger.info(colorize("Mac应用图标提取工具 - 开始处理", COLORS.cyan));
main();
