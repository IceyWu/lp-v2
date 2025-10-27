import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
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
  onEdit?: (topicId: number) => void;
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
  onEdit,
}: SimpleImageDetailProps) {
  const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
    setShowFloatingHearts(true);
    onLike?.(topic.id);

    setTimeout(() => {
      setShowFloatingHearts(false);
    }, 800);
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
    if (topic && topic.images && topic.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % topic.images!.length);
    }
  };

  const prevImage = () => {
    if (topic && topic.images && topic.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + topic.images!.length) % topic.images!.length
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
        <DialogContent className="max-h-[92vh] max-w-7xl gap-0 overflow-hidden bg-white p-0">
          <div
            className={`grid ${hasImages ? "grid-cols-1 lg:grid-cols-[1.6fr,1fr]" : "grid-cols-1"} h-[92vh]`}
          >
            {/* 左侧：图片区域 */}
            {hasImages && (
              <div className="relative overflow-hidden bg-black">
                <ErrorBoundary>
                  <div className="relative h-full w-full">
                    <div
                      className="h-full w-full cursor-pointer"
                      key={currentImageIndex}
                      onClick={() => handleImageClick(currentImageIndex)}
                    >
                      <SimpleImage
                        alt={topic.images?.[currentImageIndex]?.name}
                        className="h-full w-full"
                        src={topic.images?.[currentImageIndex]?.url || ""}
                      />
                    </div>

                    {/* 图片导航 */}
                    {topic.images && topic.images.length > 1 && (
                      <>
                        <Button
                          className="-translate-y-1/2 absolute top-1/2 left-3 z-10 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                          onClick={prevImage}
                          size="icon"
                          variant="ghost"
                        >
                          <ChevronLeft size={20} />
                        </Button>

                        <Button
                          className="-translate-y-1/2 absolute top-1/2 right-3 z-10 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                          onClick={nextImage}
                          size="icon"
                          variant="ghost"
                        >
                          <ChevronRight size={20} />
                        </Button>

                        {/* 图片指示器 */}
                        <div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-10 flex gap-1.5">
                          {topic.images?.map((_, index) => (
                            <button
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentImageIndex
                                  ? "w-6 bg-white"
                                  : "w-2 bg-white/50 hover:bg-white/70"
                              }`}
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>

                        {/* 图片计数 */}
                        <div className="absolute top-4 right-4 z-10 rounded-full bg-black/60 px-3 py-1.5 font-medium text-sm text-white backdrop-blur-sm">
                          {currentImageIndex + 1} / {topic.images?.length || 0}
                        </div>
                      </>
                    )}

                    {/* 热度标识 */}
                    {popularityInfo && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 font-medium text-white text-xs backdrop-blur-sm">
                        <popularityInfo.icon size={12} />
                        热门
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
              </div>
            )}

            {/* 右侧：内容区域 */}
            <div className="flex h-full flex-col overflow-hidden bg-white">
              {/* 头部 */}
              <div className="flex-shrink-0 border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        alt={topic.author.name}
                        src={topic.author.avatar}
                      />
                      <AvatarFallback className="bg-gray-200">
                        <User size={18} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {topic.author.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Clock size={12} />
                        {formatTime(topic.createdAt)}
                        {topic.location && (
                          <>
                            <span>•</span>
                            <MapPin size={12} />
                            <span>{topic.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {user && topic.author && user.id === topic.author.id && (
                      <Button
                        className="h-8 w-8"
                        onClick={() => onEdit?.(topicId)}
                        size="icon"
                        title="编辑"
                        variant="ghost"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    <Button
                      className="h-8 w-8"
                      size="icon"
                      variant="ghost"
                    >
                      <Share2 size={16} />
                    </Button>
                    <Button
                      className="h-8 w-8"
                      size="icon"
                      variant="ghost"
                    >
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 内容区域 - 可滚动 */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 px-5 py-4">
                  {/* 标题和内容 */}
                  <div>
                    <h1 className="mb-3 font-bold text-gray-900 text-xl leading-tight">
                      {topic.title}
                    </h1>
                    <p className="whitespace-pre-wrap text-gray-700 text-base leading-relaxed">
                      {topic.content}
                    </p>
                  </div>

                  {/* 标签 */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {topic.tags.map((tag, index) => (
                        <Badge
                          className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
                          key={index}
                          variant="secondary"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator />

                  {/* 互动按钮 */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Button
                        className={`flex items-center gap-1.5 ${
                          topic.isLiked
                            ? "text-red-500 hover:bg-red-50"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={handleLike}
                        size="sm"
                        variant="ghost"
                      >
                        <Heart
                          className={topic.isLiked ? "fill-current" : ""}
                          size={18}
                        />
                        <span className="text-sm">{topic.likes}</span>
                      </Button>

                      {/* 浮动爱心动画 */}
                      <AnimatePresence>
                        {showFloatingHearts && (
                          <motion.div
                            animate={{ opacity: 0, y: -30 }}
                            className="-top-6 -translate-x-1/2 pointer-events-none absolute left-1/2"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                          >
                            <Heart
                              className="fill-current text-red-500"
                              size={14}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button
                      className="flex items-center gap-1.5 hover:bg-gray-100"
                      size="sm"
                      variant="ghost"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm">{comments?.length || 0}</span>
                    </Button>

                    <Button
                      className={`flex items-center gap-1.5 ${
                        topic.isSaved
                          ? "text-amber-600 hover:bg-amber-50"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => onSave?.(topic.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Bookmark
                        className={topic.isSaved ? "fill-current" : ""}
                        size={18}
                      />
                      <span className="text-sm">{topic.saves}</span>
                    </Button>
                  </div>

                  <Separator />

                  {/* 评论区域 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-base">
                        评论
                      </h3>
                      <span className="text-gray-500 text-sm">
                        {comments?.length || 0}
                      </span>
                    </div>

                    {/* 评论输入 */}
                    {isAuthenticated ? (
                      <div className="space-y-2 rounded-lg border bg-gray-50 p-3">
                        <Textarea
                          className="min-h-[70px] resize-none border-0 bg-white text-sm"
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              handleSubmitComment();
                            }
                          }}
                          placeholder="写下你的评论..."
                          value={commentText}
                        />
                        <div className="flex items-center justify-end">
                          <Button
                            className="h-8 bg-black text-white hover:bg-gray-800"
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
                                <Send className="mr-1" size={14} />
                                发送
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border bg-gray-50 py-8 text-center">
                        <MessageCircle
                          className="mx-auto mb-2 text-gray-400"
                          size={24}
                        />
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
                        <>
                          {comments.map((comment: any) => (
                            <div
                              className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                              key={comment.id}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage
                                  alt={comment.user?.name}
                                  src={comment.user?.avatar}
                                />
                                <AvatarFallback className="bg-gray-200 text-xs">
                                  <User size={14} />
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="truncate font-medium text-gray-900 text-sm">
                                    {comment.user?.name}
                                  </span>
                                  <span className="text-gray-400 text-xs">
                                    {formatTime(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="break-words text-gray-700 text-sm leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="rounded-lg bg-gray-50 py-12 text-center">
                          <MessageCircle
                            className="mx-auto mb-2 text-gray-300"
                            size={32}
                          />
                          <p className="text-gray-500 text-sm">
                            还没有评论，来抢沙发吧！
                          </p>
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
