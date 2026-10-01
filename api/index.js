// Vercel serverless function: every /api/* request is rewritten here (see vercel.json)
// and handled by the same Express app that `npm start` runs. Built by `npm run build -w server`.
export { default } from '../server/dist/app.js';
