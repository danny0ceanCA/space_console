import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from 'redis';
import morgan from 'morgan';
import logger from './logger.js';

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

const globalSystem = `You are the Research Deck AI, the starship’s science officer for a 9-year-old explorer.
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
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // disable buffering so tokens reach the client as soon as they are generated
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    // flush headers so the client starts receiving chunks immediately
    res.flushHeaders();
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });
    let reply = '';
    for await (const chunk of completion) {
      const token = chunk.choices[0]?.delta?.content || '';
      reply += token;
      // send each token as a JSON line so the frontend can parse incrementally
      res.write(JSON.stringify({ reply: token }) + '\n');
      // some middleware like compression can buffer output; flush if available
      if (typeof res.flush === 'function') res.flush();
    }
    logger.info(`Chat reply conversationId=${conversationId} reply=${reply}`);
    await redis.rPush(key, JSON.stringify({ role: 'user', content: message }));
    await redis.rPush(key, JSON.stringify({ role: 'assistant', content: reply }));
    res.end();
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

const port = process.env.PORT || 3001;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
