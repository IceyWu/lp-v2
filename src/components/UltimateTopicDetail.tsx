import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    Heart, MessageCircle, Bookmark, MapPin, Send, Share2,
    User, Clock, Eye, MoreHorizontal, Sparkles, TrendingUp,
    Award, X, ChevronDown, Play, Pause
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
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";

import ImagePreview from './ImagePreview';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import SafeOptimizedImage from './SafeOptimizedImage';
import { useTopicDetail, useComments, useCreateComment } from '../hooks/useTopicDetail';
import { useIsAuthenticated } from '../hooks/useAuth';

interface UltimateTopicDetailProps {
    topicId: number;
    isOpen: boolean;
    onClose: () => void;
    onLike?: (postId: string) => void;
    onSave?: (postId: string) => void;
}

export default function UltimateTopicDetail({
    topicId,
    isOpen,
    onClose,
    onLike,
    onSave
}: UltimateTopicDetailProps) {
    const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
    const [commentText, setCommentText] = useState('');
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    const [showFloatingHearts, setShowFloatingHearts] = useState(false);
    const [isContentExpanded, setIsContentExpanded] = useState(false);
    const [isAutoplayActive, setIsAutoplayActive] = useState(true);
    const [autoplayPlugin] = useState(() =>
        Autoplay({ delay: 4000, stopOnInteraction: false })
    );

    const { isAuthenticated, user } = useIsAuthenticated();
    const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
    const { data: comments, isLoading: commentsLoading } = useComments(topicId);
    const createCommentMutation = useCreateComment();

    // 键盘快捷键
    useHotkeys('esc', onClose, { enabled: isOpen });
    useHotkeys('space', () => toggleAutoplay(), { enabled: isOpen, preventDefault: true });

    // 监听轮播图变化
    useEffect(() => {
        if (!carouselApi) return;

        const onSelect = () => {
            setCurrentImageIndex(carouselApi.selectedScrollSnap());
        };

        carouselApi.on('select', onSelect);
        onSelect(); // 初始化

        return () => {
            carouselApi.off('select', onSelect);
        };
    }, [carouselApi]);

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

    const handleLike = useCallback(() => {
        if (!topic) return;
        setIsLikeAnimating(true);
        setShowFloatingHearts(true);
        onLike?.(topic.id);

        setTimeout(() => {
            setIsLikeAnimating(false);
            setShowFloatingHearts(false);
        }, 1000);
    }, [topic, onLike]);

    const handleSubmitComment = useCallback(() => {
        if (!commentText.trim() || !isAuthenticated) return;

        createCommentMutation.mutate({
            topicId,
            content: commentText.trim(),
        }, {
            onSuccess: () => {
                setCommentText('');
            }
        });
    }, [commentText, isAuthenticated, createCommentMutation, topicId]);

    const toggleAutoplay = () => {
        if (!autoplayPlugin) return;

        if (isAutoplayActive) {
            autoplayPlugin.stop();
        } else {
            autoplayPlugin.play();
        }
        setIsAutoplayActive(!isAutoplayActive);
    };

    // 获取热度等级
    const getPopularityLevel = (likes: number, comments: number) => {
        const score = likes + comments * 2;
        if (score > 100) return {
            level: 'hot',
            color: 'from-red-500 via-orange-500 to-yellow-500',
            icon: TrendingUp,
            text: '🔥 超热门',
            glow: 'shadow-glow-red'
        };
        if (score > 50) return {
            level: 'popular',
            color: 'from-orange-500 via-yellow-500 to-red-400',
            icon: Award,
            text: '⭐ 热门',
            glow: 'shadow-glow-orange'
        };
        if (score > 20) return {
            level: 'rising',
            color: 'from-blue-500 via-purple-500 to-pink-500',
            icon: Sparkles,
            text: '✨ 上升中',
            glow: 'shadow-glow-blue'
        };
        return null;
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-7xl max-h-[95vh] bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                    <div className="flex items-center justify-center py-32">
                        <div className="text-center space-y-8">
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 mx-auto"
                                >
                                    <div className="w-full h-full border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full"></div>
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-b-pink-500 border-l-indigo-500 rounded-full"
                                />
                            </div>
                            <div className="space-y-3">
                                <motion.h3
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-xl font-bold text-gradient-blue"
                                >
                                    正在加载精彩内容
                                </motion.h3>
                                <p className="text-sm text-gray-500">请稍候片刻，好内容值得等待...</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !topic) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md bg-white">
                    <div className="text-center py-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center"
                        >
                            <span className="text-3xl">😕</span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">内容加载失败</h3>
                            <p className="text-gray-600 mb-6">抱歉，无法加载此内容</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover-lift"
                            >
                                重新加载
                            </Button>
                        </motion.div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const popularityInfo = getPopularityLevel(topic.likes, comments?.length || 0);
    const shouldTruncateContent = topic.content.length > 200;
    const displayContent = shouldTruncateContent && !isContentExpanded
        ? topic.content.slice(0, 200) + '...'
        : topic.content;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden bg-white shadow-2xl">
                    <motion.