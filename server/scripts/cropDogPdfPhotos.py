"""Crop breed photos from PDF page renders into uploads/pets/."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "uploads" / "dog-pdf-pages"
OUT_DIR = ROOT / "uploads" / "pets"
MANIFEST = ROOT / "scripts" / "dogPdfImageManifest.json"

PAGE_LAYOUT = {
    1: {"left": 28, "right": 28, "top": 270, "bottom": 1475},
    2: {"left": 28, "right": 28, "top": 270, "bottom": 1475},
    3: {"left": 22, "right": 22, "top": 95, "bottom": 1120},
    4: {"left": 22, "right": 22, "top": 95, "bottom": 1120},
    5: {"left": 22, "right": 22, "top": 95, "bottom": 1120},
}

# Portrait pages are taller cards; landscape needs a shorter photo band
PHOTO_FRACS = {
    "portrait": {"top": 0.135, "bot": 0.40, "left": 0.07, "right": 0.93},
    "landscape": {"top": 0.12, "bot": 0.34, "left": 0.06, "right": 0.94},
}
COLS, ROWS = 5, 2


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def crop_page(page_num: int, slots: list[dict]) -> list[dict]:
    layout = PAGE_LAYOUT[page_num]
    orientation = "portrait" if page_num <= 2 else "landscape"
    fr = PHOTO_FRACS[orientation]
    im = Image.open(PAGES_DIR / f"page-{page_num}.png").convert("RGB")
    w, _h = im.size
    left, right = layout["left"], layout["right"]
    top, bottom = layout["top"], layout["bottom"]
    cw = (w - left - right) / COLS
    ch = (bottom - top) / ROWS

    results = []
    for r in range(ROWS):
        for c in range(COLS):
            idx = r * COLS + c
            if idx >= len(slots):
                break
            breed = slots[idx]
            if breed.get("skip"):
                print(f"skip slot page {page_num} #{idx + 1}: {breed['name']}")
                continue

            x0 = left + c * cw
            y0 = top + r * ch
            box = (
                int(x0 + cw * fr["left"]),
                int(y0 + ch * fr["top"]),
                int(x0 + cw * fr["right"]),
                int(y0 + ch * fr["bot"]),
            )
            crop = im.crop(box)
            crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
            filename = f"pdf-breed-{slugify(breed['name'])}.jpg"
            crop.save(OUT_DIR / filename, quality=92, optimize=True)
            results.append(
                {
                    "name": breed["name"],
                    "page": page_num,
                    "slot": idx,
                    "filename": filename,
                    "path": f"/uploads/pets/{filename}",
                }
            )
            print(f"saved {filename} ({crop.size[0]}x{crop.size[1]})")
    return results


def main() -> None:
    breeds = json.loads((ROOT / "scripts" / "dogPdfBreeds.json").read_text(encoding="utf-8"))
    by_page: dict[int, list[dict]] = {}
    for b in breeds:
        by_page.setdefault(b["page"], []).append(b)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("pdf-breed-*.jpg"):
        old.unlink()

    manifest = []
    for page in sorted(by_page):
        manifest.extend(crop_page(page, by_page[page]))

    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"wrote {len(manifest)} images -> {MANIFEST}")


if __name__ == "__main__":
    main()
