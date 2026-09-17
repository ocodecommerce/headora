#!/bin/bash
set -euo pipefail

git pull origin dev
npm run build
pm2 restart 0
