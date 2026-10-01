import { useCallback, useRef, useState } from 'react';
import type { WorkflowId } from '../content';
import { RunError, streamRun, type RunBody, type RunDone, type Turn } from '../lib/api';

export type Conversation = {
  workflow: WorkflowId;
  language: string;
  /** Snapshot of the code at the first run; follow-ups reuse it so the context never drifts mid-thread. */
  code: string;
  prompt: string;
  /** entries[0] is the initial user request; then assistant/user alternate. */
  entries: Turn[];
};

export function useConversation() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<RunDone | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const convRef = useRef<Conversation | null>(null);
  convRef.current = conversation;

  const execute = useCallback(async (base: Conversation, body: RunBody) => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setError('');
    setMeta(null);
    setStreaming(true);
    setConversation({ ...base, entries: [...base.entries, { role: 'assistant', content: '' }] });

    // Batch deltas into one state update per frame to keep rendering smooth.
    let pending = '';
    let raf = 0;
    const flush = () => {
      raf = 0;
      if (!pending) return;
      const chunk = pending;
      pending = '';
      setConversation((c) => {
        if (!c) return c;
        const entries = c.entries.slice();
        const lastEntry = entries[entries.length - 1];
        entries[entries.length - 1] = { ...lastEntry, content: lastEntry.content + chunk };
        return { ...c, entries };
      });
    };

    try {
      const done = await streamRun(
        body,
        (text) => {
          pending += text;
          if (!raf) raf = requestAnimationFrame(flush);
        },
        abort.signal,
      );
      cancelAnimationFrame(raf);
      flush();
      setMeta(done);
    } catch (err) {
      cancelAnimationFrame(raf);
      flush();
      if (abort.signal.aborted) return;
      setError(err instanceof RunError ? err.message : 'Unexpected error while streaming the response.');
    } finally {
      if (abortRef.current === abort) {
        abortRef.current = null;
        setStreaming(false);
      }
    }
  }, []);

  /** Start a fresh thread for a workflow. */
  const run = useCallback(
    (workflow: WorkflowId, language: string, code: string, prompt: string) => {
      const base: Conversation = { workflow, language, code, prompt, entries: [{ role: 'user', content: prompt }] };
      void execute(base, { workflow, language, code, prompt: prompt || undefined });
    },
    [execute],
  );

  /** Ask a follow-up on the current thread. */
  const followUp = useCallback(
    (question: string) => {
      const c = convRef.current;
      if (!c) return false;
      // Drop an empty assistant turn left behind by a stopped/failed stream.
      const settled = c.entries.filter((e, i) => !(e.role === 'assistant' && !e.content && i === c.entries.length - 1));
      const history = settled.slice(1);
      if (history.length && history[history.length - 1].role === 'user') history.pop();
      const base: Conversation = { ...c, entries: [settled[0], ...history, { role: 'user', content: question }] };
      void execute(base, {
        workflow: c.workflow,
        language: c.language,
        code: c.code,
        prompt: c.prompt || undefined,
        history,
        followUp: question,
      });
      return true;
    },
    [execute],
  );

  /** Re-run the last request (initial run or latest follow-up). */
  const regenerate = useCallback(() => {
    const c = convRef.current;
    if (!c) return;
    const entries = c.entries.filter((e) => !(e.role === 'assistant' && e === c.entries[c.entries.length - 1]));
    const lastUser = entries[entries.length - 1];
    if (entries.length <= 1) {
      run(c.workflow, c.language, c.code, c.prompt);
      return;
    }
    const history = entries.slice(1, -1);
    void execute(
      { ...c, entries },
      { workflow: c.workflow, language: c.language, code: c.code, prompt: c.prompt || undefined, history, followUp: lastUser.content },
    );
  }, [execute, run]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const clear = useCallback(() => {
    stop();
    setConversation(null);
    setError('');
    setMeta(null);
  }, [stop]);

  return { conversation, streaming, error, meta, run, followUp, regenerate, stop, clear };
}
