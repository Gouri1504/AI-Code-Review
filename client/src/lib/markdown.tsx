import { useState, type ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { highlight } from './highlight';

/**
 * A small Markdown renderer covering what the AI returns: headings, paragraphs,
 * ordered/unordered lists, pipe tables, blockquotes, fenced code (tolerating an
 * unclosed fence while streaming) and inline code/bold/italic/links, plus
 * [CRITICAL]/[HIGH]/… severity badges.
 */
export function Markdown({ source }: { source: string }) {
  return <div className="md">{parseBlocks(source)}</div>;
}

type Block =
  | { type: 'code'; lang: string; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'list'; ordered: boolean; start: number; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'quote'; text: string }
  | { type: 'hr' }
  | { type: 'p'; text: string };

function tokenize(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^\s*(```+|~~~+)\s*([\w#+.-]*)/);
    if (fence) {
      const marker = fence[1];
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) body.push(lines[i++]);
      i++; // closing fence (or end of input while streaming)
      blocks.push({ type: 'code', lang: fence[2] || '', text: body.join('\n') });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) {
          rows.push(lines[i].trim().slice(1, -1).split('|').map((c) => c.trim()));
        }
        i++;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ type: 'quote', text: body.join(' ') });
      continue;
    }
    const li = line.match(/^(\s*)([-*+]|(\d+)[.)])\s+(.*)$/);
    if (li) {
      const ordered = Boolean(li[3]);
      const start = ordered ? Number(li[3]) : 1;
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (m && m[1].length <= 1) {
          items.push(m[3]);
          i++;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && !/^\s*(```|~~~)/.test(lines[i]) && items.length) {
          // continuation / nested line — fold into the current item
          items[items.length - 1] += '\n' + lines[i].trim();
          i++;
        } else break;
      }
      blocks.push({ type: 'list', ordered, start, items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*(```|~~~)|\s*>|\s*[-*+]\s|\s*\d+[.)]\s|\s*\|)/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    if (para.length) blocks.push({ type: 'p', text: para.join('\n') });
    else i++;
  }
  return blocks;
}

function parseBlocks(src: string): ReactNode[] {
  return tokenize(src).map((b, k) => {
    switch (b.type) {
      case 'code':
        return <CodeBlock key={k} lang={b.lang} text={b.text} />;
      case 'heading': {
        const cls = b.level <= 2 ? 'md-h2' : 'md-h3';
        return (
          <h3 key={k} className={cls}>
            {inline(b.text)}
          </h3>
        );
      }
      case 'hr':
        return <hr key={k} className="my-6 border-white/10" />;
      case 'quote':
        return (
          <blockquote key={k} className="my-3 border-l-2 border-indigo-300/40 pl-4 text-white/60">
            {inline(b.text)}
          </blockquote>
        );
      case 'table':
        return (
          <div key={k} className="my-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-[13.5px]">
              <tbody>
                {b.rows.map((r, ri) => (
                  <tr key={ri} className={ri === 0 ? 'bg-white/[0.04] text-white' : 'border-t border-white/[0.06] text-white/75'}>
                    {r.map((c, ci) => (
                      <td key={ci} className="px-3 py-2 align-top">
                        {inline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'list': {
        const Tag = b.ordered ? 'ol' : 'ul';
        return (
          <Tag key={k} start={b.ordered ? b.start : undefined} className={b.ordered ? 'md-ol' : 'md-ul'}>
            {b.items.map((it, ii) => (
              <li key={ii}>{inlineMultiline(it)}</li>
            ))}
          </Tag>
        );
      }
      default:
        return (
          <p key={k} className="md-p">
            {inlineMultiline(b.text)}
          </p>
        );
    }
  });
}

function inlineMultiline(text: string): ReactNode[] {
  return text.split('\n').flatMap((line, i) => (i === 0 ? inline(line) : [<br key={`br${i}`} />, ...inline(line)]));
}

const SEVERITY: Record<string, string> = {
  CRITICAL: 'text-rose-200 border-rose-400/40 bg-rose-500/15',
  HIGH: 'text-orange-200 border-orange-400/40 bg-orange-500/15',
  MEDIUM: 'text-amber-100 border-amber-300/40 bg-amber-400/15',
  LOW: 'text-sky-200 border-sky-400/40 bg-sky-500/15',
  INFO: 'text-white/70 border-white/20 bg-white/5',
};

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*)|(\[(?:CRITICAL|HIGH|MEDIUM|LOW|INFO)\])|(\[[^\]]+\]\((https?:\/\/[^)\s]+)\))/g;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  // Fresh regex per call: inline() recurses for bold text and must not share lastIndex.
  const re = new RegExp(INLINE.source, 'g');
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [tok, code, bold, italic, sev, link, href] = m;
    const key = `i${m.index}`;
    if (code) out.push(<code key={key} className="md-code">{code.slice(1, -1)}</code>);
    else if (bold) out.push(<strong key={key} className="font-semibold text-white">{inline(bold.slice(2, -2))}</strong>);
    else if (italic) out.push(<em key={key}>{italic.slice(1, -1)}</em>);
    else if (sev) {
      const s = sev.slice(1, -1);
      out.push(
        <span key={key} className={`mr-1 inline-block rounded-md border px-1.5 py-px align-[1px] text-[10.5px] tracking-wider ${SEVERITY[s]}`}>
          {s}
        </span>,
      );
    } else if (link && href) {
      out.push(
        <a key={key} href={href} target="_blank" rel="noreferrer" className="text-indigo-300 underline decoration-indigo-300/40 underline-offset-2">
          {tok.slice(1, tok.indexOf(']('))}
        </a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="group my-4 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2">
        <span className="font-code text-[11px] uppercase tracking-wider text-white/40">{lang || 'code'}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="font-code overflow-x-auto p-4 text-[12.5px] leading-[1.65]">
        <code dangerouslySetInnerHTML={{ __html: highlight(text, lang) }} />
      </pre>
    </div>
  );
}
