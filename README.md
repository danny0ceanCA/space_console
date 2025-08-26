# space_console

## Requirements
- Node.js 18+
- npm 9+
- Dependencies listed in `requirements.txt`

## Getting Started

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The app will be available at http://localhost:5173 by default.

Start the API server:
```bash
npm run server
```
The server uses environment variables defined in `.env` (see `.env.example`) and stores chat history in Redis.

### Logging
Server activity and API requests are logged using Winston and Morgan. Entries are printed to the console and written to `logs/server.log` with timestamps and structured JSON for easier filtering. The log file is created automatically when the server runs, and the log level can be adjusted with the `LOG_LEVEL` environment variable.

Build for production:
```bash
npm run build
```

## Environment Variables
- `OPENAI_API_KEY`: API key for OpenAI used in chat-based interactions.
- `REDIS_URL`: Connection string for the Redis instance used to store chat logs and memory.
- `OPENAI_MODEL`: GPT model identifier used for chat completions.

## Notes
- Uses Vite, React, and Tailwind CSS.
- See `package.json` for scripts and additional details.
