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

Build for production:
```bash
npm run build
```

## Environment Variables
- `OPENAI_API_KEY`: API key for OpenAI used in chat-based interactions.
- `REDIS_URL`: Connection string for the Redis instance used to store chat logs and memory.

## Notes
- Uses Vite, React, and Tailwind CSS.
- See `package.json` for scripts and additional details.
