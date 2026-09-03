#!/usr/bin/env python3
"""
Batch background remover.

Recursively scans a root folder (and every subfolder inside it) for
images, removes the background from each one, and saves the result as
a transparent PNG — either right next to the original, or into a
separate output folder that mirrors the input folder structure.

Install dependencies first:
    pip install rembg pillow onnxruntime

Usage:
    # Save results next to each original (default)
    python remove_bg_batch.py /path/to/input_folder

    # Save results into a separate folder, keeping the same structure
    python remove_bg_batch.py /path/to/input_folder -o /path/to/output_folder

    # Custom suffix for output filenames
    python remove_bg_batch.py /path/to/input_folder --suffix "_transparent"
"""

import argparse
import sys
from pathlib import Path

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}


def find_images(root: Path):
    """Recursively yield every image file under root, including all subfolders."""
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            yield path


def process_images(input_root: Path, output_root, suffix: str, same_folder: bool):
    from rembg import remove
    from PIL import Image

    images = list(find_images(input_root))
    if not images:
        print(f"No images found under {input_root}")
        return

    print(f"Found {len(images)} image(s). Starting background removal...\n")

    success, failed = 0, 0
    for i, img_path in enumerate(images, 1):
        try:
            if same_folder or output_root is None:
                out_path = img_path.with_name(f"{img_path.stem}{suffix}.png")
            else:
                rel_path = img_path.relative_to(input_root)
                out_path = (output_root / rel_path).with_name(f"{rel_path.stem}{suffix}.png")
                out_path.parent.mkdir(parents=True, exist_ok=True)

            with Image.open(img_path) as img:
                result = remove(img)
                result.save(out_path)

            success += 1
            print(f"[{i}/{len(images)}] OK     -> {out_path}")
        except Exception as e:
            failed += 1
            print(f"[{i}/{len(images)}] FAILED    {img_path}  ({e})")

    print(f"\nDone. {success} succeeded, {failed} failed.")


def main():
    parser = argparse.ArgumentParser(
        description="Batch-remove backgrounds from images in a folder, including all its subfolders."
    )
    parser.add_argument("input_folder", type=str, help="Root folder containing images (subfolders included)")
    parser.add_argument(
        "-o", "--output", type=str, default=None,
        help="Output folder to mirror the input structure into. If omitted, results are saved next to the originals."
    )
    parser.add_argument(
        "--suffix", type=str, default="_nobg",
        help="Suffix added to output filenames (default: _nobg)"
    )
    parser.add_argument(
        "--same-folder", action="store_true",
        help="Force saving results next to the original images, even if -o is given"
    )
    args = parser.parse_args()

    input_root = Path(args.input_folder).expanduser().resolve()
    if not input_root.is_dir():
        print(f"Error: {input_root} is not a valid folder")
        sys.exit(1)

    output_root = Path(args.output).expanduser().resolve() if args.output else None

    process_images(input_root, output_root, args.suffix, args.same_folder)


if __name__ == "__main__":
    main()    categories = [c.strip().lower() for c in args.categories]

    # Step 1 — Remove backgrounds
    if not args.json_only:
        print("=" * 60)
        print("STEP 1 — Removing backgrounds & renaming to product slugs")
        print("=" * 60)
        remove_backgrounds(public_root, output_root, categories, overwrite=args.overwrite)
    else:
        print("Skipping background removal (--json-only).")

    # Step 2 — Generate JSON
    print("\n" + "=" * 60)
    print("STEP 2 — Building menu_data.json")
    print("=" * 60)

    menu_data = build_menu_json(public_root, output_root, categories)

    json_out = (
        Path(args.json_out).expanduser().resolve()
        if args.json_out
        else public_root / "menu_data.json"
    )
    json_out.write_text(
        json.dumps(menu_data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nWrote {len(menu_data['items'])} item(s)  ->  {json_out}")
    print("\nAll done!")


if __name__ == "__main__":
    main()
