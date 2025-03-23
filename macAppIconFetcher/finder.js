import fs from "node:fs";
import path from "node:path";
import { CONFIG, CACHE } from './config.js';
import { safeExec, removeAppSuffix } from './utils.js';
import { logger } from './logger.js';

/**
 * Find app path by name
 * @param {string} appName App name
 * @returns {Promise<string>} App path
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
 * Get app display name using multiple methods
 * @param {string} appPath App path
 * @returns {Promise<string>} App display name
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
 * Find app icon file in application bundle
 * @param {string} appPath App path
 * @param {string} appName App name
 * @returns {Promise<string>} Icon file path
 */
export async function findAppIconFile(appPath, appName) {
  try {
    // Try to read CFBundleIconFile from Info.plist
    const iconName = await safeExec(
      `defaults read "${appPath}/Contents/Info" CFBundleIconFile || echo ""`,
      `读取应用"${appName}"的图标名称信息出错`
    );
    
    // Process icon name
    let iconFile = iconName;
    
    if (!iconFile || iconFile.trim() === "") {
      // If no icon info in Info.plist, try common icon naming patterns
      if (CONFIG.verbose) {
        logger.warn(`应用 "${appName}" 的Info.plist中没有定义图标名称，尝试查找通用图标`);
      }
      
      // Check common icon file names in Resources directory
      const commonIconNames = ["AppIcon.icns", "Icon.icns", `${appName}.icns`];
      const resourcesDir = path.join(appPath, "Contents", "Resources");
      
      if (fs.existsSync(resourcesDir)) {
        // Try known common names first
        for (const name of commonIconNames) {
          const iconPath = path.join(resourcesDir, name);
          if (fs.existsSync(iconPath)) {
            return iconPath;
          }
        }
        
        // If not found, try to find any .icns file
        try {
          const files = fs.readdirSync(resourcesDir);
          const icnsFile = files.find(file => file.endsWith('.icns'));
          if (icnsFile) {
            return path.join(resourcesDir, icnsFile);
          }
          
          // If still not found, try to find .png files
          const pngFile = files.filter(file => file.endsWith('.png'))
            .sort((a, b) => {
              try {
                // Prefer larger files
                const sizeA = fs.statSync(path.join(resourcesDir, a)).size;
                const sizeB = fs.statSync(path.join(resourcesDir, b)).size;
                return sizeB - sizeA;
              } catch (e) {
                return 0;
              }
            })[0];
          
          if (pngFile) {
            return path.join(resourcesDir, pngFile);
          }
        } catch (e) {
          // Ignore read errors
        }
      }
    } else {
      // Add .icns extension if needed
      if (!iconFile.endsWith(".icns")) {
        iconFile = `${iconFile}.icns`;
      }
      
      // Return full path
      return path.join(appPath, "Contents", "Resources", iconFile);
    }

    // If all attempts fail, use app itself
    return appPath;
  } catch (error) {
    if (CONFIG.verbose) {
      logger.warn(`查找图标文件出错: ${error.message}`);
    }
    return appPath;
  }
}

/**
 * Check if app is missing an icon
 * @param {Object} app App object
 * @returns {boolean} Whether icon is missing
 */
export function isIconMissing(app) {
  // Consider missing if no icon field
  if (!app.icon) {
    return true;
  }

  // Check if icon file exists
  const iconPath = path.join(CONFIG.outputDir, app.icon);
  if (!fs.existsSync(iconPath)) {
    return true;
  }

  // Icon file exists
  return false;
} 