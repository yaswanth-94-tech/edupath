import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div 
      className="liquid-bg-blobs fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none" 
      aria-hidden="true"
    >
      {/* Aurora / Mesh Gradient Drifting Blobs */}
      <div className="liquid-blob-1" />
      <div className="liquid-blob-2" />
      <div className="liquid-blob-3" />
      
      {/* Dot Grid Pattern with Center Focus Radial Mask */}
      <div className="bg-grid-dots" />
      
      {/* Ultra-light SVG Fractal Noise Overlay to eliminate gradient banding */}
      <div className="bg-noise" />
    </div>
  );
};
