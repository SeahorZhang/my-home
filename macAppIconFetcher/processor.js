import fs from "node:fs";
import path from "node:path";
import { CONFIG } from './config.js';
import { logger, progress } from './logger.js';
import { withRetry, safeExec, promisePool, removeAppSuffix, escapeRegExp } from './utils.js';
import { findAppPath, getAppDisplayName, findAppIconFile, isIconMissing } from './finder.js';

/**
 * Extract app icon and update app data
 * @param {string} appPath App path
 * @param {Object} app App object
 * @returns {Promise<string>} Icon save path
 */
export async function extractIconAndUpdateApp(appPath, app) {
  // Pre-check to avoid duplicate work
  if (app.icon) {
    const iconPath = path.join(CONFIG.outputDir, app.icon);
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
    const iconPath = path.join(CONFIG.outputDir, iconFileName);
    
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
    });

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
 * Update app fields in data file content
 * @param {Object} originalApp Original app object
 * @param {Object} updatedApp Updated app object
 * @param {string} content File content
 * @param {Function} updateContent Content update callback
 * @returns {number} Number of updated fields
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
 * Save updated data to file
 * @param {string} filePath File path
 * @param {Array} updatedData Updated data
 * @returns {Promise<number>} Number of updated fields
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
 * Process single app
 * @param {Object} app App object
 * @returns {Promise<Object>} Processing result
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
 * Process app categories in parallel
 * @param {Array} categories App categories array
 * @returns {Promise<Object>} Processing results
 */
export async function processCategories(categories) {
  // Collect all apps that need processing
  const allApps = [];
  
  // First scan all categories to collect apps to process
  for (const category of categories) {
    if (!Array.isArray(category.items)) continue;
    
    for (const app of category.items) {
      if (!app.text) continue;
      
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
        const result = await withRetry(() => processApp(app));
        
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