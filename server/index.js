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

const redisUrl = process.env.REDIS_URL;
let historyStore;

if (redisUrl) {
  const redis = createClient({ url: redisUrl });
  redis.on('error', err => logger.error(`Redis error ${err}`));
  try {
    await redis.connect();
    logger.info('Connected to Redis');
    historyStore = {
      async get(conversationId) {
        const key = `chat:${conversationId}`;
        const historyRaw = await redis.lRange(key, 0, -1);
        return historyRaw.map(JSON.parse);
      },
      async push(conversationId, entry) {
        const key = `chat:${conversationId}`;
        await redis.rPush(key, JSON.stringify(entry));
      },
    };
  } catch (err) {
    logger.error(`Failed to connect to Redis at ${redisUrl}: ${err}`);
  }
}

if (!historyStore) {
  logger.warn('Using in-memory store for chat history. Provide REDIS_URL to enable persistence.');
  const memory = new Map();
  historyStore = {
    async get(conversationId) {
      return memory.get(conversationId) ?? [];
    },
    async push(conversationId, entry) {
      const existing = memory.get(conversationId) ?? [];
      existing.push(entry);
      memory.set(conversationId, existing);
    },
  };
}

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  logger.warn('OPENAI_API_KEY is not configured. Chat endpoints will respond with an error until it is set.');
}
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const defaultGlobalSystem = `You are the Research Deck AI named "Robot", the starship’s science officer for a 9-year-old explorer.
When you mention scientific words (like nitrogen, argon, basalt, perchlorates, etc.),
always pause to explain them in kid-friendly terms.
Use short, clear sentences, fun comparisons, and space-themed metaphors.
Example: “Nitrogen is a quiet gas that makes up most of Earth’s air—it’s like the invisible pillow we breathe through.”
Never assume the explorer already knows advanced science words—always make them understandable,
like telling a story to a young astronaut.
`;

const globalSystem = (process.env.OPENAI_GLOBAL_SYSTEM_PROMPT ?? '').trim() || defaultGlobalSystem;

app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message, system, max_completion_tokens } = req.body;
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversationId and message required' });
    }
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured' });
    }
    logger.info(`Chat request conversationId=${conversationId} message=${message}`);
    const history = await historyStore.get(conversationId);
    const messages = [
      { role: 'system', content: globalSystem },
      ...(system ? [{ role: 'system', content: system }] : []),
      ...history,
      { role: 'user', content: message },
    ];
    const maxTokens = Number.isFinite(max_completion_tokens) && max_completion_tokens > 0 ? Math.floor(max_completion_tokens) : 180;
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream: false,
      max_completion_tokens: maxTokens,
    });
    const reply = completion.choices[0]?.message?.content || '';
    logger.info(`Chat reply conversationId=${conversationId} reply=${reply}`);
    await historyStore.push(conversationId, { role: 'user', content: message });
    await historyStore.push(conversationId, { role: 'assistant', content: reply });
    res.json({ reply });
  } catch (err) {
    logger.error(`Error in /api/chat: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chat/:conversationId', async (req, res) => {
  try {
    logger.info(`Fetching history for ${req.params.conversationId}`);
    const history = await historyStore.get(req.params.conversationId);
    res.json(history);
  } catch (err) {
    logger.error(`Error in GET /api/chat/${req.params.conversationId}: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stream video files with Range support
app.get('/videos/:name', (req, res) => {
  const videoPath = path.join(process.cwd(), 'public', 'videos', req.params.name);
  if (!fs.existsSync(videoPath)) {
    return res.sendStatus(404);
  }
  const range = req.headers.range;
  const stat = fs.statSync(videoPath);
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(videoPath).pipe(res);
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