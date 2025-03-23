import { CONFIG } from "./config.js";
import { logger } from "./logger.js";
import { colorize, COLORS } from "./utils.js";
import { checkEnvironment } from "./environment.js";
import { parseArgs, showMenu } from "./ui.js";
import { processCategories, saveDataToFile } from "./core.js";
import * as p from "@clack/prompts";

/**
 * 加载数据模块
 * @returns {Promise<Object>} 数据模块
 */
async function loadDataModule() {
  const dataModule = await import(CONFIG.paths.data);
  // 处理不同的导出格式
  return dataModule.default;
}

/**
 * 提取图标的主函数
 * @returns {Promise<Object>} 处理结果
 */
export async function fetchIcons() {
  // 创建 spinner 用于加载提示
  let spinner = p.spinner();

  try {
    // 检查环境
    await checkEnvironment();

    // 加载数据
    spinner.message("正在加载数据文件");
    const data = await loadDataModule();

    // 开始处理应用图标
    spinner.start("正在处理应用图标");

    // 处理分类
    const { dataUpdated, failedApps, skippedApps } = await processCategories(
      data
    );

    // 如果数据有更新，保存到文件
    if (dataUpdated) {
      spinner.message("正在保存更新的数据");
      await saveDataToFile(CONFIG.paths.data, data);
    }

    // 计算处理结果
    const processed = calculateProcessedCount(data);

    spinner.stop(`处理完成: ${processed} 个应用`);

    // 显示结果
    await outputResults(data, failedApps, skippedApps);

    return {
      success: true,
      data,
      stats: {
        processed,
        failed: failedApps.length,
        skipped: skippedApps.length,
      },
    };
  } catch (error) {
    // 确保出错时关闭 spinner
    spinner.stop(`错误: ${error.message}`);
    logger.error(error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 计算处理的应用总数
 * @param {Array} data 数据数组
 * @returns {number} 处理的应用数量
 */
function calculateProcessedCount(data) {
  return data.reduce(
    (sum, cat) => sum + (cat.items?.filter((i) => i.icon)?.length || 0),
    0
  );
}

/**
 * 命令行入口函数
 */
export async function main() {
  try {
    // 解析命令行参数
    CONFIG.onlyMissingIcons = parseArgs()
      ? await showMenu()
      : CONFIG.onlyMissingIcons;

    // 调用主函数
    const result = await fetchIcons();

    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

/**
 * 输出处理结果统计
 */
async function outputResults(data, failedApps, skippedApps) {
  // 计算统计数据
  const stats = {
    total: data.reduce((sum, cat) => sum + (cat.items?.length || 0), 0),
    processed: data.reduce(
      (sum, cat) => sum + (cat.items?.filter((i) => i.icon)?.length || 0),
      0
    ),
    skipped: skippedApps.length,
    failed: failedApps.length,
  };

  // 显示统计信息
  logger.info("\n" + colorize("===== 统计信息 =====", COLORS.cyan));
  logger.info(
    `总应用数: ${stats.total} | 已处理: ${stats.processed} | 失败: ${stats.failed} | 跳过: ${stats.skipped}`
  );

  // 如果有失败，显示失败详情
  if (failedApps.length > 0) {
    // 错误分组（每个应用只属于一个组）
    const errorGroups = {};

    // 先将错误分组
    failedApps.forEach((app) => {
      if (app.error.includes("提取图标出错")) {
        errorGroups["图标提取错误"] = errorGroups["图标提取错误"] || [];
        errorGroups["图标提取错误"].push(app);
      } else if (
        app.error.includes("找不到应用") ||
        app.error.includes("查找应用路径出错")
      ) {
        errorGroups["应用路径错误"] = errorGroups["应用路径错误"] || [];
        errorGroups["应用路径错误"].push(app);
      } else if (app.error.includes("无法获取显示名称")) {
        errorGroups["名称获取错误"] = errorGroups["名称获取错误"] || [];
        errorGroups["名称获取错误"].push(app);
      } else {
        errorGroups["其他错误"] = errorGroups["其他错误"] || [];
        errorGroups["其他错误"].push(app);
      }
    });

    // 显示错误汇总
    logger.error(`\n处理失败: ${failedApps.length} 个应用`);

    // 显示各类错误
    Object.entries(errorGroups).forEach(([type, apps]) => {
      if (apps.length === 0) return;

      logger.info(colorize(`\n【${type}】(${apps.length}个)`, COLORS.yellow));

      // 限制显示数量
      const displayCount = Math.min(10, apps.length);
      apps.slice(0, displayCount).forEach((app, i) => {
        logger.error(`  ${i + 1}. ${app.name}: ${app.error}`);
      });

      if (apps.length > displayCount) {
        logger.error(`  ... 以及 ${apps.length - displayCount} 个其他应用`);
      }
    });
  } else if (stats.processed > 0) {
    logger.success("所有处理的应用均成功!");
  }
}

// 仅当作为脚本运行时执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  logger.info(colorize("Mac应用图标提取工具 - 开始处理", COLORS.cyan));
  main();
}
