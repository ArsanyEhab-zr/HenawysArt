import { useEffect, useRef, useCallback } from 'react';

/**
 * useBackButton — Intercepts the browser back button / swipe-back gesture
 * to close overlay components (modals, drawers, popups) instead of navigating away.
 *
 * How it works:
 * 1. When `isOpen` becomes true → pushes a sentinel history entry via pushState.
 * 2. When the user presses Back (or swipes back) → popstate fires → calls onClose().
 * 3. When the overlay is closed via its own UI (X button, backdrop) → the cleanup
 *    effect calls history.back() to silently remove the sentinel entry.
 *
 * @param {boolean} isOpen - Whether the overlay is currently open.
 * @param {Function} onClose - Callback to close the overlay.
 * @param {string} overlayId - Unique identifier for this overlay (e.g. 'cart-drawer').
 */
const useBackButton = (isOpen, onClose, overlayId) => {
  // Tracks whether the close was triggered by popstate (back gesture)
  // so we don't double-pop the history stack in the cleanup effect.
  const closedByPopstate = useRef(false);

  // Stable reference to onClose to avoid re-registering the listener
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handlePopState = useCallback((event) => {
    // The sentinel was popped — the user pressed Back / swiped back
    closedByPopstate.current = true;
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Reset the guard
    closedByPopstate.current = false;

    // Push a sentinel entry so the next "back" pops this instead of navigating
    window.history.pushState({ overlay: overlayId }, '');

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // If the overlay was closed programmatically (X button / backdrop click),
      // we need to pop the sentinel entry we pushed.
      if (!closedByPopstate.current) {
        window.history.back();
      }
    };
  }, [isOpen, overlayId, handlePopState]);
};

export default useBackButton;
