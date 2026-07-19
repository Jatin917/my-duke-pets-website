from PIL import Image
from pathlib import Path

src = Path(r"D:\coding\pets-website\client\public\logo.png")
img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

# Make near-white pixels transparent (white was background + dog face fill)
threshold = 245
changed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r >= threshold and g >= threshold and b >= threshold:
            pixels[x, y] = (r, g, b, 0)
            changed += 1

img.save(src, "PNG")
img.save(Path(r"D:\coding\pets-website\client\public\favicon.png"), "PNG")

admin = Path(r"D:\coding\pets-website\admin\public")
if admin.exists():
    img.save(admin / "logo.png", "PNG")
    img.save(admin / "favicon.png", "PNG")

print(f"done: {w}x{h}, cleared {changed} pixels")
