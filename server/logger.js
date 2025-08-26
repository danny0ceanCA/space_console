import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'server.log');

function write(level, message, output) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level}] ${message}`;
  output(entry);
  fs.appendFile(logFile, entry + '\n', err => {
    if (err) {
      console.error('Failed to write log', err);
    }
  });
}

export function log(message) {
  write('INFO', message, console.log);
}

export function logError(message) {
  write('ERROR', message, console.error);
}
