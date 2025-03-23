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
  reset: "\x1b[0m",
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
 * 增强的错误处理
 * @param {Error} error 错误对象
 * @param {string} context 错误上下文
 * @param {Object} options 额外选项
 * @returns {Object} 标准错误结果对象
 */
export function handleError(error, context = "", options = {}) {
  const { silent = false, level = "error", throwError = false } = options;

  // 构建错误消息
  const message = context ? `${context}: ${error.message}` : error.message;

  // 根据选项决定日志行为
  if (!silent && logger) {
    if (level === "warn") {
      logger.warn(message);
    } else {
      logger.error(message);
    }
  }

  // 根据选项决定是否抛出错误
  if (throwError) {
    throw new Error(message);
  }

  // 返回标准错误对象
  return {
    success: false,
    error: message,
    code: error.code || "UNKNOWN_ERROR",
    originalError: error,
  };
}

/**
 * 将错误消息转换为用户友好的消息
 * @param {string} errorMessage 原始错误消息
 * @returns {string} 用户友好的错误消息
 */
export function getUserFriendlyErrorMessage(errorMessage) {
  // 处理常见错误
  if (errorMessage.includes("ENOENT") && errorMessage.includes("open")) {
    return "找不到文件或目录，请检查路径是否正确";
  }

  if (errorMessage.includes("EACCES")) {
    return "没有足够的权限执行操作，请检查文件权限";
  }

  if (errorMessage.includes("找不到应用")) {
    return "找不到该应用，请检查应用名称是否正确，或应用是否已安装";
  }

  // 应用图标提取相关错误
  if (errorMessage.includes("提取图标出错")) {
    return "提取图标时出错，可能是应用图标格式不兼容";
  }

  // 返回原始错误，如果没有匹配的友好消息
  return errorMessage;
}
