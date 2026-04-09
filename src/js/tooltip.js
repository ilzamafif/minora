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
