import { useState, useEffect } from 'react';
import { PostImage } from '../types';

interface SafeOptimizedImageProps {
    image: PostImage;
    width?: number;
    height?: number;
    className?: string;
    onClick?: () => void;
}

// OSS图片缩放参数生成
const generateOSSParams = (originalWidth: number, originalHeight: number, targetWidth: number) => {
    // 计算等比例缩放后的高度
    const targetHeight = Math.round((originalHeight / originalWidth) * targetWidth);

    // 阿里云OSS图片处理参数
    // 使用resize,w_xxx,h_xxx,m_lfit来等比例缩放
    return `?x-oss-process=image/resize,w_${targetWidth},h_${targetHeight},m_lfit/quality,q_80/format,webp`;
};

export default function SafeOptimizedImage({
    image,
    width,
    height,
    className = '',
    onClick
}: SafeOptimizedImageProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 如果没有指定宽度，使用响应式
    const isResponsive = !width && !height;
    const targetWidth = width || 400;

    // 生成缩放后的图片URL
    const optimizedUrl = image.url + generateOSSParams(image.width, image.height, targetWidth);

    useEffect(() => {
        // 预加载图片
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageError(true);
        img.src = optimizedUrl;
    }, [optimizedUrl]);

    const containerStyle = isResponsive ? {} : {
        width: width || 'auto',
        height: height || Math.round((image.height / image.width) * targetWidth)
    };

    return (
        <div
            className={`relative overflow-hidden ${className} ${isResponsive ? 'w-full h-full' : ''}`}
            style={containerStyle}
            onClick={onClick}
        >
            {/* 简单的占位符 */}
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* 实际图片 */}
            {!imageError && (
                <img
                    src={optimizedUrl}
                    alt={image.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}

            {/* 错误状态 */}
            {imageError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">图片加载失败</div>
                </div>
            )}
        </div>
    );
}