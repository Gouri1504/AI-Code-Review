export const WORKFLOW_IDS = [
  'review',
  'debug',
  'feature',
  'enhance',
  'refactor',
  'explain',
  'comments',
  'tests',
  'security',
  'performance',
  'docs',
  'chat',
] as const;

export type WorkflowId = (typeof WORKFLOW_IDS)[number];
