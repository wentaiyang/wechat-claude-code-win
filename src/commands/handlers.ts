import type { CommandContext, CommandResult } from './router.js';
import { scanAllSkills, findSkill, type SkillInfo } from '../claude/skill-scanner.js';
import { readdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';

declare const process: { cwd(): string };

const PROJECTS_ROOT = resolve(process.cwd(), '..');
const EXCLUDED_PROJECT_NAMES = new Set([basename(resolve(process.cwd()))]);

const HELP_TEXT = `可用命令：

  /help              显示帮助
  /clear             清除当前会话
  /model <名称>      切换 Claude 模型
  /status            查看当前会话状态
  /skills            列出已安装的 skill
  /projects          列出可切换项目
  /project <编号>    切换到对应项目
  /<skill> [参数]    触发已安装的 skill

当前默认会自动放行大部分本地开发操作，仅高危外部操作继续审批。
收到权限请求时，可回复 y / yes / 允许 / 同意，或 n / no / 拒绝 / 取消。
直接输入文字即可与 Claude Code 对话`;

let cachedSkills: SkillInfo[] | null = null;
let lastScanTime = 0;
const CACHE_TTL = 60_000;

function getSkills(): SkillInfo[] {
  const now = Date.now();
  if (!cachedSkills || now - lastScanTime > CACHE_TTL) {
    cachedSkills = scanAllSkills();
    lastScanTime = now;
  }
  return cachedSkills;
}

function getProjects(): Array<{ name: string; path: string }> {
  try {
    return readdirSync(PROJECTS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !EXCLUDED_PROJECT_NAMES.has(entry.name))
      .map((entry) => ({ name: entry.name, path: join(PROJECTS_ROOT, entry.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  } catch {
    return [];
  }
}

export function invalidateSkillCache(): void {
  cachedSkills = null;
}

export function handleHelp(_args: string): CommandResult {
  return { reply: HELP_TEXT, handled: true };
}

export function handleClear(ctx: CommandContext): CommandResult {
  const newSession = ctx.clearSession();
  Object.assign(ctx.session, newSession);
  return { reply: '✅ 会话已清除，下次消息将开始新会话。', handled: true };
}

export function handleModel(ctx: CommandContext, args: string): CommandResult {
  if (!args) {
    return { reply: '用法: /model <模型名称>\n例: /model claude-sonnet-4-6', handled: true };
  }
  ctx.updateSession({ model: args });
  return { reply: `✅ 模型已切换为: ${args}`, handled: true };
}

export function handleStatus(ctx: CommandContext): CommandResult {
  const s = ctx.session;
  const lines = [
    '📊 会话状态',
    '',
    `工作目录: ${s.workingDirectory}`,
    `模型: ${s.model ?? '默认'}`,
    `权限模式: ${s.permissionMode ?? '默认'}`,
    '自动放行: 大部分本地开发操作，仅高危外部操作审批',
    `会话ID: ${s.sdkSessionId ?? '无'}`,
    `状态: ${s.state}`,
  ];
  return { reply: lines.join('\n'), handled: true };
}

export function handleSkills(): CommandResult {
  invalidateSkillCache();
  const skills = getSkills();
  if (skills.length === 0) {
    return { reply: '未找到已安装的 skill。', handled: true };
  }
  const lines = skills.map((s) => `/${s.name} — ${s.description}`);
  return { reply: `📋 已安装的 Skill (${skills.length}):\n\n${lines.join('\n')}`, handled: true };
}

export function handleProjects(_ctx: CommandContext): CommandResult {
  const projects = getProjects();
  if (projects.length === 0) {
    return {
      reply: `未找到可切换项目。\n请检查目录: ${PROJECTS_ROOT}`,
      handled: true,
    };
  }

  const lines = projects.map((project, index) => `${index + 1}. ${project.name}\n   ${project.path}`);
  return {
    reply: `📁 可切换项目 (${projects.length})：\n\n${lines.join('\n')}`,
    handled: true,
  };
}

export function handleProject(ctx: CommandContext, args: string): CommandResult {
  const value = args.trim();
  if (!value) {
    return { reply: '用法: /project <编号>\n先发送 /projects 查看编号列表', handled: true };
  }

  const projects = getProjects();
  if (projects.length === 0) {
    return {
      reply: `未找到可切换项目。\n请检查目录: ${PROJECTS_ROOT}`,
      handled: true,
    };
  }

  const index = Number(value);
  const selected = Number.isInteger(index) && index >= 1 && index <= projects.length
    ? projects[index - 1]
    : projects.find((project) => project.name.toLowerCase() === value.toLowerCase());

  if (!selected) {
    return {
      reply: `未找到项目: ${value}\n先发送 /projects 查看编号列表`,
      handled: true,
    };
  }

  ctx.updateSession({
    workingDirectory: selected.path,
    sdkSessionId: undefined,
    state: 'idle',
  });

  return {
    reply: `✅ 已切换到项目: ${selected.name}\n工作目录: ${selected.path}\n已清空旧会话，下一条消息将从新项目开始。`,
    handled: true,
  };
}

export function handleUnknown(cmd: string, args: string): CommandResult {
  const skills = getSkills();
  const skill = findSkill(skills, cmd);

  if (skill) {
    const prompt = args ? `Use the ${skill.name} skill: ${args}` : `Use the ${skill.name} skill`;
    return { handled: true, claudePrompt: prompt };
  }

  return {
    handled: true,
    reply: `未找到 skill: ${cmd}\n输入 /skills 查看可用列表`,
  };
}
