# WeChat Claude Code Win

**English** | [中文](README_zh.md)

A Windows-friendly WeChat ↔ Claude Code bridge. It lets you chat with your local Claude Code from WeChat, including text, images, approvals, and basic slash commands.

## Features

- Chat with Claude Code from WeChat
- Send images for Claude to analyze
- Approve tool use from WeChat replies
- Slash commands: `/help`, `/clear`, `/model`, `/status`, `/skills`, `/projects`, `/project <number>`
- Resume sessions across messages
- Windows startup script included
- macOS daemon script included

## Prerequisites

- Node.js >= 18
- A personal WeChat account for QR binding
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

## Installation

```bash
git clone <your-repo-url>
cd wechat-claude-code
npm install
```

`npm install` will also build the TypeScript project.

## Quick Start

### 1. First-time setup

```bash
npm run setup
```

The setup flow will:
- open a QR code image when possible
- ask you to scan it with WeChat
- ask you for the default working directory

### 2. Start the bridge

**Windows**

```bash
start-wechat-claude-code.bat
```

Or run directly:

```bash
node dist/main.js start
```

**macOS**

```bash
npm run daemon -- start
```

### 3. Use it in WeChat

Send messages directly in WeChat after the bridge starts.

## WeChat Commands

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/clear` | Clear the current session |
| `/model <name>` | Switch Claude model |
| `/status` | Show current session state |
| `/skills` | List installed Claude Code skills |
| `/projects` | List switchable projects in the workspace root |
| `/project <number>` | Switch to a listed project by number |
| `/<skill> [args]` | Trigger an installed skill |

## Project Switching

The bridge can list sibling project folders next to the repository directory.

Example:
- if the bridge repo is in `your-workspace/wechat-claude-code-win`
- `/projects` will scan the parent workspace directory
- `/project 2` will switch to the second listed project

Switching projects clears the old Claude session automatically so the next message starts cleanly in the new project.

## Configuration Notes

- The first `npm run setup` will ask you for a default working directory.
- Runtime config is stored in `~/.wechat-claude-code/config.env`.
- Project switching uses the parent directory of the repository as the workspace root.
- Keep your real account data, session files, and logs out of Git.

## Data Directory

Runtime data is stored under:

```text
~/.wechat-claude-code/
```

Typical contents include:
- account binding data
- config.env
- sessions
- logs

Do not commit that directory.

## Development

```bash
npm run build
npm run dev
```

## License

[MIT](LICENSE)
