import { useRef } from 'react';
import ExpertiseTransitionTitle from './ExpertiseTransitionTitle';
import './ExpertiseSection.css';

function ExpertiseSection() {
  const sceneRef = useRef(null);

  return (
    <section className="expertise-section" ref={sceneRef} aria-label="Expertise">
      <div className="expertise-section__sticky">
        <ExpertiseTransitionTitle sceneRef={sceneRef} />
      </div>
    </section>
  );
}

export default ExpertiseSection;
