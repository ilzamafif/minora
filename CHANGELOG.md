# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2025-04-08

### Initial Release

#### Components — CSS (13 files)
| Component | File | Description |
|---|---|---|
| **Button** | `button.css` | Solid/outline/Ghost/Destructive — 3 sizes, icon-only, loading spinner, focus ring |
| **Badge** | `badge.css` | Solid/Subtle/Outline — 5 semantic colors, dot indicator, notification overlay |
| **Tag** | `badge.css` | Dismissible with fade animation, clickable, icon support, accent/semantic colors |
| **Avatar** | `avatar.css` | Image/initials/icon fallback, 5 sizes, status dots, overlapping groups, accent backgrounds |
| **Divider** | `divider.css` | Horizontal rules, text/icon separators, vertical separators, thin/thick, subtle/muted/accent |
| **Input** | `input.css` | Default/Filled/Underline — icon addons, clear button, text prefix/suffix, validation states |
| **Textarea** | `input.css` | Auto-resize, character counter, 3 sizes, validation states |
| **Select** | `select.css` | Custom dropdown with search, grouped options, keyboard navigation, auto-flip |
| **Multiselect** | `select.css` | Tag-based selection, select all/clear all, counter badge for overflow |
| **Checkbox** | `checkbox.css` | Standard/Filled/Card, radio buttons, segmented control, horizontal/vertical groups |
| **Toggle** | `toggle.css` | Smooth animated switches, icon in thumb, ON/OFF labels, card variant |
| **Form Validation** | `form-validation.css` | Inline errors with animation, password strength meter, form-level alerts, success state |
| **Toast** | `toast.css` | Floating notifications, progress bar, 6 positions, stacking (max 5), queue |
| **Modal** | `modal.css` | 5 sizes + fullscreen, focus trap, body scroll lock, nested stacking, multi-step |
| **Dialog** | `modal.css` | Confirm, destructive, info, input-based confirmation with animated scale-in |
| **Tooltip** | `tooltip.css` | 9 positions with auto-flip, rich content, interactive with action buttons |
| **Popover** | `tooltip.css` | Click-triggered panels with header/body/footer, close on outside click |
| **Alert** | `alert.css` | Subtle/Filled/Outline, inline messages, page banners with sticky positioning |

#### Components — JavaScript (4 modules)
| Module | File | Features |
|---|---|---|
| **ModalManager** | `modal.js` | `open(id)`, `close(id)` — focus trap, body scroll lock, escape/backdrop close |
| **ToastManager** | `toast.js` | `show(opts)`, `clearAll()`, `setPosition(pos)` — queue, progress bar, pause on hover |
| **Select Engine** | `select.js` | `[data-select]`, `[data-multiselect]` — search, keyboard nav, tag management |
| **TooltipManager** | `tooltip.js` | `data-tooltip` attributes — 9 positions, auto-flip, rich/interactive variants |
| **PopoverManager** | `tooltip.js` | `data-popover` attributes — click-triggered, close on outside click |

#### Design Tokens
| Category | Count | Details |
|---|---|---|
| **Colors** | 48 | Neutral (11), Accent (11), Success (4), Warning (4), Error (4), Info (4) + component-specific |
| **Typography** | 27 | Font families (3), size scale (9), line heights (6), letter spacing (6), weights (5) |
| **Spacing** | 29 | 4px base scale from 0 to 128px |
| **Radius** | 4 | none, sm (4px), md (8px), pill (9999px) |
| **Shadows** | 2 | sm, md — subtle depth |
| **Transitions** | 12 | Durations, easings, pre-built transition shorthands |
| **Z-Index** | 7 | base → raised → dropdown → tooltip → overlay → modal → toast |
| **Component** | 100+ | Sizes, colors, animations for all components |

#### Build Pipeline
| Feature | Tool | Description |
|---|---|---|
| CSS concat + minify | csso v5 | Tokens first, then 13 components alphabetically — 54% size reduction |
| JS concat + minify | terser v5 | 4 modules bundled — 43% size reduction, preserves `window.*` APIs |
| Watch mode | Node.js native | Auto-rebuild with 300ms debounce on any `src/` file change |
| Build summary | Node.js native | Prints file sizes before/after minification with percentage saved |

#### Accessibility
- All interactive components are keyboard accessible
- Focus-visible rings use consistent `--focus-ring-*` tokens
- ARIA attributes: `aria-expanded`, `aria-modal`, `aria-hidden`, `aria-describedby`, `aria-live`
- Screen reader support via hidden native inputs (checkbox, radio, select)
- Focus trap in modals prevents tab navigation from escaping

#### Browser Support
- Chrome 88+, Firefox 85+, Safari 14.1+, Edge 88+
- Uses `:has()` selector in some components (progressive enhancement)

---

[Unreleased]: https://github.com/username/minora/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/username/minora/releases/tag/v0.1.0
