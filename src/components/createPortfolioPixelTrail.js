export function createPortfolioPixelTrail(root) {
  if (!root) {
    return () => {};
  }

  const layer = root.querySelector('.portfolio-section__pixel-trail');

  if (!layer) {
    return () => {};
  }

  const state = {
    paintedCells: new Set(),
    lastCellX: -1,
    lastCellY: -1,
    lastSpawnAt: 0,
    isAutoRunning: false,
    isVisible: false,
    timeouts: new Set(),
  };
  const mobileQuery = window.matchMedia('(max-width: 1023px)');

  const getPixelSize = (bounds) => Math.max(Math.round(Math.min(bounds.width, bounds.height) / 16), 22);

  const setTrackedTimeout = (callback, delay) => {
    const timeoutId = window.setTimeout(() => {
      state.timeouts.delete(timeoutId);
      callback();
    }, delay);

    state.timeouts.add(timeoutId);
    return timeoutId;
  };

  const getRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const createPixel = (cellX, cellY, size) => {
    const key = `${cellX}:${cellY}`;

    if (state.paintedCells.has(key)) {
      return;
    }

    state.paintedCells.add(key);

    const pixel = document.createElement('span');
    pixel.className = 'portfolio-section__pixel';
    pixel.style.left = `${cellX * size}px`;
    pixel.style.top = `${cellY * size}px`;
    pixel.style.width = `${size}px`;
    pixel.style.height = `${size}px`;
    layer.appendChild(pixel);

    setTrackedTimeout(() => {
      pixel.classList.add('portfolio-section__pixel--leaving');
    }, 10000);

    setTrackedTimeout(() => {
      pixel.remove();
      state.paintedCells.delete(key);
    }, 10900);
  };

  const createSnakeRoute = (columns, rows) => {
    const horizontal = Math.random() > 0.35;
    const route = [];
    const maxLength = Math.min(Math.max(columns, rows) + getRandomInteger(6, 14), 42);
    let x;
    let y;
    let primaryDirection;

    if (horizontal) {
      primaryDirection = Math.random() > 0.5 ? 1 : -1;
      x = primaryDirection > 0 ? getRandomInteger(0, Math.max(0, Math.floor(columns * 0.2))) : getRandomInteger(Math.max(0, Math.floor(columns * 0.8)), columns - 1);
      y = getRandomInteger(0, rows - 1);
    } else {
      primaryDirection = Math.random() > 0.5 ? 1 : -1;
      x = getRandomInteger(0, columns - 1);
      y = primaryDirection > 0 ? getRandomInteger(0, Math.max(0, Math.floor(rows * 0.2))) : getRandomInteger(Math.max(0, Math.floor(rows * 0.8)), rows - 1);
    }

    for (let index = 0; index < maxLength; index += 1) {
      if (x < 0 || x >= columns || y < 0 || y >= rows) {
        break;
      }

      route.push([x, y]);

      if (horizontal) {
        x += primaryDirection;
        y += Math.random() > 0.48 ? getRandomInteger(-1, 1) : 0;
        y = Math.min(Math.max(y, 0), rows - 1);
      } else {
        y += primaryDirection;
        x += Math.random() > 0.48 ? getRandomInteger(-1, 1) : 0;
        x = Math.min(Math.max(x, 0), columns - 1);
      }
    }

    return route;
  };

  const runAutoSnake = () => {
    if (!mobileQuery.matches || !state.isVisible || state.isAutoRunning) {
      return;
    }

    const bounds = root.getBoundingClientRect();
    const size = getPixelSize(bounds);
    const columns = Math.max(Math.ceil(bounds.width / size), 1);
    const rows = Math.max(Math.ceil(bounds.height / size), 1);
    const route = createSnakeRoute(columns, rows);

    state.isAutoRunning = true;

    route.forEach(([cellX, cellY], index) => {
      setTrackedTimeout(() => {
        createPixel(cellX, cellY, size);
      }, index * 58);
    });

    setTrackedTimeout(() => {
      state.isAutoRunning = false;

      if (state.isVisible && mobileQuery.matches) {
        setTrackedTimeout(runAutoSnake, getRandomInteger(1800, 3600));
      }
    }, route.length * 58 + 160);
  };

  const handlePointerMove = (event) => {
    const bounds = root.getBoundingClientRect();
    const size = getPixelSize(bounds);
    const cellX = Math.floor((event.clientX - bounds.left) / size);
    const cellY = Math.floor((event.clientY - bounds.top) / size);
    const now = performance.now();

    if (cellX === state.lastCellX && cellY === state.lastCellY) {
      return;
    }

    if (now - state.lastSpawnAt < 18) {
      return;
    }

    if (state.lastCellX >= 0 && state.lastCellY >= 0) {
      const deltaX = cellX - state.lastCellX;
      const deltaY = cellY - state.lastCellY;
      const steps = Math.min(Math.max(Math.abs(deltaX), Math.abs(deltaY)), 8);

      for (let index = 1; index <= steps; index += 1) {
        const progress = index / steps;
        createPixel(
          Math.round(state.lastCellX + deltaX * progress),
          Math.round(state.lastCellY + deltaY * progress),
          size,
        );
      }
    } else {
      createPixel(cellX, cellY, size);
    }

    state.lastCellX = cellX;
    state.lastCellY = cellY;
    state.lastSpawnAt = now;
  };

  const handlePointerLeave = () => {
    state.lastCellX = -1;
    state.lastCellY = -1;
  };

  root.addEventListener('pointermove', handlePointerMove);
  root.addEventListener('pointerleave', handlePointerLeave);

  const observer = new IntersectionObserver(
    ([entry]) => {
      state.isVisible = entry.isIntersecting;

      if (state.isVisible) {
        runAutoSnake();
      }
    },
    { threshold: 0.45 },
  );

  observer.observe(root);

  return () => {
    root.removeEventListener('pointermove', handlePointerMove);
    root.removeEventListener('pointerleave', handlePointerLeave);
    observer.disconnect();
    state.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    state.timeouts.clear();
    layer.replaceChildren();
    state.paintedCells.clear();
  };
}
