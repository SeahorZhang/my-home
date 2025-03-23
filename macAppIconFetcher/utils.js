import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";

// 将exec函数转为Promise
export const execPromise = util.promisify(exec);

// ===== 颜色常量 =====
export const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m"
};

/**
 * 为文本添加颜色
 * @param {string} text 要着色的文本
 * @param {string} color 颜色代码
 * @returns {string} 着色后的文本
 */
export function colorize(text, color) {
  return `${color}${text}${COLORS.reset}`;
}

/**
 * 移除应用名称中的.app后缀
 * @param {string} name 应用名称
 * @returns {string} 去除.app后缀的名称
 */
export function removeAppSuffix(name) {
  return name.replace(/\.app$/i, "");
}

/**
 * 转义正则表达式特殊字符
 * @param {string} string 要转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 安全执行命令并处理错误
 * @param {string} command 要执行的命令
 * @param {string} errorMessage 错误消息前缀
 * @returns {Promise<string>} 命令输出
 */
export async function safeExec(command, errorMessage) {
  try {
    const { stdout } = await execPromise(command);
    return stdout.trim();
  } catch (error) {
    if (errorMessage) {
      throw new Error(`${errorMessage}: ${error.message}`);
    }
    return "";
  }
}

/**
 * 创建计时器对象
 * @returns {Object} 带有elapsed和reset方法的计时器对象
 */
export function createTimer() {
  const startTime = Date.now();
  return {
    elapsed: () => (Date.now() - startTime) / 1000,
    reset: () => startTime = Date.now()
  };
}

/**
 * 使用重试机制执行函数
 * @param {Function} fn 要执行的函数
 * @param {number} retries 重试次数
 * @param {number} delay 重试间隔(毫秒)
 * @returns {Promise<any>} 函数结果
 */
export async function withRetry(fn, retries = 2, delay = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
}

/**
 * 并发处理队列
 * @param {Array} items 待处理项目
 * @param {Function} fn 处理函数
 * @param {number} concurrency 并发数
 * @returns {Promise<Array>} 处理结果
 */
export async function promisePool(items, fn, concurrency) {
  // 简单分组处理
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

/**
 * 预热文件系统缓存
 * @param {string} directory 要预热的目录
 */
export async function preWarmFileSystem(directory) {
  try {
    // 读取输出目录内容到缓存
    if (fs.existsSync(directory)) {
      const files = fs.readdirSync(directory);
      for (const file of files.slice(0, 10)) {
        try {
          // 只读取几个文件的元数据来激活文件系统缓存
          fs.statSync(path.join(directory, file));
        } catch (e) {
          // 忽略单个文件错误
        }
      }
    }
  } catch (e) {
    // 忽略预热错误
  }
}

/**
 * 统一的错误处理
 * @param {Error} error 错误对象
 * @param {string} context 错误上下文
 * @returns {Object} 标准错误结果对象
 */
export function handleError(error, context = '') {
  const message = context ? `${context}: ${error.message}` : error.message;
  if (logger) logger.error(message);
  return { success: false, error: message };
}
