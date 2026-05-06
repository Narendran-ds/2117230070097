
const express = require("express");
const logger = require("./src/logger");
const { requestLogger, errorLogger } = require("./src/requestLogger");

module.exports = { logger, requestLogger, errorLogger };


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(requestLogger);

app.get("/health", (req, res) => {
  req.log.info("Health check requested");
  res.status(200).json({ status: "ok", service: "logging-middleware-demo" });
});

app.get("/notifications", (req, res) => {
  req.log.info("Fetching notifications", { page: req.query.page || 1 });

  const notifications = [
    { id: "1", type: "Placement", message: "CSX Corporation hiring", isRead: false },
    { id: "2", type: "Event",     message: "Farewell party tomorrow", isRead: false },
    { id: "3", type: "Result",    message: "Mid-sem results published", isRead: true },
  ];

  req.log.debug("Notifications fetched from DB", { count: notifications.length });
  res.status(200).json({ success: true, data: { notifications } });
});


app.patch("/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  req.log.debug("Marking notification as read", { notificationId: id });

  
  if (id === "999") {
    req.log.warn("Notification not found", { notificationId: id });
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Notification not found." },
    });
  }

  req.log.info("Notification marked as read", { notificationId: id });
  res.status(200).json({ success: true, data: { id, isRead: true } });
});

app.get("/error-demo", (req, res, next) => {
  req.log.warn("Error demo route triggered");
  const err = new Error("Simulated internal server error");
  err.status = 500;
  next(err);
});
app.use(errorLogger);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred.",
    },
  });
});


app.listen(PORT, () => {
  logger.info("Logging middleware demo server started", {
    port: PORT,
    env: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || "DEBUG",
  });
});