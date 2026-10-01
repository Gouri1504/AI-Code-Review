import { z } from 'zod';
import { WORKFLOW_IDS } from './workflows.js';

export const MAX_CODE_CHARS = 120_000;

export const runRequestSchema = z.object({
  workflow: z.enum(WORKFLOW_IDS),
  language: z.string().trim().min(1).max(40),
  code: z.string().max(MAX_CODE_CHARS),
  /** The workflow input (feature request, error, question). Sent on every turn so the prefix stays stable. */
  prompt: z.string().max(20_000).optional(),
  /** Alternating assistant/user turns after the first answer. */
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(60_000),
      }),
    )
    .max(40)
    .optional(),
  /** A new follow-up question on the same code. */
  followUp: z.string().max(20_000).optional(),
});

export type RunRequest = z.infer<typeof runRequestSchema>;
