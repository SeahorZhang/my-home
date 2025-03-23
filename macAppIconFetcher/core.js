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
    // Check cache
    if (CACHE.appPaths.has(appName)) {
      return CACHE.appPaths.get(appName);
    }

    // Optimized query - find and cache multiple apps at once
    const exactQuery = `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '${appName}'" | head -1`;
    let appPath = await safeExec(exactQuery);

    if (!appPath) {
      const fuzzyQuery = `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '*${appName}*'" | head -1`;
      appPath = await safeExec(fuzzyQuery);
    }

    if (!appPath) {
      throw new Error(`找不到应用 "${appName}"`);
    }

    // Save to cache
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
    // Check cache
    if (CACHE.displayNames.has(appPath)) {
      return CACHE.displayNames.get(appPath);
    }

    // Use the most reliable method first
    try {
      const appleScript = `tell application "Finder" to get displayed name of (POSIX file "${appPath}" as alias)`;
      const displayedName = await safeExec(`osascript -e '${appleScript}'`);
      
      if (displayedName) {
        const result = removeAppSuffix(displayedName);
        CACHE.displayNames.set(appPath, result);
        return result;
      }
    } catch (e) {
      // Ignore error, try next method
    }
    
    // Use file name (without .app suffix) as fallback
    const basename = path.basename(appPath, ".app");
    const result = removeAppSuffix(basename);
    CACHE.displayNames.set(appPath, result);
    return result;
  } catch (error) {
    // Use file name on error
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

// ================ Processor 功能 ================

/**
 * 提取应用图标并更新应用数据
 * @param {string} appPath 应用路径
 * @param {Object} app 应用对象
 * @returns {Promise<string>} 图标保存路径
 */
export async function extractIconAndUpdateApp(appPath, app) {
  // Pre-check to avoid duplicate work
  if (app.icon) {
    const iconPath = path.join(CONFIG.paths.output, app.icon);
    if (fs.existsSync(iconPath)) {
      // Check file size to ensure it's not empty or corrupt
      const stats = fs.statSync(iconPath);
      if (stats.size > 1000) { // A valid icon should be at least 1KB
        return iconPath; // Skip silently
      }
    }
  }

  try {
    // Use app name as icon file name, ensure no .app suffix
    const appName = removeAppSuffix(app.text);
    const iconFileName = `${appName}.png`;
    const iconPath = path.join(CONFIG.paths.output, iconFileName);
    
    // Find and extract icon
    await withRetry(async () => {
      const iconFile = await findAppIconFile(appPath, appName);
      
      // Extract icon - use unified extraction command
      await safeExec(
        `sips -s format png "${iconFile}" --out "${iconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize}`,
        "提取图标失败"
      );
      
      // Check extraction result
      if (!fs.existsSync(iconPath) || fs.statSync(iconPath).size < 1000) {
        // If extraction failed, try directly from the app
        await safeExec(
          `sips -s format png "${appPath}" --out "${iconPath}" --resampleHeightWidth ${CONFIG.iconSize} ${CONFIG.iconSize}`,
          "提取应用图标失败"
        );
      }
    }, CONFIG.retries);

    // Validate icon
    if (!fs.existsSync(iconPath)) {
      throw new Error("图标提取失败，文件未创建");
    }
    
    const stats = fs.statSync(iconPath);
    if (stats.size < 1000) {
      throw new Error(`图标可能损坏，文件过小 (${stats.size} 字节)`);
    }

    // Update app object's icon property - store only file name, not path
    app.icon = path.basename(iconPath);
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
  let count = 0;
  let newContent = content;

  // Update text field
  if (originalApp.text !== updatedApp.text) {
    const textRegex = new RegExp(
      `(text\\s*:\\s*)['"]${escapeRegExp(originalApp.text)}['"]`,
      "g"
    );
    newContent = newContent.replace(textRegex, `$1'${updatedApp.text}'`);
    logger.success(`更新应用名称: ${originalApp.text} -> ${updatedApp.text}`);
    count++;
  }

  // Update icon field
  if (updatedApp.icon && originalApp.icon !== updatedApp.icon) {
    if (originalApp.icon) {
      // Replace existing icon field
      const iconRegex = new RegExp(
        `(icon\\s*:\\s*)['"]${escapeRegExp(originalApp.icon)}['"]`,
        "g"
      );
      newContent = newContent.replace(iconRegex, `$1'${updatedApp.icon}'`);
      logger.success(`更新图标名称: ${updatedApp.text} -> ${updatedApp.icon}`);
      count++;
    } else {
      // If no existing icon field, add after text field
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
 * 保存数据到文件
 * @param {string} filePath 文件路径
 * @param {Array} updatedData 更新后的数据
 * @returns {Promise<number>} 更新字段数
 */
export async function saveDataToFile(filePath, updatedData) {
  try {
    // Read original file content
    const content = fs.readFileSync(filePath, "utf-8");

    // Re-import original data for comparison
    const originalModule = await import(`${filePath}?t=${Date.now()}`);
    const originalData = originalModule.data || originalModule.default;

    // Create a copy of modified content
    let modifiedContent = content;
    let updateCount = 0;

    // Process each category
    for (let i = 0; i < originalData.length; i++) {
      const originalCategory = originalData[i];
      const updatedCategory = updatedData[i];

      // Skip categories without items
      if (!Array.isArray(originalCategory?.items) || !Array.isArray(updatedCategory?.items)) {
        continue;
      }

      // Process each app
      for (let j = 0; j < originalCategory.items.length; j++) {
        if (j >= updatedCategory.items.length) break;

        const originalApp = originalCategory.items[j];
        const updatedApp = updatedCategory.items[j];

        // Update fields
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

    // Only write to file if content changed
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
    // Check if app is missing an icon
    const iconMissing = isIconMissing(app);

    // Skip apps with icons if only processing missing icons
    if (CONFIG.onlyMissingIcons && !iconMissing) {
      return { success: true, updated: false, skipped: true };
    }

    // Reduce frequent logging
    if (CONFIG.verbose) {
      logger.info(`处理应用: ${app.text}${iconMissing ? " (缺少图标)" : ""}`);
    }

    // Find app path
    const appPath = await findAppPath(app.text);
    // Get real display name
    const displayName = await getAppDisplayName(appPath);

    // Check for name differences
    if (displayName !== app.text) {
      // Prefer real display name unless it looks incorrect
      const shouldUpdate = displayName.length > 0 && 
                          displayName.length < 50 &&
                          !/^[0-9.]+$/.test(displayName); // Avoid pure numbers/versions
      
      if (shouldUpdate) {
        // Update to display name, only output in verbose mode
        if (CONFIG.verbose) {
          logger.success(`更新为显示名称: "${app.text}" -> "${displayName}"`);
        }
        app.text = removeAppSuffix(displayName);
      }
    }

    // Extract icon and update app object
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
  
  // Collect all apps that need processing
  const allApps = [];
  
  // First scan all categories to collect apps to process
  for (const category of categories) {
    if (!category || !Array.isArray(category.items)) continue;
    
    for (const app of category.items) {
      if (!app || !app.text) continue;
      
      // Pre-check if processing is needed
      const iconMissing = isIconMissing(app);
      if (CONFIG.onlyMissingIcons && !iconMissing) {
        continue; // Skip apps with icons
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
  
  // Start progress tracking
  progress.start(allApps.length);
  
  let dataUpdated = false;
  const failedApps = [];
  const skippedApps = [];
  
  // Process apps in batches to avoid memory pressure
  for (let i = 0; i < allApps.length; i += CONFIG.batchSize) {
    const batch = allApps.slice(i, i + CONFIG.batchSize);
    
    // Process current batch in parallel
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
          // Just collect errors, don't output
          failedApps.push({
            name: app.text,
            error: result.error,
          });
        }
        
        progress.update();
        return result;
      } catch (error) {
        progress.update();
        // Just collect errors, don't output
        failedApps.push({
          name: app.text,
          error: error.message,
        });
        return { success: false, error: error.message };
      }
    }, CONFIG.concurrency);
  }
  
  // Complete progress
  progress.finish();
  
  return { dataUpdated, failedApps, skippedApps };
} 