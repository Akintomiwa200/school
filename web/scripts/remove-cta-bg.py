"""Remove checkerboard / light background from CTA student PNG."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(__file__).resolve().parents[1] / "public" / "marketing" / "cta-student.png"
OUT = SRC


def is_background(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    neutral = max(r, g, b) - min(r, g, b) <= 28
    # checkerboard / white studio backdrop only — preserve subject colors
    return neutral and r > 120 and g > 120 and b > 120


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    seen = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    for point in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)):
        queue.append(point)
        seen[point[1]][point[0]] = True

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        if is_background(r, g, b, a):
            pixels[x, y] = (r, g, b, 0)
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < width and 0 <= ny < height and not seen[ny][nx]:
                    seen[ny][nx] = True
                    queue.append((nx, ny))

    img.save(OUT)
    print(f"Wrote transparent PNG to {OUT}")


if __name__ == "__main__":
    main()
