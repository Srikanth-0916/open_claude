// Copy stubs into node_modules for packages that don't exist on npm
import { cpSync, existsSync, mkdirSync } from "fs"
import { join, resolve, dirname } from "path"

const ROOT = resolve(import.meta.dir, "..")
const STUBS = join(ROOT, "stubs")

const stubs = [
  "@anthropic-ai/sandbox-runtime",
  "@ant/claude-for-chrome-mcp",
  "color-diff-napi",
]

for (const pkg of stubs) {
  const src = join(STUBS, pkg)
  const dest = join(ROOT, "node_modules", pkg)
  if (!existsSync(src)) continue
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest, { recursive: true, force: true })
  console.log(`  ✓ ${pkg}`)
}
