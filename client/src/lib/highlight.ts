const KEYWORDS = new Set(
  (
    'abstract as async await break case catch class const continue def default defer del delete do elif else enum export extends ' +
    'false final finally fn for from func function go if impl implements import in instanceof interface is lambda let loop match ' +
    'mod module mut new nil None not null of or and package pass private protected public raise readonly return self pub static struct ' +
    'super switch this throw throws trait true True False try type typeof undefined use var void while with yield'
  ).split(' '),
);

const TYPES = new Set('string number boolean any unknown never int float str bool dict list tuple Promise Array Record Map Set void'.split(' '));

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// One pass tokenizer: comments, strings, numbers, identifiers, everything else.
const TOKEN =
  /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b|\b0x[\da-f]+\b)|([A-Za-z_$][\w$]*)|([\s\S])/gi;

/** Returns escaped HTML with span classes for a lightweight, language-agnostic highlight. */
export function highlight(code: string, language: string): string {
  const hashComments = /python|ruby|shell|bash|yaml|other/i.test(language);
  let out = '';
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    const [text, comment, str, num, ident] = m;
    if (comment) {
      if (comment.startsWith('#') && !hashComments) {
        // `#` is not a comment here (e.g. private fields, C# preprocessor) — emit it and rescan the rest.
        out += '#';
        TOKEN.lastIndex = m.index + 1;
        continue;
      }
      out += `<span class="tk-c">${escape(comment)}</span>`;
    } else if (str) out += `<span class="tk-s">${escape(str)}</span>`;
    else if (num) out += `<span class="tk-n">${num}</span>`;
    else if (ident) {
      const next = code.charAt(TOKEN.lastIndex);
      if (KEYWORDS.has(ident)) out += `<span class="tk-k">${ident}</span>`;
      else if (TYPES.has(ident) || /^[A-Z][A-Za-z0-9]*$/.test(ident)) out += `<span class="tk-t">${ident}</span>`;
      else if (next === '(') out += `<span class="tk-f">${ident}</span>`;
      else out += ident;
    } else out += escape(text);
  }
  // A trailing newline needs a character after it or the <pre> collapses the last empty line.
  return out + '\n';
}

export function detectLanguage(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript',
    js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
    py: 'Python', go: 'Go', rs: 'Rust', java: 'Java', cs: 'C#',
    cpp: 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++', h: 'C++', c: 'C++',
    php: 'PHP', rb: 'Ruby', kt: 'Kotlin', kts: 'Kotlin', swift: 'Swift', sql: 'SQL',
  };
  return map[ext] ?? null;
}
