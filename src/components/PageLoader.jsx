import React from 'react';
import './PageLoader.css';

function PageLoader({ message = 'Loading component chunk...' }) {
  return (
    <div className="page-loader-wrapper" role="status" aria-live="polite">
      <div className="page-loader-card">
        {/* Animated glowing orbital spinner */}
        <div className="spinner-ring-container">
          <div className="spinner-ring"></div>
          <div className="spinner-ring-inner"></div>
          <div className="spinner-core-dot"></div>
        </div>

        {/* Loading status info */}
        <div className="page-loader-info">
          <div className="page-loader-badge">
            <span className="badge-pulse-dot"></span>
            <span>React.lazy() &amp; Suspense Fallback</span>
          </div>
          <h3 className="page-loader-title">{message}</h3>
          <p className="page-loader-subtext">
            Fetching code-split JavaScript bundle on-demand...
          </p>
        </div>

        {/* Simulated skeleton layout preview */}
        <div className="skeleton-preview-box">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-grid">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
