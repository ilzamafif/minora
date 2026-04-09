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
