#!/usr/bin/env python3
"""
Rename CoreForge supplement images to: CFG-XXX_{price} — {Title}.png
Removes exact-duplicate files that were copies under wrong product names.

Run from repo root:
  python3 other/supp-images_rename.py
  python3 other/supp-images_rename.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SUPP = ROOT / "supp-images"


# Exact duplicate files (same bytes as another kept file) — wrong second filename.
DELETE_PATHS = [
    "109 — CoreForge Vegan Protein Blend.png",
    "149 — CoreForge Strength Duo.png",
    "89 — CoreForge Pre-Workout Energy.png",
    "399 — CoreForge Complete Transformation System.png",
]

# source_filename -> (cfg_code, price_int, title)
RENAMES: list[tuple[str, str, int, str]] = [
    ("wheyprotien-119.png", "CFG-001", 119, "CoreForge Whey Protein 2kg (Chocolate)"),
    ("creatine-69.png", "CFG-002", 69, "CoreForge Creatine Monohydrate 500g"),
    ("preworkout-69.png", "CFG-003", 69, "CoreForge Pre-Workout 30 Serves"),
    ("fatburner-79.png", "CFG-004", 79, "CoreForge Thermogenic Fat Burner"),
    ("whey-179.png", "CFG-005", 179, "CoreForge Whey Isolate 2.5kg"),
    ("supp-pack-179.png", "CFG-006", 179, "CoreForge Performance Stack Bundle"),
    ("startpack-69.png", "CFG-007", 69, "CoreForge Starter Stack"),
    ("bcaa-recovery-69.png", "CFG-008", 69, "CoreForge BCAA Recovery 30 Serves"),
    ("whey-1.5-99.png", "CFG-009", 99, "CoreForge Whey Protein 1.5kg"),
    ("plant-protien-149.png", "CFG-010", 149, "CoreForge Plant Protein 2kg"),
    ("Casein-79.png", "CFG-011", 79, "CoreForge Casein Protein 1kg"),
    ("249 — CoreForge Ultimate Muscle Stack.png", "CFG-012", 249, "CoreForge Ultimate Muscle Stack"),
    ("199 — CoreForge Lean Transformation Stack.png", "CFG-013", 199, "CoreForge Lean Transformation Stack"),
    ("119 — CoreForge Meal Replacement 1.5kg.png", "CFG-014", 119, "CoreForge Meal Replacement 1.5kg"),
    ("179 — CoreForge Advanced Pre-Workout 60 Serves.png", "CFG-015", 179, "CoreForge Advanced Pre-Workout 60 Serves"),
    ("109 — CoreForge Collagen Protein Blend.png", "CFG-016", 109, "CoreForge Collagen Protein Blend"),
    ("139 — CoreForge Protein + Greens Blend.png", "CFG-017", 139, "CoreForge Protein + Greens Blend"),
    ("119 — CoreForge Recovery Protein Blend.png", "CFG-018", 119, "CoreForge Recovery Protein Blend"),
    # CFG-019 Pre-Workout Energy — no unique asset in folder (was byte-dup of CFG-015 file under wrong name)
    ("9e8505de89d34f39bea0020815850ab2.png", "CFG-020", 109, "CoreForge Vegan Protein Blend"),
    ("4e96881ec94047a4a03f3554da8c4439.png", "CFG-021", 149, "CoreForge Strength Duo"),
    ("980bfd232e574672856d78b4dd08fbb3.png", "CFG-022", 399, "CoreForge Complete Transformation System"),
    ("0da9be27fb4243bebf29addb401c88a6.png", "CFG-023", 149, "CoreForge Casein Protein 2kg (Vanilla Bean)"),
    ("cca4e93627204b2a9ff152a477efa4db.png", "CFG-023B", 149, "CoreForge Casein Protein 2kg (Chocolate)"),
    ("3b349ddfabb04198993ee5b568d1e1b7.png", "CFG-024", 249, "CoreForge Elite Performance Stack"),
    # CFG-025 Platinum Stack — no matching asset in folder
    ("efa2251a091b405181e60e9fc173b4f3.png", "CFG-026", 89, "CoreForge Thermogenic Complex"),
    ("8294567fb4fb4f5f943d1a8e8cb49e61.png", "CFG-027", 19, "CoreForge Creatine 100g"),
    ("99a80666cbe140d0bc9cabe57d4dfae4.png", "CFG-028", 5, "CoreForge Protein Sample Sachet"),
    ("ff5fd9231e23486481db001f32d6f592.png", "CFG-029", 99, "CoreForge Lean Protein 1kg"),
    ("d6a551b081ae4efab4158cb4c9ae1867.png", "CFG-030", 89, "CoreForge Amino Energy Blend"),
    ("153f84632e8c414187dd61f87ab961ed.png", "CFG-031", 99, "CoreForge Pump Matrix Pre-Workout"),
    ("940bac1f3dfd4fceb01491b77e408a1a.png", "CFG-032", 169, "CoreForge Whey Isolate 2kg"),
    ("f6ff73e4b301465c87fb5c58a768913d.png", "CFG-033", 179, "CoreForge Hardcore Pre-Workout"),
    ("9ef872d62277435f8a3f1bbb66443c6d.png", "CFG-034", 79, "CoreForge Night Recovery Casein"),
    ("511b5a530b894b2a87f3a22ff110a679.png", "CFG-035", 189, "CoreForge Muscle Builder Kit"),
]


def safe_name(cfg: str, price: int, title: str) -> str:
    return f"{cfg}_{price} — {title}.png"


def file_hash(path: Path) -> str:
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not SUPP.is_dir():
        raise SystemExit(f"Missing folder: {SUPP}")

    for rel in DELETE_PATHS:
        p = SUPP / rel
        if p.is_file():
            if args.dry_run:
                print(f"DELETE (dry): {p.name}")
            else:
                p.unlink()
                print(f"Deleted duplicate: {p.name}")

    planned: list[tuple[Path, Path]] = []
    for src_name, cfg, price, title in RENAMES:
        src = SUPP / src_name
        if not src.is_file():
            print(f"SKIP missing source: {src_name}")
            continue
        dst_name = safe_name(cfg, price, title)
        dst = SUPP / dst_name
        planned.append((src, dst))

    temp_dir = SUPP / "_renaming_tmp"
    if not args.dry_run:
        temp_dir.mkdir(exist_ok=True)

    for src, dst in planned:
        if src.name == dst.name:
            print(f"OK (already): {src.name}")
            continue
        if args.dry_run:
            print(f"RENAME: {src.name} -> {dst.name}")
            continue
        tmp = temp_dir / src.name
        shutil.move(str(src), str(tmp))

    if args.dry_run:
        return

    for src, dst in planned:
        if src.name == dst.name:
            continue
        tmp = temp_dir / src.name
        if tmp.is_file():
            if dst.exists():
                raise SystemExit(f"Refusing to overwrite existing: {dst}")
            shutil.move(str(tmp), str(dst))
            print(f"Renamed: {dst.name}")

    if temp_dir.exists() and not any(temp_dir.iterdir()):
        temp_dir.rmdir()

    by_hash: dict[str, list[str]] = {}
    for p in SUPP.glob("*.png"):
        if p.name.startswith(".") or p.name.startswith("_"):
            continue
        by_hash.setdefault(file_hash(p), []).append(p.name)
    dups = {h: names for h, names in by_hash.items() if len(names) > 1}
    if dups:
        print("\nWARNING: duplicate file contents still present:")
        for names in dups.values():
            print(" ", names)


if __name__ == "__main__":
    main()
