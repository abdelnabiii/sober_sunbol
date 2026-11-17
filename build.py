#!/usr/bin/env python3
"""Build the standalone pages: inline the self-hosted WOFF2 fonts as base64 data URIs.

src/*.html + src/fonts/*.woff2  ->  *.html  (index.html, checkout.html, admin.html)
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
DATA = {
    key: "data:font/woff2;base64," + base64.b64encode((ROOT / "src" / "fonts" / name).read_bytes()).decode("ascii")
    for key, name in FONTS.items()
}

for src in sorted((ROOT / "src").glob("*.html")):
    html = src.read_text(encoding="utf-8")
    for key, uri in DATA.items():
        html = html.replace(key, uri)
    assert "__FONT_" not in html, src.name
    (ROOT / src.name).write_text(html, encoding="utf-8")
    print(f"{src.name} written ({len(html) / 1024:.0f} KB)")
