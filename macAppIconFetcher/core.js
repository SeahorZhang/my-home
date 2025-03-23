import fs from "node:fs";
import path from "node:path";
import { CONFIG, CACHE } from './config.js';
import { logger, progress } from './logger.js';
import { withRetry, safeExec, promisePool, removeAppSuffix, escapeRegExp } from './utils.js';

// ================ 查找器功能 ================

/**
 * 通过名称查找应用路径
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 应用路径
 */
export async function findAppPath(appName) {
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
 * 使用多种方法获取应用显示名称
 * @param {string} appPath 应用路径
 * @returns {Promise<string>} 应用显示名称
 */
export async function getAppDisplayName(appPath) {
  try {
    // 检查缓存
    if (CACHE.displayNames.has(appPath)) {
      return CACHE.displayNames.get(appPath);
    }

    // 首先使用最可靠的方法
    try {
      const appleScript = `tell application "Finder" to get displayed name of (POSIX file "${appPath}" as alias)`;
      const displayedName = await safeExec(`osascript -e '${appleScript}'`);
      
      if (displayedName) {
        const result = removeAppSuffix(displayedName);
        CACHE.displayNames.set(appPath, result);
        return result;
      }
    } catch (e) {
      // 忽略错误，尝试下一种方法
    }
    
    // 使用文件名(不带.app后缀)作为后备方案
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
 * 在应用包中查找图标文件
 * @param {string} appPath 应用路径
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 图标文件路径
 */
export async function findAppIconFile(appPath, appName) {
  try {
    // 读取Info.plist中的图标名称
    const iconName = await safeExec(
      `defaults read "${appPath}/Contents/Info" CFBundleIconFile || echo ""`,
      null
    );
    
    if (iconName && iconName.trim() !== "") {
      // 添加.icns扩展名如果需要
      const iconFile = iconName.endsWith(".icns") ? iconName : `${iconName}.icns`;
      return path.join(appPath, "Contents", "Resources", iconFile);
    }
    
    // 尝试常见图标名称
    const resourcesDir = path.join(appPath, "Contents", "Resources");
    if (fs.existsSync(resourcesDir)) {
      const commonNames = ["AppIcon.icns", "Icon.icns", `${appName}.icns`];
      
      // 检查常见名称
      for (const name of commonNames) {
        const iconPath = path.join(resourcesDir, name);
        if (fs.existsSync(iconPath)) return iconPath;
      }
      
      // 查找任何.icns文件
      try {
        const files = fs.readdirSync(resourcesDir);
        const icnsFile = files.find(file => file.endsWith('.icns'));
        if (icnsFile) return path.join(resourcesDir, icnsFile);
        
        // 尝试查找.png文件
        const pngFiles = files.filter(file => file.endsWith('.png'));
        if (pngFiles.length > 0) {
          const pngFile = pngFiles.sort((a, b) => {
            try {
              return fs.statSync(path.join(resourcesDir, b)).size - 
                     fs.statSync(path.join(resourcesDir, a)).size;
            } catch (e) {
              return 0;
            }
          })[0];
          return path.join(resourcesDir, pngFile);
        }
      } catch (e) {}
    }
    
    // 如果所有尝试都失败，使用应用本身
    return appPath;
  } catch (error) {
    if (CONFIG.verbose) {
      logger.warn(`查找图标文件出错: ${error.message}`);
    }
    return appPath;
  }
}

/**
 * 检查应用是否缺少图标
 * @param {Object} app 应用对象
 * @returns {boolean} 是否缺少图标
 */
export function isIconMissing(app) {
  if (!app.icon) return true;
  const iconPath = path.join(CONFIG.paths.output, app.icon);
  return !fs.existsSync(iconPath);
}

// ================ 处理器功能 ================

/**
 * 提取应用图标并更新应用数据
 * @param {string} appPath 应用路径
 * @param {Object} app 应用对象
 * @returns {Promise<string>} 图标保存路径
 */
export async function extractIconAndUpdateApp(appPath, app) {
  // 预检查以避免重复工作
  if (app.icon) {
    const iconPath = path.join(CONFIG.paths.output, app.icon);
    if (fs.existsSync(iconPath)) {
      // 检查文件大小确保不是空文件或损坏文件
      const stats = fs.statSync(iconPath);
      if (stats.size > 1000) { // 有效图标至少应有1KB
        return iconPath; // 静默跳过
      }
    }
  }

  try {
    // 使用应用名称作为图标文件名，确保没有.app后缀
    const appName = removeAppSuffix(app.text);
    const iconFileName = `${appName}.png`;
    const iconPath = path.join(CONFIG.paths.output, iconFileName);
    
    // 查找并提取图标
    await withRetry(async () => {
      const iconFile = await findAppIconFile(appPath, appName);
      
      // 提取图标 - 使用统一的提取命令
      await safeExec(
        `sips -s format png "${iconFile}" --out "${iconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize}`,
        "提取图标失败"
      );
      
      // 验证图标
      if (!fs.existsSync(iconPath)) {
        throw new Error("图标提取失败，文件未创建");
      }
      
      // 更新应用对象
      app.icon = iconFileName;
      
      return iconPath;
    }, CONFIG.retries);
    
    return iconPath;
  } catch (error) {
    throw new Error(`提取图标出错: ${error.message}`);
  }
}

/**
 * 更新应用字段并在内容中替换
 * @param {Object} originalApp 原始应用对象
 * @param {Object} updatedApp 更新后的应用对象
 * @param {string} content 文件内容
 * @param {Function} updateContent 内容更新函数
 * @returns {Object} 更新结果
 */
export function updateAppFields(originalApp, updatedApp, content, updateContent) {
  let updatedContent = content;
  let fieldCount = 0;
  
  // 只处理两个应用都有相同ID或关键字段的情况
  if (!originalApp || !updatedApp) return 0;
  
  // 检查每个字段
  if (originalApp.text !== updatedApp.text) {
    // 查找并替换原始名称
    try {
      // 构造匹配文本属性的正则表达式，考虑可能的空格
      const textRegex = new RegExp(`text:\\s*["']${escapeRegExp(originalApp.text)}["']`, "g");
      updatedContent = updatedContent.replace(textRegex, `text: "${updatedApp.text}"`);
      fieldCount++;
    } catch (e) {
      // 忽略正则表达式错误
    }
  }
  
  // 图标字段
  if (originalApp.icon !== updatedApp.icon) {
    try {
      if (originalApp.icon) {
        // 替换现有图标字段
        const iconRegex = new RegExp(`icon:\\s*["']${escapeRegExp(originalApp.icon)}["']`, "g");
        updatedContent = updatedContent.replace(iconRegex, `icon: "${updatedApp.icon}"`);
      } else {
        // 在文本字段后添加新图标字段
        const textRegex = new RegExp(`text:\\s*["']${escapeRegExp(updatedApp.text)}["']`, "g");
        updatedContent = updatedContent.replace(textRegex, `text: "${updatedApp.text}", icon: "${updatedApp.icon}"`);
      }
      fieldCount++;
    } catch (e) {
      // 忽略正则表达式错误
    }
  }
  
  // 内容变化时更新
  if (content !== updatedContent) {
    updateContent(updatedContent);
  }
  
  return fieldCount;
}

/**
 * 保存数据到文件
 * @param {string} filePath 文件路径
 * @param {Array} updatedData 更新后的数据
 * @returns {Promise<number>} 更新字段数
 */
export async function saveDataToFile(filePath, updatedData) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, "utf-8");
    
    // 加载原始数据模块进行比较
    const originalModule = await import(filePath);
    const originalData = originalModule.data || originalModule.default;

    // 创建修改内容的副本
    let modifiedContent = content;
    let updateCount = 0;

    // 处理每个分类
    for (let i = 0; i < originalData.length; i++) {
      const originalCategory = originalData[i];
      const updatedCategory = updatedData[i];

      // 跳过没有项目的分类
      if (!Array.isArray(originalCategory?.items) || !Array.isArray(updatedCategory?.items)) {
        continue;
      }

      // 处理每个应用
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

    // 只有在内容变化时才写入文件
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
 * @returns {Promise<Object>} 处理结果
 */
export async function processApp(app) {
  try {
    // 检查应用是否缺少图标
    const iconMissing = isIconMissing(app);

    // 如果只处理缺少图标的应用，则跳过有图标的应用
    if (CONFIG.onlyMissingIcons && !iconMissing) {
      return { success: true, updated: false, skipped: true };
    }

    // 减少频繁的日志输出
    if (CONFIG.verbose) {
      logger.info(`处理应用: ${app.text}${iconMissing ? " (缺少图标)" : ""}`);
    }

    // 查找应用路径
    const appPath = await findAppPath(app.text);
    // 获取真实显示名称
    const displayName = await getAppDisplayName(appPath);

    // 检查名称差异
    if (displayName !== app.text) {
      // 除非显示名称看起来不正确，否则优先使用真实显示名称
      const shouldUpdate = displayName.length > 0 && 
                          displayName.length < 50 &&
                          !/^[0-9.]+$/.test(displayName); // 避免纯数字/版本号
      
      if (shouldUpdate) {
        // 更新为显示名称，仅在详细模式下输出
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
 * 并行处理应用分类
 * @param {Array} categories 应用分类数组
 * @returns {Promise<Object>} 处理结果
 */
export async function processCategories(categories) {
  // 确保 categories 是一个数组
  if (!Array.isArray(categories)) {
    logger.error("无效的数据格式: categories 不是数组");
    return { dataUpdated: false, failedApps: [], skippedApps: [] };
  }
  
  // 收集所有需要处理的应用
  const allApps = [];
  
  // 首先扫描所有分类以收集需要处理的应用
  for (const category of categories) {
    if (!category || !Array.isArray(category.items)) continue;
    
    for (const app of category.items) {
      if (!app || !app.text) continue;
      
      // 预先检查是否需要处理
      const iconMissing = isIconMissing(app);
      if (CONFIG.onlyMissingIcons && !iconMissing) {
        continue; // 跳过有图标的应用
      }
      
      allApps.push({
        app,
        category,
        iconMissing
      });
    }
  }
  
  // 如果没有应用需要处理，直接返回
  if (allApps.length === 0) {
    logger.info("没有找到需要处理的应用");
    return { dataUpdated: false, failedApps: [], skippedApps: [] };
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
    await promisePool(batch, async ({app, category, iconMissing}) => {
      try {
        const result = await withRetry(() => processApp(app), CONFIG.retries);
        
        if (result.success) {
          if (result.updated) {
            dataUpdated = true;
          } else if (result.skipped) {
            skippedApps.push(app.text);
          }
        } else {
          // 只收集错误，不输出
          failedApps.push({
            name: app.text,
            error: result.error,
          });
        }
        
        progress.update();
        return result;
      } catch (error) {
        progress.update();
        // 只收集错误，不输出
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