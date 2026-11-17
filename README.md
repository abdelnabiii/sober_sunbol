# Sober — prebiotic soda landing page

A single-file, four-section landing page for **Sober**, a fictional prebiotic soda brand with five cocktail-inspired, alcohol-free flavours.

The centrepiece is one real-time 3D can (Three.js 0.160 / WebGL). The can you pick on the hero arc travels down the page as one object: it flies into the pinned "what's inside" section and flips 180° at every step, spins through a storm of its own ingredients, then lands on its own card in the shop grid.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The standalone page. Fonts are inlined as base64 WOFF2, so this is the file to deploy or open. |
| `src/index.html` | Source of the page, with font placeholders. |
| `src/fonts/` | Self-hosted latin WOFF2 files: Archivo Black 400, Inter (variable), DM Mono 400 and 500. |
| `checkout.html`, `admin.html` | Checkout (`/checkout`) and order tracking (`/admin`), built the same way from `src/`. |
| `api/orders.js` | Serverless API: place orders (public), list and update orders (admin). |
| `api/_lib/shop.js` | Catalogue, prices (EGP), governorates and validation. The server prices every order from here. |
| `build.py` | Inlines the fonts into every page in `src/`. |

## Orders backend

Orders are stored in a Neon Postgres database (project `sober-orders`, table `orders`). The Vercel project needs two environment variables:

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Neon connection string. |
| `ADMIN_PASSWORD` | Password for `/admin`. |

Prices: a case is 12 cans for 240 EGP, the 3 pack is 50 EGP, delivery is free and payment is cash on delivery. Change them in `api/_lib/shop.js` (the server) and in the `PRICE` constants in `src/index.html` and `src/checkout.html` (display only).

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
