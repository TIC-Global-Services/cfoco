#!/usr/bin/env python3
"""
Batch background remover + menu JSON generator for CFOCO.

Scans the specified category folders inside `public/`, removes the
background from every product image, saves the result as a transparent
PNG named after the product (slug-style, no suffix), and generates a
`public/menu_data.json` file grouped by category — ready for the
Next.js menu page.

Supported categories (folder names):
    burgers  desserts  POULET  riz box  sides  tacos  wraps

Install dependencies first:
    pip install rembg pillow onnxruntime

Usage:
    # Process all categories (looks for public/ next to this script)
    python remover.py

    # Save processed images into a separate output folder
    python remover.py -o ./public/processed

    # Skip bg-removal and ONLY rebuild the JSON from already-processed images
    python remover.py --json-only

    # Process specific categories only
    python remover.py --categories burgers tacos
"""

import argparse
import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

# folder name (lowercased) -> category id used in JSON / UI
CATEGORY_FOLDERS = {
    "poulet":   "poulet",
    "burgers":  "burgers",
    "riz box":  "riz-box",
    "sides":    "sides",
    "tacos":    "tacos",
    "wraps":    "wraps",
    "desserts": "desserts",
}

CATEGORY_NAMES = {
    "poulet":   "Poulet",
    "burgers":  "Burgers",
    "riz-box":  "Riz Box",
    "sides":    "Sides",
    "tacos":    "Tacos",
    "wraps":    "Wraps",
    "desserts": "Desserts",
}

