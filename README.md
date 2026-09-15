<div align="center">

# CoreClaw-Model 🤖

### A local-first coding agent for your terminal and Telegram

Inspect code. Ask questions. Build plans. Stage changes. Approve with confidence.

<p>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-1.4+-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ESNext-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://ai-sdk.dev/"><img src="https://img.shields.io/badge/Vercel_AI_SDK-Tool_Agents-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel AI SDK"></a>
  <a href="https://openrouter.ai/"><img src="https://img.shields.io/badge/OpenRouter-LLM_Gateway-6E56CF?style=for-the-badge" alt="OpenRouter"></a>
  <a href="https://core.telegram.org/bots/api"><img src="https://img.shields.io/badge/Telegram-Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Bot API"></a>
  <a href="https://www.firecrawl.dev/"><img src="https://img.shields.io/badge/Firecrawl-Web_Research-FF6B35?style=for-the-badge" alt="Firecrawl"></a>
</p>

</div>

CoreClaw is a TypeScript coding assistant powered by an OpenRouter-hosted model. It works against the directory where it is launched, keeps mutations staged in memory, and asks for approval before applying changes.

> **Start here:** `bun install` then `bun run index.ts wakeup`

<details>
<summary><strong>On this page</strong></summary>

- [What It Can Do](#what-it-can-do)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running CoreClaw](#running-coreclaw)
- [CLI Workflows](#cli-workflows)
- [Telegram Commands](#telegram-commands)
- [Workspace Safety](#workspace-safety)
- [Architecture](#architecture)
- [Project Layout](#project-layout)
- [Libraries](#libraries)
- [Troubleshooting](#troubleshooting)

</details>

## What It Can Do

| Mode | Purpose | Can modify files? |
| --- | --- | --- |
| **Agent Mode** | Give the assistant a concrete coding task. It can inspect the workspace, edit files, create files, delete files, create folders, and queue shell commands. | Yes, after approval |
| **Plan Mode** | Research a goal and produce a 1-15 step implementation plan. You can select which steps to execute. | Yes, after approval |
| **Ask Mode** | Ask questions about the codebase using read-only tools. Answers can optionally be saved as Markdown. | Only the approved answer file |
| **Telegram** | Use `/ask`, `/agent`, and `/plan` from an authorized Telegram chat. | Yes, after inline approval |

Every file mutation is staged first. CoreClaw shows a diff or approval prompt before applying changes, so model-generated edits are not written immediately.

## Requirements

- [Bun](https://bun.sh/) 1.4 or newer
- An [OpenRouter](https://openrouter.ai/) API key
- An OpenRouter model identifier
- A Telegram bot token and owner chat ID for Telegram mode
- A Firecrawl API key for web search and crawling tools (optional)

## Installation

Clone the repository, enter the project directory, and install dependencies:

```bash
git clone <repository-url>
cd openClaw
bun install
```

Type-check the project:

```bash
bunx tsc --noEmit
```

There is currently no automated test script in `package.json`.

## Configuration

CoreClaw reads configuration directly from `process.env`. It does not load a `.env` file automatically, so export variables in your shell before starting the app.

### Required for AI features

| Variable | Description |
| --- | --- |
| `OPENROUTER_API_KEY` | API key passed to the OpenRouter provider. |
| `OPENROUTER_DEFAULT_MODEL` | The model ID used by Agent, Ask, and Plan modes. |

### Required for Telegram mode

| Variable | Description |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Token created by BotFather for the Telegram bot. |
| `TELEGRAM_OWNER_ID` | Authorized Telegram chat/user ID. The welcome message is sent here, and other chats are ignored. |

### Optional integrations

| Variable | Description |
| --- | --- |
| `FIRECRAWL_API_KEY` | Enables `web_search` and `web_crawl` in planning and research workflows. |
| `SKILLS_DIRS` | Additional skill directories, separated with `;` on Windows or `:` on Unix-like systems. |

Example PowerShell setup:

```powershell
$env:OPENROUTER_API_KEY = "your-openrouter-key"
$env:OPENROUTER_DEFAULT_MODEL = "your-model-id"

# Telegram mode only
$env:TELEGRAM_BOT_TOKEN = "your-telegram-bot-token"
$env:TELEGRAM_OWNER_ID = "your-telegram-chat-id"

# Optional web tools
$env:FIRECRAWL_API_KEY = "your-firecrawl-key"
```

Do not commit credentials. Keep local secrets outside version control or use your shell's secret-management workflow.

## Running CoreClaw

Start the interactive launcher:

```bash
bun run index.ts wakeup
```

The launcher displays a banner and offers:

1. **CLI** - opens the local Agent, Plan, and Ask workflows.
2. **Telegram** - sends a welcome message and starts Telegram long polling.
3. **Exit** - closes the launcher.

The package also exposes the `coreclaw-build` binary after installation:

```bash
coreclaw-build wakeup
```

Press `Ctrl+C` to stop Telegram polling.

## CLI Workflows

### Agent Mode

Agent Mode is intended for implementation work:

1. Describe the task in plain language.
2. The model uses workspace tools to inspect and change files.
3. Mutations are recorded by `ActionTracker` and kept in an in-memory overlay.
4. Review the proposed operations in the approval prompt.
5. Approve to apply them, or reject to clear the staged changes.

The default agent can read and modify files, create folders, and queue shell commands. Workspace paths are resolved relative to the current working directory. Path traversal and excluded paths are rejected.

### Plan Mode

Plan Mode separates research from execution:

1. Enter a goal.
2. The planner uses read-only workspace tools and, when configured, web tools.
3. Review the generated plan.
4. Select the steps to execute.
5. Execute selected steps through the agent.
6. Approve or reject the resulting staged changes.

Plans contain a research summary when available and between 1 and 15 steps. Web research requires `FIRECRAWL_API_KEY`.

### Ask Mode

Ask Mode is a read-focused workflow for questions such as “where is authentication handled?” or “how does this request flow through the application?” It can:

- Read text files
- List files and directories
- Search files using glob-like patterns
- Analyze workspace structure
- Discover and read supported `SKILL.md` files
- Use web tools when configured

After receiving an answer, you can save it as an approved Markdown file in the current directory. Ask Mode cannot modify existing files or execute shell commands.

## Telegram Commands

Only the chat ID matching `TELEGRAM_OWNER_ID` is authorized.

| Command | Description |
| --- | --- |
| `/start` | Display the welcome message. |
| `/ask <question>` | Research and answer a codebase question. |
| `/agent <task>` | Run an implementation task and request approval for changes. |
| `/plan <goal>` | Generate a plan, select steps with inline buttons, and execute approved work. |

Telegram uses inline buttons for plan step selection and mutation approval. Long-running agent work is started asynchronously so the bot can continue handling updates.

## Workspace Safety

The default workspace is the directory from which CoreClaw is launched: `process.cwd()`.

The tool layer:

- Rejects paths outside the workspace
- Rejects configured excluded paths
- Limits individual reads to 1 MiB
- Skips `node_modules`, `.git`, `dist`, `build`, `.next`, log files, and `.env*`
- Keeps edits in memory until approval
- Records reads, writes, deletes, folder operations, and queued shell commands

The model can still propose destructive work inside the allowed workspace. Review every approval screen before accepting changes.

## Architecture

```text
index.ts
	|
	+-- Commander: parses `wakeup`
				|
				+-- tui/wakeup.ts: banner and mode selection
							|
							+-- modes/cli.ts
							|     +-- agent/orchestrator.ts
							|     +-- plan/orchestrator.ts -> plan/planner.ts
							|     +-- ask/orchestrator.ts
							|
							+-- modes/telegram/index.ts
										+-- telegram/handlers.ts
										+-- telegram/plan-session.ts
										+-- telegram/approval-session.ts

All AI workflows
	-> ai/ai.config.ts
	-> OpenRouter model
	-> Vercel AI SDK tools and agent loops
	-> ToolExecutor
	-> ActionTracker
	-> CLI or Telegram approval
	-> apply approved operations
```

### Main layers

- **Entry point**: `index.ts` uses Commander to expose the `wakeup` command.
- **Terminal UI**: `tui/wakeup.ts` selects the top-level mode; `tui/terminal-md.ts` renders Markdown in the terminal.
- **AI configuration**: `ai/ai.config.ts` creates the OpenRouter model from environment variables.
- **Agent tools**: `modes/agent/agent-tools.ts` defines model-facing workspace operations.
- **Tool execution**: `modes/agent/tool-executor.ts` enforces path, size, and exclusion policies and maintains staged content.
- **Action tracking**: `modes/agent/action-tracker.ts` records operations and approval state.
- **Approval**: `modes/agent/approval.ts` handles CLI review; Telegram uses `approval-session.ts`.
- **Planning**: `modes/plan/planner.ts` creates structured plans with Zod validation; `selection.ts` handles step selection.
- **Web access**: `modes/plan/web-tools.ts` provides web search, URL crawling, and direct URL fetching.
- **Telegram transport**: `modes/telegram/index.ts` launches the bot; `handlers.ts` registers commands and callbacks.

## Project Layout

```text
.
├── index.ts                    # Commander entry point
├── ai/
│   ├── ai.config.ts            # OpenRouter model configuration
│   └── index.ts                # AI module exports
├── modes/
│   ├── cli.ts                  # CLI mode selector
│   ├── agent/                  # Tools, orchestration, tracking, approval
│   ├── ask/                    # Read-only question answering
│   ├── plan/                   # Structured planning and web tools
│   └── telegram/               # Bot startup, handlers, and Telegram sessions
├── tui/
│   ├── terminal-md.ts          # Markdown terminal renderer
│   └── wakeup.ts               # Banner and top-level selection
├── package.json                # Scripts, metadata, and dependencies
├── tsconfig.json               # Strict Bun/TypeScript configuration
└── README.md
```

## Libraries

### Runtime dependencies

| Technology / package | Role in CoreClaw |
| --- | --- |
| 🧭 `@clack/prompts` | Select menus, text input, confirmation, and multiselect prompts. |
| 🔥 `@mendable/firecrawl-js` | Web search and webpage crawling for optional research tools. |
| 🧠 `@openrouter/ai-sdk-provider` | Connects the Vercel AI SDK to OpenRouter models. |
| 🤖 `ai` | `ToolLoopAgent`, text generation, tools, step limits, structured output, and model middleware. |
| 🎨 `chalk` | Colored and styled terminal output. |
| 🖥️ `commander` | Top-level command parsing and the `wakeup` command. |
| 📝 `diff` | Produces text diffs for proposed file changes. |
| ✨ `figlet` | Renders the startup banner. |
| 📄 `marked` | Parses Markdown. |
| 📟 `marked-terminal` | Renders Markdown for terminal output. |
| ✈️ `telegraf` | Telegram bot polling, command handlers, callbacks, and replies. |

### TypeScript and development packages

| Package | Role |
| --- | --- |
| `@types/bun` | Bun runtime type definitions. |
| `@types/node` | Node-compatible API type definitions used by the source. |
| `@types/marked-terminal` | Type definitions for terminal Markdown rendering. |
| `typescript` | Type-checking through the peer dependency declaration. |

The source also imports `zod` for tool input validation and structured plan schemas. If dependency installation does not provide it through the current lockfile, add it explicitly with `bun add zod`.

## Troubleshooting

### `OPENROUTER_DEFAULT_MODEL is not configured`

Set `OPENROUTER_DEFAULT_MODEL` before entering Agent, Ask, or Plan Mode. The model is created lazily when an AI workflow starts.

### Telegram does not respond

Check that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OWNER_ID` are set in the same shell that launches CoreClaw. Confirm that the Telegram user is using the chat ID configured as the owner.

### Telegram prints `Bot is not running!`

This means shutdown was requested before Telegraf finished starting. Check the startup error immediately before it and verify the token, network access, and Bun/Telegraf compatibility.

### Firecrawl tools are unavailable

Set `FIRECRAWL_API_KEY` before starting CoreClaw. Without it, local workspace research still works, but web search and crawling tools are not available.

### Changes are not written immediately

This is expected. Agent and Plan workflows stage mutations and require approval. Rejecting the approval clears the in-memory staging area.

## Development Notes

Use strict TypeScript checks during development:

```bash
bunx tsc --noEmit
```

The project uses Bun's TypeScript execution directly, ES modules, bundler-style module resolution, and no build output (`noEmit: true`). Keep the process working directory at the target codebase root so relative paths and `process.cwd()` point to the intended workspace.
