import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from 'redis';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', err => console.error('Redis error', err));
await redis.connect();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

app.post('/api/chat', async (req, res) => {
  const { conversationId, message, system } = req.body;
  if (!conversationId || !message) {
    return res.status(400).json({ error: 'conversationId and message required' });
  }
  const key = `chat:${conversationId}`;
  const historyRaw = await redis.lRange(key, 0, -1);
  const history = historyRaw.map(JSON.parse);
  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    ...history,
    { role: 'user', content: message },
  ];
  const completion = await openai.chat.completions.create({
    model,
    messages,
  });
  const reply = completion.choices[0]?.message?.content || '';
  await redis.rPush(key, JSON.stringify({ role: 'user', content: message }));
  await redis.rPush(key, JSON.stringify({ role: 'assistant', content: reply }));
  res.json({ reply });
});

app.get('/api/chat/:conversationId', async (req, res) => {
  const key = `chat:${req.params.conversationId}`;
  const historyRaw = await redis.lRange(key, 0, -1);
  const history = historyRaw.map(JSON.parse);
  res.json(history);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
