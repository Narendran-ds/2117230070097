

const { v4: uuidv4 } = require("uuid");
const logger = require("./logger");

/**
 * Determines the log level based on HTTP response status code.
 * @param {number} statusCode
 * @returns {"info"|"warn"|"error"}
 */
function levelFromStatus(statusCode) {
  if (statusCode >= 500) return "error";
  if (statusCode >= 400) return "warn";
  return "info";
}

function requestLogger(req, res, next) {
 
  const requestId = uuidv4();
  const startTime = Date.now();
  req.requestId = requestId;
  req.log = logger.child({ requestId });

  req.log.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers["user-agent"] || "unknown",
  });


  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const level = levelFromStatus(res.statusCode);

    req.log[level]("Request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}

function errorLogger(err, req, res, next) {
  const log = req.log || logger;

  log.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode: err.status || 500,
  });

  next(err);
}

module.exports = { requestLogger, errorLogger };