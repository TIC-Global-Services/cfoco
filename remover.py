#!/usr/bin/env python3

"""
Batch background remover.

Removes the background from every image in a folder
and saves the result as a transparent PNG.

Install:
    pip install rembg pillow onnxruntime

Usage:
    python remove_bg.py /path/to/folder

Optional:
    python remove_bg.py /path/to/folder --suffix "_nobg"
"""

import argparse
import gc
import sys
from pathlib import Path

from rembg import remove, new_session
from PIL import Image


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tiff",
}


def remove_backgrounds(input_folder: Path, suffix: str):
    # Find all images directly inside the folder, excluding already processed suffix files
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

    print(f"Found {len(images)} image(s) to process.\n", flush=True)

    session = new_session("u2net")
    success = 0
    failed = 0

    for index, image_path in enumerate(images, 1):
        try:
            # Always save as PNG so transparency is preserved
            output_path = image_path.with_name(
                f"{image_path.stem}{suffix}.png"
            )

            with Image.open(image_path) as image:
                # Remove background using persistent session
                result = remove(image, session=session)

                # Save transparent PNG
                result.save(output_path)
                del result

            gc.collect()
            success += 1

            print(
                f"[{index}/{len(images)}] "
                f"OK -> {output_path.name}",
                flush=True
            )

        except Exception as e:
            failed += 1

            print(
                f"[{index}/{len(images)}] "
                f"FAILED -> {image_path.name}"
            )
            print(f"    Error: {e}")

    print("\n" + "=" * 50)
    print("Done!")
    print(f"Successful: {success}")
    print(f"Failed:     {failed}")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description="Remove backgrounds from all images in a folder."
    )

    parser.add_argument(
        "input_folder",
        type=str,
        help="Folder containing the images",
    )

    parser.add_argument(
        "--suffix",
        type=str,
        default="_nobg",
        help="Suffix for output files (default: _nobg)",
    )

    args = parser.parse_args()

    input_folder = Path(args.input_folder).expanduser().resolve()

    if not input_folder.is_dir():
        print(f"Error: '{input_folder}' is not a valid folder.")
        sys.exit(1)

    remove_backgrounds(
        input_folder,
        args.suffix,
    )


if __name__ == "__main__":
    main()