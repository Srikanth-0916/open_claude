import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from "fs"
import { join, resolve, dirname, extname } from "path"

const ROOT = resolve(import.meta.dir, "..")
const existing = new Set<string>()

function crawl(dir: string) {
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f)
      if (f === "node_modules" || f === ".git") continue
      if (statSync(full).isDirectory()) crawl(full)
      else existing.add(full)
    }
  } catch { }
}

crawl(join(ROOT, "src"))

const imports: Array<{ imp: string; file: string; dir: string }> = []

function findImports(dir: string) {
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f)
      if (f === "node_modules" || f === ".git") continue
      if (statSync(full).isDirectory()) { findImports(full); continue }
      if (!f.endsWith(".ts") && !f.endsWith(".tsx")) continue
      const content = readFileSync(full, "utf-8")
      const regex = /(?:from|require)\s*\(?\s*["'\x60]([^"'\x60]+)["'\x60]/g
      let m: RegExpExecArray | null
      while ((m = regex.exec(content)) !== null) {
        const imp = m[1]
        if (imp.startsWith(".") || imp.startsWith("src/")) {
          imports.push({ imp, file: full, dir: dirname(full) })
        }
      }
    }
  } catch { }
}

findImports(join(ROOT, "src"))

let created = 0
for (const { imp, dir } of imports) {
  let resolved: string
  if (imp.startsWith("src/")) {
    resolved = join(ROOT, imp)
  } else {
    resolved = resolve(dir, imp)
  }

  const baseNoExt = resolved.replace(/\.(ts|tsx|js|jsx|txt|md)$/, "")
  const candidates = [resolved]
  for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
    if (!baseNoExt.endsWith(ext)) candidates.push(baseNoExt + ext)
  }
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".txt", ".md"]) {
    candidates.push(baseNoExt + ext)
  }
  for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
    candidates.push(join(baseNoExt, "index" + ext))
  }

  let found = false
  for (const c of candidates) {
    if (existing.has(c)) { found = true; break }
  }

  if (!found && !resolved.includes("node_modules")) {
    const ext = extname(resolved)
    const stubPath = ext === ".txt" || ext === ".md" ? resolved : resolved + ".ts"
    try {
      mkdirSync(dirname(stubPath), { recursive: true })
      if (stubPath.endsWith(".md") || stubPath.endsWith(".txt")) {
        writeFileSync(stubPath, "")
      } else {
        writeFileSync(stubPath, "export {}\n")
      }
      existing.add(stubPath)
      created++
    } catch { }
  }
}

console.log(`Created ${created} stubs`)
