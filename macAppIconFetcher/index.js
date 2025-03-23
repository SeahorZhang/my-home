#!/usr/bin/env node

import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { createTimer, preWarmFileSystem, colorize } from './utils.js';
import { checkEnvironment } from './environment.js';
import { parseArgs, showMenu } from './ui.js';
import { processCategories, saveDataToFile } from './processor.js';
import { COLORS } from './utils.js';

/**
 * Main function - application entry point
 */
async function main() {
  const mainTimer = createTimer();
  
  try {
    // Check environment and parse args
    await checkEnvironment();
    const needMenu = parseArgs();
    
    if (needMenu) {
      CONFIG.onlyMissingIcons = await showMenu();
    }
    
    // Use preloading technique
    logger.info("加载数据文件...");
    const dataPromise = import(CONFIG.dataPath);
    
    // Pre-warm file system cache
    logger.info("准备输出目录...");
    const preWarmPromise = preWarmFileSystem(CONFIG.outputDir);
    
    // Wait for all preloading to complete
    const [dataModule] = await Promise.all([dataPromise, preWarmPromise]);
    const data = dataModule.data || dataModule.default;
    
    // Process categories
    const { dataUpdated, failedApps, skippedApps } = 
      await processCategories(data);
    
    // Save updated data to file if needed
    if (dataUpdated) {
      await saveDataToFile(CONFIG.dataPath, data);
    }
    
    // Output detailed statistics
    const totalTime = mainTimer.elapsed();
    logger.success(colorize(`\n处理完成! 总耗时: ${totalTime.toFixed(2)}秒`, COLORS.green));
    
    // Display statistics
    const stats = {
      total: data.reduce((sum, cat) => sum + (cat.items?.length || 0), 0),
      processed: data.reduce((sum, cat) => sum + (cat.items?.filter(i => i.icon)?.length || 0), 0),
      skipped: skippedApps.length,
      failed: failedApps.length
    };
    
    logger.info("\n" + colorize("===== 统计信息 =====", COLORS.cyan));
    logger.info(`总应用数: ${stats.total}`);
    logger.info(`已处理应用: ${stats.processed} (${((stats.processed/stats.total)*100).toFixed(1)}%)`);
    
    if (CONFIG.onlyMissingIcons && skippedApps.length > 0) {
      logger.info(`已跳过应用: ${skippedApps.length}`);
    }
    
    if (failedApps.length > 0) {
      logger.error(`\n以下 ${failedApps.length} 个应用处理失败:`);
      
      // Group errors by type
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
      
      // Show errors grouped by type
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

// Run main function
logger.info(colorize("Mac应用图标提取工具 - 开始处理", COLORS.cyan));
main();
