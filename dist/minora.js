/*! Minora UI Kit v0.1.0 — https://github.com/ilzamafif/minora */

'use strict';

/* ─── src\js\C:\DEV\minora\src\js\modal.js ─── */
/**
 * Minora — Modal Manager
 * ──────────────────────
 * Full-featured modal system with focus trap, body scroll lock,
 * nested stacking, and backdrop/escape close.
 *
 * Usage:
 *   ModalManager.open('modal-id');
 *   ModalManager.close('modal-id');
 */
(function() {
  'use strict';

  var ModalManager = (function() {
    var openModals = [];
    var previouslyFocused = [];
    var scrollBarWidth = 0;

    function getScrollBarWidth() {
      var outer = document.createElement('div');
      outer.style.cssText = 'position:absolute;top:-9999px;width:50px;height:50px;overflow:hidden;';
      document.body.appendChild(outer);
      var wNoScroll = outer.offsetWidth;
      outer.style.overflow = 'scroll';
      var inner = document.createElement('div');
      inner.style.cssText = 'width:100%;height:50px;';
      outer.appendChild(inner);
      var wScroll = inner.offsetWidth;
      document.body.removeChild(outer);
      return wNoScroll - wScroll;
    }

    function lockBodyScroll() {
      if (openModals.length === 0) {
        scrollBarWidth = getScrollBarWidth();
        document.body.style.paddingRight = scrollBarWidth + 'px';
        document.body.classList.add('is-modal-open');
      }
    }

    function unlockBodyScroll() {
      if (openModals.length === 0) {
        document.body.style.paddingRight = '';
        document.body.classList.remove('is-modal-open');
      }
    }

    function getFocusable(modal) {
      var selectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modal.querySelectorAll(selectors)).filter(function(el) {
        return el.offsetParent !== null;
      });
    }

    function trapFocus(e, overlay) {
      if (e.key !== 'Tab') return;
      var focusable = getFocusable(overlay);
      if (focusable.length === 0) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    function open(id) {
      var overlay = document.getElementById(id);
      if (!overlay) return;

      previouslyFocused.push(document.activeElement);
      lockBodyScroll();
      openModals.push(overlay);

      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');

      overlay._focusHandler = function(e) { trapFocus(e, overlay); };
      overlay.addEventListener('keydown', overlay._focusHandler);

      overlay._backdropHandler = function(e) {
        if (e.target === overlay) close(id);
      };
      overlay.addEventListener('click', overlay._backdropHandler);

      overlay._escapeHandler = function(e) {
        if (e.key === 'Escape' && openModals[openModals.length - 1] === overlay) close(id);
      };
      document.addEventListener('keydown', overlay._escapeHandler);

      requestAnimationFrame(function() {
        var focusable = getFocusable(overlay);
        if (focusable.length > 0) focusable[0].focus();
      });
    }

    function close(id) {
      var overlay = document.getElementById(id);
      if (!overlay) return;

      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');

      if (overlay._focusHandler) overlay.removeEventListener('keydown', overlay._focusHandler);
      if (overlay._backdropHandler) overlay.removeEventListener('click', overlay._backdropHandler);
      if (overlay._escapeHandler) document.removeEventListener('keydown', overlay._escapeHandler);

      openModals = openModals.filter(function(m) { return m !== overlay; });
      unlockBodyScroll();

      var prev = previouslyFocused.pop();
      if (prev && prev.focus) setTimeout(function() { prev.focus(); }, 50);
    }

    return { open: open, close: close };
  })();

  window.ModalManager = ModalManager;

  // Initialize all overlays as hidden
  document.querySelectorAll('.modal-overlay').forEach(function(el) {
    el.setAttribute('aria-hidden', 'true');
  });
})();


