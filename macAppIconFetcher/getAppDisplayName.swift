#!/usr/bin/swift

import Foundation

// 确保提供了应用路径参数
guard CommandLine.arguments.count > 1 else {
    print("Error: Please provide an app path")
    exit(1)
}

// 检查是否处于调试模式
let debugMode = CommandLine.arguments.contains("--debug")

let appPath = CommandLine.arguments[1]

// 调试信息输出函数
func debug(_ message: String) {
    if debugMode {
        // 使用更简单的方式输出调试信息
        print("DEBUG: \(message)")
    }
}

// 获取应用的显示名称
func getAppDisplayName(from appPath: String) -> String {
    // 简化函数流程，减少重复的debug日志
    debug("处理应用路径: \(appPath)")
    
    // 检查本地化字符串文件
    let stringsPath = "\(appPath)/Contents/Resources/zh-Hans.lproj/InfoPlist.strings"
    if let localizedDict = NSDictionary(contentsOfFile: stringsPath),
       let localizedName = localizedDict["CFBundleDisplayName"] as? String ?? 
                           localizedDict["CFBundleName"] as? String {
        return localizedName
    }
    
    // 检查Info.plist
    let plistPath = "\(appPath)/Contents/Info.plist"
    if let plist = NSDictionary(contentsOfFile: plistPath),
       let displayName = plist["CFBundleDisplayName"] as? String ?? plist["CFBundleName"] as? String {
        return displayName
    }
    
    // 回退到文件名
    var fileName = (appPath as NSString).lastPathComponent
    if fileName.lowercased().hasSuffix(".app") {
        fileName = String(fileName[..<fileName.index(fileName.endIndex, offsetBy: -4)])
    }
    
    return fileName
}

// 如果在调试模式下，输出调试信息
if debugMode {
    debug("应用路径: \(appPath)")
}

// 获取应用名称
let appName = getAppDisplayName(from: appPath)

// 输出结果到stdout (供JavaScript代码使用)
print(appName)