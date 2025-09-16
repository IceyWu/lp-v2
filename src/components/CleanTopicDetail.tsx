import { useState, useEffect } from 'react';
import { 
  X, Heart, MessageCircle, Bookmark, MapPin, 
  Send, User, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import ImagePreview from './ImagePreview';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import SafeOptimizedImage from './SafeOptimizedImage';
import { useTopicDetail, useComments, useCreateComment } from '../hooks/useTopicDetail';
import { useIsAuthenticated } from '../hooks/useAuth';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface CleanTopicDetailProps {
  topicId: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

export default function CleanTopicDetail({ 
  topicId, 
  isOpen, 
  onClose, 
  onLike, 
  onSave 
}: CleanTopicDetailProps) {
  const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { isAuthenticated, user } = useIsAuthenticated();
  const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
  const { data: comments, isLoading: commentsLoading } = useComments(topicId);
  const createCommentMutation = useCreateComment();

  // 锁定背景滚动
  useBodyScrollLock(isOpen);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* 主容器 */}
        <Card 
          className="w-full max-w-5xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error || !topic ? (
            <div className="text-center py-8 px-4">
              <p className="text-red-600 mb-4">加载失败</p>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[80vh]">
              {/* 左侧：图片区域 */}
              {topic.images.length > 0 && (
                <div className="lg:col-span-2 relative bg-black overflow-hidden">
                  <ErrorBoundary>
                    <div className="relative w-full h-full">
                      <div
                        className="w-full h-full cursor-pointer"
                        onClick={() => handleImageClick(currentImageIndex)}
                      >
                        <SafeOptimizedImage
                          image={topic.images[currentImageIndex]}
                          className="w-full h-full object-contain"
                        />
                      </div>

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
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
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
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={topic.author.avatar} alt={topic.author.name} />
                        <AvatarFallback>
                          <User size={18} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-semibold">
                          {topic.author.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
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
                    
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X size={16} />
                    </Button>
                  </div>
                </CardHeader>

                {/* 内容区域 */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* 标题和内容 */}
                    <div>
                      <h2 className="font-bold text-lg mb-2">{topic.title}</h2>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
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

                    <div className="border-t pt-4">
                      {/* 互动按钮 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1 ${
                              topic.isLiked ? 'text-red-500 hover:text-red-600' : ''
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
                            className={`flex items-center gap-1 ${
                              topic.isSaved ? 'text-amber-600 hover:text-amber-700' : ''
                            }`}
                            onClick={() => onSave?.(topic.id)}
                          >
                            <Bookmark size={16} className={topic.isSaved ? 'fill-current' : ''} />
                            <span className="text-sm">{topic.saves}</span>
                          </Button>
                        </div>
                      </div>

                      {/* 评论区域 */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">评论</h3>
                        
                        {/* 评论输入 */}
                        {isAuthenticated ? (
                          <div className="space-y-2">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="写下你的评论..."
                              className="w-full min-h-[60px] text-sm resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                  e.preventDefault();
                                  handleSubmitComment();
                                }
                              }}
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
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
                          <div className="text-center py-3 text-gray-500 text-sm">
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
                            comments.map((comment: any) => (
                              <div
                                key={comment.id}
                                className="flex gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                                    <span className="text-xs text-gray-500">
                                      {formatTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 break-words">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                              <p className="text-sm">暂无评论</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          )}
        </Card>
      </div>

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