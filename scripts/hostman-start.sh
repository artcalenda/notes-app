#!/bin/sh
set -e
cd "$(dirname "$0")/../backend"
bun run migrate
exec bun src/index.ts
