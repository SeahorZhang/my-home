import { COLORS, colorize } from "./utils.js";

/**
 * 日志级别
 */
export const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5,
};

/**
 * 增强的日志记录器
 */
export const logger = {
  level: LOG_LEVELS.INFO,

  /**
   * 设置日志级别
   * @param {number} level 日志级别
   */
  setLevel(level) {
    this.level = level;
  },

  /**
   * 静默模式开关
   * @param {boolean} silent 是否静默
   */
  setSilent(silent) {
    this.level = silent ? LOG_LEVELS.NONE : LOG_LEVELS.INFO;
  },

  /**
   * 格式化日志消息
   * @param {string} prefix 前缀
   * @param {string} message 消息
   * @param {string} color 颜色代码
   * @returns {string} 格式化的消息
   */
  formatMessage(prefix, message, color) {
    const prefixText = prefix ? `[${prefix}] ` : "";
    const text = `${prefixText}${message}`;
    return color ? colorize(text, color) : text;
  },

  /**
   * 调试日志
   * @param {string} message 日志消息
   */
  debug(message) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage("调试", message, COLORS.blue));
    }
  },

  /**
   * 信息日志
   * @param {string} message 日志消息
   */
  info(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage("", message));
    }
  },

  /**
   * 成功日志
   * @param {string} message 日志消息
   */
  success(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(colorize(message, COLORS.green));
    }
  },

  /**
   * 警告日志
   * @param {string} message 日志消息
   */
  warn(message) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.log(colorize(`[警告] ${message}`, COLORS.yellow));
    }
  },

  /**
   * 错误日志
   * @param {string} message 日志消息
   */
  error(message) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(colorize(`[错误] ${message}`, COLORS.red));
    }
  },

  /**
   * 分节标题
   * @param {string} title 标题
   */
  section(title) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(
        `\n${colorize(
          "=".repeat(10) + " " + title + " " + "=".repeat(10),
          COLORS.cyan
        )}`
      );
    }
  },
};
