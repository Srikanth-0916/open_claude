// dev-launcher.ts — Shims for running open-claude in development with Bun

const { writeSync, appendFileSync } = await import("fs")
const LOG = "/tmp/opencode/startup.log"
const trace = (msg: string) => {
  try { appendFileSync(LOG, `[${Date.now()}] ${msg}\n`) } catch {}
}

// Make trace available globally so other modules can use it
;(globalThis as any).__TRACE = trace

trace("=== dev-launcher START ===")
trace(`argv: ${process.argv.slice(2).join(" ")}`)
trace(`stdin.isTTY: ${process.stdin.isTTY}`)
trace(`stdout.isTTY: ${process.stdout.isTTY}`)
trace(`process.env.OPEN_CLAUDE_ENABLED: ${process.env.OPEN_CLAUDE_ENABLED}`)
trace(`process.env.ANTHROPIC_API_KEY: ${(process.env.ANTHROPIC_API_KEY || '').slice(0, 20)}...`)
trace(`process.env.CLAUDE_CONFIG_DIR: ${process.env.CLAUDE_CONFIG_DIR}`)

globalThis.MACRO = {
  VERSION: "2.0.0",
  PACKAGE_URL: "open-claude",
  ISSUES_EXPLAINER: "report issues at https://github.com/anthropics/claude-code/issues",
}

process.env.USER_TYPE ??= "external"
process.env.NODE_ENV ??= "development"

// Bun plugin to load .md files as default string exports
if (typeof Bun !== 'undefined' && Bun.plugin) {
  Bun.plugin({
    name: 'md-loader',
    setup(build) {
      build.onLoad({ filter: /\.md$/ }, async (args) => {
        const text = await Bun.file(args.path).text()
        return {
          exports: { default: text },
          loader: 'object',
        }
      })
    },
  })
}

trace("dev-launcher: registering global error handlers")

// Override process.exit to trace it
const origExit = process.exit
process.exit = function (code?: number) {
  const err = new Error()
  trace(`process.exit(${code}) CALLED from:\n${(err.stack || '').replace(/^Error\n?/, '')}`)
  writeSync(2, `Fatal: process.exit(${code}) called\n`)
  origExit.apply(process, arguments as any)
  return undefined as never
} as typeof process.exit

process.on('uncaughtException', (err) => {
  trace(`FATAL uncaughtException: ${err.stack || err.message}`)
  writeSync(2, `Fatal: ${err.stack || err.message}\n`)
  process.exit(1)
})
process.on('unhandledRejection', (err: any) => {
  trace(`FATAL unhandledRejection: ${err.stack || err.message || String(err)}`)
  writeSync(2, `Fatal: ${err.stack || err.message || String(err)}\n`)
  process.exit(1)
})

trace("dev-launcher: importing cli.tsx")

await import("./src/entrypoints/cli.tsx").catch(err => {
  trace(`FATAL import error: ${err.stack || err.message}`)
  writeSync(2, `Fatal: ${err.stack || err.message}\n`)
  process.exit(1)
})

trace("=== dev-launcher END ===")
