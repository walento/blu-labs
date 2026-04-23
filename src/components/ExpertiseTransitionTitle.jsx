import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createDecodeTextReveal } from './createDecodeTextReveal';
import { createPixelHoverTextEffect } from './createPixelHoverTextEffect';
import './ExpertiseTransitionTitle.css';

const FINAL_TEXT = 'EXPERTISE';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%<>[]{}+*';
const EXPERTISE_BODY_TEXT =
  'W\u00e4rst du offen daf\u00fcr, dass ich dir kostenlos ein konkretes Homepage-Konzept mit Textbeispielen und klarer Websitestruktur ausarbeite, damit deine Website mehr Anfragen und Bewerbungen bekommt? W\u00e4rst du offen daf\u00fcr, dass ich dir kostenlos ein konkretes Homepage-Konzept mit Textbeispielen und klarer Websitestruktur ausarbeite, damit deine Website mehr Anfragen und Bewerbungen bekommt?';
const EXPERTISE_ITEMS = ['STRATEGY', 'CONCEPTION', 'MESSAGING', 'DEVELOPMENT'];

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function ExpertiseTransitionTitle({ sceneRef }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const listRef = useRef(null);
  const destroyDecodeRef = useRef(() => {});
  const hideAnimationFrameRef = useRef(0);
  const isVisibleRef = useRef(false);
  const sectionStartScrollRef = useRef(null);
  const frameRef = useRef(0);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isLaptopIntroCollapsed, setIsLaptopIntroCollapsed] = useState(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const title = titleRef.current;

    if (!track || !title) {
      return undefined;
    }

    let resizeFrame = 0;
    let disposed = false;

    const fitTitle = () => {
      const listWidth = listRef.current?.clientWidth || 0;
      const trackStyle = window.getComputedStyle(track);
      const horizontalPadding =
        (Number.parseFloat(trackStyle.paddingLeft) || 0) +
        (Number.parseFloat(trackStyle.paddingRight) || 0);
      const fallbackWidth = track.clientWidth - horizontalPadding;
      const availableWidth = listWidth || fallbackWidth;

      if (!availableWidth) {
        return;
      }

      rootRef.current?.style.setProperty('width', `${availableWidth}px`);

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
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        if (!disposed) {
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
      disposed = true;
      window.cancelAnimationFrame(resizeFrame);
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
      window.cancelAnimationFrame(hideAnimationFrameRef.current);
      destroyDecodeRef.current();
      destroyDecodeRef.current = () => {};
      title.textContent = FINAL_TEXT;
      root.__pixelHoverUpdateText?.(FINAL_TEXT);
      root.classList.add('expertise-title--visible');
      root.classList.remove('expertise-title--hidden');
      setIsSectionVisible(true);
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
      sectionStartScrollRef.current = null;
      setActiveItemIndex(-1);
      setIsLaptopIntroCollapsed(false);
      setIsSectionVisible(false);
      root.classList.remove('pixel-hover-title--decoded');
      root.classList.remove('pixel-hover-title--decoding');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        root.classList.remove('expertise-title--visible');
        root.classList.add('expertise-title--hidden');
        title.textContent = FINAL_TEXT;
        root.__pixelHoverUpdateText?.(FINAL_TEXT);
        return;
      }

      const startedAt = performance.now();
      const duration = 420;

      const tick = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        title.textContent = Array.from(FINAL_TEXT, (char) => {
          if (char === ' ') {
            return ' ';
          }

          return progress < 1 ? randomGlyph() : char;
        }).join('');

        if (progress < 1) {
          hideAnimationFrameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        root.classList.remove('expertise-title--visible');
        root.classList.add('expertise-title--hidden');
        title.textContent = FINAL_TEXT;
        root.__pixelHoverUpdateText?.(FINAL_TEXT);
      };

      hideAnimationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const updateActiveItem = () => {
      frameRef.current = 0;

      const rect = scene.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isCovered = scene.classList.contains('portfolio-transition-scene--green-covered');
      const isInViewport = rect.top < viewportHeight && rect.bottom > 0;

      if (!isCovered || !isInViewport) {
        sectionStartScrollRef.current = null;
        hideTitle();
        return;
      }

      const sceneScroll = Math.max(-rect.top, 0);
      const scrollableDistance = Math.max(scene.offsetHeight - viewportHeight, 1);
      revealTitle();

      if (sectionStartScrollRef.current === null) {
        sectionStartScrollRef.current = sceneScroll;
      }

      const firstItemStart = sectionStartScrollRef.current + viewportHeight * 0.22;
      const releaseTail = viewportHeight * 1.05;
      const sequenceDistance = Math.max(
        scrollableDistance - firstItemStart - releaseTail,
        viewportHeight * 2.6,
      );
      const itemScrollSpan = sequenceDistance / EXPERTISE_ITEMS.length;
      const rawActiveItem = Math.floor((sceneScroll - firstItemStart) / itemScrollSpan);
      const nextActiveItem = Math.min(
        EXPERTISE_ITEMS.length - 1,
        Math.max(-1, rawActiveItem),
      );

      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      setIsLaptopIntroCollapsed(
        viewportWidth >= 1024 && viewportWidth <= 1439 && nextActiveItem >= 0,
      );
      setActiveItemIndex(nextActiveItem);
    };

    const requestUpdate = () => {
      if (frameRef.current) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(updateActiveItem);
    };

    const observer = new MutationObserver(requestUpdate);
    observer.observe(scene, {
      attributes: true,
      attributeFilter: ['class'],
    });

    updateActiveItem();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.cancelAnimationFrame(hideAnimationFrameRef.current);
      observer.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      destroyDecodeRef.current();
    };
  }, [sceneRef]);

  return (
    <div className="expertise-title-track" ref={trackRef}>
      <div className="expertise-title expertise-title--hidden" ref={rootRef}>
        <h2 className="expertise-title__text" ref={titleRef}>
          {FINAL_TEXT}
        </h2>
      </div>
      <div
        className={`expertise-intro ${
          isSectionVisible ? 'expertise-intro--visible' : 'expertise-intro--hidden'
        } ${isLaptopIntroCollapsed ? 'expertise-intro--laptop-collapsed' : ''}`.trim()}
        ref={contentRef}
      >
        <p className="expertise-intro__text">
          W\u00e4rst du offen daf\u00fcr, dass ich dir kostenlos ein konkretes
          Homepage-Konzept mit Textbeispielen und klarer Websitestruktur ausarbeite,
          damit deine Website mehr Anfragen und Bewerbungen bekommt?
        </p>
        <span className="expertise-intro__index">[3/8]</span>
      </div>
      <div
        className={`expertise-list ${
          isSectionVisible ? 'expertise-list--visible' : 'expertise-list--hidden'
        }`.trim()}
        ref={listRef}
      >
        {EXPERTISE_ITEMS.map((item, index) => (
          <article
            className={`expertise-list__item ${
              activeItemIndex === index ? 'expertise-list__item--active' : ''
            }`.trim()}
            key={item}
          >
            <h3 className="expertise-list__heading">{item}</h3>
            <div className="expertise-list__body-wrap">
              <p className="expertise-list__body">{EXPERTISE_BODY_TEXT}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ExpertiseTransitionTitle;
