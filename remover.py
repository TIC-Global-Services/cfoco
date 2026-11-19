#!/usr/bin/env python3

"""
Batch background remover and image renamer for CFOCO.

Removes the background from every image in a folder,
optionally normalizes/slugifies the filename,
and saves the result as a transparent PNG.

Requirements:
    pip install rembg pillow onnxruntime

Usage Examples:
    # 1. Remove background with default '_nobg' suffix:
    python remover.py ./public/signature

    # 2. Remove background AND rename filename to clean slug:
    # (e.g. '3 DYNAMIC IWNGS .png' -> '3-dynamic-iwngs.png')
    python remover.py ./public/wraps --rename --suffix ""

    # 3. Save into a separate output folder:
    python remover.py ./public/signature -o ./public/signature_nobg --rename
"""

import argparse
import gc
import re
import sys
from pathlib import Path

from PIL import Image


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tiff",
}


def slugify(name: str) -> str:
    """Convert filename into a clean lowercase slug with hyphens."""
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def remove_backgrounds(
    input_folder: Path,
    output_folder: Path | None = None,
    suffix: str = "_nobg",
    rename: bool = False,
    overwrite: bool = False,
):
    out_dir = output_folder or input_folder
    out_dir.mkdir(parents=True, exist_ok=True)

    # Find all images directly inside the folder, excluding already processed output files
    images = [
        path
        for path in input_folder.iterdir()
        if path.is_file()
        and path.suffix.lower() in IMAGE_EXTENSIONS
        and not (suffix and path.stem.endswith(suffix))
    ]

    if not images:
        print(f"No images found in: {input_folder}", flush=True)
        return

    try:
        from rembg import remove, new_session
    except ImportError:
        print("\n❌ Missing required dependency: rembg", flush=True)
        print("Please install it using:\n    pip install rembg pillow onnxruntime\n", flush=True)
        sys.exit(1)

    print(f"Found {len(images)} image(s) to process in '{input_folder.name}/'.\n", flush=True)

    session = new_session("u2net")
    success = 0
    skipped = 0
    failed = 0

    for index, image_path in enumerate(images, 1):
        try:
            base_name = slugify(image_path.stem) if rename else image_path.stem
            out_filename = f"{base_name}{suffix}.png"
            output_path = out_dir / out_filename

            # Skip if destination already exists and not overwriting
            if output_path.exists() and not overwrite and output_path != image_path:
                print(f"[{index}/{len(images)}] SKIP -> {output_path.name} (already exists)", flush=True)
                skipped += 1
                continue

            with Image.open(image_path) as image:
                result = remove(image, session=session)
                result.save(output_path)
                del result

            gc.collect()
            success += 1

            print(
                f"[{index}/{len(images)}] "
                f"OK: {image_path.name} -> {output_path.name}",
                flush=True
            )

        except Exception as e:
            failed += 1
            print(
                f"[{index}/{len(images)}] "
                f"FAILED: {image_path.name}\n"
                f"    Error: {e}",
                flush=True
            )

    print("\n" + "=" * 50)
    print("Done!")
    print(f"Successful: {success}")
    if skipped:
        print(f"Skipped:    {skipped}")
    print(f"Failed:     {failed}")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description="Remove backgrounds and optionally rename/slugify images in a folder."
    )

    parser.add_argument(
        "input_folder",
        type=str,
        help="Folder containing the images (e.g. ./public/signature or ./public/POULET)",
    )

    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Optional output folder (defaults to same folder)",
    )

    parser.add_argument(
        "--suffix",
        type=str,
        default="_nobg",
        help="Suffix for output files (default: _nobg, pass '' for no suffix)",
    )

    parser.add_argument(
        "--rename", "--slugify",
        action="store_true",
        help="Slugify image names to clean lowercase hyphens (e.g. 'CHICKEN MEAL .png' -> 'chicken-meal.png')",
    )

    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing output files instead of skipping them",
    )

    args = parser.parse_args()

    input_folder = Path(args.input_folder).expanduser().resolve()
    output_folder = Path(args.output).expanduser().resolve() if args.output else None

    if not input_folder.is_dir():
        print(f"Error: '{input_folder}' is not a valid folder.")
        sys.exit(1)

    remove_backgrounds(
        input_folder=input_folder,
        output_folder=output_folder,
        suffix=args.suffix,
        rename=args.rename,
        overwrite=args.overwrite,
    )


if __name__ == "__main__":
    main()