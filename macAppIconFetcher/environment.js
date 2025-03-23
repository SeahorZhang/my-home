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
  if (!fs.existsSync(CONFIG.paths.data)) {
    throw new Error(`数据文件不存在: ${CONFIG.paths.data}`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.paths.output)) {
    fs.mkdirSync(CONFIG.paths.output, { recursive: true });
    logger.info(`已创建输出目录: ${CONFIG.paths.output}`);
  }
} 