#!/usr/bin/env bash
set -euo pipefail

COMFY_DIR="/home/lenovo/.openclaw/workspace/tools/ComfyUI"
cd "$COMFY_DIR"
. .venv/bin/activate

# CPU-safe defaults for this machine
python main.py --listen 127.0.0.1 --port 8188 --cpu
