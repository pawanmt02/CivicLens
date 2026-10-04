import React from 'react';

export default function GooeyFilter() {
  return (
    <svg className="fixed w-0 h-0 pointer-events-none -z-50" aria-hidden="true">
      <defs>
        {/* Gooey Liquid Meniscus Matrix Filter for organic mercury-like fluid transitions */}
        <filter id="gooey-meniscus-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix 
            in="blur" 
            mode="matrix" 
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 22 -9" 
            result="goo" 
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>

        {/* Lightweight subtle gooey for tabs and buttons */}
        <filter id="gooey-subtle-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix 
            in="blur" 
            mode="matrix" 
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 18 -7" 
            result="goo" 
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}
