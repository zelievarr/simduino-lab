#!/bin/zsh
cd "${0:A:h}"
if command -v node >/dev/null 2>&1; then
  exec node server.mjs
elif [[ -x /Users/zelievarr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ]]; then
  exec /Users/zelievarr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.mjs
else
  echo 'Для запуска установите Node.js 22 или новее с nodejs.org.'
  read '?Нажмите Enter…'
fi
