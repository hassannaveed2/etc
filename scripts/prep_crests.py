"""Make a crest PNG with a transparent background.

Usage: python scripts/prep_crests.py <in.png> <out.png> [--height 1200]

Near-white pixels connected to the image border become transparent; a thin
ring just inside that region is feathered by whiteness so edges stay smooth on
both light and dark backgrounds. The result is trimmed and resized.
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

WHITE_MIN = 235  # min(R,G,B) at or above this counts as background white
EDGE_MIN = 170   # whiteness at which edge pixels start to keep opacity


def make_transparent(img: Image.Image) -> Image.Image:
    rgb = img.convert("RGB")
    arr = np.asarray(rgb).astype(np.int16)
    white = arr.min(axis=2)

    # .copy(): fromarray shares numpy's read-only buffer, which floodfill silently ignores
    mask = Image.fromarray(np.where(white >= WHITE_MIN, 255, 0).astype(np.uint8), "L").copy()
    w, h = mask.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if mask.getpixel(xy) == 255:
            ImageDraw.floodfill(mask, xy, 128)
    bg = np.asarray(mask) == 128

    ring = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    ring &= ~bg

    alpha = np.full(white.shape, 255, dtype=np.float32)
    alpha[bg] = 0
    feather = np.clip((255 - white) / (255 - EDGE_MIN), 0, 1) * 255
    alpha[ring] = np.minimum(alpha[ring], feather[ring])

    out = rgb.convert("RGBA")
    out.putalpha(Image.fromarray(alpha.astype(np.uint8), "L"))
    return out.crop(out.getbbox())


def main(argv):
    src, dst = argv[0], argv[1]
    height = int(argv[argv.index("--height") + 1]) if "--height" in argv else 1200
    out = make_transparent(Image.open(src))
    width = round(out.width * height / out.height)
    out.resize((width, height), Image.LANCZOS).save(dst, optimize=True)
    print(dst, (width, height))


if __name__ == "__main__":
    main(sys.argv[1:])
