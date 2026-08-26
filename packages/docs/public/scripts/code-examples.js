/**
 * The live-example card's behaviour, ported from the Eleventy site's docs/assets/scripts/code-examples.js.
 *
 * Kept: the Code toggle and its height/opacity animation, the per-example light/dark toggle, the LTR/RTL
 * toggle, and the drag-to-resize handle. The animation reads its durations back out of computed style, so
 * code-examples.css remains the source of truth for the timing.
 *
 * Dropped: the CodePen "Edit" button, which posted the example to a Font Awesome kit on a host Cru does
 * not own; and the `turbo:load` listener, since this site has no client-side router.
 *
 * The per-example theme toggle works by putting `cs-light` / `cs-dark` on the preview. That is not a rule
 * in the docs stylesheet — the library's own theme redeclares every colour token and `color-scheme` for
 * those bare classes on any element, so the subtree re-themes by inheritance and the change reaches
 * component shadow DOM. It also means the page-level toggle has to tell this file when it changes, which
 * src/theme-sync.js does by emitting the same three events the Eleventy site used.
 */

import { doViewTransition } from './view-transitions.js';

const codeExampleAnimations = new WeakMap();

const directionObservers = new WeakMap();

function stampDirection(content, dir) {
  content.setAttribute('dir', dir);
  content.querySelectorAll('*').forEach((el) => el.setAttribute('dir', dir));
}

function setPreviewDirection(content, dir) {
  directionObservers.get(content)?.disconnect();
  directionObservers.delete(content);

  stampDirection(content, dir);

  if (dir === 'rtl') {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            stampDirection(node, 'rtl');
          }
        });
      }
    });
    observer.observe(content, { childList: true, subtree: true });
    directionObservers.set(content, observer);
  }
}

function parseDuration(duration) {
  duration = String(duration).toLowerCase();

  if (duration.includes('ms')) {
    return parseFloat(duration) || 0;
  }

  if (duration.includes('s')) {
    return (parseFloat(duration) || 0) * 1000;
  }

  return parseFloat(duration) || 0;
}

