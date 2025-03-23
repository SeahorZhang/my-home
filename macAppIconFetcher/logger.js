import { COLORS, colorize, createTimer } from './utils.js';

/**
 * Logger with colorized output
 */
export const logger = {
  info: (message) => console.log(message),
  success: (message) => console.log(colorize(message, COLORS.green)),
  warn: (message) => console.log(colorize(message, COLORS.yellow)),
  error: (message) => console.error(colorize(`错误: ${message}`, COLORS.red)),
  section: (title) => console.log(`\n${colorize("=".repeat(10) + " " + title + " " + "=".repeat(10), COLORS.cyan)}`)
};

/**
 * Progress tracking utility
 */
export const progress = {
  total: 0,
  current: 0,
  startTime: 0,
  
  start(total) {
    this.total = total;
    this.current = 0;
    this.startTime = Date.now();
    logger.info(`\n准备处理 ${total} 个应用...`);
  },
  
  update(increment = 1) {
    this.current += increment;
    const percent = Math.floor((this.current / this.total) * 100);
    
    // 只在10%的整数倍显示进度，减少日志输出
    if (this.current === 1 || this.current === this.total || percent % 10 === 0) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const remaining = this.current > 0 ? 
        (elapsed / this.current) * (this.total - this.current) : 0;
      
      logger.info(colorize(
        `[${percent}%] ${this.current}/${this.total} - 已用时: ${elapsed.toFixed(1)}秒 - 剩余: ${remaining.toFixed(1)}秒`,
        COLORS.blue
      ));
    }
  },
  
  finish() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    logger.success(`完成! 耗时: ${elapsed.toFixed(1)}秒, 平均: ${(elapsed / this.total).toFixed(2)}秒/应用`);
  }
}; 