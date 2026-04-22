#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
from datetime import datetime
from pathlib import Path

import fal_client
import requests

DEFAULT_ENDPOINT = "fal-ai/kling-video/v3/pro/text-to-video"
ENV_VIDEO = Path("/home/lenovo/.openclaw/workspace/.env.video")


def load_env_video() -> None:
    if not ENV_VIDEO.exists():
        return
    for line in ENV_VIDEO.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


def download_file(url: str, out_path: Path) -> None:
    r = requests.get(url, timeout=300)
    r.raise_for_status()
    out_path.write_bytes(r.content)


def main() -> int:
    load_env_video()
    p = argparse.ArgumentParser(description="Generate AI realistic video via fal.ai")
    p.add_argument("--prompt", required=True, help="What should be in the video")
    p.add_argument("--endpoint", default=DEFAULT_ENDPOINT, help="fal endpoint")
    p.add_argument("--duration", choices=["5", "10"], default="5")
    p.add_argument("--aspect", choices=["16:9", "9:16", "1:1"], default="16:9")
    p.add_argument("--negative", default="blur, distort, and low quality")
    p.add_argument("--cfg", type=float, default=0.5)
    p.add_argument("--audio", action="store_true", help="Generate native audio if model supports it")
    p.add_argument("--output-dir", default="/home/lenovo/.openclaw/workspace/exports")
    args = p.parse_args()

    if not os.getenv("FAL_KEY"):
        raise RuntimeError("FAL_KEY is not set. Add API key: export FAL_KEY=... ")

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    input_payload = {
        "prompt": args.prompt,
        "duration": args.duration,
        "aspect_ratio": args.aspect,
        "negative_prompt": args.negative,
        "cfg_scale": args.cfg,
    }
    if args.audio:
        input_payload["generate_audio"] = True

    print(f"Submitting to {args.endpoint} ...")

    result = fal_client.subscribe(
        args.endpoint,
        arguments={"input": input_payload},
        with_logs=True,
    )

    data = result.get("data", {})
    video = data.get("video", {})
    url = video.get("url")
    if not url:
        raise RuntimeError(f"No video URL in response: {data}")

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_path = out_dir / f"ai-video-{stamp}.mp4"
    download_file(url, out_path)

    print(out_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
