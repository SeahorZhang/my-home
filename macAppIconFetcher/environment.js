import fs from "node:fs";
import { CONFIG } from './config.js';
import { logger } from './logger.js';

/**
 * Check environment and file existence
 */
export async function checkEnvironment() {
  // Check if running on macOS
  if (process.platform !== "darwin") {
    throw new Error("此工具仅支持macOS系统");
  }

  // Check if data file exists
  if (!fs.existsSync(CONFIG.dataPath)) {
    throw new Error(`数据文件不存在: ${CONFIG.dataPath}`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    logger.info(`已创建输出目录: ${CONFIG.outputDir}`);
  }
} 