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
  timer: null,
  start: function(total) {
    this.total = total;
    this.current = 0;
    this.timer = createTimer();
    logger.info(`\n准备处理 ${total} 个应用...`);
  },
  update: function(increment = 1) {
    this.current += increment;
    const percent = Math.floor((this.current / this.total) * 100);
    const elapsed = this.timer.elapsed();
    const estimatedTotal = (elapsed / this.current) * this.total;
    const remaining = estimatedTotal - elapsed;
    
    // Update progress every 10% to avoid excessive output
    if (this.current === 1 || this.current === this.total || percent % 10 === 0) {
      logger.info(colorize(
        `进度: ${percent}% (${this.current}/${this.total}) - 已用时间: ${elapsed.toFixed(1)}秒 - 预计剩余: ${remaining.toFixed(1)}秒`,
        COLORS.blue
      ));
    }
  },
  finish: function() {
    const elapsed = this.timer.elapsed();
    logger.success(`完成！总耗时: ${elapsed.toFixed(2)}秒，平均每个应用 ${(elapsed / this.total).toFixed(2)}秒`);
  }
}; 