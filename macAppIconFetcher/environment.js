import fs from "node:fs";
import { CONFIG } from './config.js';
import { logger } from './logger.js';

/**
 * 检查环境和文件存在性
 */
export async function checkEnvironment() {
  // 检查是否在macOS上运行
  if (process.platform !== "darwin") {
    throw new Error("此工具仅支持macOS系统");
  }

  // 检查数据文件是否存在
  if (!fs.existsSync(CONFIG.paths.data)) {
    throw new Error(`数据文件不存在: ${CONFIG.paths.data}`);
  }

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.paths.output)) {
    fs.mkdirSync(CONFIG.paths.output, { recursive: true });
    logger.info(`已创建输出目录: ${CONFIG.paths.output}`);
  }
} 