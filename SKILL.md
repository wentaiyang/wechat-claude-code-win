---
name: wechat-claude-code
description: 微信桥接 - 在微信中与本地 Claude Code 对话，支持文字、图片、审批和基础命令。
---

# WeChat Claude Code Bridge

通过微信与本地 Claude Code 对话。

## 前置条件

- Node.js >= 18
- 个人微信账号（需扫码绑定）
- 已安装 Claude Code（含 Agent SDK）

## 安装

```bash
npm install
```

## 常用命令

```bash
npm run setup
npm run build
node dist/main.js start
```

macOS 也可以使用：

```bash
npm run daemon -- start
```

## 微信侧命令

- `/help`
- `/clear`
- `/model <名称>`
- `/status`
- `/skills`
- `/projects`
- `/project <编号>`

## 说明

- `/projects` 会扫描仓库目录的上一级目录，列出可切换项目
- `/project <编号>` 会切换到选中的项目
- 切换项目时会自动清空旧会话

## 数据目录

运行数据在：

```text
~/.wechat-claude-code/
```

请不要把其中的账号、session、日志等数据提交到仓库。
