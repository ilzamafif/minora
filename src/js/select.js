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
