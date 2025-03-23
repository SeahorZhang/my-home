import path from "node:path";

/**
 * Application configuration
 */
export const CONFIG = {
  outputDir: path.join(process.cwd(), "toolSoftware", "icons"),
  iconSize: 64,
  dataPath: path.join(process.cwd(), "toolSoftware", "data.js"),
  onlyMissingIcons: false,
  concurrency: 10,
  retryAttempts: 2,
  batchSize: 50,
  debug: false,
  verbose: false
};

/**
 * Cache for expensive operations
 */
export const CACHE = {
  appPaths: new Map(),
  displayNames: new Map()
}; 