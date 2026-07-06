# open-claude

**Claude Code TUI + Free LLM Backend**

A fork of Anthropic's Claude Code CLI that replaces the proprietary API with free/open-source LLM models via [OpenCode](https://opencode.ai). No API key required.

![screenshot](https://img.shields.io/badge/runtime-Bun-ff69b4)

---

## Quick Start

```bash
# Install globally
bash setup.sh

# Run from any directory
open_claude
```

## Requirements

- **Bun** >= 1.1.0

```bash
curl -fsSL https://bun.sh/install | bash
```

## Usage

```bash
# Interactive TUI (from any directory)
open_claude

# Non-interactive
open_claude --print "Explain this project"

# Inside the project directory
./run.sh

# Override model
OPEN_CLAUDE_MODEL=deepseek-v3 ./run.sh

# Use your own Anthropic account instead
ANTHROPIC_API_KEY=sk-... ./run.sh
```

## How It Works

open-claude replaces the Anthropic API backend with an OpenAI-compatible adapter that talks to OpenCode's free tier. The entire Claude Code UI (Ink + React), tool system (60+ tools), and command infrastructure are preserved.

```
run.sh ──→ dev-launcher.ts ──→ cli.tsx ──→ main.tsx
                                         ↓
                              queryModelWithOpencodeStreaming()
                                         ↓
                              OpenCode API (OpenAI-compatible)
```

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `OPEN_CLAUDE_MODEL` | `deepseek-v4-flash-free` | Model to use |
| `OPENCODE_API_KEY` | `"public"` | OpenCode API key |
| `OPEN_CLAUDE_BASE_URL` | `https://opencode.ai/zen/v1` | API endpoint |
| `ANTHROPIC_API_KEY` | `sk-opencode-dummy` | Dummy key (required to skip OAuth) |

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run dev

# Type-check
bun run typecheck

# Lint
bun run lint

# Test adapter
bun test/test-opencode.js

# Production bundle
bun scripts/build-bundle.ts --minify
```

## Project Structure

```
src/services/api/opencode/    # Core adapter (the fork's heart)
├── client.ts                 # OpenAI-compatible SSE client
├── messages.ts               # Message format conversion
├── tools.ts                  # Tool schema conversion
├── stream.ts                 # Stream event conversion
└── models.ts                 # Model discovery

src/
├── components/               # ~200 Ink/React TUI components
├── tools/                    # 60+ tool implementations
├── commands/                 # 100+ CLI subcommands
└── services/                 # API clients, analytics, MCP, auth
```

## License

MIT

## Acknowledgements

- [Anthropic](https://anthropic.com) for Claude Code
- [OpenCode](https://opencode.ai) for the free LLM API
