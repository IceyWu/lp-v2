import { useEffect } from 'react';
import { useImageViewer } from '../hooks/useImageViewer';
import { PostImage } from '../types';
import type { ImageObj } from '../hooks/useImageViewer';

interface ImagePreviewProps {
    images: PostImage[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImagePreview({ images, initialIndex, isOpen, onClose }: ImagePreviewProps) {
    const { 
        initWithPostImages, 
        openPreview, 
        closePreview
    } = useImageViewer({
        onImageLoad: (imgObj: ImageObj, idx: number) => {
            console.log('图片加载完成:', imgObj, idx)
        }
    });

    // 当图片列表变化时更新viewer
    useEffect(() => {
        if (images.length > 0) {
            initWithPostImages(images);
        }
    }, [images, initWithPostImages]);

    // 当打开状态或初始索引变化时控制viewer
    useEffect(() => {
        if (isOpen && images.length > 0) {
            // 延迟一点打开，确保viewer已经初始化
            const timer = setTimeout(() => {
                openPreview(initialIndex);
            }, 100);
            return () => clearTimeout(timer);
        } else if (!isOpen) {
            closePreview();
        }
    }, [isOpen, initialIndex, images.length, openPreview, closePreview]);

    // 监听viewer的关闭事件
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // viewer-pro 会创建自己的DOM结构，这里不需要返回可见的JSX
    return null;
}