import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import OptimizedImage from './OptimizedImage';
import { PostImage } from '../types';

interface ImageGalleryProps {
  images: PostImage[];
  maxDisplay?: number;
  className?: string;
  onImageClick?: (index: number) => void;
}

export default function ImageGallery({ 
  images, 
  maxDisplay = 9, 
  className = '',
  onImageClick
}: ImageGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (images.length === 0) return null;

  const displayImages = showAll ? images : images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  // 根据图片数量决定布局
  const getLayoutConfig = (count: number) => {
    switch (count) {
      case 1:
        return { 
          containerClass: 'grid grid-cols-1',
          imageClass: 'aspect-[4/3] w-full'
        };
      case 2:
        return { 
          containerClass: 'grid grid-cols-2 gap-1',
          imageClass: 'aspect-square w-full'
        };
      case 3:
        return { 
          containerClass: 'grid grid-cols-2 gap-1',
          imageClass: (index: number) => 
            index === 0 ? 'col-span-2 aspect-[2/1] w-full' : 'aspect-square w-full'
        };
      case 4:
        return { 
          containerClass: 'grid grid-cols-2 gap-1',
          imageClass: 'aspect-square w-full'
        };
      case 5:
        return { 
          containerClass: 'grid grid-cols-3 gap-1',
          imageClass: (index: number) => 
            index < 2 ? 'aspect-square w-full' : 
            index === 2 ? 'col-span-1 row-span-2 aspect-[1/2] w-full' : 'aspect-square w-full'
        };
      case 6:
        return { 
          containerClass: 'grid grid-cols-3 gap-1',
          imageClass: 'aspect-square w-full'
        };
      default:
        return { 
          containerClass: 'grid grid-cols-3 gap-1',
          imageClass: 'aspect-square w-full'
        };
    }
  };

  const layoutConfig = getLayoutConfig(Math.min(displayImages.length, maxDisplay));

  return (
    <div className={`relative w-full ${className}`}>
      <div className={layoutConfig.containerClass}>
        {displayImages.map((image, index) => {
          const isLastInGrid = index === maxDisplay - 1 && remainingCount > 0;
          const imageClass = typeof layoutConfig.imageClass === 'function' 
            ? layoutConfig.imageClass(index) 
            : layoutConfig.imageClass;
          
          return (
            <div 
              key={image.id} 
              className="relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                onImageClick?.(index);
              }}
            >
              <OptimizedImage
                image={image}
                className={`${imageClass} object-cover`}
              />
              
              {/* 显示剩余图片数量 */}
              {isLastInGrid && !showAll && (
                <div 
                  className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                  }}
                >
                  <Badge className="bg-white/90 text-black text-lg px-4 py-2 rounded-full font-semibold">
                    +{remainingCount}
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 收起按钮 */}
      {showAll && images.length > maxDisplay && (
        <div className="mt-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(false);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            收起
          </button>
        </div>
      )}
    </div>
  );
}