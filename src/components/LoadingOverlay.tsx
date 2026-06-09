import React from 'react';

export function LoadingOverlay({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="route-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="route-loader-inner">
        <div className="spinner" aria-hidden="true" />
        <span className="route-loader-label">{label}</span>
      </div>
    </div>
  );
}
