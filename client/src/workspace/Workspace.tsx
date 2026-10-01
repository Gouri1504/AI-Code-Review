import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EDITOR_STORAGE_KEY, UserMenu } from '../auth/UserMenu';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { SAMPLE_CODE, WORKFLOWS, WORKFLOW_BY_ID, type WorkflowId } from '../content';
import { fetchHealth } from '../lib/api';
import { Link, navigate, useLocation } from '../router';
import { CodeEditor } from './CodeEditor';
import { ResultPanel } from './ResultPanel';
import { useConversation } from './useConversation';

function loadDraft(): { code: string; language: string; fileName: string } {
  try {
    const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable */
  }
  return { code: SAMPLE_CODE, language: 'JavaScript', fileName: 'orders.js' };
}

export function Workspace() {
  const { search } = useLocation();
  const param = new URLSearchParams(search).get('w') as WorkflowId | null;
  const workflowId: WorkflowId = param && param in WORKFLOW_BY_ID ? param : 'review';
  const workflow = WORKFLOW_BY_ID[workflowId];

  const [draft] = useState(loadDraft);
  const [code, setCode] = useState(draft.code);
  const [language, setLanguage] = useState(draft.language);
  const [fileName, setFileName] = useState(draft.fileName);
  const [inputs, setInputs] = useState<Partial<Record<WorkflowId, string>>>({});
  const [question, setQuestion] = useState('');
  const [health, setHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [model, setModel] = useState('');
  const [validation, setValidation] = useState('');
  const { conversation, streaming, error, meta, run, followUp, regenerate, stop, clear } = useConversation();
  const railRef = useRef<HTMLDivElement>(null);

  const input = inputs[workflowId] ?? '';

  useEffect(() => {
    document.title = `${workflow.title} · AI Code Review Application`;
    return () => {
      document.title = 'AI Code Review Application';
    };
  }, [workflow.title]);

  useEffect(() => {
    let alive = true;
    fetchHealth().then((h) => {
      if (!alive) return;
      setHealth(h?.ok ? 'online' : 'offline');
      if (h?.model) setModel(h.model);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify({ code, language, fileName }));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code, language, fileName]);

  // Keep the active chip visible in the horizontal mobile rail.
  useEffect(() => {
    railRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [workflowId]);

  const selectWorkflow = (id: WorkflowId) => {
    setValidation('');
    navigate(`/workspace?w=${id}`);
  };

  const submit = () => {
    if (streaming) return;
    const needsCode = workflowId !== 'chat';
    if (needsCode && !code.trim()) {
      setValidation('Add some code first — paste it, drop a file, or load the sample.');
      return;
    }
    if (workflow.input?.required && !input.trim()) {
      setValidation(`${workflow.input.label} is required for ${workflow.title}.`);
      return;
    }
    setValidation('');
    run(workflowId, language, code, input.trim());
  };

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || streaming) return;
    setQuestion('');
    if (!followUp(q)) run('chat', language, code, q);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#050505]">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-5">
        <div className="[&_a]:text-[18px] sm:[&_a]:text-[20px]">
          <Logo compact />
        </div>
        <span className="hidden text-white/15 sm:inline">/</span>
        <span className="hidden text-[13px] text-white/50 sm:inline">Workspace</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11.5px] text-white/60">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                health === 'online' ? 'animate-pulse-dot bg-emerald-400' : health === 'offline' ? 'bg-rose-400' : 'bg-white/30'
              }`}
            />
            <span className="hidden sm:inline">
              {health === 'online' ? `AI engine online${model ? ` · ${model}` : ''}` : health === 'offline' ? 'API offline' : 'Connecting…'}
            </span>
            <span className="sm:hidden">{health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : '…'}</span>
          </span>
          <Link href="/" className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white" title="Home">
            <Icon name="home" className="h-4 w-4" />
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Workflow rail */}
        <aside className="shrink-0 border-b border-white/[0.07] lg:w-60 lg:border-b-0 lg:border-r">
          <div ref={railRef} className="flex gap-1.5 overflow-x-auto px-3 py-2.5 lg:h-full lg:flex-col lg:gap-0.5 lg:overflow-y-auto lg:py-4">
            <p className="hidden px-2.5 pb-2 text-[10.5px] tracking-[0.2em] text-white/30 lg:block">WORKFLOWS</p>
            {WORKFLOWS.map((w, i) => (
              <div key={w.id} className="contents">
                {i > 0 && WORKFLOWS[i - 1].primary && !w.primary && (
                  <p className="hidden px-2.5 pb-2 pt-5 text-[10.5px] tracking-[0.2em] text-white/30 lg:block">ASSISTANT</p>
                )}
                <button
                  type="button"
                  onClick={() => selectWorkflow(w.id)}
                  aria-current={w.id === workflowId ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                    w.id === workflowId ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white/90'
                  }`}
                >
                  <Icon name={w.icon} className={`h-4 w-4 ${w.id === workflowId ? 'text-indigo-200' : ''}`} />
                  {w.title}
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Editor + action */}
        <section className="flex min-h-[60vh] min-w-0 flex-col border-b border-white/[0.07] lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1">
            <CodeEditor
              code={code}
              language={language}
              fileName={fileName}
              onCode={setCode}
              onLanguage={setLanguage}
              onFileName={setFileName}
              onSubmit={submit}
            />
          </div>

          <div className="border-t border-white/[0.07] p-3 sm:p-4">
            {workflow.input && (
              <label className="mb-3 block">
                <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-white/40">
                  {workflow.input.label.toUpperCase()}
                  {!workflow.input.required && <span className="ml-1 text-white/25">· OPTIONAL</span>}
                </span>
                <textarea
                  value={input}
                  onChange={(e) => setInputs((s) => ({ ...s, [workflowId]: e.target.value }))}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  rows={2}
                  placeholder={workflow.input.placeholder}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-white/90 outline-none transition-colors placeholder:text-white/30 focus:border-indigo-300/40"
                />
              </label>
            )}
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                {validation ? (
                  <p className="text-[12.5px] text-amber-200/90">{validation}</p>
                ) : (
                  <p className="truncate text-[12.5px] text-white/40">{workflow.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={streaming ? stop : submit}
                data-interactive
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-[background-color,box-shadow] duration-300 ${
                  streaming
                    ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                    : 'bg-white text-black hover:shadow-[0_0_32px_-6px_rgba(167,139,250,0.6)]'
                }`}
              >
                <Icon name={streaming ? 'stop' : workflow.icon} className="h-4 w-4" />
                {streaming ? 'Stop' : workflow.action}
              </button>
            </div>
          </div>
        </section>

        {/* Output + chat */}
        <section className="flex min-h-[70vh] min-w-0 flex-col lg:min-h-0 lg:w-[44%] xl:w-[46%]">
          <div className="min-h-0 flex-1">
            <ResultPanel
              conversation={conversation}
              streaming={streaming}
              error={error}
              meta={meta}
              workflow={workflow}
              onStop={stop}
              onRegenerate={regenerate}
              onClear={clear}
            />
          </div>
          <form onSubmit={ask} className="border-t border-white/[0.07] p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 pl-4 transition-colors focus-within:border-indigo-300/40">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    ask(e);
                  }
                }}
                rows={1}
                placeholder={conversation ? 'Ask a follow-up about this code…' : 'Ask anything about your code…'}
                className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[14px] text-white/90 outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                disabled={!question.trim() || streaming}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-opacity disabled:opacity-25"
              >
                <Icon name="send" className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
