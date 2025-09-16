import { useState, useEffect } from 'react';
import { PostImage } from '../types';

interface UniversalImageProps {
    image: PostImage;
    className?: string;
    onClick?: () => void;
}

export default function UniversalImage({
    image,
    className = '',
    onClick
}: UniversalImageProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        console.log('UniversalImage - 图片信息:', {
            url: image.url,
            name: image.name,
            width: image.width,
            height: image.height
        });
    }, [image]);

    const handleLoad = () => {
        console.log('UniversalImage - 图片加载成功:', image.url);
        setImageLoaded(true);
    };

    const handleError = (e: any) => {
        console.error('UniversalImage - 图片加载失败:', image.url, e);
        setImageError(true);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onClick={onClick}
        >
            {/* 加载占位符 */}
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* 实际图片 */}
            {!imageError && (
                <img
                    src={image.url}
                    alt={image.name || '图片'}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleLoad}
                    onError={handleError}
                    crossOrigin="anonymous"
                />
            )}

            {/* 错误状态 */}
            {imageError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-2xl mb-2">📷</div>
                        <div className="text-sm">图片加载失败</div>
                        <div className="text-xs mt-1 text-gray-400 max-w-32 truncate">
                            {image.url}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}