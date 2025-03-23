#!/usr/bin/swift

import Foundation
import AppKit

// 快速参数解析
guard CommandLine.arguments.count >= 3 else {
    print("使用方法: ./getAppIcon.swift <应用路径> <输出路径> [图标大小]")
    exit(1)
}

let appPath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]
let size = CommandLine.arguments.count > 3 ? Int(CommandLine.arguments[3]) ?? 64 : 64

// 快速创建目录，不检查错误
let outputDir = (outputPath as NSString).deletingLastPathComponent
try? FileManager.default.createDirectory(atPath: outputDir, withIntermediateDirectories: true)

// 使用 NSWorkspace 获取图标 - 这是最高效的方法
let icon = NSWorkspace.shared.icon(forFile: appPath)

// 优化的图像大小调整
let newSize = NSSize(width: CGFloat(size), height: CGFloat(size))
let representation = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(newSize.width),
    pixelsHigh: Int(newSize.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)

// 设置适当的分辨率
representation?.size = newSize

// 使用 Core Graphics 直接绘制，避免 lockFocus
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: representation!)
icon.draw(in: NSRect(origin: .zero, size: newSize),
         from: NSRect(origin: .zero, size: icon.size),
         operation: .copy,
         fraction: 1.0)
NSGraphicsContext.restoreGraphicsState()

// 直接生成PNG数据，无需中间转换
if let pngData = representation?.representation(using: .png, properties: [:]) {
    do {
        try pngData.write(to: URL(fileURLWithPath: outputPath))
        exit(0)
    } catch {
        // 静默失败，返回错误码
    }
}

exit(1)
