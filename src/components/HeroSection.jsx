import { useLayoutEffect, useRef } from 'react';
import DarkButton from './DarkButton';
import './HeroSection.css';

function HeroSection() {
  const titleTrackRef = useRef(null);
  const titleRef = useRef(null);

  useLayoutEffect(() => {
    const track = titleTrackRef.current;
    const title = titleRef.current;

    if (!track || !title) {
      return undefined;
    }

    const fitTitle = () => {
      const availableWidth = track.clientWidth;

      if (!availableWidth) {
        return;
      }

      let low = 32;
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
    };

    fitTitle();

    const observer = new ResizeObserver(() => {
      fitTitle();
    });

    observer.observe(track);
    window.addEventListener('resize', fitTitle);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fitTitle);
    };
  }, []);

  return (
    <section className="hero" aria-label="Hero Section">
      <div className="hero__inner">
        <div className="hero__content">
          <p className="hero__kicker">
            <span className="hero__kicker-index">[1/8]</span>
            <span className="hero__kicker-copy" data-text-role="subheading-display">
              <span>WEBSITES F\u00dcR</span>
              <span>IT-DIENSTLEISTER</span>
              <span>UND IT-BERATER</span>
            </span>
          </p>

          <div className="hero__lower">
            <div className="hero__title-track" ref={titleTrackRef}>
              <h1 className="hero__title" data-text-role="heading" ref={titleRef}>
                WEBDESIGN
              </h1>
            </div>

            <div className="hero__body">
              <p className="hero__text">
                <span className="hero__text-logo">
                  <span className="hero__text-logo-main">blu</span>
                  <span className="hero__text-logo-accent">::</span>
                  <span className="hero__text-logo-main">labs</span>
                </span>{' '}
                ist dein Ansprechpartner f\u00fcr Websites in der IT, die aus der
                Masse herausstechen. In einer Welt voller AI-Slop, achten wir
                aufs Detail und sorgen daf\u00fcr, dass du als IT-Dienstleister oder
                -Berater bei potentiellen Kunden positiv im Kopf bleibst.
              </p>

              <DarkButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
