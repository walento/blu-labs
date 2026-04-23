import { useEffect, useMemo, useRef } from 'react';
import { gsap } from '../lib/gsap';
import './GreenTransitionSection.css';

const TILE_COLUMNS = 12;
const TILE_ROWS = 8;
const TILE_TOTAL = TILE_COLUMNS * TILE_ROWS;
const FORWARD_TRIGGER_PROGRESS = 0.08;
const BACKWARD_TRIGGER_PROGRESS = 0.02;
const FORWARD_LOCK_PROGRESS = 0.1;
const BACKWARD_LOCK_PROGRESS = 0.01;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const seededNoise = (value) => {
  const noise = Math.sin(value * 91.345 + 17.17) * 10000;
  return noise - Math.floor(noise);
};

const getNeighborIndexes = (index) => {
  const column = index % TILE_COLUMNS;
  const row = Math.floor(index / TILE_COLUMNS);
  const neighbors = [];

  if (column > 0) {
    neighbors.push(index - 1);
  }

  if (column < TILE_COLUMNS - 1) {
    neighbors.push(index + 1);
  }

  if (row > 0) {
    neighbors.push(index - TILE_COLUMNS);
  }

  if (row < TILE_ROWS - 1) {
    neighbors.push(index + TILE_COLUMNS);
  }

  return neighbors;
};

const createConnectedOrder = () => {
  const centerColumn = Math.floor(TILE_COLUMNS / 2);
  const centerRow = Math.floor(TILE_ROWS / 2);
  const startIndex = centerRow * TILE_COLUMNS + centerColumn;
  const visited = new Set([startIndex]);
  const order = [startIndex];
  let currentIndex = startIndex;

  while (order.length < TILE_TOTAL) {
    const directNeighbors = getNeighborIndexes(currentIndex).filter((neighborIndex) => !visited.has(neighborIndex));
    let nextIndex;

    if (directNeighbors.length > 0) {
      const pick = Math.floor(seededNoise(order.length * 23 + currentIndex * 5) * directNeighbors.length);
      nextIndex = directNeighbors[pick];
    } else {
      const frontier = order
        .flatMap((tileIndex) => getNeighborIndexes(tileIndex))
        .filter((neighborIndex) => !visited.has(neighborIndex));

      if (frontier.length === 0) {
        break;
      }

      const pick = Math.floor(seededNoise(order.length * 19 + frontier.length * 7) * frontier.length);
      nextIndex = frontier[pick];
    }

    visited.add(nextIndex);
    order.push(nextIndex);
    currentIndex = nextIndex;
  }

  return order;
};

