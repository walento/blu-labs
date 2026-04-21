import { useEffect } from 'react';
import HeroSection from './HeroSection';
import PortfolioSection from './PortfolioSection';
import SiteHeader from './SiteHeader';
import './PageShell.css';

function PageShell() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      return undefined;
    }

    document.body.classList.add('is-intro-scroll-locked');

    const timeoutId = window.setTimeout(() => {
      document.body.classList.remove('is-intro-scroll-locked');
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
      document.body.classList.remove('is-intro-scroll-locked');
    };
  }, []);

  return (
    <main className="page-shell" data-page="onepage-root">
      <div className="page-shell__canvas">
        <div className="page-shell__preview">
          <SiteHeader />
          <HeroSection />
          <PortfolioSection />
        </div>
      </div>
    </main>
  );
}

export default PageShell;
