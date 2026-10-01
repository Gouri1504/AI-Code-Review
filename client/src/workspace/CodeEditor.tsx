import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react';
import { Icon } from '../components/Icon';
import { LANGUAGES, SAMPLE_CODE } from '../content';
import { detectLanguage, highlight } from '../lib/highlight';

type Props = {
  code: string;
  language: string;
  fileName: string;
  onCode: (code: string) => void;
  onLanguage: (lang: string) => void;
  onFileName: (name: string) => void;
  onSubmit: () => void;
};

const MAX_FILE_BYTES = 500_000;

/** Dependency-free code editor: a transparent textarea over a syntax-highlighted <pre>. */
export function CodeEditor({ code, language, fileName, onCode, onLanguage, onFileName, onSubmit }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const html = useMemo(() => highlight(code, language), [code, language]);
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  const syncScroll = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) preRef.current.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-ta.scrollTop}px)`;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
      return;
    }
    if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = ta;
      if (e.shiftKey) {
        // Outdent the current line.
        const lineStart = code.lastIndexOf('\n', s - 1) + 1;
        const removed = code.slice(lineStart, lineStart + 2).match(/^ {1,2}/)?.[0].length ?? 0;
        if (!removed) return;
        onCode(code.slice(0, lineStart) + code.slice(lineStart + removed));
        requestAnimationFrame(() => ta.setSelectionRange(Math.max(lineStart, s - removed), Math.max(lineStart, end - removed)));
      } else {
        onCode(code.slice(0, s) + '  ' + code.slice(end));
        requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
      }
    }
  };

  const loadFile = async (file: File) => {
    setFileError('');
    if (file.size > MAX_FILE_BYTES) {
      setFileError('File is larger than 500 KB.');
      return;
    }
    const text = await file.text();
    onCode(text);
    onFileName(file.name);
    const lang = detectLanguage(file.name);
    if (lang) onLanguage(lang);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void loadFile(file);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void loadFile(file);
    e.target.value = '';
  };

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] px-3 py-2">
        <input
          value={fileName}
          onChange={(e) => onFileName(e.target.value)}
          aria-label="File name"
          className="font-code w-36 min-w-0 rounded-md bg-transparent px-2 py-1 text-[12px] text-white/70 outline-none focus:bg-white/5 sm:w-44"
        />
        <select
          value={language}
          onChange={(e) => onLanguage(e.target.value)}
          aria-label="Language"
          className="rounded-md border border-white/10 bg-[#0d0d0f] px-2 py-1 text-[12px] text-white/75 outline-none focus:border-white/25"
        >
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton icon="upload" label="Upload" onClick={() => fileRef.current?.click()} />
          <ToolbarButton
            icon="doc"
            label="Sample"
            onClick={() => {
              onCode(SAMPLE_CODE);
              onLanguage('JavaScript');
              onFileName('orders.js');
            }}
          />
          <ToolbarButton icon="trash" label="Clear" onClick={() => onCode('')} />
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={onPick} />
      </div>

      {/* Editor surface */}
      <div className="font-code relative min-h-0 flex-1 overflow-hidden text-[13px] leading-[1.7]">
        <div className="absolute inset-y-0 left-0 w-12 overflow-hidden border-r border-white/[0.05] bg-[#070707]">
          <div ref={gutterRef} className="px-2 pt-4 text-right text-white/20 select-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 left-12 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none m-0 whitespace-pre p-4 text-white/85"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <textarea
            ref={taRef}
            value={code}
            onChange={(e) => onCode(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            aria-label="Code editor"
            placeholder="Paste code, drop a file, or load the sample…"
            className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 text-transparent caret-indigo-300 outline-none selection:bg-indigo-400/30 placeholder:text-white/25"
          />
        </div>

        {dragging && (
          <div className="absolute inset-2 z-10 flex items-center justify-center rounded-xl border border-dashed border-indigo-300/50 bg-indigo-500/10 text-[14px] text-indigo-100 backdrop-blur-sm">
            Drop a file to load it
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.07] px-3 py-1.5 text-[11px] text-white/35">
        <span>
          {lineCount} lines · {code.length.toLocaleString()} chars
        </span>
        {fileError ? <span className="text-rose-300">{fileError}</span> : <span className="hidden sm:inline">Ctrl/⌘ + Enter to run</span>}
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label, onClick }: { icon: 'upload' | 'doc' | 'trash'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
