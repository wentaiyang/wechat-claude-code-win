# WeChat Claude Code Win

[English](README.md) | **中文**

这是一个偏 Windows 友好的 WeChat ↔ Claude Code 桥接项目。它可以让你通过微信与本地 Claude Code 对话，支持文字、图片、审批和基础斜杠命令。

## 功能

- 通过微信与 Claude Code 对话
- 发送图片给 Claude 分析
- 在微信里回复审批结果
- 斜杠命令：`/help`、`/clear`、`/model`、`/status`、`/skills`、`/projects`、`/project <编号>`
- 跨消息保留会话
- 附带 Windows 启动脚本
- 附带 macOS daemon 脚本

## 前置条件

- Node.js >= 18
- 可扫码绑定的个人微信账号
- 已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

## 安装

```bash
git clone <你的仓库地址>
cd wechat-claude-code
npm install
```

`npm install` 会自动完成 TypeScript 构建。

## 快速开始

### 1. 首次设置

```bash
npm run setup
```

设置流程会：
- 尝试打开二维码图片
- 等你用微信扫码绑定
- 让你输入默认工作目录

### 2. 启动桥接

**Windows**

```bash
start-wechat-claude-code.bat
```

或直接运行：

```bash
node dist/main.js start
```

**macOS**

```bash
npm run daemon -- start
```

### 3. 在微信里使用

桥启动后，直接在微信里发消息即可。

## 微信命令

| 命令 | 说明 |
|------|------|
| `/help` | 查看帮助 |
| `/clear` | 清空当前会话 |
| `/model <名称>` | 切换 Claude 模型 |
| `/status` | 查看当前会话状态 |
| `/skills` | 列出已安装的 Claude Code skill |
| `/projects` | 列出工作区根目录下可切换项目 |
| `/project <编号>` | 按编号切换到项目 |
| `/<skill> [参数]` | 触发已安装 skill |

## 项目切换

桥接会扫描当前仓库目录的上一级目录，把其中的兄弟项目列出来。

例如：
- 仓库放在 `你的工作区/wechat-claude-code-win`
- `/projects` 会扫描这个仓库的上一级目录
- `/project 2` 会切换到列表中的第 2 个项目

切项目时会自动清空旧的 Claude 会话，确保下一条消息从新项目上下文开始。

## 配置说明

- 第一次运行 `npm run setup` 时，会让你输入默认工作目录。
- 运行时配置保存在 `~/.wechat-claude-code/config.env`。
- 项目切换会把当前仓库的上一级目录视为工作区根目录。
- 真实账号数据、session 和日志不要提交到 Git。

## 数据目录

运行数据默认保存在：

```text
~/.wechat-claude-code/
```

通常包括：
- 账号绑定数据
- config.env
- sessions
- logs

这个目录不要提交到 Git。

## 开发

```bash
npm run build
npm run dev
```

## License

[MIT](LICENSE)
