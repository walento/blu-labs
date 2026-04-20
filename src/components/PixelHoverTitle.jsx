import { useEffect, useRef } from 'react';
import { createPixelHoverTextEffect } from './createPixelHoverTextEffect';
import './PixelHoverTitle.css';

function PixelHoverTitle({ text, className = '', titleRef }) {
  const rootRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const textNode = textRef.current;

    if (!root || !textNode) {
      return undefined;
    }

    return createPixelHoverTextEffect(root, textNode, text);
  }, [text]);

  return (
    <div className={`pixel-hover-title ${className}`.trim()} ref={rootRef}>
      <h1
        className="pixel-hover-title__text"
        ref={(node) => {
          textRef.current = node;

          if (titleRef) {
            titleRef.current = node;
          }
        }}
      >
        {text}
      </h1>
    </div>
  );
}

export default PixelHoverTitle;
