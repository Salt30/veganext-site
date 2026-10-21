# VegaNext Site

A complete, portable copy of the VegaNext company website: a responsive static page with a self-hosted Three.js hero, service examples, technology logos, service dialogs, and keyboard-accessible process tabs. The visual direction is inspired by the supplied Qronos reference and adapted to VegaNext's content and artwork.

The editable source is in **`dist/`**. There is no build step, package installation, backend, or API key required to run this site. All site scripts, styles, logo assets, and the Three.js runtime are included.

## Preview locally

From the repository root, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765). Stop the server with **Ctrl+C**. On Windows, `py -m http.server 8765 --bind 127.0.0.1 --directory dist` is an alternative when Python is installed through the Python launcher.

Any local static HTTP server can serve `dist/`. Use an HTTP server rather than opening `index.html` directly, because the JavaScript uses ES modules.

## Edit the site

| File | Purpose |
| --- | --- |
| `dist/index.html` | Page structure, company copy, navigation, consultation and phone links |
| `dist/styles.css` | Base layout, typography, colors, and animations |
| `dist/responsive.css` | Fluid spacing, touch controls, tablet layouts, short-screen navigation, and dialogs |
| `dist/brand.css` | Original VegaNext logo presentation and artwork-derived color accents |
| `dist/app.js` | Icons, the eight technology logos, navigation, service dialogs, and module initialization |
| `dist/command-center.js` and `.css` | Connected-workflow examples and capability navigation |
| `dist/service-demos.js` and `.css` | Cybersecurity, cloud, AI, and managed IT examples |
| `dist/experience-demos.js` and `.css` | Approach stages and industry diagrams |
| `dist/scroll-playback.js` and `.css` | Visibility-aware demo timing and playback controls |
| `dist/demo-layout.css` | Shared layout for the compact service examples |
| `dist/vortex.js` | WebGL particle hero, adaptive quality, and visibility controls |
| `dist/assets/tech/sources.json` | Source records for the technology logo files |

Edit these files directly and refresh the local preview. Keep the stylesheet order in `index.html`: later stylesheets refine the shared layout and responsive rules.

## Behavior and content

- The technology strip includes **Microsoft, AWS, Google Cloud, SentinelOne, Palo Alto Networks, Fortinet, Ubiquiti, and N-able**, using the supplied or sourced company logo assets. It represents technologies, not a client list.
- Demo stories advance when scrolled into view and pause offscreen or when the browser tab is hidden. Each has a compact pause/play control. Reduced-motion visitors start with a still example and can advance one step at a time or explicitly choose playback.
- The capability navigation and approach tabs support direct exploration. The AI example shows human review before handoff.
- Demos are illustrative local animations. They do not connect to customer systems, submit requests, or display live customer data or real performance metrics. No customer logos or testimonials are included.
- Consultation buttons link to VegaNext's existing [contact page](https://www.veganext.com/contact); phone links use its published telephone number. There is no contact-form backend in this repository.
- The hero adjusts its rendering quality on resize, uses fewer particles and a 30 fps cap on compact screens, and respects reduced motion.

Existing responsive checks covered 320, 360, 375, 390, 430, 568, 667, 768, 820, 1024, 1280, 1440, 1920, and 2560 CSS-pixel widths, including short landscape viewports. Main controls use at least 44-pixel touch targets. Recheck relevant mobile and desktop views after changing the layout.

## Brand assets

`dist/assets/veganext-logo-stacked.png` preserves the supplied 2048 × 2048 transparent PNG byte-for-byte. The horizontal header/footer lockup uses CSS to display the original mark and wordmark separately from that same image. It keeps the artwork's proportions, transparency, and original colors, without recoloring the logo.

The blue, navy, and silver UI accents in `brand.css` were sampled from the supplied artwork; they are not an asserted official color specification. Other original tracked logo variants and assets are retained for a complete handoff.

## Host the site

Publish the **contents of `dist/`** as the static site's document root, keeping the asset paths and subdirectories intact.

- Build command: **none**.
- Output/publish directory: **`dist`**.
- Entry page: **`index.html`** inside `dist/`.
- Serve JavaScript modules with a JavaScript MIME type. Ordinary static hosts handle this automatically.

No runtime secrets or environment variables are needed. The site can be served at a domain root or a subdirectory because its internal script, stylesheet, and image references are relative.

`.openai/hosting.json` is metadata for the original Sites project and declares `dist` as its static output. It is retained as part of the original tracked source. It is **not required by other static hosts** and contains a project identifier, not a login credential. Do not use it to provision a different deployment unless you intend to work with that original Sites project.

## Sources and third-party notices

VegaNext offering and contact information came from its existing website:

- [Home](https://www.veganext.com/)
- [Cybersecurity](https://www.veganext.com/cybersecurity)
- [Infrastructure](https://www.veganext.com/infrastructure)
- [AI solutions](https://www.veganext.com/ai-solutions)
- [About](https://www.veganext.com/about)
- [Contact](https://www.veganext.com/contact)

Technology asset provenance is recorded in [`dist/assets/tech/sources.json`](dist/assets/tech/sources.json), including the official N-able horizontal SVG. Technology and VegaNext logos belong to their respective owners.

Three.js is distributed under its included [MIT license](dist/assets/THREE-LICENSE.txt), copyright 2010–2025 three.js authors. Keep this license and the library's embedded notices with redistributed copies. This repository does not add a new license for VegaNext branding or the site as a whole.

## Browser, app, and sharing artwork

`dist/assets/brand/` contains exports made from the supplied VegaNext artwork, with its original colors and proportions. `source.json` records the source image hash and crop coordinates. Transparent mark-only SVG/PNG favicons and the multi-size `dist/favicon.ico` keep the symbol legible at small sizes. Apple and app icons use a pale silver background; the separate maskable icon leaves room for device cropping. `dist/site.webmanifest` declares the 192px, 512px, and maskable app icons.

- `social-share.png`: 1200 × 630 website preview, wired to Open Graph and Twitter metadata in `dist/index.html`.
- `github-social.png`: 1280 × 640 image for the repository's **Settings → General → Social preview** upload.
- `veganext-horizontal.png`: transparent 1600 × 360 horizontal lockup for other brand uses. The website's existing header and footer presentation remains unchanged.

When moving to a production host, update the canonical URL, `og:url`, and absolute `og:image`/`twitter:image` URLs in `dist/index.html` together. Sharing services must be able to fetch the page and image to display previews; private hosting can prevent that.
