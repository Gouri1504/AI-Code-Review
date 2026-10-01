import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { systemPrompt } from './prompts.js';
import type { RunRequest } from './schema.js';

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
export const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function checkModel(): Promise<void> {
  try {
    const list = await groq.models.list();
    const ids = list.data.map((m) => m.id);
    if (!ids.includes(model)) {
      console.warn(`[groq] Model "${model}" is not available to your key. Set GROQ_MODEL to one of:\n  ${ids.join('\n  ')}`);
    }
  } catch (err) {
    console.warn('[groq] Could not verify model list:', err instanceof Error ? err.message : err);
  }
}

export function buildMessages(req: RunRequest): ChatCompletionMessageParam[] {
  // The code block comes first and stays byte-identical across follow-up turns,
  // so providers that cache prompt prefixes can reuse it.
  const context = `Language: ${req.language}\n\nCode:\n\`\`\`${req.language.toLowerCase()}\n${req.code || '(no code provided)'}\n\`\`\``;
  const first = req.prompt?.trim() ? `${context}\n\nUser request:\n${req.prompt}` : context;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt(req.workflow) },
    { role: 'user', content: first },
    ...(req.history ?? []),
  ];
  if (req.followUp?.trim()) messages.push({ role: 'user', content: req.followUp });
  return messages;
}
