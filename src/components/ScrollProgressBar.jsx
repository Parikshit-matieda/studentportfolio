import React, { useState, useEffect } from 'react';

/**
 * Optimized ScrollProgressBar:
 * Isolates scroll state updates so the entire root <App /> and its child
 * tree do NOT re-render on every scroll event (60-120fps).
 * Profiler verified optimization!
 */
function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY || window.pageYOffset;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="scroll-progress-bar" 
      style={{ width: `${scrollProgress}%` }}
      aria-hidden="true"
    />
  );
}

export default React.memo(ScrollProgressBar);
