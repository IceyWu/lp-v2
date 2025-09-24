import { Bookmark, Heart, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Post } from "../types";
import ErrorBoundary from "./ErrorBoundary";
import ImageGallery from "./ImageGallery";
import ImagePreview from "./ImagePreview";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: (postId: string) => void;
}

export default function PostCard({
  post,
  onLike,
  onSave,
  onClick,
}: PostCardProps) {
  const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);

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
      return "1天前";
    }
    return `${Math.floor(hours / 24)}天前`;
  };

  const handleImageClick = (index: number) => {
    setImagePreviewIndex(index);
  };

  return (
    <>
      <Card
        className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500 ${
          post.images.length === 0
            ? "border-border bg-gradient-to-br from-muted/50 via-background to-muted/50 hover:border-ring hover:shadow-lg"
            : "border-border bg-card hover:border-ring hover:shadow-black/5 hover:shadow-xl dark:hover:shadow-white/5"
        }`}
        onClick={() => onClick(post.id)}
      >
        {/* 图片部分 */}
        {post.images.length > 0 && (
          <div className="relative overflow-hidden rounded-t-2xl">
            <ErrorBoundary
              fallback={
                <div className="flex h-48 w-full items-center justify-center bg-gray-200">
                  <span className="text-gray-500">图片加载失败</span>
                </div>
              }
            >
              <ImageGallery
                className="transition-all duration-500 group-hover:scale-[1.01]"
                images={post.images}
                maxDisplay={9}
                onImageClick={(index) => {
                  handleImageClick(index);
                }}
              />
            </ErrorBoundary>
            {/* 悬停遮罩 */}
            <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-black/0 transition-all duration-300 group-hover:bg-black/5" />
          </div>
        )}

        {/* 纯文本动态的装饰性元素 */}
        {post.images.length === 0 && (
          <div className="absolute top-4 right-4 opacity-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted">
              <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
          </div>
        )}

        {/* 内容部分 */}
        <CardContent
          className={`${post.images.length === 0 ? "relative z-10 p-6" : "p-5"}`}
        >
          {/* 纯文本动态的引用标记 */}
          {post.images.length === 0 && (
            <div className="-left-1 absolute top-6 h-16 w-1 rounded-full bg-gradient-to-b from-muted to-muted/50" />
          )}

          <h3
            className={`mb-3 line-clamp-2 font-semibold text-foreground leading-tight transition-colors group-hover:text-muted-foreground ${
              post.images.length === 0 ? "text-xl" : "text-lg"
            }`}
          >
            {post.title}
          </h3>
          <p
            className={`mb-4 text-muted-foreground leading-relaxed ${
              post.images.length === 0
                ? "line-clamp-5 text-base"
                : "line-clamp-3 text-sm"
            }`}
          >
            {post.content}
          </p>

          {/* 标签 */}
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  className="cursor-pointer rounded-full bg-secondary px-3 py-1 text-secondary-foreground text-xs transition-colors hover:bg-secondary/80"
                  key={index}
                  variant="secondary"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 位置信息 */}
          {post.location && (
            <div className="mb-4 flex items-center gap-2 text-muted-foreground text-xs">
              <MapPin className="text-muted-foreground/70" size={14} />
              <span className="font-medium">{post.location}</span>
            </div>
          )}

          {/* 用户信息 */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              <AvatarImage alt={post.author.name} src={post.author.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 font-medium text-muted-foreground text-sm">
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-foreground text-sm">
                {post.author.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatTime(post.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>

        {/* 互动按钮 */}
        <CardFooter className="flex items-center justify-between border-border border-t px-5 pt-4 pb-5">
          <Button
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
              post.isLiked
                ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                : "text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            size="sm"
            variant="ghost"
          >
            <Heart
              className={`transition-all duration-200 ${post.isLiked ? "scale-110 fill-current" : "hover:scale-110"}`}
              size={16}
            />
            <span className="font-medium">{post.likes}</span>
          </Button>

          <Button
            className="flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground text-sm transition-all duration-200 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950"
            size="sm"
            variant="ghost"
          >
            <MessageCircle
              className="transition-transform hover:scale-110"
              size={16}
            />
            <span className="font-medium">{post.comments}</span>
          </Button>

          <Button
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
              post.isSaved
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900"
                : "text-muted-foreground hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSave(post.id);
            }}
            size="sm"
            variant="ghost"
          >
            <Bookmark
              className={`transition-all duration-200 ${post.isSaved ? "scale-110 fill-current" : "hover:scale-110"}`}
              size={16}
            />
            <span className="font-medium">{post.saves}</span>
          </Button>
        </CardFooter>
      </Card>

      {/* 图片预览 */}
      {imagePreviewIndex >= 0 && post.images.length > 0 && (
        <ImagePreview
          images={post.images}
          initialIndex={imagePreviewIndex}
          isOpen={imagePreviewIndex >= 0}
          onClose={() => setImagePreviewIndex(-1)}
        />
      )}
    </>
  );
}
