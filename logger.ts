import winston from "winston";

const logger: winston.Logger = winston.createLogger({
  level: "info",
  format: winston.format.cli(),
  transports: [new winston.transports.Console()],
});

export { logger };