/* ─── src\js\C:\DEV\minora\src\js\select.js ─── */
/**
 * Minora — Select & Multiselect Manager
 * ─────────────────────────────────────
 * Custom dropdowns with search, keyboard navigation,
 * grouped options, and tag-based multiselect.
 *
 * Usage:
 *   <div class="select select-md" data-select>
 *     <div class="select-trigger" role="combobox" tabindex="0">
 *       <span class="select-placeholder">Choose…</span>
 *       <span class="select-value" hidden></span>
 *       <span class="select-chevron"><svg>…</svg></span>
 *     </div>
 *     <select name="field" hidden>
 *       <option value="a">Option A</option>
 *     </select>
 *     <div class="select-dropdown">
 *       <div class="select-search-wrapper"><input class="select-search-input" /></div>
 *       <div class="select-options">
 *         <div class="select-option" data-value="a"><span>Option A</span><svg class="select-check">…</svg></div>
 *       </div>
 *     </div>
 *   </div>
 */
(function() {
  'use strict';

  /* ─── Utility: Close all open selects ─── */
  function closeAllSelects(except) {
    document.querySelectorAll('.select-open').forEach(function(el) {
      if (el !== except) {
        el.classList.remove('select-open');
        var trigger = el.querySelector('.select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        el.classList.remove('select-flip-up');
      }
    });
  }

  /* ─── SINGLE SELECT ─── */
  function initSingleSelect(selectEl) {
    if (selectEl.classList.contains('select-disabled')) return;

    var trigger = selectEl.querySelector('.select-trigger');
    var dropdown = selectEl.querySelector('.select-dropdown');
    var nativeSelect = selectEl.querySelector('select');
    var searchInput = selectEl.querySelector('.select-search-input');
    var options = selectEl.querySelectorAll('.select-option');
    var placeholder = selectEl.querySelector('.select-placeholder');
    var valueEl = selectEl.querySelector('.select-value');

    if (!trigger || !dropdown || !nativeSelect) return;

    if (nativeSelect.value) {
      var initialOption = nativeSelect.options[nativeSelect.selectedIndex];
      if (initialOption && initialOption.value) {
        if (placeholder) placeholder.hidden = true;
        if (valueEl) { valueEl.hidden = false; valueEl.textContent = initialOption.text; }
        var matchingOpt = selectEl.querySelector('.select-option[data-value="' + initialOption.value + '"]');
        if (matchingOpt) matchingOpt.classList.add('is-selected');
      }
    }

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = selectEl.classList.contains('select-open');
      if (isOpen) {
        selectEl.classList.remove('select-open');
        trigger.setAttribute('aria-expanded', 'false');
        selectEl.classList.remove('select-flip-up');
      } else {
        closeAllSelects();
        selectEl.classList.add('select-open');
        trigger.setAttribute('aria-expanded', 'true');
        if (searchInput) setTimeout(function() { searchInput.focus(); }, 50);
        requestAnimationFrame(function() {
          var rect = dropdown.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 16) selectEl.classList.add('select-flip-up');
        });
      }
    });

    options.forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        if (opt.classList.contains('is-disabled')) return;
        var val = opt.getAttribute('data-value');
        var text = opt.querySelector('span').textContent;
        options.forEach(function(o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        nativeSelect.value = val;
        if (placeholder) placeholder.hidden = true;
        if (valueEl) { valueEl.hidden = false; valueEl.textContent = text; }
        selectEl.classList.remove('select-open');
        trigger.setAttribute('aria-expanded', 'false');
        selectEl.classList.remove('select-flip-up');
        if (searchInput) { searchInput.value = ''; options.forEach(function(o) { o.classList.remove('is-hidden'); }); }
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        e.stopPropagation();
        var query = searchInput.value.toLowerCase().trim();
        options.forEach(function(opt) {
          var text = opt.querySelector('span').textContent.toLowerCase();
          opt.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
        selectEl.querySelectorAll('.select-group-label').forEach(function(label) {
          var next = label.nextElementSibling, hasVisible = false;
          while (next && !next.classList.contains('select-group-label')) {
            if (next.classList.contains('select-option') && !next.classList.contains('is-hidden')) { hasVisible = true; break; }
            next = next.nextElementSibling;
          }
          label.style.display = hasVisible ? '' : 'none';
        });
        options.forEach(function(o) { o.classList.remove('is-focused'); });
      });
      searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    trigger.addEventListener('keydown', function(e) {
      var isOpen = selectEl.classList.contains('select-open');
      var visibleOptions = Array.from(options).filter(function(o) { return !o.classList.contains('is-hidden') && !o.classList.contains('is-disabled'); });
      if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); trigger.click(); return; }
      if (isOpen) {
        var focusedOpt = selectEl.querySelector('.select-option.is-focused');
        var focusedIdx = visibleOptions.indexOf(focusedOpt);
        if (e.key === 'ArrowDown') { e.preventDefault(); if (focusedOpt) focusedOpt.classList.remove('is-focused'); var n = focusedIdx < visibleOptions.length - 1 ? focusedIdx + 1 : 0; visibleOptions[n].classList.add('is-focused'); visibleOptions[n].scrollIntoView({ block: 'nearest' }); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (focusedOpt) focusedOpt.classList.remove('is-focused'); var p = focusedIdx > 0 ? focusedIdx - 1 : visibleOptions.length - 1; visibleOptions[p].classList.add('is-focused'); visibleOptions[p].scrollIntoView({ block: 'nearest' }); }
        else if (e.key === 'Enter') { e.preventDefault(); if (focusedOpt) focusedOpt.click(); }
        else if (e.key === 'Escape') { e.preventDefault(); selectEl.classList.remove('select-open'); trigger.setAttribute('aria-expanded', 'false'); selectEl.classList.remove('select-flip-up'); }
      }
    });

    document.addEventListener('click', function(e) {
      if (!selectEl.contains(e.target)) {
        selectEl.classList.remove('select-open');
        trigger.setAttribute('aria-expanded', 'false');
        selectEl.classList.remove('select-flip-up');
        if (searchInput) { searchInput.value = ''; options.forEach(function(o) { o.classList.remove('is-hidden'); }); }
      }
    });
  }

  /* ─── MULTISELECT ─── */
  function initMultiselect(multiEl) {
    if (multiEl.classList.contains('select-disabled')) return;

    var trigger = multiEl.querySelector('.select-trigger');
    var dropdown = multiEl.querySelector('.select-dropdown');
    var nativeSelect = multiEl.querySelector('select');
    var options = multiEl.querySelectorAll('.select-option');
    var tagsContainer = multiEl.querySelector('.multiselect-tags');
    var searchInput = multiEl.querySelector('.multiselect-search-input');
    var placeholder = multiEl.querySelector('.multiselect-tag-placeholder');
    var MAX_VISIBLE = 2;
    var selectedValues = [];

    if (!trigger || !dropdown || !nativeSelect || !tagsContainer) return;

    Array.from(nativeSelect.selectedOptions).forEach(function(opt) { selectedValues.push(opt.value); });

    function renderTags() {
      tagsContainer.querySelectorAll('.multiselect-tag, .multiselect-counter').forEach(function(el) { el.remove(); });
      if (selectedValues.length === 0) { if (placeholder) placeholder.style.display = ''; return; }
      if (placeholder) placeholder.style.display = 'none';
      var visibleCount = Math.min(selectedValues.length, MAX_VISIBLE);
      for (var i = 0; i < visibleCount; i++) {
        var val = selectedValues[i];
        var optEl = multiEl.querySelector('.select-option[data-value="' + val + '"]');
        var text = optEl ? optEl.querySelector('span').textContent : val;
        var tag = document.createElement('span');
        tag.className = 'multiselect-tag';
        tag.setAttribute('data-value', val);
        tag.innerHTML = '<span class="multiselect-tag-label">' + text + '</span>' +
          '<button class="multiselect-tag-remove" type="button" aria-label="Remove">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
        tagsContainer.insertBefore(tag, searchInput);
        tag.querySelector('.multiselect-tag-remove').addEventListener('click', function(e) { e.stopPropagation(); removeValue(val); });
      }
      var remaining = selectedValues.length - MAX_VISIBLE;
      if (remaining > 0) {
        var counter = document.createElement('span');
        counter.className = 'multiselect-counter';
        counter.textContent = '+' + remaining;
        tagsContainer.insertBefore(counter, searchInput);
      }
    }

    function removeValue(val) { selectedValues = selectedValues.filter(function(v) { return v !== val; }); updateNativeSelect(); renderTags(); var o = multiEl.querySelector('.select-option[data-value="' + val + '"]'); if (o) o.classList.remove('is-selected'); }
    function addValue(val) { if (selectedValues.indexOf(val) === -1) selectedValues.push(val); updateNativeSelect(); renderTags(); var o = multiEl.querySelector('.select-option[data-value="' + val + '"]'); if (o) o.classList.add('is-selected'); }
    function updateNativeSelect() { Array.from(nativeSelect.options).forEach(function(opt) { opt.selected = selectedValues.indexOf(opt.value) !== -1; }); nativeSelect.dispatchEvent(new Event('change', { bubbles: true })); }

    function openDropdown() {
      closeAllSelects();
      multiEl.classList.add('select-open');
      trigger.setAttribute('aria-expanded', 'true');
      if (searchInput) { searchInput.style.display = ''; setTimeout(function() { searchInput.focus(); }, 50); }
      requestAnimationFrame(function() {
        var rect = dropdown.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 16) multiEl.classList.add('select-flip-up');
      });
    }

    function closeDropdown() {
      multiEl.classList.remove('select-open');
      trigger.setAttribute('aria-expanded', 'false');
      multiEl.classList.remove('select-flip-up');
      if (selectedValues.length === 0 && searchInput) searchInput.style.display = 'none';
      if (searchInput) { searchInput.value = ''; options.forEach(function(o) { o.classList.remove('is-hidden'); }); }
    }

    trigger.addEventListener('click', function(e) { e.stopPropagation(); multiEl.classList.contains('select-open') ? closeDropdown() : openDropdown(); });

    options.forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        if (opt.classList.contains('is-disabled')) return;
        var val = opt.getAttribute('data-value');
        opt.classList.contains('is-selected') ? removeValue(val) : addValue(val);
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        e.stopPropagation();
        var query = searchInput.value.toLowerCase().trim();
        options.forEach(function(opt) { var t = opt.querySelector('span').textContent.toLowerCase(); opt.classList.toggle('is-hidden', query && t.indexOf(query) === -1); });
        multiEl.querySelectorAll('.select-group-label').forEach(function(label) {
          var next = label.nextElementSibling, hasVisible = false;
          while (next && !next.classList.contains('select-group-label')) { if (next.classList.contains('select-option') && !next.classList.contains('is-hidden')) { hasVisible = true; break; } next = next.nextElementSibling; }
          label.style.display = hasVisible ? '' : 'none';
        });
        options.forEach(function(o) { o.classList.remove('is-focused'); });
      });
      searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    var selectAllBtn = multiEl.querySelector('.multiselect-select-all');
    if (selectAllBtn) selectAllBtn.addEventListener('click', function(e) { e.stopPropagation(); options.forEach(function(opt) { if (!opt.classList.contains('is-disabled')) { addValue(opt.getAttribute('data-value')); opt.classList.add('is-selected'); } }); });

    var clearAllBtn = multiEl.querySelector('.multiselect-clear-all');
    if (clearAllBtn) clearAllBtn.addEventListener('click', function(e) { e.stopPropagation(); selectedValues = []; updateNativeSelect(); renderTags(); options.forEach(function(opt) { opt.classList.remove('is-selected'); }); });

    trigger.addEventListener('keydown', function(e) {
      var isOpen = multiEl.classList.contains('select-open');
      var visibleOptions = Array.from(options).filter(function(o) { return !o.classList.contains('is-hidden') && !o.classList.contains('is-disabled'); });
      if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openDropdown(); return; }
      if (isOpen) {
        var focusedOpt = multiEl.querySelector('.select-option.is-focused');
        var focusedIdx = visibleOptions.indexOf(focusedOpt);
        if (e.key === 'ArrowDown') { e.preventDefault(); if (focusedOpt) focusedOpt.classList.remove('is-focused'); var n = focusedIdx < visibleOptions.length - 1 ? focusedIdx + 1 : 0; visibleOptions[n].classList.add('is-focused'); visibleOptions[n].scrollIntoView({ block: 'nearest' }); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (focusedOpt) focusedOpt.classList.remove('is-focused'); var p = focusedIdx > 0 ? focusedIdx - 1 : visibleOptions.length - 1; visibleOptions[p].classList.add('is-focused'); visibleOptions[p].scrollIntoView({ block: 'nearest' }); }
        else if (e.key === 'Enter') { e.preventDefault(); if (focusedOpt) focusedOpt.click(); }
        else if (e.key === 'Escape') { e.preventDefault(); closeDropdown(); }
      }
    });

    renderTags();
    document.addEventListener('click', function(e) { if (!multiEl.contains(e.target)) closeDropdown(); });
  }

  /* ─── Init on DOM ready ─── */
  function init() {
    document.querySelectorAll('[data-select]').forEach(initSingleSelect);
    document.querySelectorAll('[data-multiselect]').forEach(initMultiselect);
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();


/* ─── src\js\C:\DEV\minora\src\js\toast.js ─── */
/**
 * Minora — Toast Manager
 * ──────────────────────
 * Queue-based toast system with position control,
 * auto-dismiss, progress bar, and action buttons.
 *
 * Usage:
 *   ToastManager.show({ type: 'success', message: 'Saved!' });
 *   ToastManager.show({ type: 'error', message: 'Failed', duration: 6000 });
 *   ToastManager.show({ type: 'info', message: 'Hint', action: { label: 'Undo', onClick: fn } });
 *   ToastManager.setPosition('top-left');
 *   ToastManager.clearAll();
 */
(function() {
  'use strict';

  var ToastManager = (function() {
    var queue = [];
    var active = [];
    var stackEl = null;
    var position = 'bottom-right';
    var MAX_VISIBLE = 5;
    var DEFAULT_DURATION = 4000;

    /* SVG icons by type */
    var ICONS = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      neutral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
      loading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-dasharray="20" stroke-dashoffset="15"></circle></svg>'
    };

    function init() {
      if (!stackEl) {
        stackEl = document.createElement('div');
        stackEl.className = 'toast-stack toast-stack-' + position;
        stackEl.id = 'toast-stack';
        document.body.appendChild(stackEl);
      }
    }

    function show(opts) {
      opts = opts || {};
      var type = opts.type || 'neutral';
      var message = opts.message || '';
      var duration = opts.duration || DEFAULT_DURATION;
      var action = opts.action || null;
      var item = { type: type, message: message, duration: duration, action: action };

      if (active.length < MAX_VISIBLE) {
        renderToast(item);
      } else {
        queue.push(item);
      }
    }

    function renderToast(item) {
      init();

      var toast = document.createElement('div');
      toast.className = 'toast toast-' + item.type + ' toast-enter';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');

      var actionHTML = item.action
        ? '<button class="toast-action" data-action="1">' + item.action.label + '</button>'
        : '';

      toast.innerHTML =
        '<span class="toast-icon">' + (ICONS[item.type] || ICONS.neutral) + '</span>' +
        '<div class="toast-body">' +
          '<span class="toast-message">' + item.message + '</span>' +
          actionHTML +
        '</div>' +
        '<button class="toast-close" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>' +
        (item.type !== 'loading' ? '<div class="toast-progress running" style="animation-duration:' + item.duration + 'ms"></div>' : '<div class="toast-progress"></div>');

      var closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', function() { dismissToast(toast); });

      var actionBtn = toast.querySelector('.toast-action');
      if (actionBtn && item.action && item.action.onClick) {
        actionBtn.addEventListener('click', function() { dismissToast(toast); item.action.onClick(); });
      }

      var progressEl = toast.querySelector('.toast-progress.running');
      if (progressEl) {
        toast.addEventListener('mouseenter', function() { progressEl.style.animationPlayState = 'paused'; });
        toast.addEventListener('mouseleave', function() { progressEl.style.animationPlayState = 'running'; });
      }

      stackEl.appendChild(toast);
      active.push(toast);

      if (item.type !== 'loading') {
        toast._dismissTimer = setTimeout(function() { dismissToast(toast); }, item.duration + 200);
      }
    }

    function dismissToast(toast) {
      clearTimeout(toast._dismissTimer);
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', function handler() {
        toast.removeEventListener('animationend', handler);
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        var idx = active.indexOf(toast);
        if (idx !== -1) active.splice(idx, 1);
        processQueue();
      });
    }

    function processQueue() {
      while (queue.length > 0 && active.length < MAX_VISIBLE) {
        renderToast(queue.shift());
      }
    }

    function clearAll() {
      active.slice().forEach(function(t) { dismissToast(t); });
      queue = [];
    }

    function setPosition(pos) {
      position = pos;
      if (stackEl) {
        stackEl.className = 'toast-stack';
        stackEl.classList.add('toast-stack-' + position);
      }
    }

    return { show: show, clearAll: clearAll, setPosition: setPosition };
  })();

  window.ToastManager = ToastManager;
})();


