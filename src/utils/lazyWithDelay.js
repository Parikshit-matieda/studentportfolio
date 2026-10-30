import React from 'react';

/**
 * Utility to introduce a minimum delay to dynamic imports.
 * Prevents the "flash of loading content" (flicker) on ultra-fast networks
 * when a chunk downloads in under 50ms.
 * 
 * @param {Function} importFunc - The dynamic import function, e.g. () => import('./components/Projects')
 * @param {number} delay - Minimum duration in ms (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithDelay(importFunc, delay = 300) {
  return React.lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, delay))
    ]).then(([moduleExports]) => moduleExports)
  );
}

export default lazyWithDelay;
