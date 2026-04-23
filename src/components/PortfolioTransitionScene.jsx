import { useRef } from 'react';
import ExpertiseTransitionTitle from './ExpertiseTransitionTitle';
import GreenTransitionSection from './GreenTransitionSection';
import PortfolioSection from './PortfolioSection';
import './PortfolioTransitionScene.css';

function PortfolioTransitionScene() {
  const sceneRef = useRef(null);

  return (
    <>
      <section className="portfolio-transition-scene" ref={sceneRef}>
        <div className="portfolio-transition-scene__sticky">
          <PortfolioSection />
          <GreenTransitionSection sceneRef={sceneRef} />
          <ExpertiseTransitionTitle sceneRef={sceneRef} />
        </div>
      </section>
      <section className="page-shell__next-section" aria-label="Nächste Section" />
    </>
  );
}

export default PortfolioTransitionScene;
