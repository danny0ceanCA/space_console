import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'http',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp }) => `[${timestamp}] [${level}] ${message}`)
      )
    }),
    new transports.File({ filename: path.join(logDir, 'server.log') })
  ]
});

logger.stream = {
  write: message => logger.http(message.trim())
};

export default logger;
