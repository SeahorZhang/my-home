#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
const execPromise = util.promisify(exec);

// 配置选项
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), "app-icons");
const DEFAULT_SIZE = 64;

/**
 * 根据应用名称查找应用路径
 * @param {string} appName 应用名称
 * @returns {Promise<string>} 应用路径
 */
async function findAppPath(appName) {
  try {
    // 使用mdfind查找应用路径，优先完全匹配
    const { stdout } = await execPromise(
      `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '${appName}'" | head -1`
    );

    let appPath = stdout.trim();

    // 如果没有完全匹配，尝试部分匹配
    if (!appPath) {
      const { stdout: fuzzyStdout } = await execPromise(
        `mdfind "kMDItemContentType == 'com.apple.application-bundle' && kMDItemDisplayName == '*${appName}*'" | head -1`
      );
      appPath = fuzzyStdout.trim();
    }

    if (!appPath) {
      throw new Error(`找不到应用 "${appName}"`);
    }

    return appPath;
  } catch (error) {
    throw new Error(`查找应用路径出错: ${error.message}`);
  }
}

/**
 * 从应用提取图标
 * @param {string} appPath 应用路径
 * @param {string} outputPath 输出路径
 * @param {number} size 图标大小
 * @returns {Promise<string>} 图标保存路径
 */
async function extractIcon(appPath, outputPath, size) {
  try {
    const appName = path.basename(appPath, ".app");
    const iconPath = path.join(outputPath, `${appName}.png`);
console.log(1,iconPath)
    // 创建输出目录（如果不存在）
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 查找应用中的图标路径
    const { stdout: iconName } = await execPromise(
      `defaults read "${appPath}/Contents/Info" CFBundleIconFile || echo ""`
    );
    let iconFile = iconName.trim();

    // 有些图标没有扩展名，需要添加.icns
    if (iconFile && !iconFile.endsWith(".icns")) {
      iconFile += ".icns";
    }

    if (!iconFile) {
      // 如果Info.plist中没有指定图标，查找Resources目录中的.icns文件
      const { stdout } = await execPromise(
        `find "${appPath}/Contents/Resources" -name "*.icns" | head -1`
      );
      iconFile = stdout.trim();

      if (!iconFile) {
        throw new Error(`无法找到应用 "${appName}" 的图标`);
      }
    } else {
      iconFile = path.join(appPath, "Contents", "Resources", iconFile);
    }

    // 使用sips提取图标并转换为PNG
    await execPromise(
      `sips -s format png "${iconFile}" --out "${iconPath}" --resampleHeightWidth ${size} ${size}`
    );

    console.log(`图标已保存到: ${iconPath}`);
    return iconPath;
  } catch (error) {
    throw new Error(`提取图标出错: ${error.message}`);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  // 显示帮助信息
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    console.log(`
Mac应用图标获取工具

用法:
  macAppIconFetcher <应用名称> [选项]

选项:
  --output, -o   指定输出目录 (默认: ${DEFAULT_OUTPUT_DIR})
  --size, -s     指定图标大小 (默认: ${DEFAULT_SIZE}px)
  --help, -h     显示帮助信息

示例:
  macAppIconFetcher "Chrome"
  macAppIconFetcher "Visual Studio Code" --output ./icons --size 256
    `);
    return;
  }

  // 解析参数
  const appName = args[0];
  let outputDir = DEFAULT_OUTPUT_DIR;
  let iconSize = DEFAULT_SIZE;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--output" || args[i] === "-o") {
      outputDir = args[++i] || outputDir;
    } else if (args[i] === "--size" || args[i] === "-s") {
      iconSize = parseInt(args[++i], 10) || iconSize;
    }
  }

  try {
    // 查找应用路径
    console.log(`正在查找应用 "${appName}"...`);
    const appPath = await findAppPath(appName);
    console.log(`找到应用: ${appPath}`);

    // 提取图标
    console.log(`正在提取图标...`);
    await extractIcon(appPath, outputDir, iconSize);
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main();
