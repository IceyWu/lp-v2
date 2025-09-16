import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    X, Heart, MessageCircle, Bookmark, MapPin,
    Send, Share2, User, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import SafeOptimizedImage from './SafeOptimizedImage';
import { useTopicDetail, useComments, useCreateComment } from '../hooks/useTopicDetail';
import { useIsAuthenticated } from '../hooks/useAuth';

interface SimpleModernDetailProps {
    topicId: number;
    isOpen: boolean;
    onClose: () => void;
    onLike?: (postId: string) => void;
    onSave?: (postId: string) => void;
}

export default function SimpleModernDetail({
    topicId,
    isOpen,
    onClose,
    onLike,
    onSave
}: SimpleModernDetailProps) {
    const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
    const [commentText, setCommentText] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { isAuthenticated, user } = useIsAuthenticated();
    const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
    const { data: comments, isLoading: commentsLoading } = useComments(topicId);
    const createCommentMutation = useCreateComment();

    // 键盘快捷键
    useHotkeys('esc', onClose, { enabled: isOpen });

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

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner size="lg" />
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
                        <p className="text-red-600 mb-4">加载失败</p>
                        <Button onClick={() => window.location.reload()}>重试</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-5xl max-h-[85vh] p-0 gap-0 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 h-[80vh]">
                        {/* 左侧：图片区域 */}
                        {topic.images.length > 0 && (
                            <div className="lg:col-span-2 relative bg-black overflow-hidden">
                                <ErrorBoundary>
                                    <div className="relative w-full h-full">
                                        <motion.div
                                            key={currentImageIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full h-full cursor-pointer"
                                            onClick={() => handleImageClick(currentImageIndex)}
                                        >
                                            <SafeOptimizedImage
                                                image={topic.images[currentImageIndex]}
                                                className="w-full h-full object-contain"
                                            />
                                        </motion.div>

                                        {/* 图片导航 */}
                                        {topic.images.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                                    onClick={prevImage}
                                                >
                                                    <ChevronLeft size={20} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                                    onClick={nextImage}
                                                >
                                                    <ChevronRight size={20} />
                                                </Button>

                                                {/* 图片指示器 */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {topic.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                                }`}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                        />
                                                    ))}
                                                </div>

                                                {/* 图片计数 */}
                                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                    {currentImageIndex + 1} / {topic.images.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </ErrorBoundary>
                            </div>
                        )}

                        {/* 右侧：内容区域 */}
                        <div className="flex flex-col h-full bg-white">
                            {/* 头部 */}
                            <DialogHeader className="p-4 pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={topic.author.avatar} alt={topic.author.name} />
                                            <AvatarFallback>
                                                <User size={18} />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <DialogTitle className="text-base font-semibold">
                                                {topic.author.name}
                                            </DialogTitle>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock size={12} />
                                                {formatTime(topic.createdAt)}
                                                {topic.location && (
                                                    <>
                                                        <span>•</span>
                                                        <MapPin size={12} />
                                                        {topic.location}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="ghost" size="sm">
                                        <Share2 size={16} />
                                    </Button>
                                </div>
                            </DialogHeader>

                            {/* 内容区域 */}
                            <ScrollArea className="flex-1 px-4">
                                <div className="py-4 space-y-4">
                                    {/* 标题和内容 */}
                                    <div>
                                        <h2 className="font-bold text-lg mb-2">{topic.title}</h2>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {topic.content}
                                        </p>
                                    </div>

                                    {/* 标签 */}
                                    {topic.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {topic.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <Separator />

                                    {/* 互动按钮 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`flex items-center gap-1 ${topic.isLiked ? 'text-red-500 hover:text-red-600' : ''
                                                    }`}
                                                onClick={() => onLike?.(topic.id)}
                                            >
                                                <Heart size={16} className={topic.isLiked ? 'fill-current' : ''} />
                                                <span className="text-sm">{topic.likes}</span>
                                            </Button>

                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                                <MessageCircle size={16} />
                                                <span className="text-sm">{comments?.length || 0}</span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`flex items-center gap-1 ${topic.isSaved ? 'text-amber-600 hover:text-amber-700' : ''
                                                    }`}
                                                onClick={() => onSave?.(topic.id)}
                                            >
                                                <Bookmark size={16} className={topic.isSaved ? 'fill-current' : ''} />
                                                <span className="text-sm">{topic.saves}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* 评论区域 */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm">评论</h3>

                                        {/* 评论输入 */}
                                        {isAuthenticated ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="写下你的评论..."
                                                    className="min-h-[60px] text-sm resize-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                            e.preventDefault();
                                                            handleSubmitComment();
                                                        }
                                                    }}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">
                                                        Cmd/Ctrl + Enter 发送
                                                    </span>
                                                    <Button
                                                        onClick={handleSubmitComment}
                                                        disabled={!commentText.trim() || createCommentMutation.isPending}
                                                        size="sm"
                                                    >
                                                        {createCommentMutation.isPending ? (
                                                            <LoadingSpinner size="sm" />
                                                        ) : (
                                                            <>
                                                                <Send size={12} className="mr-1" />
                                                                发送
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 text-muted-foreground text-sm">
                                                登录后可以发表评论
                                            </div>
                                        )}

                                        {/* 评论列表 */}
                                        <div className="space-y-3">
                                            {commentsLoading ? (
                                                <div className="text-center py-4">
                                                    <LoadingSpinner size="sm" />
                                                </div>
                                            ) : comments && comments.length > 0 ? (
                                                <AnimatePresence>
                                                    {comments.map((comment: any, index: number) => (
                                                        <motion.div
                                                            key={comment.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="flex gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                        >
                                                            <Avatar className="w-6 h-6">
                                                                <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
                                                                <AvatarFallback>
                                                                    <User size={12} />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-xs truncate">{comment.user?.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatTime(comment.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground break-words">{comment.content}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            ) : (
                                                <div className="text-center py-6 text-muted-foreground">
                                                    <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">暂无评论</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 图片预览 */}
            {imagePreviewIndex >= 0 && (
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