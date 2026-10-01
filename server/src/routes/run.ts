import { Router } from 'express';
import Groq from 'groq-sdk';
import { buildMessages, groq, model } from '../groq.js';
import { runRequestSchema } from '../schema.js';

export const runRouter = Router();

runRouter.post('/', async (req, res) => {
  const parsed = runRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Stop the upstream generation if the browser disconnects or presses Stop.
  const abort = new AbortController();
  res.on('close', () => abort.abort());

  const started = Date.now();
  try {
    const stream = await groq.chat.completions.create(
      {
        model,
        messages: buildMessages(parsed.data),
        stream: true,
        temperature: 0.2,
        max_completion_tokens: 8192,
      },
      { signal: abort.signal },
    );

    let finishReason: string | null = null;
    let usage: unknown = null;
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) send('delta', { text: delta });
      finishReason = chunk.choices[0]?.finish_reason ?? finishReason;
      if (chunk.x_groq?.usage) usage = chunk.x_groq.usage;
    }
    send('done', {
      model,
      finishReason,
      truncated: finishReason === 'length',
      usage,
      ms: Date.now() - started,
    });
  } catch (err) {
    if (abort.signal.aborted) return;
    let message = 'Something went wrong while contacting the AI engine.';
    if (err instanceof Groq.RateLimitError) {
      message = 'The AI engine is rate limited right now. Please retry in a few seconds.';
    } else if (err instanceof Groq.AuthenticationError) {
      message = "The server's GROQ_API_KEY was rejected. Check the key in .env.";
    } else if (err instanceof Groq.APIConnectionError) {
      message = 'Could not reach the Groq API. Check the network connection.';
    } else if (err instanceof Groq.APIError) {
      message = `Groq API error (${err.status ?? 'unknown'}): ${err.message}`;
    }
    console.error('[run]', err);
    send('error', { message });
  } finally {
    res.end();
  }
});
