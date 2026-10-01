import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { WORKFLOW_BY_ID, type Workflow } from '../content';
import type { RunDone } from '../lib/api';
import { Markdown } from '../lib/markdown';
import type { Conversation } from './useConversation';

type Props = {
  conversation: Conversation | null;
  streaming: boolean;
  error: string;
  meta: RunDone | null;
  workflow: Workflow;
  onStop: () => void;
  onRegenerate: () => void;
  onClear: () => void;
};

export function ResultPanel({ conversation, streaming, error, meta, workflow, onStop, onRegenerate, onClear }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const entries = conversation?.entries ?? [];
  const last = entries[entries.length - 1];

  // Keep the view pinned to the bottom while streaming unless the user scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [last?.content, error]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const lastAnswer = [...entries].reverse().find((e) => e.role === 'assistant')?.content ?? '';
  const activeWorkflow = conversation ? WORKFLOW_BY_ID[conversation.workflow] : workflow;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
        <Icon name={activeWorkflow.icon} className="h-4 w-4 text-indigo-200" />
        <span className="text-[13px] text-white/80">{conversation ? activeWorkflow.title : 'AI Output'}</span>
        {streaming && (
          <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] text-emerald-300/80">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Streaming
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {streaming ? (
            <PanelButton icon="stop" label="Stop" onClick={onStop} />
          ) : (
            conversation && (
              <>
                <CopyButton text={lastAnswer} />
                <PanelButton icon="refresh" label="Regenerate" onClick={onRegenerate} />
                <PanelButton icon="trash" label="Clear" onClick={onClear} />
              </>
            )
          )}
        </div>
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {!conversation && !error && <EmptyState workflow={workflow} />}

        {entries.map((entry, i) => {
          if (entry.role === 'user') {
            if (i === 0) {
              return entry.content ? (
                <div key={i} className="mb-5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[13.5px] text-white/65">
                  <span className="mb-1 block text-[11px] tracking-[0.16em] text-white/35">{activeWorkflow.input?.label.toUpperCase() ?? 'REQUEST'}</span>
                  <span className="whitespace-pre-wrap">{entry.content}</span>
                </div>
              ) : null;
            }
            return (
              <div key={i} className="my-6 flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-white/[0.07] px-4 py-2.5 text-[14px] text-white/90">
                  {entry.content}
                </div>
              </div>
            );
          }
          const isLive = streaming && i === entries.length - 1;
          return (
            <div key={i} className={isLive ? 'caret-host' : ''}>
              {entry.content ? (
                <Markdown source={entry.content} />
              ) : isLive ? (
                <div className="space-y-2.5">
                  <div className="shimmer h-4 w-2/5 rounded" />
                  <div className="shimmer h-3 w-full rounded" />
                  <div className="shimmer h-3 w-11/12 rounded" />
                  <div className="shimmer h-3 w-3/4 rounded" />
                </div>
              ) : null}
            </div>
          );
        })}

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-100">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {meta && !streaming && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.07] px-4 py-1.5 text-[11px] text-white/35">
          <span className="font-code">{meta.model}</span>
          <span>{(meta.ms / 1000).toFixed(1)}s</span>
          {meta.usage?.total_tokens != null && <span>{meta.usage.total_tokens.toLocaleString()} tokens</span>}
          {meta.truncated && <span className="text-amber-300/80">Output hit the length limit — ask it to continue.</span>}
        </div>
      )}
    </div>
  );
}

function EmptyState({ workflow }: { workflow: Workflow }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-indigo-200">
          <Icon name={workflow.icon} className="h-6 w-6" />
        </div>
      </div>
      <h3 className="font-heading text-[22px] tracking-tight">{workflow.title}</h3>
      <p className="mt-2 max-w-sm text-[14.5px] text-white/50">{workflow.description}</p>
      <p className="mt-6 text-[12px] text-white/30">Add code on the left, then press {workflow.action}.</p>
    </div>
  );
}

function PanelButton({ icon, label, onClick }: { icon: 'stop' | 'refresh' | 'trash'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy answer"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
    >
      <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
      <span className="hidden xl:inline">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