CATEGORY_DESCRIPTIONS = {
    "poulet":   "Fresh, Crispy Chicken, Served Hot And Packed With Flavour.",
    "burgers":  "Juicy, Flame-Grilled Burgers Stacked With Premium Toppings.",
    "riz-box":  "Tender Chicken Over Fragrant Rice, Bold Sauces, Full Satisfaction.",
    "sides":    "Golden, Crispy Sides To Complete Your CFOCO Experience.",
    "tacos":    "Soft, Melted French Tacos Loaded With Your Favourite Fillings.",
    "wraps":    "Wrapped Tight With Fresh Ingredients And Signature Sauces.",
    "desserts": "Sweet Endings — Shakes, Sundaes & Frozen Treats.",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(name: str) -> str:
    """Convert a filename stem into a URL-friendly slug (lowercase, hyphens)."""
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def title_case(stem: str) -> str:
    """Convert slug-style stem back to a display title."""
    return " ".join(w.capitalize() for w in stem.replace("-", " ").split())


def find_images(folder: Path):
    """Yield every image directly inside *folder* (non-recursive)."""
    for p in sorted(folder.iterdir()):
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS:
            yield p


def resolve_src_folder(public_root: Path, folder_name: str):
    """Find a category folder inside public_root, case-insensitively."""
    for candidate in public_root.iterdir():
        if candidate.is_dir() and candidate.name.lower() == folder_name:
            return candidate
    return None


# ---------------------------------------------------------------------------
# Background removal
# ---------------------------------------------------------------------------

def remove_backgrounds(public_root: Path, output_root, categories: list, overwrite: bool = False, model_name: str = "isnet-general-use"):
    """
    Remove backgrounds for the requested category folders.
    Output filenames are slugified product names (no suffix).
    Skips already processed images unless overwrite=True.
    Returns mapping: category_id -> list of output PNG paths.
    """
    from rembg import remove, new_session  # type: ignore
    from PIL import Image                  # type: ignore

    print(f"Loading background removal model: {model_name}...")
    session = new_session(model_name)
    print("Model loaded successfully.\n")

    results = {}

    for folder_name, cat_id in CATEGORY_FOLDERS.items():
        if categories and cat_id not in categories:
            continue

        src_folder = resolve_src_folder(public_root, folder_name)
        if src_folder is None:
            print(f"  [SKIP] Folder not found for category '{folder_name}'")
            continue

        images = list(find_images(src_folder))
        if not images:
            print(f"  [SKIP] No images in {src_folder.name}/")
            continue

        if output_root is None:
            out_folder = src_folder
        else:
            out_folder = output_root / src_folder.name
            out_folder.mkdir(parents=True, exist_ok=True)

        print(f"\n[{cat_id.upper()}] {len(images)} image(s) in {src_folder.name}/")
        processed = []

        for i, img_path in enumerate(images, 1):
            product_slug = slugify(img_path.stem)
            out_path = out_folder / f"{product_slug}.png"

            # Avoid re-processing if the file is already the processed output
            if out_folder == src_folder and img_path.name == out_path.name:
                processed.append(out_path)
                continue

            # Skip if already exists and not overwriting
            if out_path.exists() and not overwrite:
                processed.append(out_path)
                print(f"  [{i}/{len(images)}] SKIP {img_path.name} -> {out_path.name} (already exists)")
                continue

            try:
                with Image.open(img_path) as img:
                    result = remove(img, session=session)
                    result.save(out_path, format="PNG")
                processed.append(out_path)
                print(f"  [{i}/{len(images)}] OK   {img_path.name} -> {out_path.name}")
            except Exception as exc:
                print(f"  [{i}/{len(images)}] FAIL {img_path.name}  ({exc})")

        results[cat_id] = processed

    return results


# ---------------------------------------------------------------------------
# JSON generation
# ---------------------------------------------------------------------------

def build_menu_json(public_root: Path, output_root, categories: list) -> dict:
    """
    Scan processed image folders and build the full menu data structure.
    Public URL is derived by stripping the public_root prefix.
    If processed images are found, uses them. Otherwise falls back to original images.
    """
    menu_items = []
    item_id = 1

    for folder_name, cat_id in CATEGORY_FOLDERS.items():
        if categories and cat_id not in categories:
            continue

        if output_root is None:
            scan_folder = resolve_src_folder(public_root, folder_name)
        else:
            src = resolve_src_folder(public_root, folder_name)
            scan_folder = output_root / src.name if src else output_root / folder_name

        if scan_folder is None or not scan_folder.exists():
            print(f"  [JSON] Folder not found for '{folder_name}', skipping.")
            continue

        # Check for slugified PNGs first (processed transparent images)
        slug_pngs = sorted(
            p for p in scan_folder.iterdir()
            if p.is_file() and p.suffix.lower() == ".png" and p.stem == slugify(p.stem)
        )

        # If slugified PNGs exist, use them. Otherwise, fall back to all images in folder
        target_images = slug_pngs if slug_pngs else list(find_images(scan_folder))

        for img_path in target_images:
            rel = img_path.relative_to(public_root)
            public_url = "/" + "/".join(rel.parts)

            clean_name = slugify(img_path.stem)

            # Custom names for number-only files
            number_only_names = {
                "152": "Tacos Chèvre Miel Signature",
                "154": "Tacos Raclette Royale",
                "156": "Tacos Cheddar Supreme",
            }
            if clean_name in number_only_names:
                display_title = number_only_names[clean_name]
            elif clean_name.isdigit():
                display_title = f"{CATEGORY_NAMES.get(cat_id, 'Special')} Delice"
            else:
                display_title = title_case(clean_name)
                # Remove numbers from title
                display_title = re.sub(r'^\d+\s*', '', display_title)
                display_title = re.sub(r'\b\d+\b', '', display_title)
                display_title = re.sub(r'\s+', ' ', display_title).strip()

                # Typo and wording fixes
                word_fixes = {
                    r'\bIwngs\b': 'Wings',
                    r'\bChciken\b': 'Chicken',
                    r'\bChcken\b': 'Chicken',
                    r'\bPetiti\b': 'Petit',
                    r'\bVeggei\b': 'Veggie',
                    r'\bVegge\b': 'Veggie',
                    r'\bShakle\b': 'Shake',
                    r'\bMoza\b': 'Mozza',
                }
                for pattern, rep in word_fixes.items():
                    display_title = re.sub(pattern, rep, display_title, flags=re.IGNORECASE)

                if display_title.lower() == "double":
                    display_title = "Double Burger"

            menu_items.append({
                "id": item_id,
                "title": display_title,
                "description": CATEGORY_DESCRIPTIONS.get(cat_id, ""),
                "image": public_url,
                "category": cat_id,
                "categoryName": CATEGORY_NAMES.get(cat_id, cat_id),
            })
            item_id += 1

    return {
        "categories": [
            {"id": cid, "name": CATEGORY_NAMES[cid]}
            for cid in CATEGORY_NAMES
        ],
        "items": menu_items,
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description=(
            "Remove backgrounds from CFOCO product images and generate "
            "public/menu_data.json for the Next.js menu page."
        )
    )
    parser.add_argument(
        "--public", type=str, default=None,
        help="Path to the public/ folder (defaults to ./public next to this script).",
    )
    parser.add_argument(
        "-o", "--output", type=str, default=None,
        help=(
            "Optional output folder. Processed images are saved here mirroring "
            "category sub-folders. If omitted, images are saved next to the originals."
        ),
    )
    parser.add_argument(
        "--json-only", action="store_true",
        help="Skip background removal; only rebuild menu_data.json from existing processed images.",
    )
    parser.add_argument(
        "--categories", nargs="+", default=[], metavar="CAT",
        help="Limit to these category ids: poulet burgers riz-box sides tacos wraps desserts",
    )
    parser.add_argument(
        "--json-out", type=str, default=None,
        help="Where to write menu_data.json (defaults to <public>/menu_data.json).",
    )
    parser.add_argument(
        "--overwrite", action="store_true",
        help="Overwrite existing output images instead of skipping them.",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    public_root = (
        Path(args.public).expanduser().resolve()
        if args.public
        else script_dir / "public"
    )
    if not public_root.is_dir():
        print(f"Error: public folder not found at {public_root}")
        sys.exit(1)

    output_root = Path(args.output).expanduser().resolve() if args.output else None
    categories = [c.strip().lower() for c in args.categories]

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