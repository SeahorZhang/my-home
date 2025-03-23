#!/usr/bin/env node

import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { colorize, COLORS } from './utils.js';
import { checkEnvironment } from './environment.js';
import { parseArgs, showMenu } from './ui.js';
import { processCategories, saveDataToFile } from './core.js';

/**
 * Main function - application entry point
 */
async function main() {
  const startTime = Date.now();
  
  try {
    // Check environment and parse args
    await checkEnvironment();
    CONFIG.onlyMissingIcons = parseArgs() ? await showMenu() : CONFIG.onlyMissingIcons;
    
    // Load data
    logger.info("加载数据文件...");
    const dataModule = await import(CONFIG.paths.data);
    // 处理不同的导出格式
    const data = dataModule.data || dataModule.default || [];
    
    if (!Array.isArray(data)) {
      throw new Error(`数据格式错误: 预期为数组，实际为 ${typeof data}`);
    }
    
    if (data.length === 0) {
      logger.warn("数据文件中没有找到应用数据");
    }
    
    // Process categories
    const { dataUpdated, failedApps, skippedApps } = await processCategories(data);
    if (dataUpdated) await saveDataToFile(CONFIG.paths.data, data);
    
    // Output statistics
    const totalTime = (Date.now() - startTime) / 1000;
    logger.success(colorize(`\n处理完成! 总耗时: ${totalTime.toFixed(2)}秒`, COLORS.green));
    
    // Display results
    outputResults(data, failedApps, skippedApps);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

// Run main function
logger.info(colorize("Mac应用图标提取工具 - 开始处理", COLORS.cyan));
main();

/**
 * 输出处理结果统计
 */
function outputResults(data, failedApps, skippedApps) {
  // 计算统计数据
  const stats = {
    total: data.reduce((sum, cat) => sum + (cat.items?.length || 0), 0),
    processed: data.reduce((sum, cat) => sum + (cat.items?.filter(i => i.icon)?.length || 0), 0),
    skipped: skippedApps.length,
    failed: failedApps.length
  };
  
  // 显示统计信息
  logger.info("\n" + colorize("===== 统计信息 =====", COLORS.cyan));
  logger.info(`总应用数: ${stats.total} | 已处理: ${stats.processed} | 失败: ${stats.failed} | 跳过: ${stats.skipped}`);
  
  // 如果有失败，显示失败详情
  if (failedApps.length > 0) {
    // 错误分组（每个应用只属于一个组）
    const errorGroups = {};
    
    // 先将错误分组
    failedApps.forEach(app => {
      if (app.error.includes("提取图标出错")) {
        errorGroups["图标提取错误"] = errorGroups["图标提取错误"] || [];
        errorGroups["图标提取错误"].push(app);
      } else if (app.error.includes("找不到应用") || app.error.includes("查找应用路径出错")) {
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
