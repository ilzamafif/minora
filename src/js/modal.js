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
