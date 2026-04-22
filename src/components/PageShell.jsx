import { useEffect, useLayoutEffect, useState } from 'react';
import HeroSection from './HeroSection';
import PortfolioTransitionScene from './PortfolioTransitionScene';
import SiteHeader from './SiteHeader';
import './PageShell.css';

const INTRO_SCROLL_LOCK_DURATION = 3000;

function PageShell() {
  const [isIntroReady, setIsIntroReady] = useState(false);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isDisposed = false;
    let timeoutId = 0;

    const releaseScrollLock = () => {
      document.body.classList.remove('is-intro-scroll-locked');
    };
    const startIntroAfterNextPaint = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(startIntro);
      });
    };

    if (reducedMotion) {
      setIsIntroReady(true);
      releaseScrollLock();
      return releaseScrollLock;
    }

    document.body.classList.add('is-intro-scroll-locked');

    const startIntro = () => {
      if (isDisposed) {
        return;
      }

      window.scrollTo(0, 0);
      setIsIntroReady(true);
      timeoutId = window.setTimeout(releaseScrollLock, INTRO_SCROLL_LOCK_DURATION);
    };

    if (document.fonts) {
      Promise.all([
        document.fonts.load("400 1em 'Early Gameboy'"),
        document.fonts.ready,
      ])
        .then(startIntroAfterNextPaint)
        .catch(startIntroAfterNextPaint);
    } else {
      window.addEventListener('load', startIntroAfterNextPaint, { once: true });
    }

    return () => {
      isDisposed = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener('load', startIntroAfterNextPaint);
      releaseScrollLock();
    };
  }, []);

  return (
    <main
      className={`page-shell ${isIntroReady ? 'page-shell--intro-ready' : ''}`.trim()}
      data-page="onepage-root"
    >
      <div className="page-shell__canvas">
        <div className="page-shell__preview">
          <SiteHeader />
          <HeroSection />
          <PortfolioTransitionScene />
        </div>
      </div>
    </main>
  );
}

export default PageShell;
