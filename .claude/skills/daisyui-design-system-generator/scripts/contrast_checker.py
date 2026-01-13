#!/usr/bin/env python3
"""
DaisyUI Theme Contrast Checker

Validates WCAG AAA contrast ratios for DaisyUI theme color pairs.
Parses OKLCH colors from CSS and calculates contrast ratios.

Usage:
    python3 contrast_checker.py path/to/theme.css
    python3 contrast_checker.py --check "oklch(98% 0.01 240)" "oklch(18% 0.02 240)"
"""

import re
import sys
import math
from dataclasses import dataclass
from typing import Optional


@dataclass
class OklchColor:
    """OKLCH color representation."""
    l: float  # Lightness 0-1
    c: float  # Chroma 0-0.4+
    h: float  # Hue 0-360

    @classmethod
    def parse(cls, value: str) -> Optional["OklchColor"]:
        """Parse oklch(L% C H) or oklch(L C H) format."""
        match = re.search(
            r"oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)",
            value.strip(),
            re.IGNORECASE,
        )
        if not match:
            return None
        l_val = float(match.group(1))
        if match.group(2) == "%":
            l_val /= 100
        return cls(l=l_val, c=float(match.group(3)), h=float(match.group(4)))

    def to_srgb(self) -> tuple[float, float, float]:
        """Convert OKLCH to linear sRGB (approximate)."""
        # Simplified conversion for contrast calculation
        # Full accuracy would require complete OKLab->XYZ->sRGB pipeline
        if self.c < 0.001:
            # Achromatic
            return (self.l, self.l, self.l)
        
        h_rad = math.radians(self.h)
        a = self.c * math.cos(h_rad)
        b = self.c * math.sin(h_rad)
        
        # OKLab to approximate linear RGB
        l_ = self.l + 0.3963377774 * a + 0.2158037573 * b
        m_ = self.l - 0.1055613458 * a - 0.0638541728 * b
        s_ = self.l - 0.0894841775 * a - 1.2914855480 * b
        
        l = l_ ** 3
        m = m_ ** 3
        s = s_ ** 3
        
        r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
        g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
        b_val = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
        
        return (max(0, min(1, r)), max(0, min(1, g)), max(0, min(1, b_val)))

    def relative_luminance(self) -> float:
        """Calculate relative luminance for contrast ratio."""
        r, g, b = self.to_srgb()
        
        def channel_luminance(c: float) -> float:
            if c <= 0.03928:
                return c / 12.92
            return ((c + 0.055) / 1.055) ** 2.4
        
        return (
            0.2126 * channel_luminance(r)
            + 0.7152 * channel_luminance(g)
            + 0.0722 * channel_luminance(b)
        )


def contrast_ratio(color1: OklchColor, color2: OklchColor) -> float:
    """Calculate WCAG contrast ratio between two colors."""
    l1 = color1.relative_luminance()
    l2 = color2.relative_luminance()
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def check_aaa(ratio: float, large_text: bool = False) -> tuple[bool, str]:
    """Check if contrast ratio meets WCAG AAA."""
    threshold = 4.5 if large_text else 7.0
    passed = ratio >= threshold
    status = "✅ Pass" if passed else "❌ Fail"
    return passed, status


# DaisyUI color pairs to check
COLOR_PAIRS = [
    ("base-100", "base-content"),
    ("base-200", "base-content"),
    ("base-300", "base-content"),
    ("primary", "primary-content"),
    ("secondary", "secondary-content"),
    ("accent", "accent-content"),
    ("neutral", "neutral-content"),
    ("info", "info-content"),
    ("success", "success-content"),
    ("warning", "warning-content"),
    ("error", "error-content"),
]


def parse_theme_css(css_content: str) -> dict[str, OklchColor]:
    """Extract color variables from DaisyUI theme CSS."""
    colors = {}
    pattern = r"--color-([\w-]+):\s*(oklch\([^)]+\))"
    for match in re.finditer(pattern, css_content, re.IGNORECASE):
        name = match.group(1)
        color = OklchColor.parse(match.group(2))
        if color:
            colors[name] = color
    return colors


def validate_theme(css_content: str) -> list[dict]:
    """Validate all color pairs in a theme."""
    colors = parse_theme_css(css_content)
    results = []
    
    for bg_name, fg_name in COLOR_PAIRS:
        if bg_name not in colors or fg_name not in colors:
            continue
        
        bg = colors[bg_name]
        fg = colors[fg_name]
        ratio = contrast_ratio(bg, fg)
        passed, status = check_aaa(ratio)
        
        results.append({
            "background": bg_name,
            "foreground": fg_name,
            "ratio": ratio,
            "passed": passed,
            "status": status,
        })
    
    return results


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    if sys.argv[1] == "--check" and len(sys.argv) >= 4:
        # Direct color comparison
        c1 = OklchColor.parse(sys.argv[2])
        c2 = OklchColor.parse(sys.argv[3])
        if not c1 or not c2:
            print("Error: Could not parse OKLCH colors")
            sys.exit(1)
        ratio = contrast_ratio(c1, c2)
        passed, status = check_aaa(ratio)
        print(f"Contrast ratio: {ratio:.2f}:1 {status}")
        sys.exit(0 if passed else 1)
    
    # File validation
    filepath = sys.argv[1]
    try:
        with open(filepath, "r") as f:
            css_content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    
    results = validate_theme(css_content)
    
    if not results:
        print("No color pairs found in CSS file.")
        sys.exit(1)
    
    print(f"\nDaisyUI Theme Contrast Report")
    print(f"{'='*50}")
    print(f"File: {filepath}")
    print(f"{'='*50}\n")
    
    all_passed = True
    for r in results:
        print(f"{r['background']:15} / {r['foreground']:20} → {r['ratio']:5.2f}:1  {r['status']}")
        if not r["passed"]:
            all_passed = False
    
    print(f"\n{'='*50}")
    if all_passed:
        print("✅ All color pairs meet WCAG AAA requirements")
    else:
        print("❌ Some color pairs fail WCAG AAA requirements")
        print("   Adjust lightness values to achieve 7:1 minimum contrast")
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