/* ─── src\js\C:\DEV\minora\src\js\tooltip.js ─── */
/**
 * Minora — Tooltip & Popover Manager
 * ───────────────────────────────────
 * Tooltips with 9 positions, auto-flip, rich content,
 * interactive variants, and click-triggered popovers.
 *
 * Usage (tooltip):
 *   data-tooltip="text"
 *   data-tooltip-title="Title" data-tooltip-body="Body text"
 *   data-tooltip-position="top|bottom|left|right|top-start|..."
 *   data-tooltip-variant="light"
 *   data-tooltip-trigger="hover|focus|click|hover-focus"
 *   data-tooltip-interactive
 *
 * Usage (popover):
 *   data-popover="popover-id" data-popover-position="bottom|top|bottom-end|..."
 */
(function() {
  'use strict';

  var ICONS = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  };

  /* ─── TooltipManager ─── */
  var TooltipManager = (function() {
    var tooltips = [];

    function escapeHtml(str) { var div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

    function buildContent(trigger) {
      var text = trigger.getAttribute('data-tooltip');
      var title = trigger.getAttribute('data-tooltip-title');
      var body = trigger.getAttribute('data-tooltip-body');
      var icon = trigger.getAttribute('data-tooltip-icon');
      var isInteractive = trigger.hasAttribute('data-tooltip-interactive');
      var html = '<span class="tooltip-arrow"></span><div>';
      if (title || body) {
        html += '<span class="tooltip-rich">';
        if (title) html += '<span class="tooltip-title">' + escapeHtml(title) + '</span>';
        if (body) html += '<span class="tooltip-body">' + escapeHtml(body) + '</span>';
        html += '</span>';
      } else if (icon) {
        html += '<span class="tooltip-with-icon"><span class="tooltip-icon-img">' + (ICONS[icon] || ICONS.info) + '</span><span>' + escapeHtml(text) + '</span></span>';
      } else if (text) { html += escapeHtml(text); }
      if (isInteractive) {
        html += '<div class="tooltip-actions"><button class="tooltip-action-btn" data-tooltip-action>Learn More</button><button class="tooltip-action-btn" data-tooltip-dismiss>Dismiss</button></div>';
      }
      return html + '</div>';
    }

    function positionTooltip(trigger, tooltip, position) {
      var triggerRect = trigger.getBoundingClientRect();
      var tooltipRect = tooltip.getBoundingClientRect();
      var gap = 10;
      var basePos = position.replace(/-(start|end)$/, '');
      var align = position.indexOf('-start') !== -1 ? 'start' : position.indexOf('-end') !== -1 ? 'end' : 'center';
      var top, left;

      switch (basePos) {
        case 'top': top = triggerRect.top - gap - tooltipRect.height; left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2; break;
        case 'bottom': top = triggerRect.bottom + gap; left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2; break;
        case 'left': top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2; left = triggerRect.left - gap - tooltipRect.width; break;
        case 'right': top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2; left = triggerRect.right + gap; break;
      }
      if (align === 'start') { if (basePos === 'top' || basePos === 'bottom') left = triggerRect.left; else top = triggerRect.top; }
      else if (align === 'end') { if (basePos === 'top' || basePos === 'bottom') left = triggerRect.right - tooltipRect.width; else top = triggerRect.bottom - tooltipRect.height; }

      if (top < 4 && basePos === 'top') { basePos = 'bottom'; top = triggerRect.bottom + gap; }
      if (top + tooltipRect.height > window.innerHeight - 4 && basePos === 'bottom') { basePos = 'top'; top = triggerRect.top - gap - tooltipRect.height; }
      if (left < 4 && basePos === 'left') { basePos = 'right'; left = triggerRect.right + gap; }
      if (left + tooltipRect.width > window.innerWidth - 4 && basePos === 'right') { basePos = 'left'; left = triggerRect.left - gap - tooltipRect.width; }

      left = Math.max(4, Math.min(left, window.innerWidth - tooltipRect.width - 4));
      top = Math.max(4, Math.min(top, window.innerHeight - tooltipRect.height - 4));
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';

      var arrow = tooltip.querySelector('.tooltip-arrow');
      if (arrow) {
        if (basePos === 'top') { arrow.style.bottom = 'calc(var(--tooltip-arrow-size) * -1 + 1px)'; arrow.style.top = ''; var c = (triggerRect.left + triggerRect.width / 2) - left; arrow.style.left = Math.max(8, Math.min(c - 3, tooltipRect.width - 16)) + 'px'; arrow.style.right = ''; }
        else if (basePos === 'bottom') { arrow.style.top = 'calc(var(--tooltip-arrow-size) * -1 + 1px)'; arrow.style.bottom = ''; var c2 = (triggerRect.left + triggerRect.width / 2) - left; arrow.style.left = Math.max(8, Math.min(c2 - 3, tooltipRect.width - 16)) + 'px'; arrow.style.right = ''; }
        else if (basePos === 'left') { arrow.style.right = 'calc(var(--tooltip-arrow-size) * -1 + 1px)'; arrow.style.left = ''; var c3 = (triggerRect.top + triggerRect.height / 2) - top; arrow.style.top = Math.max(8, Math.min(c3 - 3, tooltipRect.height - 16)) + 'px'; arrow.style.bottom = ''; }
        else if (basePos === 'right') { arrow.style.left = 'calc(var(--tooltip-arrow-size) * -1 + 1px)'; arrow.style.right = ''; var c4 = (triggerRect.top + triggerRect.height / 2) - top; arrow.style.top = Math.max(8, Math.min(c4 - 3, tooltipRect.height - 16)) + 'px'; arrow.style.bottom = ''; }
      }
    }

    function show(trigger) {
      hide(trigger);
      var position = trigger.getAttribute('data-tooltip-position') || 'top';
      var variant = trigger.getAttribute('data-tooltip-variant') || '';
      var isInteractive = trigger.hasAttribute('data-tooltip-interactive');
      var tooltip = document.createElement('div');
      tooltip.className = 'tooltip tooltip-' + position;
      if (variant === 'light') tooltip.classList.add('tooltip-light');
      if (isInteractive) tooltip.classList.add('tooltip-interactive');
      tooltip.setAttribute('role', 'tooltip');
      tooltip.innerHTML = buildContent(trigger);
      document.body.appendChild(tooltip);
      positionTooltip(trigger, tooltip, position);
      tooltip._showTimer = setTimeout(function() { tooltip.classList.add('is-visible'); }, 100);
      tooltips.push({ trigger: trigger, tooltip: tooltip });

      if (isInteractive) {
        tooltip.addEventListener('mouseenter', function() { clearTimeout(tooltip._hideTimer); });
        tooltip.addEventListener('mouseleave', function() { tooltip._hideTimer = setTimeout(function() { hide(trigger); }, 100); });
        tooltip.addEventListener('click', function(e) {
          if (e.target.hasAttribute('data-tooltip-dismiss')) hide(trigger);
          if (e.target.hasAttribute('data-tooltip-action')) { hide(trigger); if (window.ToastManager) ToastManager.show({ type: 'info', message: 'Action clicked!' }); }
        });
      }
    }

    function hide(trigger) {
      var entry = tooltips.find(function(t) { return t.trigger === trigger; });
      if (!entry) return;
      clearTimeout(entry.tooltip._showTimer);
      entry.tooltip.classList.remove('is-visible');
      entry.tooltip._hideTimer = setTimeout(function() {
        if (entry.tooltip.parentNode) entry.tooltip.parentNode.removeChild(entry.tooltip);
        tooltips = tooltips.filter(function(t) { return t !== entry; });
      }, 100);
    }

    function init() {
      document.querySelectorAll('[data-tooltip]').forEach(function(trigger) {
        var triggerType = trigger.getAttribute('data-tooltip-trigger') || 'hover';
        if (triggerType === 'hover' || triggerType === 'hover-focus') {
          trigger.addEventListener('mouseenter', function() { show(trigger); });
          trigger.addEventListener('mouseleave', function() { hide(trigger); });
        }
        if (triggerType === 'focus' || triggerType === 'hover-focus') {
          trigger.addEventListener('focus', function() { show(trigger); });
          trigger.addEventListener('blur', function() { hide(trigger); });
        }
        if (triggerType === 'click') {
          trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var entry = tooltips.find(function(t) { return t.trigger === trigger; });
            entry ? hide(trigger) : show(trigger);
          });
        }
      });
      var scrollTimer;
      window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() { tooltips.slice().forEach(function(entry) { hide(entry.trigger); }); }, 50);
      }, { passive: true });
    }

    return { init: init, show: show, hide: hide };
  })();

  /* ─── PopoverManager ─── */
  var PopoverManager = (function() {
    var openPopovers = [];

    function positionPopover(trigger, popover, position) {
      document.body.appendChild(popover);
      var triggerRect = trigger.getBoundingClientRect();
      var popoverRect = popover.getBoundingClientRect();
      var gap = 8;
      var pos = position || 'bottom';
      var align = pos.indexOf('-end') !== -1 ? 'end' : pos.indexOf('-start') !== -1 ? 'start' : 'center';
      var base = pos.replace(/-(start|end)$/, '');
      var top, left;

      if (base === 'bottom') { top = triggerRect.bottom + gap; if (align === 'end') left = triggerRect.right - popoverRect.width; else if (align === 'start') left = triggerRect.left; else left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2; }
      else if (base === 'top') { top = triggerRect.top - gap - popoverRect.height; if (align === 'end') left = triggerRect.right - popoverRect.width; else if (align === 'start') left = triggerRect.left; else left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2; }

      left = Math.max(8, Math.min(left, window.innerWidth - popoverRect.width - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - popoverRect.height - 8));
      popover.style.left = left + 'px';
      popover.style.top = top + 'px';
    }

    function show(trigger, popoverId, position) {
      var popover = document.getElementById(popoverId);
      if (!popover) return;
      closeAll();
      popover.classList.add('is-visible');
      popover.classList.remove('is-hidden');
      openPopovers.push(popover);
      positionPopover(trigger, popover, position);
      popover._closeHandler = function(e) { if (!popover.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) close(popoverId); };
      setTimeout(function() { document.addEventListener('click', popover._closeHandler); }, 0);
      popover.querySelectorAll('[data-popover-close]').forEach(function(btn) { btn.addEventListener('click', function() { close(popoverId); }); });
    }

    function close(popoverId) {
      var popover = document.getElementById(popoverId);
      if (!popover) return;
      popover.classList.remove('is-visible');
      popover.classList.add('is-hidden');
      if (popover._closeHandler) document.removeEventListener('click', popover._closeHandler);
      openPopovers = openPopovers.filter(function(p) { return p !== popover; });
      setTimeout(function() { popover.classList.remove('is-hidden'); }, 200);
    }

    function closeAll() { openPopovers.slice().forEach(function(popover) { close(popover.id); }); }

    function init() {
      document.querySelectorAll('[data-popover]').forEach(function(trigger) {
        var popoverId = trigger.getAttribute('data-popover');
        var position = trigger.getAttribute('data-popover-position') || 'bottom';
        trigger.addEventListener('click', function(e) {
          e.stopPropagation();
          var popover = document.getElementById(popoverId);
          if (popover && popover.classList.contains('is-visible')) close(popoverId); else show(trigger, popoverId, position);
        });
      });
    }

    return { init: init, close: close, closeAll: closeAll };
  })();

  window.TooltipManager = TooltipManager;
  window.PopoverManager = PopoverManager;

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { TooltipManager.init(); PopoverManager.init(); }); } else { TooltipManager.init(); PopoverManager.init(); }
})();


