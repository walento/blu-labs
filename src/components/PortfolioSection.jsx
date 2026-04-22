import { useEffect, useLayoutEffect, useRef } from 'react';
import portfolioImage from '../assets/images/portfolio-dms-thumbnail.png';
import { createDecodeTextReveal } from './createDecodeTextReveal';
import { createPortfolioPixelTrail } from './createPortfolioPixelTrail';
import './PortfolioSection.css';

function PortfolioSection() {
  const headerRef = useRef(null);
  const mediaRef = useRef(null);
  const titleShellRef = useRef(null);
  const titleRef = useRef(null);
  const indexRef = useRef(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const title = titleRef.current;
    const index = indexRef.current;

    if (!header || !title || !index) {
      return undefined;
    }

    let frameId = 0;
    let isDisposed = false;

    const fitTitle = () => {
      const headerStyle = window.getComputedStyle(header);
      const gap = Number.parseFloat(headerStyle.columnGap) || 0;
      const paddingX =
        (Number.parseFloat(headerStyle.paddingLeft) || 0) +
        (Number.parseFloat(headerStyle.paddingRight) || 0);
      const availableWidth = header.clientWidth - paddingX - index.offsetWidth - gap;
      const titleSafeWidth = availableWidth - 12;

      if (titleSafeWidth <= 0) {
        return;
      }

      let low = 24;
      let high = 160;
      let best = low;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        title.style.fontSize = `${mid}px`;

        if (title.scrollWidth <= titleSafeWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      title.style.fontSize = `${best}px`;
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
    observer.observe(header);
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
    const shell = titleShellRef.current;
    const title = titleRef.current;

    if (!shell || !title) {
      return undefined;
    }

    let destroyReveal = () => {};
    let hasPlayed = false;

    const playReveal = () => {
      if (hasPlayed) {
        return;
      }

      hasPlayed = true;
      destroyReveal = createDecodeTextReveal(shell, title, 'PORTFOLIO', {
        duration: 1250,
        scrambleWindow: 0.08,
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playReveal();
          observer.disconnect();
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(shell);

    return () => {
      observer.disconnect();
      destroyReveal();
    };
  }, []);

  useEffect(() => {
    const media = mediaRef.current;

    if (!media) {
      return undefined;
    }

    return createPortfolioPixelTrail(media);
  }, []);

  return (
    <section className="portfolio-section" aria-label="Portfolio">
      <div className="portfolio-section__grid">
        <div
          className="portfolio-section__media-placeholder"
          ref={mediaRef}
        >
          <img
            className="portfolio-section__media-image portfolio-section__media-image--base"
            src={portfolioImage}
            alt=""
            draggable="false"
          />
          <div className="portfolio-section__pixel-trail" aria-hidden="true" />
          <a className="portfolio-section__image-button light-button" href="/">
            <span
              className="light-button__icon light-button__icon--left"
              aria-hidden="true"
            >
              <span className="light-button__arrow" />
            </span>
            <span className="light-button__content">
              <span className="light-button__label">ZUR WEBSITE</span>
            </span>
            <span
              className="light-button__icon light-button__icon--right"
              aria-hidden="true"
            >
              <span className="light-button__arrow" />
            </span>
          </a>
        </div>

        <div className="portfolio-section__content">
          <div className="portfolio-section__header" ref={headerRef}>
            <div className="portfolio-section__title-shell" ref={titleShellRef}>
              <h2 className="portfolio-section__title" ref={titleRef}>
                PORTFOLIO
              </h2>
            </div>
            <span className="portfolio-section__index" ref={indexRef}>
              [2/8]
            </span>
          </div>

          <div className="portfolio-section__empty-card">
            <div className="portfolio-section__meta-row">
              <span className="portfolio-section__client">[DMS-GRUPPE.DE]</span>
              <div className="portfolio-section__tags" aria-label="Projektkategorien">
                <span className="portfolio-section__tag">WEBDESIGN</span>
                <span className="portfolio-section__tag">SEO</span>
              </div>
            </div>

            <h3 className="portfolio-section__case-title">
              AUTOMATION F&Uuml;R
              <br />
              DIE ENERGIEBRANCHE
            </h3>

            <p className="portfolio-section__case-text">
              W&auml;rst du offen daf&uuml;r, dass ich dir kostenlos ein konkretes
              Homepage-Konzept mit Textbeispielen und klarer Websitestruktur ausarbeite,
              damit deine Website mehr Anfragen und Bewerbungen bekommt?
            </p>
          </div>
        </div>
      </div>

      <div className="portfolio-section__footer">
        <p className="portfolio-section__footer-text">
          <span className="portfolio-section__footer-emphasis">
            Auf der Suche nach mehr Projekten?
          </span>{' '}
          Hier gibt es weitere Websites die wir bereits unter anderem Namen erstellt haben.
        </p>
        <button className="portfolio-section__pdf-button" type="button">
          PDF ANSCHAUEN
        </button>
      </div>
    </section>
  );
}

export default PortfolioSection;
