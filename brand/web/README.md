# PolicyIntel logo kit for the web

The text in every logo is converted to shapes, so no font is needed.

## Which file to use
| Where | File |
| --- | --- |
| Site header on a white or light background | `svg/policyintel-logo-on-light.svg` |
| Site header or footer on navy (#0B1F33) | `svg/policyintel-logo-on-dark.svg` |
| White Policy + amber Intel anywhere, with the navy background built in (social posts, slides, email) | `svg/policyintel-logo-navy-bg.svg`, `svg/policyintel-logo-stacked-navy-bg.svg`, or the `png/*-navy-bg-*` files |
| Hero section, login page, about page | `svg/policyintel-logo-stacked-on-light.svg` or `-on-dark.svg` |
| Small spaces, avatars, social profile pictures | `svg/policyintel-mark-on-light.svg` or `-on-dark.svg`, or `favicon/icon-512.png` |
| Email signatures, Word documents, places that don't accept SVG | `png/` (the `128h` versions are for retina screens) |
| Link previews (WhatsApp, LinkedIn, Slack) | `png/policyintel-og-image-1200x630.png` |

## Header
```html
<a href="/" class="logo">
  <img src="/brand/policyintel-logo-on-light.svg" alt="PolicyIntel" height="40">
</a>
```

## <head>
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<meta name="theme-color" content="#0B1F33">
<meta property="og:image" content="https://YOUR-DOMAIN/brand/policyintel-og-image-1200x630.png">
```
Put `favicon.ico` at the root of the site and everything else in `/brand/`.
`icon-192.png` and `icon-512.png` are for a `manifest.json` if the site is a PWA.

## Why the on-dark files look blank on GitHub
The on-dark files have a transparent background and white "Policy" text, so on a white page only "Intel" shows. Put them on navy, or use the `navy-bg` files.

## Rules
- Use the on-dark files on navy or dark backgrounds, and the on-light files on white or light backgrounds.
- Don't put the logo on photos.
- Keep the logo at least 24px tall (the mark alone at least 20px).
- Leave clear space around it of at least half the shield's width.
- Don't recolor, stretch, rotate, or add shadows or gradients.
- Colors: navy #0B1F33, secondary navy #163A5C, amber #F2A900 (use amber as a fill only, never as text on white).
