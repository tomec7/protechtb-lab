#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from datetime import datetime

import torch
from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline, DPMSolverMultistepScheduler


def build_prompt(user_prompt: str) -> str:
    base = (
        "ultra realistic photo, natural skin texture, physically based lighting, "
        "high detail, accurate shadows, depth, color graded, professional photography"
    )
    if user_prompt.strip():
        return f"{user_prompt.strip()}, {base}"
    return base


def run(args: argparse.Namespace) -> Path:
    input_path = Path(args.input).expanduser().resolve()
    if not input_path.exists():
        raise FileNotFoundError(f"Input image not found: {input_path}")

    out_dir = Path(args.output_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    init_img = Image.open(input_path).convert("RGB")

    max_side = args.max_side
    w, h = init_img.size
    scale = min(max_side / max(w, h), 1.0)
    if scale < 1.0:
        init_img = init_img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        args.model,
        torch_dtype=torch.float32,
        safety_checker=None,
        requires_safety_checker=False,
    )
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to("cpu")

    prompt = build_prompt(args.prompt)
    negative = args.negative or (
        "blurry, artifacts, deformed face, extra fingers, bad anatomy, lowres, cartoon, oversaturated"
    )

    effective_steps = max(args.steps, 10)
    effective_strength = max(args.strength, 0.25)

    gen = pipe(
        prompt=prompt,
        negative_prompt=negative,
        image=init_img,
        strength=effective_strength,
        guidance_scale=args.guidance,
        num_inference_steps=effective_steps,
    )

    out_img = gen.images[0]

    if args.upscale > 1:
        out_img = out_img.resize((out_img.width * args.upscale, out_img.height * args.upscale), Image.LANCZOS)

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_path = out_dir / f"render-{stamp}.png"
    out_img.save(out_path)
    return out_path


def main() -> int:
    p = argparse.ArgumentParser(description="Photoreal img2img renderer")
    p.add_argument("--input", required=True, help="Input image path")
    p.add_argument("--prompt", default="", help="What to change / desired scene")
    p.add_argument("--negative", default="", help="Negative prompt")
    p.add_argument("--model", default="runwayml/stable-diffusion-v1-5")
    p.add_argument("--strength", type=float, default=0.35)
    p.add_argument("--guidance", type=float, default=7.0)
    p.add_argument("--steps", type=int, default=28)
    p.add_argument("--max-side", type=int, default=1024)
    p.add_argument("--upscale", type=int, default=1)
    p.add_argument("--output-dir", default="/home/lenovo/.openclaw/workspace/exports")
    args = p.parse_args()

    out = run(args)
    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
