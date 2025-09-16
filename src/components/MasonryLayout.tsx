import { ReactNode, useEffect, useState, useRef } from 'react';

interface MasonryLayoutProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
  className?: string;
}

export default function MasonryLayout({ 
  children, 
  columns = 3, 
  gap = 16, 
  className = '' 
}: MasonryLayoutProps) {
  return (
    <div 
      className={`w-full ${className}`}
      style={{ 
        columnCount: columns,
        columnGap: `${gap}px`,
        columnFill: 'balance'
      }}
    >
      {children.map((child, index) => (
        <div 
          key={index} 
          className="break-inside-avoid mb-4 w-full"
          style={{ 
            display: 'inline-block',
            width: '100%'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}