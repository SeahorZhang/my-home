import path from "node:path";

/**
 * Application configuration
 */
export const CONFIG = {
  paths: {
    output: path.join(process.cwd(), "toolSoftware", "icons"),
    data: path.join(process.cwd(), "toolSoftware", "data.js"),
  },
  iconSize: 64,
  onlyMissingIcons: false,
  concurrency: 10,
  retries: 2,
  batchSize: 50,
  verbose: false
};

/**
 * Cache for expensive operations
 */
export const CACHE = {
  appPaths: new Map(),
  displayNames: new Map()
}; 