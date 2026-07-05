#!/bin/bash
# open-claude — install a global `open_claude` command
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${HOME}/.local/bin/open_claude"

mkdir -p "${HOME}/.local/bin"
ln -sf "${DIR}/run.sh" "${TARGET}"
chmod +x "${DIR}/run.sh"

echo "Installed → ${TARGET}"
echo "Make sure ${HOME}/.local/bin is in your PATH:"
echo "  export PATH=\"\${HOME}/.local/bin:\${PATH}\""
