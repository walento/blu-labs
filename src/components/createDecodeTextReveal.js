const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%<>[]{}+*';

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export function createDecodeTextReveal(root, sourceElement, finalText, options = {}) {
  if (!root || !sourceElement) {
    return () => {};
  }

  const {
    delay = 0,
    duration = 2250,
    scrambleWindow = 0.12,
  } = options;

  let frameId = 0;
  let timeoutId = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setText = (nextText) => {
    sourceElement.textContent = nextText;

    if (typeof root.__pixelHoverUpdateText === 'function') {
      root.__pixelHoverUpdateText(nextText);
    }
  };

  if (reducedMotion) {
    setText(finalText);
    root.classList.add('pixel-hover-title--decoded');

    return () => {};
  }

  const encrypted = Array.from(finalText, (char) => (char === ' ' ? ' ' : randomGlyph())).join('');
  setText(encrypted);
  root.classList.add('pixel-hover-title--decoding');

  const start = () => {
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const nextText = Array.from(finalText, (char, index) => {
        if (char === ' ') {
          return ' ';
        }

        const revealAt = index / finalText.length;
        const lockAt = revealAt + scrambleWindow;

        if (progress >= lockAt) {
          return char;
        }

        if (progress >= revealAt) {
          return Math.random() > 0.38 ? char : randomGlyph();
        }

        return randomGlyph();
      }).join('');

      setText(nextText);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      setText(finalText);
      root.classList.remove('pixel-hover-title--decoding');
      root.classList.add('pixel-hover-title--decoded');
    };

    frameId = window.requestAnimationFrame(tick);
  };

  timeoutId = window.setTimeout(start, delay);

  return () => {
    window.clearTimeout(timeoutId);
    window.cancelAnimationFrame(frameId);
    setText(finalText);
  };
}
