import type { IconName } from './components/Icon';

export const BRAND = {
  name: 'AI Code Review Application',
  short: 'AI Code Review',
  tagline: 'Review code. Fix bugs. Build features. Ship better software.',
  supporting: 'One intelligent workspace to understand, review, debug, enhance, test, secure, and improve your code.',
  heroDescription:
    'AI Code Review Application brings review, debugging, feature development, enhancement, testing, security, and documentation into one intelligent coding workspace.',
};

export type NavItem = { label: string; href: string };

export const NAV_DESKTOP: NavItem[] = [
  { label: 'Review', href: '/workspace?w=review' },
  { label: 'Debug', href: '/workspace?w=debug' },
  { label: 'Enhance', href: '/workspace?w=enhance' },
  { label: 'Features', href: '/#features' },
  { label: 'Workspace', href: '/#workspace' },
  { label: 'Docs', href: '/#docs' },
];

export const NAV_MOBILE: NavItem[] = [
  { label: 'Review', href: '/workspace?w=review' },
  { label: 'Debug', href: '/workspace?w=debug' },
  { label: 'Enhance', href: '/workspace?w=enhance' },
  { label: 'Features', href: '/#features' },
  { label: 'Workspace', href: '/#workspace' },
  { label: 'Documentation', href: '/#docs' },
];

export type WorkflowId =
  | 'review'
  | 'debug'
  | 'feature'
  | 'enhance'
  | 'refactor'
  | 'explain'
  | 'comments'
  | 'tests'
  | 'security'
  | 'performance'
  | 'docs'
  | 'chat';

export type Workflow = {
  id: WorkflowId;
  title: string;
  description: string;
  icon: IconName;
  /** Primary workflows appear in the landing feature grid. */
  primary: boolean;
  /** When set, the workspace shows an extra input with this label/placeholder. */
  input?: { label: string; placeholder: string; required: boolean };
  action: string;
};

export const WORKFLOWS: Workflow[] = [
  { id: 'review', title: 'AI Code Review', description: 'Find bugs, issues, and bad practices.', icon: 'review', primary: true, action: 'Review code' },
  {
    id: 'debug',
    title: 'Debug',
    description: 'Detect root causes and generate fixes.',
    icon: 'bug',
    primary: true,
    action: 'Debug',
    input: { label: 'Error or symptom', placeholder: 'Paste the error message, stack trace, or describe what goes wrong…', required: false },
  },
  {
    id: 'feature',
    title: 'Add Feature',
    description: 'Build new functionality from natural-language prompts.',
    icon: 'plus',
    primary: true,
    action: 'Build feature',
    input: { label: 'Feature request', placeholder: 'e.g. Add pagination with a page size option and total count…', required: true },
  },
  { id: 'enhance', title: 'Enhance Code', description: 'Improve existing implementations.', icon: 'sparkles', primary: true, action: 'Enhance' },
  { id: 'refactor', title: 'Refactor', description: 'Clean and simplify code without changing behavior.', icon: 'layers', primary: true, action: 'Refactor' },
  { id: 'explain', title: 'Code Explanation', description: 'Explain complex code in simple language.', icon: 'book', primary: true, action: 'Explain' },
  { id: 'comments', title: 'Smart Comments', description: 'Automatically generate useful code comments.', icon: 'comment', primary: true, action: 'Add comments' },
  { id: 'tests', title: 'Test Generation', description: 'Generate unit, integration, and edge-case tests.', icon: 'flask', primary: true, action: 'Generate tests' },
  { id: 'security', title: 'Security Scan', description: 'Detect vulnerabilities and unsafe patterns.', icon: 'shield', primary: true, action: 'Scan' },
  { id: 'performance', title: 'Performance Optimization', description: 'Identify bottlenecks and suggest improvements.', icon: 'bolt', primary: true, action: 'Optimize' },
  { id: 'docs', title: 'Documentation', description: 'Generate README, API, and function documentation.', icon: 'doc', primary: true, action: 'Generate docs' },
  {
    id: 'chat',
    title: 'AI Coding Chat',
    description: 'Ask anything about your code.',
    icon: 'chat',
    primary: false,
    action: 'Ask',
    input: { label: 'Question', placeholder: 'Ask anything about this code…', required: true },
  },
];

export const WORKFLOW_BY_ID = Object.fromEntries(WORKFLOWS.map((w) => [w.id, w])) as Record<WorkflowId, Workflow>;

export const PIPELINE = ['Code', 'Understand', 'Review', 'Debug', 'Build', 'Enhance', 'Refactor', 'Test', 'Secure', 'Document', 'Ship'];

export const FLOATING_SNIPPETS = [
  'review()',
  'debug()',
  'refactor()',
  'generateTests()',
  'security.scan()',
  'optimize()',
  'explain()',
  'generateDocs()',
  'addFeature()',
];

export const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'SQL', 'Other'];

export const SAMPLE_CODE = `import { db } from './db';

export async function getUserOrders(userId, page) {
  const query = "SELECT * FROM orders WHERE user_id = " + userId;
  const orders = await db.query(query);

  let total = 0;
  for (let i = 0; i <= orders.length; i++) {
    total += orders[i].amount;
  }

  const pageSize = 10;
  const start = page * pageSize;
  return {
    orders: orders.slice(start, start + pageSize),
    total: total,
    average: total / orders.length,
  };
}
`;
