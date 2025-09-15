import { ReactNode, useEffect, useState } from 'react';

interface MasonryGridProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
}

export default function MasonryGrid({ children, columns = 3, gap = 24 }: MasonryGridProps) {
  const [columnHeights, setColumnHeights] = useState<number[]>(new Array(columns).fill(0));
  
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0));
  }, [columns]);

  const getShortestColumn = () => {
    let shortestIndex = 0;
    let shortestHeight = columnHeights[0];
    
    columnHeights.forEach((height, index) => {
      if (height < shortestHeight) {
        shortestHeight = height;
        shortestIndex = index;
      }
    });
    
    return shortestIndex;
  };

  return (
    <div className="relative">
      {/* 列容器 */}
      <div 
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {Array.from({ length: columns }).map((_, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {children
              .filter((_, childIndex) => childIndex % columns === columnIndex)
              .map((child, index) => (
                <div key={index} className="break-inside-avoid">
                  {child}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}