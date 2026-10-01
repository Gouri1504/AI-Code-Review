import { getIdToken } from '../auth/AuthProvider';
import type { WorkflowId } from '../content';

export type Turn = { role: 'user' | 'assistant'; content: string };

export type RunBody = {
  workflow: WorkflowId;
  language: string;
  code: string;
  prompt?: string;
  history?: Turn[];
  followUp?: string;
};

export type RunDone = {
  model: string;
  finishReason: string | null;
  truncated: boolean;
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
  ms: number;
};

export class RunError extends Error {}

/**
 * POST /api/run and read the server-sent event stream. Calls `onDelta` for each
 * text chunk and resolves with the final `done` payload.
 */
export async function streamRun(body: RunBody, onDelta: (text: string) => void, signal: AbortSignal): Promise<RunDone> {
  let res: Response;
  try {
    const token = await getIdToken();
    res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw err;
    throw new RunError('Could not reach the API server. Is it running (npm run dev)?');
  }

  if (!res.ok || !res.body) {
    let message = `Request failed (${res.status}).`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* non-JSON error body */
    }
    throw new RunError(message);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let done: RunDone | null = null;

  for (;;) {
    const { value, done: finished } = await reader.read();
    if (finished) break;
    buffer += value;
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let event = 'message';
      let data = '';
      for (const line of raw.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        else if (line.startsWith('data: ')) data += line.slice(6);
      }
      if (!data) continue;
      const payload = JSON.parse(data);
      if (event === 'delta') onDelta(payload.text);
      else if (event === 'done') done = payload;
      else if (event === 'error') throw new RunError(payload.message);
    }
  }

  if (!done) throw new RunError('The stream ended unexpectedly.');
  return done;
}

export async function fetchHealth(): Promise<{ ok: boolean; model: string } | null> {
  try {
    const res = await fetch('/api/health');
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
