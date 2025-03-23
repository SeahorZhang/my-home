import fs from "node:fs";
import path from "node:path";
import { CONFIG } from "./config.js";
import { logger } from "./logger.js";
import {
  safeExec,
  promisePool,
  removeAppSuffix,
  escapeRegExp,
} from "./utils.js";
import { extractAppIcon } from "./iconExtractor.js";

// ================ 查找器功能 ================

/**
 * 通过名称查找应用路径
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 应用路径
 */
export async function findAppPath(appName) {
  try {
    // 直接进行查询
    const exactQuery = `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '${appName}'" | head -1`;
    let appPath = await safeExec(exactQuery);

    if (!appPath) {
      const fuzzyQuery = `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '*${appName}*'" | head -1`;
      appPath = await safeExec(fuzzyQuery);
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
 * 使用Swift脚本获取应用显示名称
 * @param {string} appPath 应用路径
 * @returns {Promise<string>} 应用显示名称
 */
export async function getAppDisplayName(appPath) {
  try {
    // 使用import.meta.url代替__dirname
    const swiftScriptPath = new URL("getAppDisplayName.swift", import.meta.url)
      .pathname;
    const displayName = await safeExec(
      `chmod +x "${swiftScriptPath}" && "${swiftScriptPath}" "${appPath}"`
    );

    // 处理Swift脚本返回的显示名称
    if (displayName && displayName.trim()) {
      return removeAppSuffix(displayName.trim());
    }

    // 作为最后的后备方案，使用文件名(不带.app后缀)
    const basename = path.basename(appPath, ".app");
    return removeAppSuffix(basename);
  } catch (error) {
    logger.warn(`获取应用显示名称出错: ${error.message}`);
    // 出错时使用文件名
    const basename = path.basename(appPath, ".app");
    return removeAppSuffix(basename);
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
 * 提取应用图标并更新应用对象
 * @param {string} appPath 应用路径
 * @param {Object} app 应用对象
 * @returns {Promise<string>} 图标保存路径
 */
export async function extractIconAndUpdateApp(appPath, app) {
  // 准备路径
  const appName = removeAppSuffix(app.text);
  const iconFileName = `${appName}.png`;
  const iconPath = path.join(CONFIG.paths.output, iconFileName);

  // 确保目录存在
  fs.mkdirSync(CONFIG.paths.output, { recursive: true });

  try {
    await extractAppIcon(appPath, iconPath, CONFIG.iconSize);
    app.icon = iconFileName;
    return iconPath;
  } catch (error) {
    throw new Error(`提取图标失败: ${error.message}`);
  }
}

/**
 * 更新应用字段并在内容中替换
 * @param {Object} originalApp 原始应用对象
 * @param {Object} updatedApp 更新后的应用对象
 * @param {string} content 文件内容
 * @param {Function} updateContent 内容更新函数
 * @returns {number} 更新字段数
 */
export function updateAppFields(
  originalApp,
  updatedApp,
  content,
  updateContent
) {
  let updatedContent = content;
  let fieldCount = 0;

  // 只处理两个应用都有相同ID或关键字段的情况
  if (!originalApp || !updatedApp) return 0;

  // 检查文本字段
  if (originalApp.text !== updatedApp.text) {
    try {
      // 构造匹配文本属性的正则表达式，考虑可能的空格和引号变化
      const textRegex = new RegExp(
        `text:\\s*["']${escapeRegExp(originalApp.text)}["']`,
        "g"
      );
      const newContent = updatedContent.replace(
        textRegex,
        `text: "${updatedApp.text}"`
      );

      // 只有在内容变化时才计数
      if (newContent !== updatedContent) {
        updatedContent = newContent;
        fieldCount++;
        logger.debug(
          `更新应用名称: "${originalApp.text}" -> "${updatedApp.text}"`
        );
      }
    } catch (e) {
      // 忽略正则表达式错误
      logger.warn(`更新应用名称时出错: ${e.message}`);
    }
  }

  // 图标字段
  if (originalApp.icon !== updatedApp.icon) {
    try {
      if (originalApp.icon) {
        // 替换现有图标字段
        const iconRegex = new RegExp(
          `icon:\\s*["']${escapeRegExp(originalApp.icon)}["']`,
          "g"
        );
        updatedContent = updatedContent.replace(
          iconRegex,
          `icon: "${updatedApp.icon}"`
        );
      } else {
        // 在文本字段后添加新图标字段
        const textRegex = new RegExp(
          `text:\\s*["']${escapeRegExp(updatedApp.text)}["']`,
          "g"
        );
        updatedContent = updatedContent.replace(
          textRegex,
          `text: "${updatedApp.text}", icon: "${updatedApp.icon}"`
        );
      }
      fieldCount++;
    } catch (e) {
      // 忽略正则表达式错误
      logger.warn(`更新应用图标时出错: ${e.message}`);
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
    const originalModule = await import(`${filePath}?update=${Date.now()}`);
    const originalData = originalModule.data || originalModule.default;

    // 创建修改内容的副本
    let modifiedContent = content;
    let updateCount = 0;

    // 处理每个分类
    for (let i = 0; i < originalData.length; i++) {
      const originalCategory = originalData[i];
      const updatedCategory = updatedData[i];

      // 跳过没有项目的分类
      if (
        !Array.isArray(originalCategory?.items) ||
        !Array.isArray(updatedCategory?.items)
      ) {
        continue;
      }

      // 处理每个应用
      for (let j = 0; j < originalCategory.items.length; j++) {
        if (j >= updatedCategory.items.length) break;

        const originalApp = originalCategory.items[j];
        const updatedApp = updatedCategory.items[j];

        // 更新字段
        const fieldsUpdated = updateAppFields(
          originalApp,
          updatedApp,
          modifiedContent,
          (newContent) => {
            modifiedContent = newContent;
          }
        );

        updateCount += fieldsUpdated;

        // 如果没有更新，但应用名称不同，尝试直接替换文本
        if (fieldsUpdated === 0 && originalApp.text !== updatedApp.text) {
          // 直接在内容中替换应用名称
          const escapedOriginal = escapeRegExp(originalApp.text);
          const replaceRegex = new RegExp(
            `text:\\s*["']${escapedOriginal}["']`,
            "g"
          );
          const replacement = `text: "${updatedApp.text}"`;

          const newContent = modifiedContent.replace(replaceRegex, replacement);
          if (newContent !== modifiedContent) {
            modifiedContent = newContent;
            updateCount++;
            logger.info(
              `强制更新应用名称: "${originalApp.text}" -> "${updatedApp.text}"`
            );
          }
        }
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
    logger.error(`保存数据文件出错: ${error.message}`);
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

    // 查找应用路径 - 使用原有的findAppPath函数
    let appPath;
    try {
      appPath = await findAppPath(app.text);
      if (!appPath) {
        throw new Error(`找不到应用 "${app.text}"`);
      }
    } catch (error) {
      return {
        success: false,
        updated: false,
        error: `查找应用路径出错: ${error.message}`,
      };
    }

    // 从应用包中获取真实显示名称
    const swiftScriptPath = new URL("getAppDisplayName.swift", import.meta.url)
      .pathname;
    const swiftResult = await safeExec(
      `chmod +x "${swiftScriptPath}" && "${swiftScriptPath}" "${appPath}"`
    );
    const displayName = removeAppSuffix(swiftResult.trim());

    // 处理应用名称更新
    let nameUpdated = false;

    // 检查名称差异并更新
    if (displayName !== app.text) {
      // 除非显示名称看起来不正确，否则优先使用真实显示名称
      const shouldUpdate =
        displayName.length > 0 &&
        displayName.length < 50 &&
        !/^[0-9.]+$/.test(displayName); // 避免纯数字/版本号

      if (shouldUpdate) {
        // 更新为显示名称，仅在详细模式下输出
        if (CONFIG.verbose) {
          logger.success(`更新为显示名称: "${app.text}" -> "${displayName}"`);
        }
        app.text = displayName;
        nameUpdated = true;
      }
    }

    // 提取图标并更新应用对象
    let iconUpdated = false;
    try {
      await extractIconAndUpdateApp(appPath, app);
      iconUpdated = true;
    } catch (error) {
      if (CONFIG.verbose) {
        logger.warn(`提取图标失败: ${error.message}`);
      }
    }

    return {
      success: true,
      updated: nameUpdated || iconUpdated,
      nameUpdated,
      iconUpdated,
    };
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
  // 收集所有需要处理的应用
  const allApps = categories
    .filter((category) => category && Array.isArray(category.items))
    .flatMap((category) =>
      category.items
        .filter((app) => app && app.text)
        .map((app) => {
          const iconMissing = isIconMissing(app);
          // 如果只处理缺少图标的应用，则跳过有图标的应用
          if (CONFIG.onlyMissingIcons && !iconMissing) {
            return null;
          }
          return { app, category, iconMissing };
        })
    )
    .filter(Boolean); // 移除null值

  // 如果没有应用需要处理，直接返回
  if (allApps.length === 0) {
    logger.info("没有找到需要处理的应用");
    return { dataUpdated: false, failedApps: [], skippedApps: [] };
  }

  let dataUpdated = false;
  const failedApps = [];
  const skippedApps = [];

  // 并行处理所有应用
  await promisePool(
    allApps,
    async ({ app, category, iconMissing }) => {
      try {
        const result = await processApp(app);

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

        return result;
      } catch (error) {
        // 只收集错误，不输出
        failedApps.push({
          name: app.text,
          error: error.message,
        });
        return { success: false, error: error.message };
      }
    },
    CONFIG.concurrency
  );

  return { dataUpdated, failedApps, skippedApps };
}
