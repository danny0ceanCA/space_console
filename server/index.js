import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from 'redis';
import { log } from './logger.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log every request and its completion for troubleshooting
app.use((req, res, next) => {
  log(`Incoming ${req.method} ${req.originalUrl} body=${JSON.stringify(req.body)}`);
  res.on('finish', () => {
    log(`Completed ${req.method} ${req.originalUrl} status=${res.statusCode}`);
  });
  next();
});

const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', err => log(`Redis error ${err}`));
await redis.connect();
log('Connected to Redis');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const globalSystem = `You are the AI onboard a futuristic spaceship designed for a 9-year-old explorer.
Everything you explain—math, science, or stories—should feel like part of a space mission.
Use a warm, encouraging tone.
Make learning feel like an adventure across the stars.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message, system } = req.body;
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversationId and message required' });
    }
    log(`Chat request conversationId=${conversationId} message=${message}`);
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
    });
    const reply = completion.choices[0]?.message?.content || '';
    log(`Chat reply conversationId=${conversationId} reply=${reply}`);
    await redis.rPush(key, JSON.stringify({ role: 'user', content: message }));
    await redis.rPush(key, JSON.stringify({ role: 'assistant', content: reply }));
    res.json({ reply });
  } catch (err) {
    log(`Error in /api/chat: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chat/:conversationId', async (req, res) => {
  try {
    const key = `chat:${req.params.conversationId}`;
    log(`Fetching history for ${req.params.conversationId}`);
    const historyRaw = await redis.lRange(key, 0, -1);
    const history = historyRaw.map(JSON.parse);
    res.json(history);
  } catch (err) {
    log(`Error in GET /api/chat/${req.params.conversationId}: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  log(`Server listening on port ${port}`);
});
