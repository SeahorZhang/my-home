import * as prompts from "@clack/prompts";
import { CONFIG } from "./config.js";
import { COLORS, colorize } from "./utils.js";
import { logger } from "./logger.js";

/**
 * 显示交互式菜单供用户选择
 * @returns {Promise<boolean>} 是否只处理缺少图标的应用
 */
export async function showMenu() {
  try {
    // 初始化提示
    prompts.intro("Mac应用图标提取工具");

    // 创建菜单选项
    const mode = await prompts.select({
      message: "请选择处理模式",
      options: [
        { label: "只处理缺少图标的应用", value: true },
        { label: "处理所有应用", value: false },
      ],
    });

    // 用户按Ctrl+C取消
    if (prompts.isCancel(mode)) {
      prompts.cancel("操作已取消");
      process.exit(0);
    }

    const modeText = mode ? "只处理缺少图标的应用" : "处理所有应用";
    prompts.log.step(`已选择: ${modeText}`);
    prompts.log.step("开始处理应用");

    return mode;
  } catch (error) {
    logger.error(`无法显示交互菜单: ${error.message}`);
    logger.info("请安装 @clack/prompts: npm install @clack/prompts");
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 * @returns {boolean} 是否显示菜单
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  let showMenuNeeded = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--only-missing" || args[i] === "-m") {
      CONFIG.onlyMissingIcons = true;
      showMenuNeeded = false;
      logger.info(colorize("模式: 只处理缺少图标的应用", COLORS.cyan));
    } else if (args[i] === "--all" || args[i] === "-a") {
      CONFIG.onlyMissingIcons = false;
      showMenuNeeded = false;
      logger.info(colorize("模式: 处理所有应用", COLORS.cyan));
    } else if (args[i] === "--help" || args[i] === "-h") {
      showHelp();
      process.exit(0);
    } else if (args[i] === "--verbose" || args[i] === "-v") {
      CONFIG.verbose = true;
      logger.info(colorize("模式: 详细输出", COLORS.cyan));
    }
  }

  return showMenuNeeded;
}

/**
 * 显示帮助信息
 */
export function showHelp() {
  console.log(`
${colorize("Mac应用图标提取工具", COLORS.cyan)}

用法:
  macAppIconFetcher.js [选项]

选项:
  --only-missing, -m   只处理缺少图标的应用
  --all, -a            处理所有应用 (默认)
  --help, -h           显示此帮助信息
  --verbose, -v        详细输出模式，默认关闭

说明:
  此工具会从Mac系统中查找应用程序并提取其图标，
  保存到icons目录中，并更新data.js文件。
  
  如果不提供选项，将显示交互式菜单供选择。
  `);
}
