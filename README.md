# Sober — prebiotic soda landing page

A single-file, four-section landing page for **Sober**, a fictional prebiotic soda brand with five cocktail-inspired, alcohol-free flavours.

The centrepiece is one real-time 3D can (Three.js 0.160 / WebGL). The can you pick on the hero arc travels down the page as one object: it flies into the pinned "what's inside" section and flips 180° at every step, spins through a storm of its own ingredients, then lands on its own card in the shop grid.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The standalone page. Fonts are inlined as base64 WOFF2, so this is the file to deploy or open. |
| `src/index.html` | Source of the page, with font placeholders. |
| `src/fonts/` | Self-hosted latin WOFF2 files: Archivo Black 400, Inter (variable), DM Mono 400 and 500. |
| `build.py` | Inlines the fonts: `src/index.html` → `index.html`. |

## Build and run

```bash
python3 build.py
```

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. The page loads images and video from images.higgs.ai and d8j0ntlcm91z4.cloudfront.net, and three.js from cdn.jsdelivr.net. No other hosts are used.

## Sections

1. **Flavors**: a 3D can carousel. Drag, flick, tap a can, use the → button or the arrow keys. Autoplay runs every 3.2 s. The new flavour colour grows as a feathered circle from behind the centre can.
2. **Inside**: a pinned section in four steps. The can flips to show its nutrition panel, then an ingredient storm plays.
3. **Shop**: five cards with tilt and a squash on click. "+" flies a case into the basket.
4. **Range**: build-your-3-pack. Add to cart flies all three cans into the basket.

`prefers-reduced-motion` skips the intro and turns off all motion.