async function animate(el, keyframes, options) {
  return el.animate(keyframes, options).finished.catch(() => {
    /* suppress errors in Safari */
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getAnimationGeneration(codeExample) {
  return codeExampleAnimations.get(codeExample) || 0;
}

function bumpAnimationGeneration(codeExample) {
  const generation = getAnimationGeneration(codeExample) + 1;
  codeExampleAnimations.set(codeExample, generation);
  return generation;
}

function cancelSourceAnimations(source) {
  source.getAnimations().forEach((animation) => animation.cancel());
}

function getCodeExampleDurations(source) {
  const style = getComputedStyle(source);
  const showDuration = parseDuration(style.getPropertyValue('--code-example-show-duration').trim() || '200ms');
  const hideDuration = parseDuration(style.getPropertyValue('--code-example-hide-duration').trim() || '200ms');

  return { showDuration, hideDuration };
}

function setCodeExampleSourceAccessibility(source, open) {
  if (open) {
    source.removeAttribute('aria-hidden');
    source.inert = false;
  } else {
    source.setAttribute('aria-hidden', 'true');
    source.inert = true;
  }
}

function setCodeExampleSourceCollapsed(source, collapsed) {
  if (collapsed) {
    source.style.height = '0';
    source.style.opacity = '0';
    return;
  }

  source.style.height = 'auto';
  source.style.opacity = '';
}

function resetCodeExampleElement(codeExample) {
  const source = codeExample.querySelector('.code-example-source');
  const preview = codeExample.querySelector('.code-example-preview');

  if (source) {
    cancelSourceAnimations(source);
    source.classList.remove('is-animating');
  }

  if (preview) {
    preview.classList.remove('is-dragging');
    preview.style.removeProperty('width');
  }
}

function initCodeExamples() {
  document.querySelectorAll('.code-example').forEach((codeExample) => {
    const source = codeExample.querySelector('.code-example-source');
    if (!source) {
      return;
    }

    resetCodeExampleElement(codeExample);

    const open = codeExample.classList.contains('open');
    setCodeExampleSourceCollapsed(source, !open);
    setCodeExampleSourceAccessibility(source, open);
  });
}

async function setCodeExampleOpen(codeExample, toggle, open) {
  const source = codeExample.querySelector('.code-example-source');
  if (!source) {
    return;
  }

  const generation = bumpAnimationGeneration(codeExample);
  cancelSourceAnimations(source);
  source.classList.remove('is-animating');

  if (prefersReducedMotion()) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    codeExample.classList.toggle('open', open);
    setCodeExampleSourceCollapsed(source, !open);
    setCodeExampleSourceAccessibility(source, open);
    return;
  }

  const { showDuration, hideDuration } = getCodeExampleDurations(source);

  if (open) {
    toggle.setAttribute('aria-expanded', 'true');
    codeExample.classList.add('open');
    setCodeExampleSourceAccessibility(source, true);
    source.classList.add('is-animating');
    source.style.height = '0';
    source.style.opacity = '0';

    await new Promise((resolve) => requestAnimationFrame(resolve));

    await animate(
      source,
      [
        { height: '0', opacity: '0' },
        { height: `${source.scrollHeight}px`, opacity: '1' },
      ],
      { duration: showDuration, easing: 'linear' }
    );

    if (getAnimationGeneration(codeExample) !== generation) {
      return;
    }

    source.style.height = 'auto';
    source.style.opacity = '';
    source.classList.remove('is-animating');
    return;
  }

  toggle.setAttribute('aria-expanded', 'false');
  source.classList.add('is-animating');
  // Remove .open before the animation so the chevron rotation and panel collapse run together,
  // mirroring the open path where .open is added before the panel animates.
  codeExample.classList.remove('open');
  // Setting an explicit pixel height flushes layout, so no rAF is needed here
  // (unlike the open path, which animates from height: 0 and must measure scrollHeight first).
  const startHeight = source.scrollHeight;
  source.style.height = `${startHeight}px`;

  await animate(
    source,
    [
      { height: `${startHeight}px`, opacity: '1' },
      { height: '0', opacity: '0' },
    ],
    { duration: hideDuration, easing: 'linear' }
  );

  if (getAnimationGeneration(codeExample) !== generation) {
    return;
  }

  setCodeExampleSourceCollapsed(source, true);
  source.classList.remove('is-animating');
  setCodeExampleSourceAccessibility(source, false);
}

// One pass at load. The Eleventy site also re-ran this on `turbo:load`; Astro ships no client
// router here, so a navigation is a fresh document and the pass runs again on its own.
initCodeExamples();

//
// Preview color-scheme changes run through a View Transition so they crossfade in step with the page
// (direction changes flip instantly — they read better without a crossfade). While transitioning, a
// preview is frozen — is-syncing-scheme zeros its transition tokens so the snapshot captures the final
// state instead of an in-flight CSS fade (the tokens reach component shadow DOM by inheritance) — and
// given a view-transition-name to scope the crossfade to it.
//
function freezePreview(preview, name) {
  preview.style.viewTransitionName = name;
  preview.classList.add('is-syncing-scheme');
}

function thawPreview(preview) {
  preview.style.viewTransitionName = '';
  preview.classList.remove('is-syncing-scheme');
}

// A single per-example toggle gets its own View Transition.
function transitionPreview(preview, apply) {
  if (!preview) {
    return;
  }
  freezePreview(preview, 'code-example-preview');
  doViewTransition(apply).finally(() => thawPreview(preview));
}

// The site color-scheme toggle is one page-wide View Transition (driven by color-scheme.js): freeze and
// tag the overridden previews before it captures, absorb them back to the page theme inside it, thaw after.
let syncingPreviews = [];
document.addEventListener('color-scheme-change', () => {
  syncingPreviews = [...document.querySelectorAll('.code-example-preview.cs-light, .code-example-preview.cs-dark')];
  syncingPreviews.forEach((preview, index) => freezePreview(preview, `code-example-preview-${index}`));
});
document.addEventListener('color-scheme-applied', () => {
  syncingPreviews.forEach((preview) => preview.classList.remove('cs-light', 'cs-dark'));
});
document.addEventListener('color-scheme-settled', () => {
  syncingPreviews.forEach(thawPreview);
  syncingPreviews = [];
});

//
// Resizing previews
//
document.addEventListener('mousedown', handleResizerDrag);
document.addEventListener('touchstart', handleResizerDrag, { passive: true });

function handleResizerDrag(event) {
  const resizer = event.target.closest('.code-example-resizer');
  const preview = event.target.closest('.code-example-preview');

  if (!resizer || !preview) {
    return;
  }

  const startX = event.changedTouches ? event.changedTouches[0].pageX : event.clientX;
  const startWidth = parseInt(document.defaultView.getComputedStyle(preview).width, 10);

  event.preventDefault();
  preview.classList.add('is-dragging');
  document.documentElement.addEventListener('mousemove', dragMove);
  document.documentElement.addEventListener('touchmove', dragMove);
  document.documentElement.addEventListener('mouseup', dragStop);
  document.documentElement.addEventListener('touchend', dragStop);

  function dragMove(event) {
    const width = startWidth + (event.changedTouches ? event.changedTouches[0].pageX : event.pageX) - startX;
    preview.style.width = `${width}px`;
  }

  function dragStop() {
    preview.classList.remove('is-dragging');
    document.documentElement.removeEventListener('mousemove', dragMove);
    document.documentElement.removeEventListener('touchmove', dragMove);
    document.documentElement.removeEventListener('mouseup', dragStop);
    document.documentElement.removeEventListener('touchend', dragStop);
  }
}

//
// Toggle source, per-example color scheme, and text direction
//
document.addEventListener('click', (event) => {
  const themeBtn = event.target?.closest('.code-example-theme');
  if (themeBtn) {
    const preview = themeBtn.closest('.code-example')?.querySelector('.code-example-preview');
    transitionPreview(preview, () => {
      const effectiveDark =
        preview.classList.contains('cs-dark') ||
        (!preview.classList.contains('cs-light') && document.documentElement.classList.contains('cs-dark'));
      preview.classList.remove('cs-dark', 'cs-light');
      preview.classList.add(effectiveDark ? 'cs-light' : 'cs-dark');
    });
    return;
  }

  const dirBtn = event.target?.closest('.code-example-dir');
  if (dirBtn) {
    // Direction flips instantly — no View Transition, so the RTL/LTR swap doesn't crossfade.
    const content = dirBtn.closest('.code-example')?.querySelector('.code-example-content');
    if (content) {
      const toRtl = content.getAttribute('dir') !== 'rtl';
      setPreviewDirection(content, toRtl ? 'rtl' : 'ltr');
    }
    return;
  }

  const toggle = event.target?.closest('.code-example-toggle');

  // Toggle source
  if (toggle) {
    const codeExample = toggle.closest('.code-example');
    if (!codeExample) {
      return;
    }

    const open = !codeExample.classList.contains('open');
    void setCodeExampleOpen(codeExample, toggle, open);
  }
});
