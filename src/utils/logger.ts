import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true, // Enable colors
      translateTime: "SYS:standard", // Format timestamp
      ignore: "pid,hostname", // Ignore unnecessary fields
    },
  },
});

export default logger;