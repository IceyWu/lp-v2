import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useIsAuthenticated } from "../hooks/useAuth";
import {
  useComments,
  useCreateComment,
  useTopicDetail,
} from "../hooks/useTopicDetail";
import ErrorBoundary from "./ErrorBoundary";
import ImagePreview from "./ImagePreview";
import LoadingSpinner from "./LoadingSpinner";

interface SimpleImageDetailProps {
  topicId: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

// 简单的图片组件
const SimpleImage = ({
  src,
  alt,
  className,
  onClick,
}: {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {!(loaded || error) && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        </div>
      )}

      {!error && (
        <img
          alt={alt || "图片"}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
          src={src}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
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
  onSave,
}: SimpleImageDetailProps) {
  const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);

  const { isAuthenticated, user } = useIsAuthenticated();
  const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
  const { data: comments, isLoading: commentsLoading } = useComments(topicId);
  const createCommentMutation = useCreateComment();

  // 键盘快捷键
  useHotkeys("esc", onClose, { enabled: isOpen });
  useHotkeys("left", () => prevImage(), { enabled: isOpen });
  useHotkeys("right", () => nextImage(), { enabled: isOpen });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      return "刚刚";
    }
    if (hours < 24) {
      return `${hours}小时前`;
    }
    if (hours < 48) {
      return "昨天";
    }
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  const handleImageClick = (index: number) => {
    setImagePreviewIndex(index);
  };

  const handleLike = () => {
    if (!topic) {
      return;
    }
    setIsLikeAnimating(true);
    setShowFloatingHearts(true);
    onLike?.(topic.id);

    setTimeout(() => {
      setIsLikeAnimating(false);
      setShowFloatingHearts(false);
    }, 1000);
  };

  const handleSubmitComment = () => {
    if (!(commentText.trim() && isAuthenticated)) {
      return;
    }

    createCommentMutation.mutate(
      {
        topicId,
        content: commentText.trim(),
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const nextImage = () => {
    if (topic && topic.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % topic.images.length);
    }
  };

  const prevImage = () => {
    if (topic && topic.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + topic.images.length) % topic.images.length
      );
    }
  };

