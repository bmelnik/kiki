#!/usr/bin/env python3
"""
Styled QR Code Generator.

Generates QR codes with rounded dots, dark theme, and optional centered label.

Usage:
    python qr_generator.py --url "https://example.com" --label "KIKI" --output my_qr.png
    python qr_generator.py --url "https://example.com" --label "MY BRAND"
    python qr_generator.py --url "https://example.com"
"""

import argparse
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer


def _hex_to_rgb(hex_color: str) -> tuple:
    value = hex_color.strip().lstrip("#")
    if len(value) != 6:
        raise ValueError(f"Invalid color '{hex_color}'. Expected format: #RRGGBB")
    try:
        return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError as exc:
        raise ValueError(f"Invalid color '{hex_color}'. Expected hex digits only.") from exc


def _load_label_font(font_size: int) -> ImageFont.ImageFont:
    # Try common bold fonts on macOS/Linux first, then fallback to PIL default.
    font_candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]

    for font_path in font_candidates:
        try:
            return ImageFont.truetype(font_path, font_size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def generate_styled_qr(
    url: str,
    label: str = "",
    output: str = "qr_output.png",
    size: int = 600,
    fg_color: tuple = (255, 255, 255),
    bg_color: tuple = (10, 10, 10),
    label_bg: str = "#1a3a4a",
    label_fg: str = "#ffffff",
    border_color: tuple = (255, 255, 255),
) -> Path:
    """Generate a styled QR code image and save it to disk."""
    if size < 128:
        raise ValueError("size must be >= 128")

    output_path = Path(output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    qr_img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(radius_ratio=0.7),
        back_color=bg_color,
        fill_color=fg_color,
    ).convert("RGBA")

    pad = int(size * 0.06)
    inner_size = size - (2 * pad)
    qr_img = qr_img.resize((inner_size, inner_size), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), bg_color + (255,))
    canvas.paste(qr_img, (pad, pad))

    draw = ImageDraw.Draw(canvas)

    border_w = max(4, int(size * 0.008))
    radius = int(size * 0.07)
    draw.rounded_rectangle(
        [border_w // 2, border_w // 2, size - border_w // 2, size - border_w // 2],
        radius=radius,
        outline=border_color + (255,),
        width=border_w,
    )

    if label:
        label = label.upper()
        cx, cy = size // 2, size // 2

        label_width = int(size * 0.22)
        label_height = int(size * 0.11)
        label_radius = int(label_height * 0.18)

        label_bg_rgb = _hex_to_rgb(label_bg)
        label_fg_rgb = _hex_to_rgb(label_fg)

        box = [
            cx - label_width // 2,
            cy - label_height // 2,
            cx + label_width // 2,
            cy + label_height // 2,
        ]
        draw.rounded_rectangle(box, radius=label_radius, fill=label_bg_rgb + (255,))

        font_size = int(label_height * 0.55)
        font = _load_label_font(font_size)

        bbox = draw.textbbox((0, 0), label, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        draw.text(
            (cx - text_w // 2, cy - text_h // 2 - bbox[1]),
            label,
            fill=label_fg_rgb + (255,),
            font=font,
        )

    canvas.convert("RGB").save(output_path, "PNG", quality=95)
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a styled QR code with rounded dots and an optional center label."
    )
    parser.add_argument("--url", required=True, help="URL or text to encode")
    parser.add_argument("--label", default="", help="Center label text (e.g. KIKI)")
    parser.add_argument("--output", default="qr_output.png", help="Output filename")
    parser.add_argument("--size", default=600, type=int, help="Image size in pixels")
    parser.add_argument("--label-bg", default="#1a3a4a", help="Label background hex color")
    parser.add_argument("--label-fg", default="#ffffff", help="Label text hex color")

    args = parser.parse_args()

    saved_to = generate_styled_qr(
        url=args.url,
        label=args.label,
        output=args.output,
        size=args.size,
        label_bg=args.label_bg,
        label_fg=args.label_fg,
    )

    print(f"QR code saved: {saved_to}")
    print(f"URL: {args.url}")
    if args.label:
        print(f"Label: {args.label.upper()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
#!/usr/bin/env python3
"""
Styled QR Code Generator
Generates QR codes with rounded dots, dark theme, and centered label (like the KIKI example).

Usage:
    python generate_qr.py --url "https://example.com" --label "KIKI" --output my_qr.png
    python generate_qr.py --url "https://example.com" --label "MY BRAND"
    python generate_qr.py --url "https://example.com"   # no label
"""

import argparse
import math
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from PIL import Image, ImageDraw, ImageFont


def generate_styled_qr(
    url: str,
    label: str = "",
    output: str = "qr_output.png",
    size: int = 600,
    fg_color: tuple = (255, 255, 255),
    bg_color: tuple = (10, 10, 10),
    label_bg: str = "#1a3a4a",
    label_fg: str = "#ffffff",
    border_color: tuple = (255, 255, 255),
):
    """
    Generate a styled QR code.

    Args:
        url:          The URL or text to encode
        label:        Center label text (e.g. "KIKI"). Leave empty for no label.
        output:       Output filename (.png)
        size:         Output image size in pixels (square)
        fg_color:     QR module (dot) color as (R, G, B)
        bg_color:     Background color as (R, G, B)
        label_bg:     Center label background color (hex string)
        label_fg:     Center label text color (hex string)
        border_color: Outer border color as (R, G, B)
    """

    # ── 1. Build QR data ──────────────────────────────────────────────────────
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High: needed for logo overlay
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # ── 2. Render with rounded dots ───────────────────────────────────────────
    qr_img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(radius_ratio=0.7),
        back_color=bg_color,
        fill_color=fg_color,
    ).convert("RGBA")

    # ── 3. Resize to target size with padding ─────────────────────────────────
    pad = int(size * 0.06)  # ~6% padding on each side
    inner = size - pad * 2
    qr_img = qr_img.resize((inner, inner), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), bg_color + (255,))
    canvas.paste(qr_img, (pad, pad))

    draw = ImageDraw.Draw(canvas)

    # ── 4. Rounded outer border ───────────────────────────────────────────────
    border_w = max(4, int(size * 0.008))
    radius = int(size * 0.07)
    draw.rounded_rectangle(
        [border_w // 2, border_w // 2, size - border_w // 2, size - border_w // 2],
        radius=radius,
        outline=border_color + (255,),
        width=border_w,
    )

    # ── 5. Center label overlay ───────────────────────────────────────────────
    if label:
        label = label.upper()
        cx, cy = size // 2, size // 2

        # Label box dimensions
        lw = int(size * 0.22)
        lh = int(size * 0.11)
        lr = int(lh * 0.18)  # corner radius

        # Parse hex colors
        def hex_to_rgb(h):
            h = h.lstrip("#")
            return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

        lbg = hex_to_rgb(label_bg)
        lfg = hex_to_rgb(label_fg)

        # Draw label box
        box = [cx - lw // 2, cy - lh // 2, cx + lw // 2, cy + lh // 2]
        draw.rounded_rectangle(box, radius=lr, fill=lbg + (255,))

        # Draw label text — try a few common bold fonts, fall back to default
        font_size = int(lh * 0.55)
        font = None
        for font_path in [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ]:
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except (IOError, OSError):
                continue

        if font is None:
            font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), label, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(
            (cx - tw // 2, cy - th // 2 - bbox[1]),
            label,
            fill=lfg + (255,),
            font=font,
        )

    # ── 6. Save ───────────────────────────────────────────────────────────────
    final = canvas.convert("RGB")
    final.save(output, "PNG", quality=95)
    print(f"✅  QR code saved → {output}")
    print(f"    URL: {url}")
    if label:
        print(f"    Label: {label}")


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a styled QR code with rounded dots and optional center label."
    )
    parser.add_argument("--url",        required=True,             help="URL or text to encode")
    parser.add_argument("--label",      default="",                help="Center label text (e.g. KIKI)")
    parser.add_argument("--output",     default="qr_output.png",   help="Output filename")
    parser.add_argument("--size",       default=600, type=int,     help="Image size in pixels (default 600)")
    parser.add_argument("--label-bg",   default="#1a3a4a",         help="Label background hex color")
    parser.add_argument("--label-fg",   default="#ffffff",         help="Label text hex color")

    args = parser.parse_args()

    generate_styled_qr(
        url=args.url,
        label=args.label,
        output=args.output,
        size=args.size,
        label_bg=args.label_bg,
        label_fg=args.label_fg,
    )
