import { useEffect, useState } from 'react';
import './LightButton.css';

function LightButton({
  label = 'JETZT PROTOTYP SICHERN',
  mobileLabel = label,
  type = 'button',
  className = '',
}) {
  const classes = ['light-button', className].filter(Boolean).join(' ');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const syncViewport = () => {
      setIsMobile(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
    };
  }, []);

  const activeLabel = isMobile ? mobileLabel : label;

  return (
    <button className={classes} type={type}>
      <span className="light-button__icon light-button__icon--left" aria-hidden="true">
        <span className="light-button__arrow" />
      </span>
      <span className="light-button__content">
        <span className="light-button__label">{activeLabel}</span>
      </span>
      <span className="light-button__icon light-button__icon--right" aria-hidden="true">
        <span className="light-button__arrow" />
      </span>
    </button>
  );
}

export default LightButton;
