# Minora — GitHub Pages Setup

## Automated Deployment

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
automatically builds and deploys to GitHub Pages on every push to `main`.

### One-time Setup (do this ONCE in GitHub UI):

1. Go to your repo: **https://github.com/ilzamafif/minora**
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Done — no need to select a branch

### What Happens Next:

1. Push to `main` → GitHub Actions triggers
2. Workflow runs: `npm ci` → `npm run build:all`
3. Artifact uploads to GitHub Pages
4. Site is live at: **https://ilzamafif.github.io/minora/**

### Manual Trigger:

You can also trigger a deploy manually:
- Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

---

## File Structure for GitHub Pages

```
minora/
├── index.html          ← Landing page (root)
├── dist/               ← Built CSS + JS (auto-generated)
│   ├── minora.css
│   ├── minora.min.css
│   ├── minora.js
│   ├── minora.min.js
│   └── tokens.css
├── docs/               ← Documentation
│   ├── docs.html       ← Interactive docs
│   ├── dashboard.html  ← Dashboard demo
│   ├── login.html      ← Login page demo
│   └── landing.html    ← Landing page demo
└── .github/workflows/
    └── deploy.yml      ← Auto-deploy workflow
```

## CDN Links

After deployment, your site will be accessible at:

```
https://ilzamafif.github.io/minora/
https://ilzamafif.github.io/minora/docs/docs.html
https://ilzamafif.github.io/minora/docs/dashboard.html
https://ilzamafif.github.io/minora/docs/login.html
```

jsDelivr CDN for the built files:
```
https://cdn.jsdelivr.net/gh/ilzamafif/minora@main/dist/minora.min.css
https://cdn.jsdelivr.net/gh/ilzamafif/minora@main/dist/minora.min.js
```
