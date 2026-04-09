/**
 * Minora — Build Pipeline
 * ───────────────────────
 * Zero-config: concat + minify CSS & JS.
 *
 * Why csso + terser?
 *   • csso   — 150KB, pure Node, best CSS minifier that preserves
 *               custom properties. No bundler overhead.
 *   • terser — 350KB, industry-standard JS minifier. Uglify successor.
 *   Together: ~500KB devDependencies vs 50MB+ for Vite/Webpack/Rollup.
 *   Perfect for a vanilla CSS/JS kit.
 *
 * Usage:
 *   npm run build:css     — Concat + minify CSS
 *   npm run build:js      — Concat + minify JS
 *   npm run build:all     — Run both
 *   npm run watch         — Auto-rebuild on file changes
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { minify as cssoMinify } from 'csso';
import { minify as terserMinify } from 'terser';

// ─── Paths ──────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = __dirname;
const SRC_DIR = join(ROOT, 'src');
const DIST_DIR = join(ROOT, 'dist');
const COMPONENTS_DIR = join(SRC_DIR, 'components');
const JS_DIR = join(SRC_DIR, 'js');

// ─── Helpers ────────────────────────────────────────────────
function ensureDist() {
  if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR, { recursive: true });
}

function getFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .sort()
    .map(f => join(dir, f));
}

function formatBytes(bytes) {
  return bytes < 1024 ? bytes + ' B'
    : (bytes / 1024).toFixed(1) + ' KB';
}

function printSummary(files) {
  console.log('\n  ═══════════════════════════════════════════');
  console.log('  File                    Original   Minified   Saved');
  console.log('  ═══════════════════════════════════════════');
  let totalOrig = 0, totalMin = 0;
  files.forEach(f => {
    totalOrig += f.original;
    totalMin += f.minified;
    const pct = (((f.original - f.minified) / f.original) * 100).toFixed(0);
    const name = f.name.padEnd(22);
    console.log(`  ${name}  ${formatBytes(f.original).padStart(8)}   ${formatBytes(f.minified).padStart(8)}   ${pct.padStart(4)}%`);
  });
  const totalPct = (((totalOrig - totalMin) / totalOrig) * 100).toFixed(0);
  console.log('  ═══════════════════════════════════════════');
  console.log(`  ${'TOTAL'.padEnd(22)}  ${formatBytes(totalOrig).padStart(8)}   ${formatBytes(totalMin).padStart(8)}   ${totalPct.padStart(4)}%`);
  console.log('  ═══════════════════════════════════════════\n');
}

// ─── Build CSS ──────────────────────────────────────────────
async function buildCSS(silent) {
  ensureDist();
  const tokensPath = join(SRC_DIR, 'tokens.css');
  const componentFiles = getFiles(COMPONENTS_DIR, '.css');
  const summary = [];

  // 1. Build full CSS (tokens first, then components in alphabetical order)
  let fullCSS = `/*! Minora UI Kit v0.1.0 — https://github.com/ilzamafif/minora */\n\n`;

  // Tokens always first
  if (existsSync(tokensPath)) {
    fullCSS += readFileSync(tokensPath, 'utf-8') + '\n\n';
  } else {
    console.log('  ⚠  src/tokens.css not found');
    return summary;
  }

  // Then all components
  if (componentFiles.length > 0) {
    componentFiles.forEach(file => {
      const relative = join('src', 'components', file.split('/').pop());
      fullCSS += `/* ─── ${relative} ─── */\n`;
      fullCSS += readFileSync(file, 'utf-8') + '\n\n';
    });
  } else {
    console.log('  ⚠  No component CSS in src/components/');
  }

  // Write unminified
  const outPath = join(DIST_DIR, 'minora.css');
  writeFileSync(outPath, fullCSS, 'utf-8');
  const fullSize = Buffer.byteLength(fullCSS, 'utf-8');

  // Minify with csso
  // restructure: true  — merges duplicate selectors, shortens values
  // comments: false    — strips all comments
  // Custom properties (--var) are preserved by default
  const minified = cssoMinify(fullCSS, { restructure: true, comments: false });
  const minPath = join(DIST_DIR, 'minora.min.css');
  writeFileSync(minPath, minified.css, 'utf-8');
  const minSize = Buffer.byteLength(minified.css, 'utf-8');

  summary.push({ name: 'minora.css', original: fullSize, minified: minSize });

  // 2. Standalone tokens.css
  if (existsSync(tokensPath)) {
    const tokensContent = readFileSync(tokensPath, 'utf-8');
    const tokensMin = cssoMinify(tokensContent, { restructure: true, comments: false });
    writeFileSync(join(DIST_DIR, 'tokens.css'), tokensContent, 'utf-8');
    const tokOrig = Buffer.byteLength(tokensContent, 'utf-8');
    const tokMin = Buffer.byteLength(tokensMin.css, 'utf-8');
    summary.push({ name: 'tokens.css', original: tokOrig, minified: tokMin });
  }

  if (!silent) {
    console.log('\n⬡  CSS built — ' + componentFiles.length + ' components bundled\n');
    printSummary(summary);
  }

  return summary;
}

// ─── Build JS ───────────────────────────────────────────────
async function buildJS(silent) {
  ensureDist();
  const jsFiles = getFiles(JS_DIR, '.js');
  const summary = [];

  if (jsFiles.length === 0) {
    console.log('  ⚠  No JS files in src/js/');
    return summary;
  }

  // 1. Concat all JS with file headers
  let fullJS = `/*! Minora UI Kit v0.1.0 — https://github.com/ilzamafif/minora */\n\n`;
  fullJS += `'use strict';\n\n`;
  jsFiles.forEach(file => {
    const relative = join('src', 'js', file.split('/').pop());
    fullJS += `/* ─── ${relative} ─── */\n`;
    fullJS += readFileSync(file, 'utf-8') + '\n\n';
  });

  // Write unminified
  const outPath = join(DIST_DIR, 'minora.js');
  writeFileSync(outPath, fullJS, 'utf-8');
  const fullSize = Buffer.byteLength(fullJS, 'utf-8');

  // 2. Minify with terser
  // compress: true      — dead code removal, simplify expressions
  // mangle: toplevel:false — preserve window.* public APIs
  // output comments: /^!/ — keep banner only
  const result = await terserMinify(fullJS, {
    compress: {
      drop_console: false,
      pure_funcs: ['console.log']
    },
    mangle: {
      toplevel: false  // keep ToastManager, ModalManager, etc. on window
    },
    output: {
      comments: /^!/
    }
  });

  const minPath = join(DIST_DIR, 'minora.min.js');
  writeFileSync(minPath, result.code, 'utf-8');
  const minSize = Buffer.byteLength(result.code, 'utf-8');

  summary.push({ name: 'minora.js', original: fullSize, minified: minSize });

  if (!silent) {
    console.log('\n⬡  JS built — ' + jsFiles.length + ' modules bundled\n');
    printSummary(summary);
  }

  return summary;
}

// ─── Build All ──────────────────────────────────────────────
async function buildAll() {
  console.log('\n⬡  Minora v0.1.0 — Building...\n');
  const start = Date.now();
  const cssSummary = await buildCSS(true);
  const jsSummary = await buildJS(true);
  const elapsed = Date.now() - start;

  printSummary([...cssSummary, ...jsSummary]);
  console.log(`  ⬡  Done in ${elapsed}ms\n`);
}

// ─── Watch Mode ─────────────────────────────────────────────
async function watchMode() {
  console.log('\n⬡  Minora v0.1.0 — Watching for changes...\n');

  // Initial build
  await buildAll();

  let debounceTimer = null;
  const DEBOUNCE_MS = 300;

  // Watch CSS files
  const cssWatchDirs = [SRC_DIR, COMPONENTS_DIR];
  cssWatchDirs.forEach(dir => {
    if (existsSync(dir)) {
      watch(dir, { recursive: false }, (eventType, filename) => {
        if (!filename || !filename.endsWith('.css')) return;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          console.log(`  ✎  ${filename} changed — rebuilding CSS...`);
          await buildCSS(false);
        }, DEBOUNCE_MS);
      });
    }
  });

  // Watch JS files
  if (existsSync(JS_DIR)) {
    watch(JS_DIR, { recursive: false }, (eventType, filename) => {
      if (!filename || !filename.endsWith('.js')) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log(`  ✎  ${filename} changed — rebuilding JS...`);
        await buildJS(false);
      }, DEBOUNCE_MS);
    });
  }

  console.log('  👁  Watching src/ for changes. Press Ctrl+C to stop.\n');
}

// ─── Main ───────────────────────────────────────────────────
const command = process.argv[2] || 'all';

(async () => {
  try {
    switch (command) {
      case 'css':     await buildCSS(false); break;
      case 'js':      await buildJS(false); break;
      case 'watch':   await watchMode(); break;
      case 'all':
      default:        await buildAll(); break;
    }
  } catch (err) {
    console.error('✗ Build failed:', err.message);
    process.exit(1);
  }
})();
