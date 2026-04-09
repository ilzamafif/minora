# Minora

> Elegant minimalist UI kit — clean components with warm gold accent, zero dependencies.

[![npm version](https://img.shields.io/badge/version-0.1.0-bb6b21)]()
[![license](https://img.shields.io/badge/license-MIT-78716c)](LICENSE)
[![size](https://img.shields.io/badge/gzip-44KB-d4872e)](dist/minora.min.css)
[![cdn](https://img.shields.io/badge/cdn-jsDelivr-57534e)](https://www.jsdelivr.com/package/gh/ilzamafif/minora)

Minora is a handcrafted UI kit built with **vanilla HTML, CSS, and JavaScript**. Every component uses CSS custom properties from a single source of truth — change one token, the entire system adapts. No frameworks. No dependencies. Just clean, elegant components.

```
┌─────────────────────────────────────────────────────┐
│  ╭────────────╮  ╭────────────╮  ╭────────────╮   │
│  │  Button    │  │   Badge    │  │   Toggle   │   │
│  ╰────────────╯  ╰────────────╯  ╰────────────╯   │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Input with label & helper text           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ╭─ Radio ○ ─╮  ╭─ Checkbox ☑ ─╮  ╭─ Alert ─╮    │
│  ╰───────────╯  ╰──────────────╯  ╰─────────╯    │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Toast notification: ✓ Saved!             │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Modal backdrop with dialog [ Confirm ]           │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start — CDN

### CSS Only

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/minora.min.css">
```

### JS Only (modals, toasts, selects, tooltips)

```html
<script src="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/minora.min.js"></script>
```

### CSS + JS (complete)

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/minora.min.css">
<script src="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/minora.min.js"></script>
```

### Specific Version (recommended for production)

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/username/minora@v0.1.0/dist/minora.min.css">
<script src="https://cdn.jsdelivr.net/gh/username/minora@v0.1.0/dist/minora.min.js"></script>
```

### Design Tokens Only

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/tokens.css">
```

---

## Complete Example

Copy-paste this into an `.html` file and open in your browser:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minora Quick Start</title>
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/minora.min.css">
</head>
<body style="max-width:480px; margin:4rem auto; padding:0 1rem;">

  <h1 style="font-family:var(--font-serif); font-size:var(--text-2xl);
              margin-bottom:var(--space-6);">Quick Start</h1>

  <!-- Button -->
  <button class="btn btn-primary btn-md" onclick="demo()">Click Me</button>

  <!-- Input -->
  <div class="input-group" style="margin-top:var(--space-6);">
    <label class="input-label" for="name">Full Name</label>
    <div class="input-wrapper">
      <input class="input input-md" id="name"
             type="text" placeholder="John Doe" />
    </div>
  </div>

  <!-- Toast (needs JS) -->
  <script src="https://cdn.jsdelivr.net/gh/username/minora@latest/dist/minora.min.js"></script>
  <script>
    function demo() {
      ToastManager.show({
        type: 'success',
        message: 'It works! Minora is loaded via CDN.'
      });
    }
  </script>

</body>
</html>
```

---

## Available Components

| Component | Description | Status |
|---|---|---|
| **[Button](https://github.com/username/minora#button)** | Solid, outline, ghost, destructive — 3 sizes, icon-only, loading spinner | ✅ Stable |
| **[Badge](https://github.com/username/minora#badge)** | Solid/subtle/outline — with dot indicator, notification overlay | ✅ Stable |
| **[Tag](https://github.com/username/minora#tag)** | Dismissible tags with fade animation, clickable, icon support | ✅ Stable |
| **[Avatar](https://github.com/username/minora#avatar)** | Image/initials/icon fallback, status dots, overlapping groups | ✅ Stable |
| **[Divider](https://github.com/username/minora#divider)** | Horizontal rules, text/icon separators, vertical separators | ✅ Stable |
| **[Input](https://github.com/username/minora#input)** | Default/filled/underline variants, icon addons, clear button | ✅ Stable |
| **[Textarea](https://github.com/username/minora#textarea)** | Auto-resize, character counter, validation states | ✅ Stable |
| **[Select](https://github.com/username/minora#select)** | Custom dropdown with search, grouped options, keyboard nav | ✅ Stable |
| **[Multiselect](https://github.com/username/minora#multiselect)** | Tag-based selection, select all/clear, counter badge | ✅ Stable |
| **[Checkbox](https://github.com/username/minora#checkbox)** | Standard/filled/card, radio buttons, segmented controls | ✅ Stable |
| **[Toggle](https://github.com/username/minora#toggle)** | Smooth animated switches with icon support | ✅ Stable |
| **[Form Validation](https://github.com/username/minora#form-validation)** | Inline errors, password strength, form-level alerts | ✅ Stable |
| **[Toast](https://github.com/username/minora#toast)** | 6 positions, progress bar, stacking, auto-dismiss, actions | ✅ Stable |
| **[Modal](https://github.com/username/minora#modal)** | Focus trap, scroll lock, nested stacking, multi-step | ✅ Stable |
| **[Dialog](https://github.com/username/minora#dialog)** | Confirm, destructive, info, input-based confirmation | ✅ Stable |
| **[Tooltip](https://github.com/username/minora#tooltip)** | 9 positions, auto-flip, rich content, interactive | ✅ Stable |
| **[Popover](https://github.com/username/minora#popover)** | Click-triggered panels with header/body/footer | ✅ Stable |
| **[Alert](https://github.com/username/minora#alert)** | Subtle/filled/outline, inline messages, page banners | ✅ Stable |

---

## Customization

All colors, spacing, typography, and animation values come from `tokens.css` — a single source of truth. Override them **after** loading Minora CSS:

```html
<link rel="stylesheet" href=".../minora.min.css">
<style>
  :root {
    /* Change accent color */
    --color-accent-500: #3b82f6;  /* blue instead of gold */
    --color-accent-600: #2563eb;
    --color-accent-700: #1d4ed8;

    /* Use your own fonts */
    --font-serif: 'Merriweather', serif;
    --font-sans:  'Source Sans 3', sans-serif;

    /* Adjust spacing */
    --space-4: 20px;  /* default: 16px */

    /* Customize focus ring */
    --focus-ring-color: var(--color-info);
  }
</style>
```

### Full Token List

See [tokens.css](src/tokens.css) for all available custom properties:

| Category | Tokens |
|---|---|
| **Colors** | `--color-neutral-*` (50–950), `--color-accent-*` (50–950), `--color-success-*`, `--color-warning-*`, `--color-error-*`, `--color-info-*` |
| **Typography** | `--font-serif`, `--font-sans`, `--font-mono`, `--text-*`, `--leading-*`, `--tracking-*`, `--font-*` |
| **Spacing** | `--space-0` to `--space-32` (4px base) |
| **Radius** | `--radius-none`, `--radius-sm`, `--radius-md`, `--radius-pill` |
| **Shadows** | `--shadow-sm`, `--shadow-md` |
| **Transitions** | `--duration-*`, `--ease-*`, `--transition-*` |
| **Z-Index** | `--z-base` to `--z-toast` |

---

## Design System

**Palette:** Warm gold (`#d4872e`) on cool gray — timeless, sophisticated, minimal.

**Typography:** Playfair Display (serif) for headings + Inter (sans-serif) for body. Classical meets modern.

**Philosophy:** Every value is a CSS custom property. Change one token, the entire system adapts. No hardcoded values anywhere.

---

## Browser Support

| Browser | Version |
|---|---|
| Chrome | 88+ |
| Firefox | 85+ |
| Safari | 14.1+ |
| Edge | 88+ |
| Opera | 74+ |

> **Note:** Some components use `:has()` selector (input focus states). Polyfill available at [css-has-pseudo](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-has-pseudo).

---

## File Size

| File | Size | Gzip |
|---|---|---|
| `minora.css` | 246 KB | 38 KB |
| `minora.min.css` | 112 KB | **22 KB** |
| `minora.js` | 39 KB | 13 KB |
| `minora.min.js` | 22 KB | **9 KB** |
| `tokens.css` | 28 KB | 6 KB |
| **Total (min + gzipped)** | | **~37 KB** |

---

## Build from Source

```bash
git clone https://github.com/username/minora.git
cd minora
npm install
npm run build:all    # CSS + JS concat + minify
npm run watch        # auto-rebuild on changes
```

**Build output:** `dist/` folder with concatenated and minified files, ready for CDN.

---

## Project Structure

```
minora/
├── dist/                    ← CDN-ready files
│   ├── minora.css           ← All components
│   ├── minora.min.css       ← Minified
│   ├── minora.js            ← All JS modules
│   ├── minora.min.js        ← Minified
│   └── tokens.css           ← Standalone tokens
├── src/
│   ├── tokens.css           ← Design tokens (source of truth)
│   ├── components/          ← 13 CSS component files
│   └── js/                  ← 4 JS module files
├── docs/                    ← Documentation
├── package.json
├── build.mjs                ← Build script (csso + terser)
├── LICENSE                  ← MIT
└── README.md
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-component`)
3. Commit your changes (`git commit -m 'Add amazing component'`)
4. Push to the branch (`git push origin feature/amazing-component`)
5. Open a Pull Request

**Guidelines:**
- All CSS values must use custom properties — no hardcoded colors or pixel values
- Follow the existing naming convention: `.component`, `.component-variant`, `.component-size`
- Include anatomy comments at the top of each component file
- Test across Chrome, Firefox, Safari, and Edge

---

## License

[MIT](LICENSE) — use freely in personal and commercial projects. Attribution appreciated but not required.

---

Built with ☕ by the Minora team.
