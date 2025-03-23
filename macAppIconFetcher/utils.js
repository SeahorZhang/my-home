import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";

// Promisified exec function
export const execPromise = util.promisify(exec);

// ===== Color constants =====
export const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m"
};

/**
 * Apply color to text
 * @param {string} text Text to colorize
 * @param {string} color Color code
 * @returns {string} Colorized text
 */
export function colorize(text, color) {
  return `${color}${text}${COLORS.reset}`;
}

/**
 * Remove .app suffix from app name
 * @param {string} name App name
 * @returns {string} Name without .app suffix
 */
export function removeAppSuffix(name) {
  return name.replace(/\.app$/i, "");
}

/**
 * Escape special characters in string for RegExp
 * @param {string} string String to escape
 * @returns {string} Escaped string
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Safely execute a command and handle errors
 * @param {string} command Command to execute
 * @param {string} errorMessage Error message prefix
 * @returns {Promise<string>} Command output
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
 * Create a timer object
 * @returns {Object} Timer object with elapsed and reset methods
 */
export function createTimer() {
  const startTime = Date.now();
  return {
    elapsed: () => (Date.now() - startTime) / 1000,
    reset: () => startTime = Date.now()
  };
}

/**
 * Execute a function with retry capability
 * @param {Function} fn Function to execute
 * @param {number} retries Number of retry attempts
 * @param {number} delay Delay between retries in ms
 * @returns {Promise<any>} Function result
 */
export async function withRetry(fn, retries = 2, delay = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
}

/**
 * Limit concurrent execution of promises
 * @param {Array} items Items to process
 * @param {Function} fn Processing function
 * @param {number} concurrency Maximum concurrent operations
 * @returns {Promise<Array>} Processing results
 */
export async function promisePool(items, fn, concurrency) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

/**
 * Pre-warm file system cache
 * @param {string} directory Directory to warm
 */
export async function preWarmFileSystem(directory) {
  try {
    // Read output directory contents to cache
    if (fs.existsSync(directory)) {
      const files = fs.readdirSync(directory);
      for (const file of files.slice(0, 10)) {
        try {
          // Just read metadata for a few files to activate FS cache
          fs.statSync(path.join(directory, file));
        } catch (e) {
          // Ignore individual file errors
        }
      }
    }
  } catch (e) {
    // Ignore warming errors
  }
}
