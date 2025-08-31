import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from 'redis';
import morgan from 'morgan';
import logger from './logger.js';
import fs from 'fs';
import path from 'path';
import os from 'os';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
morgan.token('body', req => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms body=:body', {
    stream: logger.stream,
  })
);

const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', err => logger.error(`Redis error ${err}`));
await redis.connect();
logger.info('Connected to Redis');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const globalSystem = `You are the Research Deck AI named "Robot", the starship’s science officer for a 9-year-old explorer.
When you mention scientific words (like nitrogen, argon, basalt, perchlorates, etc.),
always pause to explain them in kid-friendly terms.
Use short, clear sentences, fun comparisons, and space-themed metaphors.
Example: “Nitrogen is a quiet gas that makes up most of Earth’s air—it’s like the invisible pillow we breathe through.”
Never assume the explorer already knows advanced science words—always make them understandable,
like telling a story to a young astronaut.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message, system } = req.body;
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversationId and message required' });
    }
    logger.info(`Chat request conversationId=${conversationId} message=${message}`);
    const key = `chat:${conversationId}`;
    const historyRaw = await redis.lRange(key, 0, -1);
    const history = historyRaw.map(JSON.parse);
    const messages = [
      { role: 'system', content: globalSystem },
      ...(system ? [{ role: 'system', content: system }] : []),
      ...history,
      { role: 'user', content: message },
    ];
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream: false,
    });
    const reply = completion.choices[0]?.message?.content || '';
    logger.info(`Chat reply conversationId=${conversationId} reply=${reply}`);
    await redis.rPush(key, JSON.stringify({ role: 'user', content: message }));
    await redis.rPush(key, JSON.stringify({ role: 'assistant', content: reply }));
    res.json({ reply });
  } catch (err) {
    logger.error(`Error in /api/chat: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chat/:conversationId', async (req, res) => {
  try {
    const key = `chat:${req.params.conversationId}`;
    logger.info(`Fetching history for ${req.params.conversationId}`);
    const historyRaw = await redis.lRange(key, 0, -1);
    const history = historyRaw.map(JSON.parse);
    res.json(history);
  } catch (err) {
    logger.error(`Error in GET /api/chat/${req.params.conversationId}: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stream media files with Range support
app.get('/videos/:name', (req, res) => {
  const mediaPath = path.join(process.cwd(), 'public', 'videos', req.params.name);
  if (!fs.existsSync(mediaPath)) {
    return res.sendStatus(404);
  }
  const ext = path.extname(mediaPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'video/mp4';

  const range = req.headers.range;
  const stat = fs.statSync(mediaPath);
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(mediaPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(mediaPath).pipe(res);
  }
});

const port = process.env.PORT || 3001;
const host = '0.0.0.0';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

app.listen(port, host, () => {
  const ip = getLocalIp();
  logger.info(`Server listening on http://${ip}:${port}`);
});

max_tokens: 250