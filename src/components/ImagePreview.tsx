import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { PostImage } from '../types';

interface ImagePreviewProps {
    images: PostImage[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImagePreview({ images, initialIndex, isOpen, onClose }: ImagePreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // 锁定背景滚动
    useBodyScrollLock(isOpen);

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [initialIndex, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        resetTransform();
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        resetTransform();
    };

    const resetTransform = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev * 1.5, 5));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev / 1.5, 0.5));
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentImage.url;
        link.download = currentImage.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
            {/* 顶部工具栏 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 text-white">
                    <span className="text-sm">
                        {currentIndex + 1} / {images.length}
                    </span>
                    <span className="text-sm opacity-75">
                        {currentImage.width} × {currentImage.height}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="缩小"
                    >
                        <ZoomOut size={20} />
                    </button>

                    <span className="text-white text-sm min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={handleZoomIn}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="放大"
                    >
                        <ZoomIn size={20} />
                    </button>

                    <button
                        onClick={handleDownload}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="下载"
                    >
                        <Download size={20} />
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="关闭"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* 图片容器 */}
            <div
                className="relative w-full h-full flex items-center justify-center cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    src={currentImage.url}
                    alt={currentImage.name}
                    className="max-w-full max-h-full object-contain select-none"
                    style={{
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    }}
                    draggable={false}
                />
            </div>

            {/* 导航按钮 */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="上一张"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="下一张"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* 缩略图导航 */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => {
                                setCurrentIndex(index);
                                resetTransform();
                            }}
                            className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors ${index === currentIndex ? 'border-white' : 'border-transparent hover:border-white/50'
                                }`}
                        >
                            <img
                                src={image.url + '?x-oss-process=image/resize,w_48,h_48,m_fill'}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}