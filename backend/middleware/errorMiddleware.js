const fs = require("fs");
const path = require("path");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const logEntry = `[${new Date().toISOString()}]\nMethod: ${req.method}\nURL: ${req.originalUrl}\nStatus: ${statusCode}\nError: ${err.message}\nStack: ${err.stack}\n--------------------------------------------------\n`;

  const logDir = path.join(__dirname, "..", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFile(path.join(logDir, "error.log"), logEntry, (fileErr) => {
    if (fileErr) console.error("Failed to write to log file:", fileErr);
  });

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };
