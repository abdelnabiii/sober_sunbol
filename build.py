#!/usr/bin/env python3
"""Build the standalone page: inline the self-hosted WOFF2 fonts as base64 data URIs.

src/index.html + src/fonts/*.woff2  ->  index.html
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).parent
FONTS = {
    "__FONT_ARCHIVO__": "archivo.woff2",
    "__FONT_INTER__": "inter.woff2",
    "__FONT_DM400__": "dm400.woff2",
    "__FONT_DM500__": "dm500.woff2",
}

html = (ROOT / "src" / "index.html").read_text(encoding="utf-8")
for key, name in FONTS.items():
    data = base64.b64encode((ROOT / "src" / "fonts" / name).read_bytes()).decode("ascii")
    html = html.replace(key, f"data:font/woff2;base64,{data}")
assert "__FONT_" not in html
(ROOT / "index.html").write_text(html, encoding="utf-8")
print(f"index.html written ({len(html) / 1024:.0f} KB)")
