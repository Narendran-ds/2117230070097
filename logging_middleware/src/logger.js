
const fs = require("fs");
const path = require("path");

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LEVEL_LABELS = {
  0: "DEBUG",
  1: "INFO",
  2: "WARN",
  3: "ERROR",
};


const COLORS = {
  DEBUG: "\x1b[36m", 
  INFO: "\x1b[32m",  
  WARN: "\x1b[33m", 
  ERROR: "\x1b[31m", 
  RESET: "\x1b[0m",
  DIM: "\x1b[2m",
  BOLD: "\x1b[1m",
};


const LOG_DIR = path.join(__dirname, "../logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const ERROR_LOG_FILE = path.join(LOG_DIR, "error.log");
const MIN_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.DEBUG;


if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}


function formatForFile(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: LEVEL_LABELS[level],
    message,
    ...meta,
  });
}


function formatForConsole(level, message, meta = {}) {
  const levelLabel = LEVEL_LABELS[level];
  const color = COLORS[levelLabel];
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length
    ? `\n  ${COLORS.DIM}${JSON.stringify(meta, null, 2).replace(/\n/g, "\n  ")}${COLORS.RESET}`
    : "";

  return `${COLORS.DIM}${timestamp}${COLORS.RESET} ${color}${COLORS.BOLD}[${levelLabel}]${COLORS.RESET} ${message}${metaStr}`;
}


function writeToFile(filePath, line) {
  fs.appendFile(filePath, line + "\n", (err) => {
    if (err) {
      process.stderr.write(`[LOGGER ERROR] Failed to write to log file: ${err.message}\n`);
    }
  });
}

/**
 * Internal log dispatcher. All public methods route through here.
 * @param {number} level - Numeric log level
 * @param {string} message - Log message
 * @param {object} meta - Optional metadata (requestId, userId, etc.)
 */
function log(level, message, meta = {}) {
  if (level < MIN_LEVEL) return;

  const consoleLine = formatForConsole(level, message, meta);
  const fileLine = formatForFile(level, message, meta);

  
  if (level === LOG_LEVELS.ERROR) {
    process.stderr.write(consoleLine + "\n");
  } else {
    process.stdout.write(consoleLine + "\n");
  }

  
  writeToFile(LOG_FILE, fileLine);


  if (level === LOG_LEVELS.ERROR) {
    writeToFile(ERROR_LOG_FILE, fileLine);
  }
}


const logger = {
  /**
   * Debug-level log. Use for verbose development/diagnostic info.
   * @param {string} message
   * @param {object} [meta]
   */
  debug: (message, meta = {}) => log(LOG_LEVELS.DEBUG, message, meta),

  /**
   * Info-level log. Use for normal operational events.
   * @param {string} message
   * @param {object} [meta]
   */
  info: (message, meta = {}) => log(LOG_LEVELS.INFO, message, meta),

  /**
   * Warn-level log. Use for recoverable issues or unexpected states.
   * @param {string} message
   * @param {object} [meta]
   */
  warn: (message, meta = {}) => log(LOG_LEVELS.WARN, message, meta),

  /**
   * Error-level log. Use for failures that require attention.
   * @param {string} message
   * @param {object} [meta]
   */
  error: (message, meta = {}) => log(LOG_LEVELS.ERROR, message, meta),

  /**
   * Creates a child logger with persistent metadata attached to every log entry.
   * Useful for attaching requestId or userId to all logs within a request lifecycle.
   * @param {object} defaultMeta - Metadata to attach to all child log calls
   * @returns {object} Child logger instance
   */
  child: (defaultMeta = {}) => ({
    debug: (message, meta = {}) => log(LOG_LEVELS.DEBUG, message, { ...defaultMeta, ...meta }),
    info:  (message, meta = {}) => log(LOG_LEVELS.INFO,  message, { ...defaultMeta, ...meta }),
    warn:  (message, meta = {}) => log(LOG_LEVELS.WARN,  message, { ...defaultMeta, ...meta }),
    error: (message, meta = {}) => log(LOG_LEVELS.ERROR, message, { ...defaultMeta, ...meta }),
  }),
};

module.exports = logger;