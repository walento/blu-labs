import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import './SiteHeader.css';

function SiteHeader() {
  const [isCompact, setIsCompact] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    let rafId = 0;

    const updateHeaderState = () => {
      rafId = 0;

      if (!desktopQuery.matches) {
        setIsCompact(false);
        lastScrollYRef.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 12) {
        setIsCompact(false);
        setIsScrolled(false);
      } else if (delta > 4) {
        setIsCompact(true);
        setIsScrolled(true);
      } else if (delta < -4) {
        setIsCompact(false);
        setIsScrolled(true);
      } else {
        setIsScrolled(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const requestUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateHeaderState);
      }
    };

    lastScrollYRef.current = window.scrollY;
    updateHeaderState();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    desktopQuery.addEventListener('change', updateHeaderState);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener('scroll', requestUpdate);
      desktopQuery.removeEventListener('change', updateHeaderState);
    };
  }, []);

  return (
    <header className="site-header">
      <Navbar isCompact={isCompact} isScrolled={isScrolled} />
    </header>
  );
}

export default SiteHeader;
