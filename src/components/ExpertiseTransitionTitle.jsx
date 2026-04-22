import { useEffect, useLayoutEffect, useRef } from 'react';
import { createDecodeTextReveal } from './createDecodeTextReveal';
import { createPixelHoverTextEffect } from './createPixelHoverTextEffect';
import './ExpertiseTransitionTitle.css';

const FINAL_TEXT = 'EXPERTISE';

function ExpertiseTransitionTitle({ sceneRef }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const titleRef = useRef(null);
  const destroyDecodeRef = useRef(() => {});
  const isVisibleRef = useRef(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const title = titleRef.current;

    if (!track || !title) {
      return undefined;
    }

    let frameId = 0;
    let isDisposed = false;

    const fitTitle = () => {
      const availableWidth = track.clientWidth;

      if (!availableWidth) {
        return;
      }

      let low = 24;
      let high = 320;
      let best = low;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        title.style.fontSize = `${mid}px`;

        if (title.scrollWidth <= availableWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      title.style.fontSize = `${best}px`;
      rootRef.current?.__pixelHoverUpdateText?.(title.textContent || FINAL_TEXT);
    };

    const requestFitTitle = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (!isDisposed) {
          fitTitle();
        }
      });
    };

    fitTitle();
    requestFitTitle();

    const observer = new ResizeObserver(requestFitTitle);
    observer.observe(track);
    window.addEventListener('load', requestFitTitle);
    window.addEventListener('resize', requestFitTitle);

    if (document.fonts) {
      document.fonts.load("400 1em 'Early Gameboy'").then(requestFitTitle);
      document.fonts.ready.then(requestFitTitle);
    }

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('load', requestFitTitle);
      window.removeEventListener('resize', requestFitTitle);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;

    if (!root || !title) {
      return undefined;
    }

    return createPixelHoverTextEffect(root, title, FINAL_TEXT);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const root = rootRef.current;
    const title = titleRef.current;

    if (!scene || !root || !title) {
      return undefined;
    }

    const revealTitle = () => {
      if (isVisibleRef.current) {
        return;
      }

      isVisibleRef.current = true;
      destroyDecodeRef.current();
      title.textContent = FINAL_TEXT;
      root.__pixelHoverUpdateText?.(FINAL_TEXT);
      root.classList.add('expertise-title--visible');
      root.classList.remove('expertise-title--hidden');
      root.classList.remove('pixel-hover-title--decoded');
      root.classList.remove('pixel-hover-title--decoding');
      destroyDecodeRef.current = createDecodeTextReveal(root, title, FINAL_TEXT, {
        duration: 1550,
        scrambleWindow: 0.1,
      });
    };

    const hideTitle = () => {
      if (!isVisibleRef.current) {
        return;
      }

      isVisibleRef.current = false;
      destroyDecodeRef.current();
      destroyDecodeRef.current = () => {};
      root.classList.remove('expertise-title--visible');
      root.classList.add('expertise-title--hidden');
      root.classList.remove('pixel-hover-title--decoded');
      root.classList.remove('pixel-hover-title--decoding');
      title.textContent = FINAL_TEXT;
      root.__pixelHoverUpdateText?.(FINAL_TEXT);
    };

    const syncVisibility = () => {
      if (scene.classList.contains('portfolio-transition-scene--green-covered')) {
        revealTitle();
      } else {
        hideTitle();
      }
    };

    const observer = new MutationObserver(syncVisibility);

    syncVisibility();
    observer.observe(scene, {
      attributeFilter: ['class'],
      attributes: true,
    });

    return () => {
      observer.disconnect();
      destroyDecodeRef.current();
    };
  }, [sceneRef]);

  return (
    <div className="expertise-title-track" ref={trackRef}>
      <div className="expertise-title pixel-hover-title expertise-title--hidden" ref={rootRef}>
        <h2 className="expertise-title__text pixel-hover-title__text" ref={titleRef}>
          {FINAL_TEXT}
        </h2>
      </div>
    </div>
  );
}

export default ExpertiseTransitionTitle;
