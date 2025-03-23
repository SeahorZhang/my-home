import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { logger } from "./logger.js";
import { safeExec } from "./utils.js";

const execPromise = util.promisify(exec);
const MIN_ICON_SIZE = 1000; // 最小有效图标大小(字节)，固定值而非配置

/**
 * 提取应用图标
 * @param {string} appPath 应用路径
 * @param {string} outputPath 图标输出路径
 * @param {number} size 图标大小
 * @returns {Promise<boolean>} 是否成功
 */
export async function extractAppIcon(appPath, outputPath, size = 64) {
  try {
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log(`创建图标输出目录: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`尝试提取图标从: ${appPath}`);
    console.log(`将保存到: ${outputPath}`);
    
    // 现有的图标提取逻辑
    const swiftScriptPath = new URL("getAppIcon.swift", import.meta.url).pathname;
    
    // 添加更多日志输出
    console.log(`使用脚本: ${swiftScriptPath}`);
    console.log(`目标图标大小: ${size}px`);
    
    await safeExec(
      `chmod +x "${swiftScriptPath}" && "${swiftScriptPath}" "${appPath}" "${outputPath}" ${size}`
    );
    
    // 验证输出文件是否存在
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`图标已保存，文件大小: ${stats.size} 字节`);
      if (stats.size < MIN_ICON_SIZE) {
        logger.debug(`提取的图标过小(${stats.size}字节)，可能无效`);
        throw new Error("提取的图标无效");
      }
      return true;
    } else {
      console.error(`警告: 图标提取似乎成功，但文件 ${outputPath} 不存在`);
      throw new Error("图标提取后未找到文件");
    }
  } catch (error) {
    console.error(`图标提取错误: ${error.message}`);
    throw new Error(`提取图标出错: ${error.message}`);
  }
}