  // 获取热度等级
  const getPopularityLevel = (likes: number, comments: number) => {
    const score = likes + comments * 2;
    if (score > 100) {
      return { level: "hot", color: "text-red-500", icon: TrendingUp };
    }
    if (score > 50) {
      return { level: "popular", color: "text-orange-500", icon: Award };
    }
    if (score > 20) {
      return { level: "rising", color: "text-blue-500", icon: Sparkles };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Dialog onOpenChange={onClose} open={isOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center justify-center py-20">
            <div className="space-y-4 text-center">
              <LoadingSpinner size="lg" />
              <p className="animate-pulse text-muted-foreground">
                正在加载精彩内容...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !topic) {
    return (
      <Dialog onOpenChange={onClose} open={isOpen}>
        <DialogContent className="max-w-md">
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">😕</span>
            </div>
            <p className="mb-4 text-red-600">内容加载失败</p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => window.location.reload()}
            >
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
      <Dialog onOpenChange={onClose} open={isOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl gap-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-0">
          <div
            className={`grid ${hasImages ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"} h-[85vh]`}
          >
            {/* 左侧：图片区域 */}
            {hasImages && (
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black lg:col-span-3">
                <ErrorBoundary>
                  <div className="relative h-full w-full">
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      className="group h-full w-full cursor-pointer"
                      initial={{ opacity: 0, scale: 1.05 }}
                      key={currentImageIndex}
                      onClick={() => handleImageClick(currentImageIndex)}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <SimpleImage
                        alt={topic.images[currentImageIndex]?.name}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        src={topic.images[currentImageIndex]?.url || ""}
                      />

                      {/* 悬浮提示 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
                        <motion.div
                          className="rounded-full bg-white/20 p-3 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                        >
                          <Eye className="text-white" size={24} />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* 图片导航 */}
                    {topic.images.length > 1 && (
                      <>
                        <Button
                          className="-translate-y-1/2 absolute top-1/2 left-4 z-10 bg-black/50 text-white hover:bg-black/70"
                          onClick={prevImage}
                          size="icon"
                          variant="ghost"
                        >
                          <ChevronLeft size={24} />
                        </Button>

                        <Button
                          className="-translate-y-1/2 absolute top-1/2 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                          onClick={nextImage}
                          size="icon"
                          variant="ghost"
                        >
                          <ChevronRight size={24} />
                        </Button>

                        {/* 图片指示器 */}
                        <div className="-translate-x-1/2 absolute bottom-6 left-1/2 z-10 flex gap-2">
                          {topic.images.map((_, index) => (
                            <button
                              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                index === currentImageIndex
                                  ? "bg-white shadow-lg"
                                  : "bg-white/50 hover:bg-white/70"
                              }`}
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>

                        {/* 图片计数 */}
                        <div className="absolute top-6 right-6 z-10 rounded-full bg-black/60 px-3 py-1.5 font-medium text-sm text-white">
                          {currentImageIndex + 1} / {topic.images.length}
                        </div>
                      </>
                    )}

                    {/* 热度标识 */}
                    {popularityInfo && (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 font-medium text-white text-xs shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
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
            <div
              className={`${hasImages ? "lg:col-span-2" : "col-span-1"} flex h-full flex-col bg-white/80 backdrop-blur-sm`}
            >
              {/* 头部 */}
              <div className="border-gray-200/50 border-b bg-gradient-to-r from-white to-blue-50/30 p-6 pb-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                        <AvatarImage
                          alt={topic.author.name}
                          src={topic.author.avatar}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {topic.author.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock size={14} />
                        {formatTime(topic.createdAt)}
                        {topic.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <MapPin size={14} />
                            <span className="text-blue-600">
                              {topic.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="hover:bg-blue-50"
                        size="sm"
                        variant="ghost"
                      >
                        <Share2 size={16} />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="hover:bg-gray-50"
                        size="sm"
                        variant="ghost"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* 内容区域 */}
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                  {/* 标题和内容 */}
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h1 className="mb-3 font-bold text-gray-900 text-xl leading-tight">
                      {topic.title}
                    </h1>
                    <p className="whitespace-pre-wrap text-base text-gray-700 leading-relaxed">
                      {topic.content}
                    </p>
                  </motion.div>

                  {/* 标签 */}
                  {topic.tags.length > 0 && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.2 }}
                    >
                      {topic.tags.map((tag, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            className="cursor-pointer border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 transition-all hover:from-blue-100 hover:to-purple-100"
                            variant="secondary"
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
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-6">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`flex items-center gap-2 transition-all duration-300 ${
                            topic.isLiked
                              ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                              : "hover:bg-red-50 hover:text-red-500"
                          }`}
                          onClick={handleLike}
                          size="sm"
                          variant="ghost"
                        >
                          <motion.div
                            animate={
                              isLikeAnimating ? { scale: [1, 1.3, 1] } : {}
                            }
                            transition={{ duration: 0.3 }}
                          >
                            <Heart
                              className={`transition-all ${topic.isLiked ? "fill-current" : ""}`}
                              size={18}
                            />
                          </motion.div>
                          <span className="font-medium">{topic.likes}</span>
                        </Button>

                        {/* 浮动爱心动画 */}
                        <AnimatePresence>
                          {showFloatingHearts && (
                            <motion.div
                              animate={{ opacity: 0, y: -30, scale: 1 }}
                              className="-top-8 -translate-x-1/2 pointer-events-none absolute left-1/2"
                              exit={{ opacity: 0 }}
                              initial={{ opacity: 1, y: 0, scale: 0.5 }}
                              transition={{ duration: 1 }}
                            >
                              <Heart
                                className="fill-current text-red-500"
                                size={16}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
                          size="sm"
                          variant="ghost"
                        >
                          <MessageCircle size={18} />
                          <span className="font-medium">
                            {comments?.length || 0}
                          </span>
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`flex items-center gap-2 transition-all ${
                            topic.isSaved
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                              : "hover:bg-amber-50 hover:text-amber-600"
                          }`}
                          onClick={() => onSave?.(topic.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Bookmark
                            className={topic.isSaved ? "fill-current" : ""}
                            size={18}
                          />
                          <span className="font-medium">{topic.saves}</span>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  {/* 评论区域 */}
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">评论</h3>
                      <Badge className="text-xs" variant="outline">
                        {comments?.length || 0}
                      </Badge>
                    </div>

                    {/* 评论输入 */}
                    {isAuthenticated ? (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-4"
                        initial={{ opacity: 0, y: 10 }}
                      >
                        <Textarea
                          className="min-h-[80px] resize-none border-0 bg-white/70 backdrop-blur-sm transition-all focus:bg-white"
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              handleSubmitComment();
                            }
                          }}
                          placeholder="分享你的想法..."
                          value={commentText}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs">
                            ⌘ + Enter 快速发送
                          </span>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                              disabled={
                                !commentText.trim() ||
                                createCommentMutation.isPending
                              }
                              onClick={handleSubmitComment}
                              size="sm"
                            >
                              {createCommentMutation.isPending ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <Send className="mr-1.5" size={14} />
                                  发送
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 py-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <MessageCircle className="text-blue-600" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">登录后参与讨论</p>
                      </div>
                    )}

                    {/* 评论列表 */}
                    <div className="space-y-3">
                      {commentsLoading ? (
                        <div className="py-8 text-center">
                          <LoadingSpinner size="sm" />
                          <p className="mt-2 text-gray-500 text-sm">
                            加载评论中...
                          </p>
                        </div>
                      ) : comments && comments.length > 0 ? (
                        <AnimatePresence>
                          {comments.map((comment: any, index: number) => (
                            <motion.div
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="flex gap-3 rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-blue-100 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50"
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              key={comment.id}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                                <AvatarImage
                                  alt={comment.user?.name}
                                  src={comment.user?.avatar}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                  <User size={14} />
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="truncate font-semibold text-gray-900 text-sm">
                                    {comment.user?.name}
                                  </span>
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 text-xs">
                                    {formatTime(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="break-words text-gray-700 text-sm leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      ) : (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 py-12 text-center"
                          initial={{ opacity: 0 }}
                        >
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <MessageCircle
                              className="text-blue-400"
                              size={24}
                            />
                          </div>
                          <p className="text-gray-500 text-sm">
                            还没有评论，来抢沙发吧！
                          </p>
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
