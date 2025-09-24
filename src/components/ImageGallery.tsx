import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { PostImage } from "../types";
import OptimizedImage from "./OptimizedImage";

interface ImageGalleryProps {
  images: PostImage[];
  maxDisplay?: number;
  className?: string;
  onImageClick?: (index: number) => void;
}

export default function ImageGallery({
  images,
  maxDisplay = 9,
  className = "",
  onImageClick,
}: ImageGalleryProps) {
  const [showAll, setShowAll] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const displayImages = showAll ? images : images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  // 根据图片数量决定布局
  const getLayoutConfig = (count: number) => {
    switch (count) {
      case 1:
        return {
          containerClass: "grid grid-cols-1",
          imageClass: "aspect-[4/3] w-full",
        };
      case 2:
        return {
          containerClass: "grid grid-cols-2 gap-1",
          imageClass: "aspect-square w-full",
        };
      case 3:
        return {
          containerClass: "grid grid-cols-2 gap-1",
          imageClass: (index: number) =>
            index === 0
              ? "col-span-2 aspect-[2/1] w-full"
              : "aspect-square w-full",
        };
      case 4:
        return {
          containerClass: "grid grid-cols-2 gap-1",
          imageClass: "aspect-square w-full",
        };
      case 5:
        return {
          containerClass: "grid grid-cols-3 gap-1",
          imageClass: (index: number) =>
            index < 2
              ? "aspect-square w-full"
              : index === 2
                ? "col-span-1 row-span-2 aspect-[1/2] w-full"
                : "aspect-square w-full",
        };
      case 6:
        return {
          containerClass: "grid grid-cols-3 gap-1",
          imageClass: "aspect-square w-full",
        };
      default:
        return {
          containerClass: "grid grid-cols-3 gap-1",
          imageClass: "aspect-square w-full",
        };
    }
  };

  const layoutConfig = getLayoutConfig(
    Math.min(displayImages.length, maxDisplay)
  );

  return (
    <div className={`relative w-full ${className}`}>
      <div className={layoutConfig.containerClass}>
        {displayImages.map((image, index) => {
          const isLastInGrid = index === maxDisplay - 1 && remainingCount > 0;
          const imageClass =
            typeof layoutConfig.imageClass === "function"
              ? layoutConfig.imageClass(index)
              : layoutConfig.imageClass;

          return (
            <button
              className="relative cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90"
              key={image.id}
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                onImageClick?.(index);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onImageClick?.(index);
                }
              }}
              type="button"
            >
              <OptimizedImage
                className={`${imageClass} object-cover`}
                image={image}
              />

              {/* 显示剩余图片数量 */}
              {isLastInGrid && !showAll && (
                <button
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 transition-colors hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setShowAll(true);
                    }
                  }}
                  type="button"
                >
                  <Badge className="rounded-full bg-white/90 px-4 py-2 font-semibold text-black text-lg">
                    +{remainingCount}
                  </Badge>
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* 收起按钮 */}
      {showAll && images.length > maxDisplay && (
        <div className="mt-2 text-center">
          <button
            className="text-gray-500 text-sm transition-colors hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(false);
            }}
            type="button"
          >
            收起
          </button>
        </div>
      )}
    </div>
  );
}
