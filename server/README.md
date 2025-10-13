To run the server:
  - Development mode: npm run dev
  - Build: npm run build
  - Production: npm start

Project structure:
  - package.json - Configured with ESM ("type": "module")
  - tsconfig.json - TypeScript config for ESM output
  - src/index.ts - Basic Fastify server listening on port 3000
  - Dependencies: Fastify, TypeScript, tsx for development

Environment setup:
1. Copy .env.example to .env
2. Add your Supabase URL and anon key

The server will run on http://localhost:3000.