function GreenTransitionSection({ sceneRef }) {
  const tilesRef = useRef([]);
  const mobileTriggerStartRef = useRef(null);
  const animationFrameRef = useRef(0);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoAnimationStartedAtRef = useRef(0);
  const autoAnimationFromRef = useRef(0);
  const lockedScrollYRef = useRef(null);

  const tiles = useMemo(() => {
    const order = createConnectedOrder();
    const orderMap = new Map(order.map((tileIndex, orderIndex) => [tileIndex, orderIndex]));

    return Array.from({ length: TILE_TOTAL }, (_, index) => {
      const column = index % TILE_COLUMNS;
      const row = Math.floor(index / TILE_COLUMNS);
      const orderIndex = orderMap.get(index) || 0;
      const connectedStart = orderIndex / (TILE_TOTAL - 1);

      return {
        column,
        id: `${column}-${row}`,
        row,
        start: clamp(0.2 + connectedStart * 0.7, 0.2, 0.9),
      };
    });
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activeTiles = tilesRef.current.filter(Boolean);

    if (reducedMotion) {
      gsap.set(activeTiles, { autoAlpha: 1 });
      return undefined;
    }

    const setTilesByProgress = (progress) => {
      const isCovered = progress >= 0.995;
      const sticky = scene.querySelector('.portfolio-transition-scene__sticky');
      const overlayScale = 1 - progress * 0.3;
      const overlayBlur = progress * 16;

      scene.classList.toggle('portfolio-transition-scene--green-covered', isCovered);
      sticky?.style.setProperty('--portfolio-overlay-scale', `${overlayScale}`);
      sticky?.style.setProperty('--portfolio-overlay-blur', `${overlayBlur}px`);

      activeTiles.forEach((tile) => {
        const start = Number.parseFloat(tile.dataset.start || '0');
        const isVisible = progress >= start;

        gsap.set(tile, {
          autoAlpha: isVisible ? 1 : 0,
        });
      });
    };

    let releaseScrollInputPause = () => {};

    const scrollKeys = new Set([
      ' ',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'End',
      'Home',
      'PageDown',
      'PageUp',
    ]);

    const pauseScrollInput = () => {
      const stopScrollInput = (event) => {
        event.preventDefault();
      };
      const stopScrollKey = (event) => {
        if (scrollKeys.has(event.key)) {
          event.preventDefault();
        }
      };

      window.addEventListener('wheel', stopScrollInput, { passive: false });
      window.addEventListener('touchmove', stopScrollInput, { passive: false });
      window.addEventListener('keydown', stopScrollKey);

      releaseScrollInputPause = () => {
        window.removeEventListener('wheel', stopScrollInput);
        window.removeEventListener('touchmove', stopScrollInput);
        window.removeEventListener('keydown', stopScrollKey);
        releaseScrollInputPause = () => {};
      };
    };

    const setTargetProgress = (nextTarget, lockedScrollY) => {
      if (targetProgressRef.current === nextTarget) {
        return;
      }

      releaseScrollInputPause();
      pauseScrollInput();
      targetProgressRef.current = nextTarget;
      autoAnimationFromRef.current = progressRef.current;
      autoAnimationStartedAtRef.current = performance.now();
      lockedScrollYRef.current = lockedScrollY;
    };

    const animateToTarget = () => {
      const duration = 1050;
      const elapsed = performance.now() - autoAnimationStartedAtRef.current;
      const linearProgress = clamp(elapsed / duration, 0, 1);
      const easedProgress =
        linearProgress < 0.5
          ? 4 * linearProgress ** 3
          : 1 - ((-2 * linearProgress + 2) ** 3) / 2;

      if (typeof lockedScrollYRef.current === 'number') {
        window.scrollTo({
          top: lockedScrollYRef.current,
          behavior: 'auto',
        });
      }

      progressRef.current =
        autoAnimationFromRef.current +
        (targetProgressRef.current - autoAnimationFromRef.current) * easedProgress;
      setTilesByProgress(progressRef.current);

      if (linearProgress >= 1) {
        progressRef.current = targetProgressRef.current;
        setTilesByProgress(progressRef.current);
        animationFrameRef.current = 0;
        if (typeof lockedScrollYRef.current === 'number') {
          window.scrollTo({
            top: lockedScrollYRef.current,
            behavior: 'auto',
          });
        }
        lockedScrollYRef.current = null;
        releaseScrollInputPause();
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateToTarget);
    };

    const requestAnimation = () => {
      if (animationFrameRef.current) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateToTarget);
    };

    let frameId = 0;

    const updateTransition = () => {
      frameId = 0;

      const rect = scene.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollableDistance = Math.max(rect.height - viewportHeight, 1);
      const sceneTopAbsolute = window.scrollY + rect.top;
      const sticky = scene.querySelector('.portfolio-transition-scene__sticky');
      const portfolio = scene.querySelector('.portfolio-section');
      const sceneScroll = Math.max(0 - rect.top, 0);
      const isMobileTransition = window.matchMedia('(max-width: 1023px)').matches;
      const currentMobileOffset =
        sticky ? Number.parseFloat(window.getComputedStyle(sticky).getPropertyValue('--portfolio-mobile-scroll-offset')) || 0 : 0;
      const stickyBottom = sticky ? sticky.getBoundingClientRect().bottom : viewportHeight;
      const portfolioBottomAtRest = portfolio ? portfolio.getBoundingClientRect().bottom - currentMobileOffset : 0;
      const portfolioRevealDistance =
        sticky && portfolio
          ? Math.max(portfolioBottomAtRest - stickyBottom, 0)
          : 0;
      const projectedPortfolioBottom = portfolioBottomAtRest - Math.min(sceneScroll, portfolioRevealDistance);

      if (projectedPortfolioBottom > stickyBottom) {
        mobileTriggerStartRef.current = null;
      } else if (mobileTriggerStartRef.current === null) {
        mobileTriggerStartRef.current = sceneScroll;
      }

      const startBuffer = viewportHeight * (isMobileTransition ? 0.22 : 0.08);
      const holdDistance =
        mobileTriggerStartRef.current === null
          ? Number.POSITIVE_INFINITY
          : mobileTriggerStartRef.current + startBuffer;
      const revealDistance = Math.max(scrollableDistance - holdDistance, 1);
      const scrollProgress = clamp((0 - rect.top - holdDistance) / revealDistance, 0, 1);
      const nextTarget =
        targetProgressRef.current >= 0.5
          ? scrollProgress > BACKWARD_TRIGGER_PROGRESS
            ? 1
            : 0
          : scrollProgress >= FORWARD_TRIGGER_PROGRESS
            ? 1
            : 0;
      const lockedProgress =
        nextTarget === 1 ? FORWARD_LOCK_PROGRESS : BACKWARD_LOCK_PROGRESS;
      const transitionThresholdScroll = clamp(
        nextTarget === 1
          ? Math.max(window.scrollY, sceneTopAbsolute + holdDistance + revealDistance * lockedProgress)
          : Math.min(window.scrollY, sceneTopAbsolute + holdDistance + revealDistance * lockedProgress),
        sceneTopAbsolute,
        sceneTopAbsolute + scrollableDistance,
      );
      const mobilePortfolioOffset =
        portfolioRevealDistance > 0 ? -clamp(sceneScroll / portfolioRevealDistance, 0, 1) * portfolioRevealDistance : 0;

      sticky?.style.setProperty('--portfolio-mobile-scroll-offset', `${mobilePortfolioOffset}px`);

      setTargetProgress(nextTarget, transitionThresholdScroll);
      requestAnimation();
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateTransition);
    };

    updateTransition();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(animationFrameRef.current);
      releaseScrollInputPause();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [sceneRef]);

  return (
    <div className="green-transition-section" aria-hidden="true">
      <div className="green-transition-section__tiles">
        {tiles.map((tile, index) => (
          <span
            className="green-transition-section__tile"
            style={{
              '--tile-column': tile.column,
              '--tile-row': tile.row,
            }}
            data-start={tile.start}
            key={tile.id}
            ref={(node) => {
              tilesRef.current[index] = node;
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default GreenTransitionSection;
