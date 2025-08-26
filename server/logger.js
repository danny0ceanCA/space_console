import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'server.log');

export function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFile(logFile, entry, err => {
    if (err) {
      console.error('Failed to write log', err);
    }
  });
}
