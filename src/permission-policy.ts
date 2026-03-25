const AUTO_ALLOW_TOOLS = new Set([
  'Read',
  'Glob',
  'Grep',
  'LS',
  'WebFetch',
  'WebSearch',
  'TaskOutput',
]);

const HIGH_RISK_PATTERNS: RegExp[] = [
  /\bgit\s+push\b/i,
  /\bgh\s+(?:pr|issue|release)\s+(?:create|edit|merge|close|reopen|comment)\b/i,
  /\brm\s+-rf\b/i,
  /\bdel\s+\/f\b/i,
  /\brmdir\b.*\/(?:s|q)\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+clean\b/i,
  /\bgit\s+checkout\s+--\b/i,
  /\bgit\s+restore\b/i,
  /\btaskkill\b/i,
  /\bshutdown\b/i,
  /\bdrop\s+table\b/i,
  /\btruncate\s+table\b/i,
  /\bkubectl\s+(?:delete|apply)\b/i,
  /\bterraform\s+apply\b/i,
  /\b(vercel|netlify|railway|flyctl)\b.*\b(deploy|deployments?)\b/i,
  /\bnpm\s+publish\b/i,
  /\bpip\s+publish\b/i,
  /\btwilio\b/i,
  /\bcurl\b.*https?:\/\//i,
  /\bInvoke-WebRequest\b.*https?:\/\//i,
  /\bStart-Process\b/i,
];

function parseInput(toolInput: string): Record<string, unknown> {
  try {
    return JSON.parse(toolInput) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function extractCommand(toolInput: string): string {
  const parsed = parseInput(toolInput);
  const command = parsed.command;
  return typeof command === 'string' ? command : toolInput;
}

export interface PermissionDecision {
  allow: boolean;
  reason: string;
}

export function decidePermission(toolName: string, toolInput: string): PermissionDecision {
  if (AUTO_ALLOW_TOOLS.has(toolName)) {
    return { allow: true, reason: `auto-allow tool ${toolName}` };
  }

  if (toolName === 'Bash') {
    const command = extractCommand(toolInput);
    const blocked = HIGH_RISK_PATTERNS.find((pattern) => pattern.test(command));
    if (blocked) {
      return { allow: false, reason: `manual approval required for risky command: ${command.slice(0, 120)}` };
    }
    return { allow: true, reason: 'auto-allow non-risky Bash command' };
  }

  if (toolName === 'Edit' || toolName === 'Write' || toolName === 'NotebookEdit') {
    return { allow: true, reason: `auto-allow local file mutation via ${toolName}` };
  }

  return { allow: true, reason: `auto-allow default tool ${toolName}` };
}
