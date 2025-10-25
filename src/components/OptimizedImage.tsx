import { useEffect, useState } from "react";
import { Blurhash } from "react-blurhash";
import type { PostImage } from "../types";
import { isValidBlurhash } from "../utils/blurhash";

interface OptimizedImageProps {
  image: PostImage;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

// OSS图片缩放参数生成
const generateOssParams = (
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
) => {
  // 计算等比例缩放后的高度
  const targetHeight = Math.round(
    (originalHeight / originalWidth) * targetWidth
  );

  // 阿里云OSS图片处理参数
  // 使用resize,w_xxx,h_xxx,m_lfit来等比例缩放
  return `?x-oss-process=image/resize,w_${targetWidth},h_${targetHeight},m_lfit/quality,q_60/format,webp`;
};

export default function OptimizedImage({
  image,
  width,
  height,
  className = "",
  onClick,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 如果没有指定宽度，使用响应式
  const isResponsive = !(width || height);
  const targetWidth = width || 400;

  // 生成缩放后的图片URL
  const optimizedUrl =
    image.url + generateOssParams(image.width, image.height, targetWidth);

  useEffect(() => {
    // 预加载图片
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = optimizedUrl;
  }, [optimizedUrl]);

  const containerStyle = isResponsive
    ? {}
    : {
        width: width || "auto",
        height:
          height || Math.round((image.height / image.width) * targetWidth),
      };

  return (
    <div
      className={`relative overflow-hidden ${className} ${isResponsive ? "h-full w-full" : ""}`}
      onClick={onClick}
      style={containerStyle}
    >
      {/* Blurhash占位符 */}
      {!(imageLoaded || imageError) && (
        <div className="absolute inset-0">
          {isValidBlurhash(image.blurhash) ? (
            <Blurhash
              className="h-full w-full"
              hash={image.blurhash}
              height="100%"
              punch={1}
              resolutionX={32}
              resolutionY={32}
              width="100%"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>
      )}

      {/* 实际图片 */}
      {!imageError && (
        <img
          alt={image.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          src={optimizedUrl}
        />
      )}

      {/* 错误状态 */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-gray-400 text-sm">图片加载失败</div>
        </div>
      )}

      {/* 加载指示器 */}
      {!(imageLoaded || imageError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
