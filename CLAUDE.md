# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bun install

# Run the interactive TUI
bun run dev                   # or: ./run.sh
bun run src/entrypoints/cli.tsx -- --print "prompt"  # non-interactive

# Type-check (tsc --noEmit)
bun run typecheck

# Lint with Biome
bun run lint                  # check only
bun run lint:fix              # check + write fixes

# Production bundle via esbuild
bun scripts/build-bundle.ts --minify

# Test opencode API adapter standalone
bun test/test-opencode.js

# Dev launcher wrapper (sets env for free-tier mode)
bun dev-launcher.ts
```

## Architecture

This is a fork of Claude Code that replaces the Anthropic API backend with free LLM models via [OpenCode](https://opencode.ai). It's a full-featured terminal UI built with **Ink v5** + **React v19**, using **Bun** as the runtime and **esbuild** for production bundles.

### Entry point flow

```
run.sh ──→ dev-launcher.ts ──→ src/entrypoints/cli.tsx ──→ src/main.tsx
```

- `run.sh` — shell wrapper that preconfigures env vars for opencode free tier and creates a dummy config to skip onboarding.
- `dev-launcher.ts` — sets `MACRO.VERSION`, registers a Bun `.md` loader plugin, patches `process.exit`/uncaught handlers for tracing, then imports `cli.tsx`.
- `src/entrypoints/cli.tsx` — fast-path dispatcher: detects `--version`, `--print`, `daemon`, `bridge`, `remote-control`, `--bg`, `worktree--tmux`, etc. via dynamic imports. Falls through to `src/main.tsx`.
- `src/main.tsx` — the main `main()` function (line 585) containing all top-level init side effects: MDM prefetch, keychain prefetch, GrowthBook, policy limits, config, permissions, setup, then the Ink render loop.

### OpenCode adapter (the fork's core)

```
src/services/api/opencode/
├── client.ts    # OpenAI-compatible /chat/completions client (fetch-based)
├── messages.ts  # Claude message format → OpenAI format converter
├── tools.ts     # Anthropic tool schema → OpenAI function calling converter
├── stream.ts    # OpenAI SSE chunks → Claude-style stream events
└── models.ts    # Free model discovery via catalog API + caching
```

The adapter plugs in at `src/services/api/opencode-query.ts` via `queryModelWithOpencodeStreaming()`, which translates the Claude message loop into OpenAI-compatible streaming calls and yields events that match the Claude SDK's stream event shape. The switch happens in `src/query/deps.ts`:

```ts
callModel: isOpencodeEnabled()
  ? queryModelWithOpencodeStreaming
  : queryModelWithStreaming
```

`isOpencodeEnabled()` checks `OPEN_CLAUDE_ENABLED`, then `ANTHROPIC_API_KEY`, defaulting to `true` (opencode mode) when neither is set.

### Query loop

`src/query.ts` exports `query()` — the main model interaction loop. It yields `StreamEvent`, `Message`, and other types in a single async generator. The loop manages tool execution, compaction, output token recovery, and stop hooks. Tools are run via `runTools()` from `src/query.ts` importing from `src/tools.ts`.

### Tools

- `src/Tool.ts` — base `Tool` class and type definitions (`ToolInputJSONSchema`, `ToolUseBlockParam`, etc.)
- `src/tools.ts` — tool registry (`getTools()`) that collects all built-in tools + MCP tools + skill tools.
- `src/tools/` — 60+ tool implementations (BashTool, FileReadTool, FileWriteTool, AgentTool, GrepTool, GlobTool, etc.)

### Commands

- `src/commands.ts` — registers and resolves CLI subcommands.
- `src/commands/` — 100+ individual command directories (each containing handler, prompt, tests, etc.).

### Components & UI

- `src/components/` — ~200 Ink/React components. The root component is `App.tsx` which renders the main chat interface, settings dialogs, onboarding flow, etc.
- `src/hooks/` — ~80 custom React hooks for terminal interaction, API calls, settings, permissions, IDE integration, etc.
- Ink v5 is used as the React terminal renderer; the render loop is in `src/ink/`.

### Skills

`src/skills/` — the skill system: bundled skills (defined in `src/skills/bundled/`), MCP skills, and dynamically loaded skills. Skills are reusable prompts with optional tool access, invocable via `/skill-name`.

### Services

`src/services/` — API clients (`claude.ts`, `opencode/`, `bootstrap.ts`, `filesApi.ts`), analytics (Statsig/GrowthBook), MCP (`mcp/`), auth (`oauth/`, `claudeAiLimits.ts`), policy limits (`policyLimits/`), settings sync (`remoteManagedSettings/`, `settingsSync/`), telemetry, session management, etc.

### Feature flags

Uses the `feature('FLAG_NAME')` function from `bun:bundle` for build-time dead code elimination via esbuild's `define`. Many flags (DAEMON, BRIDGE_MODE, BG_SESSIONS, KAIROS, COORDINATOR_MODE) are Ant-internal and gated behind feature checks.

### Entrypoint modes

| Flag | Entry path | Description |
|------|-----------|-------------|
| (none) | `main.tsx` → Ink TUI | Interactive terminal UI |
| `--print` | `cli/print.ts` | Non-interactive single-turn |
| `--bg` | `cli/bg.ts` | Background session |
| `remote-control` | `bridge/bridgeMain.ts` | Bridge/remote control |
| `daemon` | `daemon/main.ts` | Long-running supervisor |
| `--claude-in-chrome-mcp` | Chrome MCP server | Chrome extension bridge |
| `environment-runner` | BYOC runner | Headless BYOC environment |
| `self-hosted-runner` | Worker poller | Self-hosted runner |

### Key env vars (opencode-specific)

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPEN_CLAUDE_ENABLED` | `true` (auto) | Bypass Anthropic API key check |
| `OPENCODE_API_KEY` | `"public"` | OpenCode API key |
| `OPEN_CLAUDE_BASE_URL` | `https://opencode.ai/zen/v1` | API base URL |
| `OPEN_CLAUDE_MODEL` | `deepseek-v4-flash-free` | Model name |
| `OPENCODE_MODELS_URL` | `https://models.dev/api.json` | Model catalog |
