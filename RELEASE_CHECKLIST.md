# Release Checklist

Follow these steps every time you release a new version of Minora.

---

## Pre-Release

- [ ] **Test all components** — Open showcase HTML files in Chrome, Firefox, Safari
- [ ] **Check focus states** — Tab through every interactive component
- [ ] **Verify responsive** — Resize browser window, check mobile layout
- [ ] **Run build locally** — `npm run build:all` — ensure no errors
- [ ] **Check minified output** — Open `dist/minora.min.css` in browser, verify it works

---

## Version Bump

- [ ] **Update `package.json`** — Change `version` field (e.g., `0.1.0` → `0.2.0`)
  ```json
  { "version": "0.2.0" }
  ```

- [ ] **Update `CHANGELOG.md`** — Add new version section at top:
  ```markdown
  ## [0.2.0] — 2025-XX-XX

  ### Added
  - New component: ...

  ### Changed
  - Updated ...

  ### Fixed
  - Fixed ...
  ```

- [ ] **Update `README.md`** — Badge version, CDN example URLs, changelog links

- [ ] **Update `build.mjs`** — Change version string in banner comments:
  ```
  Minora UI Kit v0.2.0
  ```

---

## Build & Tag

- [ ] **Run full build**
  ```bash
  npm run build:all
  ```

- [ ] **Verify dist/ output** — Check all 5 files exist:
  ```
  dist/minora.css
  dist/minora.min.css
  dist/minora.js
  dist/minora.min.js
  dist/tokens.css
  ```

- [ ] **Commit changes**
  ```bash
  git add -A
  git commit -m "release: v0.2.0"
  ```

- [ ] **Create git tag** (use `v` prefix for CDN compatibility)
  ```bash
  git tag -a v0.2.0 -m "Release v0.2.0"
  ```

- [ ] **Push code + tag**
  ```bash
  git push origin main
  git push origin v0.2.0
  ```

---

## npm Publish (optional)

- [ ] **Login to npm** (first time only)
  ```bash
  npm login
  ```

- [ ] **Publish package**
  ```bash
  npm publish --access public
  ```

---

## CDN Verification

- [ ] **Wait 1–2 minutes** for jsDelivr to pick up the new version

- [ ] **Open `test/cdn-test.html`** in browser — verify all 5 components render

- [ ] **Test each CDN URL manually:**
  ```
  https://cdn.jsdelivr.net/gh/username/minora@v0.2.0/dist/minora.min.css
  https://cdn.jsdelivr.net/gh/username/minora@v0.2.0/dist/minora.min.js
  https://cdn.jsdelivr.net/gh/username/minora@v0.2.0/dist/tokens.css
  https://cdn.jsdelivr.net/npm/minora@0.2.0/dist/minora.min.css
  https://cdn.jsdelivr.net/npm/minora@0.2.0/dist/minora.min.js
  ```

- [ ] **Verify no 404s** — All URLs should return content, not error pages

---

## Post-Release

- [ ] **Create GitHub Release** — Go to repository → Releases → Draft new release
  - Tag: `v0.2.0`
  - Title: `Minora v0.2.0`
  - Body: Copy from CHANGELOG.md

- [ ] **Update showcase files** — Replace CDN URLs in `button.html`, `input.html`, etc.
  from `../src/` to CDN paths if they reference local files

- [ ] **Announce** — Social media, Discord, changelog sites

---

## Versioning Guide

Minora follows [Semantic Versioning](https://semver.org/):

| Bump | When | Example |
|---|---|---|
| **Major** (`1.0.0`) | Breaking API changes | New file structure, renamed classes |
| **Minor** (`0.1.0` → `0.2.0`) | New components, features | New component, new variant |
| **Patch** (`0.1.0` → `0.1.1`) | Bug fixes only | CSS fix, JS fix, no API change |

**CDN URL patterns:**
```
@latest           → Always the newest version
@v0.1.0          → Pinned to specific version (production)
@0.x             → Latest minor in 0.x range
```
