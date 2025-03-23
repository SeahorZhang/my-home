import os from "node:os";
import fs from "node:fs";
import { logger } from "./logger.js";
import { CONFIG } from "./config.js";
import { safeExec } from "./utils.js";
import * as prompts from "@clack/prompts";

/**
 * 检查运行环境
 */
export async function checkEnvironment() {
  // 检查操作系统
  const platform = os.platform();
  if (platform !== "darwin") {
    throw new Error(`不支持的操作系统: ${platform}。该工具仅适用于macOS。`);
  }

  // 检查必要的命令
  const commands = ["mdfind"];
  for (const cmd of commands) {
    try {
      await safeExec(`which ${cmd}`);
    } catch (error) {
      throw new Error(`缺少必要命令: ${cmd}。请确保macOS系统工具已安装。`);
    }
  }

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.paths.output)) {
    try {
      fs.mkdirSync(CONFIG.paths.output, { recursive: true });
      prompts.log.step(`已创建输出目录: ${CONFIG.paths.output}`);
    } catch (error) {
      throw new Error(`无法创建输出目录: ${error.message}`);
    }
  }

  // 检查数据文件路径
  if (!fs.existsSync(CONFIG.paths.data)) {
    logger.warn(`数据文件不存在: ${CONFIG.paths.data}`);
  }

  return true;
}
