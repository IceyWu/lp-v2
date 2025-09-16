import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    Heart, MessageCircle, Bookmark, MapPin, Send, Share2,
    User, Clock, ChevronLeft, ChevronRight, Eye, MoreHorizontal,
    Sparkles, TrendingUp, Award
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import ImagePreview from './ImagePreview';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { useTopicDetail, useComments, useCreateComment } from '../hooks/useTopicDetail';
import { useIsAuthenticated } from '../hooks/useAuth';

interface SimpleImageDetailProps {
    topicId: number;
    isOpen: boolean;
    onClose: () => void;
    onLike?: (postId: string) => void;
    onSave?: (postId: string) => void;
}

// 简单的图片组件
const SimpleImage = ({ src, alt, className, onClick }: {
    src: string;
    alt?: string;
    className?: string;
    onClick?: () => void;
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative ${className}`} onClick={onClick}>
            {!loaded && !error && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {!error && (
                <img
                    src={src}
                    alt={alt || '图片'}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                />
            )}

            {error && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-500 text-sm">图片加载失败</div>
                </div>
            )}
        </div>
    );
};

export default function SimpleImageDetail({
    topicId,
    isOpen,
    onClose,
    onLike,
    onSave
}: SimpleImageDetailProps) {
    const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
    const [commentText, setCommentText] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    const [showFloatingHearts, setShowFloatingHearts] = useState(false);

    const { isAuthenticated, user } = useIsAuthenticated();
    const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
    const { data: comments, isLoading: commentsLoading } = useComments(topicId);
    const createCommentMutation = useCreateComment();

    // 键盘快捷键
    useHotkeys('esc', onClose, { enabled: isOpen });
    useHotkeys('left', () => prevImage(), { enabled: isOpen });
    useHotkeys('right', () => nextImage(), { enabled: isOpen });

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return '刚刚';
        if (hours < 24) return `${hours}小时前`;
        if (hours < 48) return '昨天';
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    const handleImageClick = (index: number) => {
        setImagePreviewIndex(index);
    };

    const handleLike = () => {
        if (!topic) return;
        setIsLikeAnimating(true);
        setShowFloatingHearts(true);
        onLike?.(topic.id);

        setTimeout(() => {
            setIsLikeAnimating(false);
            setShowFloatingHearts(false);
        }, 1000);
    };

    const handleSubmitComment = () => {
        if (!commentText.trim() || !isAuthenticated) return;

        createCommentMutation.mutate({
            topicId,
            content: commentText.trim(),
        }, {
            onSuccess: () => {
                setCommentText('');
            }
        });
    };

    const nextImage = () => {
        if (topic && topic.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % topic.images.length);
        }
    };

    const prevImage = () => {
        if (topic && topic.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + topic.images.length) % topic.images.length);
        }
    };

    // 获取热度等级
    const getPopularityLevel = (likes: number, comments: number) => {
        const score = likes + comments * 2;
        if (score > 100) return { level: 'hot', color: 'text-red-500', icon: TrendingUp };
        if (score > 50) return { level: 'popular', color: 'text-orange-500', icon: Award };
        if (score > 20) return { level: 'rising', color: 'text-blue-500', icon: Sparkles };
        return null;
    };

    // 调试：打印数据
    console.log('Topic data:', topic);
    console.log('Images:', topic?.images);

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-4">
                            <LoadingSpinner size="lg" />
                            <p className="text-muted-foreground animate-pulse">正在加载精彩内容...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !topic) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-2xl">😕</span>
                        </div>
                        <p className="text-red-600 mb-4">内容加载失败</p>
                        <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                            重新加载
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const popularityInfo = getPopularityLevel(topic.likes, comments?.length || 0);
    const hasImages = topic.images && topic.images.length > 0;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                    <div className={`grid ${hasImages ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'} h-[85vh]`}>
                        {/* 左侧：图片区域 */}
                        {hasImages && (
                            <div className="lg:col-span-3 relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                                <ErrorBoundary>
                                    <div className="relative w-full h-full">
                                        <motion.div
                                            key={currentImageIndex}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="w-full h-full cursor-pointer group"
                                            onClick={() => handleImageClick(currentImageIndex)}
                                        >
                                            <SimpleImage
                                                src={topic.images[currentImageIndex]?.url || ''}
                                                alt={topic.images[currentImageIndex]?.name}
                                                className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* 悬浮提示 */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    whileHover={{ opacity: 1, scale: 1 }}
                                                    className="bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Eye size={24} className="text-white" />
                                                </motion.div>
                                            </div>
                                        </motion.div>

                                        {/* 图片导航 */}
                                        {topic.images.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10"
                                                    onClick={prevImage}
                                                >
                                                    <ChevronLeft size={24} />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10"
                                                    onClick={nextImage}
                                                >
                                                    <ChevronRight size={24} />
                                                </Button>

                                                {/* 图片指示器 */}
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                                    {topic.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                                                                    ? 'bg-white shadow-lg'
                                                                    : 'bg-white/50 hover:bg-white/70'
                                                                }`}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                        />
                                                    ))}
                                                </div>

                                                {/* 图片计数 */}
                                                <div className="absolute top-6 right-6 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium z-10">
                                                    {currentImageIndex + 1} / {topic.images.length}
                                                </div>
                                            </>
                                        )}

                                        {/* 热度标识 */}
                                        {popularityInfo && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute top-6 left-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg"
                                            >
                                                <popularityInfo.icon size={12} />
                                                热门
                                            </motion.div>
                                        )}
                                    </div>
                                </ErrorBoundary>
                            </div>
                        )}

                        {/* 右侧：内容区域 */}
                        <div className={`${hasImages ? 'lg:col-span-2' : 'col-span-1'} flex flex-col h-full bg-white/80 backdrop-blur-sm`}>
                            {/* 头部 */}
                            <div className="p-6 pb-4 border-b border-gray-200/50 bg-gradient-to-r from-white to-blue-50/30">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="relative"
                                        >
                                            <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                                                <AvatarImage src={topic.author.avatar} alt={topic.author.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    <User size={20} />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{topic.author.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock size={14} />
                                                {formatTime(topic.createdAt)}
                                                {topic.location && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <MapPin size={14} />
                                                        <span className="text-blue-600">{topic.location}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                                                <Share2 size={16} />
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            {/* 内容区域 */}
                            <ScrollArea className="flex-1 px-6">
                                <div className="py-6 space-y-6">
                                    {/* 标题和内容 */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <h1 className="font-bold text-xl mb-3 text-gray-900 leading-tight">{topic.title}</h1>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                                            {topic.content}
                                        </p>
                                    </motion.div>

                                    {/* 标签 */}
                                    {topic.tags.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex flex-wrap gap-2"
                                        >
                                            {topic.tags.map((tag, index) => (
                                                <motion.div
                                                    key={index}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all cursor-pointer"
                                                    >
                                                        #{tag}
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}

                                    <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                                    {/* 互动按钮 */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="relative"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`flex items-center gap-2 transition-all duration-300 ${topic.isLiked
                                                            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
                                                            : 'hover:text-red-500 hover:bg-red-50'
                                                        }`}
                                                    onClick={handleLike}
                                                >
                                                    <motion.div
                                                        animate={isLikeAnimating ? { scale: [1, 1.3, 1] } : {}}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <Heart
                                                            size={18}
                                                            className={`transition-all ${topic.isLiked ? 'fill-current' : ''}`}
                                                        />
                                                    </motion.div>
                                                    <span className="font-medium">{topic.likes}</span>
                                                </Button>

                                                {/* 浮动爱心动画 */}
                                                <AnimatePresence>
                                                    {showFloatingHearts && (
                                                        <motion.div
                                                            initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                                            animate={{ opacity: 0, y: -30, scale: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 1 }}
                                                            className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
                                                        >
                                                            <Heart size={16} className="text-red-500 fill-current" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-50">
                                                    <MessageCircle size={18} />
                                                    <span className="font-medium">{comments?.length || 0}</span>
                                                </Button>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`flex items-center gap-2 transition-all ${topic.isSaved
                                                            ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                            : 'hover:text-amber-600 hover:bg-amber-50'
                                                        }`}
                                                    onClick={() => onSave?.(topic.id)}
                                                >
                                                    <Bookmark size={18} className={topic.isSaved ? 'fill-current' : ''} />
                                                    <span className="font-medium">{topic.saves}</span>
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </motion.div>

                                    <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                                    {/* 评论区域 */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-gray-900">评论</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {comments?.length || 0}
                                            </Badge>
                                        </div>

                                        {/* 评论输入 */}
                                        {isAuthenticated ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-3 p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100"
                                            >
                                                <Textarea
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="分享你的想法..."
                                                    className="min-h-[80px] resize-none border-0 bg-white/70 backdrop-blur-sm focus:bg-white transition-all"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                            e.preventDefault();
                                                            handleSubmitComment();
                                                        }
                                                    }}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">
                                                        ⌘ + Enter 快速发送
                                                    </span>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            onClick={handleSubmitComment}
                                                            disabled={!commentText.trim() || createCommentMutation.isPending}
                                                            size="sm"
                                                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                                        >
                                                            {createCommentMutation.isPending ? (
                                                                <LoadingSpinner size="sm" />
                                                            ) : (
                                                                <>
                                                                    <Send size={14} className="mr-1.5" />
                                                                    发送
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200">
                                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <MessageCircle size={20} className="text-blue-600" />
                                                </div>
                                                <p className="text-gray-600 text-sm">登录后参与讨论</p>
                                            </div>
                                        )}

                                        {/* 评论列表 */}
                                        <div className="space-y-3">
                                            {commentsLoading ? (
                                                <div className="text-center py-8">
                                                    <LoadingSpinner size="sm" />
                                                    <p className="text-sm text-gray-500 mt-2">加载评论中...</p>
                                                </div>
                                            ) : comments && comments.length > 0 ? (
                                                <AnimatePresence>
                                                    {comments.map((comment: any, index: number) => (
                                                        <motion.div
                                                            key={comment.id}
                                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                                            whileHover={{ scale: 1.02 }}
                                                            className="flex gap-3 p-4 rounded-xl hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 border border-transparent hover:border-blue-100"
                                                        >
                                                            <Avatar className="w-8 h-8 ring-2 ring-blue-100">
                                                                <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                                                    <User size={14} />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="font-semibold text-sm text-gray-900 truncate">{comment.user?.name}</span>
                                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                        {formatTime(comment.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 break-words leading-relaxed">{comment.content}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl"
                                                >
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <MessageCircle size={24} className="text-blue-400" />
                                                    </div>
                                                    <p className="text-gray-500 text-sm">还没有评论，来抢沙发吧！</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 图片预览 */}
            {imagePreviewIndex >= 0 && topic.images && (
                <ImagePreview
                    images={topic.images}
                    initialIndex={imagePreviewIndex}
                    isOpen={imagePreviewIndex >= 0}
                    onClose={() => setImagePreviewIndex(-1)}
                />
            )}
        </>
    );
}