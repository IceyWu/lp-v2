import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageGallery from './ImageGallery';
import ErrorBoundary from './ErrorBoundary';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: (postId: string) => void;
}

export default function PostCard({ post, onLike, onSave, onClick }: PostCardProps) {
  // 计算卡片的动态高度，基于内容和图片
  const calculateCardHeight = () => {
    if (post.images.length === 0) return 'auto';
    
    // 基于第一张图片的宽高比计算显示高度
    const firstImage = post.images[0];
    const cardWidth = 320; // 假设卡片宽度
    const imageHeight = Math.min((firstImage.height / firstImage.width) * cardWidth, 400);
    
    return imageHeight + 200; // 图片高度 + 内容区域高度
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return '1天前';
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <Card 
      className={`w-full overflow-hidden cursor-pointer group border transition-all duration-500 rounded-2xl relative ${
        post.images.length === 0 
          ? 'border-gray-200 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50' 
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl hover:shadow-black/5'
      }`}
      onClick={() => onClick(post.id)}
    >
      {/* 图片部分 */}
      {post.images.length > 0 && (
        <div className="relative overflow-hidden rounded-t-2xl">
          <ErrorBoundary fallback={
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">图片加载失败</span>
            </div>
          }>
            <ImageGallery 
              images={post.images} 
              maxDisplay={9}
              className="transition-all duration-500 group-hover:scale-[1.01]"
            />
          </ErrorBoundary>
          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-t-2xl pointer-events-none" />
        </div>
      )}

      {/* 纯文本动态的装饰性元素 */}
      {post.images.length === 0 && (
        <div className="absolute top-4 right-4 opacity-10">
          <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}

      {/* 内容部分 */}
      <CardContent className={`${post.images.length === 0 ? 'p-6 relative z-10' : 'p-5'}`}>
        {/* 纯文本动态的引用标记 */}
        {post.images.length === 0 && (
          <div className="absolute -left-1 top-6 w-1 h-16 bg-gradient-to-b from-gray-300 to-gray-200 rounded-full"></div>
        )}
        
        <h3 className={`font-semibold text-black mb-3 line-clamp-2 leading-tight group-hover:text-gray-700 transition-colors ${
          post.images.length === 0 ? 'text-xl' : 'text-lg'
        }`}>
          {post.title}
        </h3>
        <p className={`text-gray-600 mb-4 leading-relaxed ${
          post.images.length === 0 ? 'line-clamp-5 text-base' : 'line-clamp-3 text-sm'
        }`}>
          {post.content}
        </p>
        
        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 位置信息 */}
        {post.location && (
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
            <MapPin size={14} className="text-gray-400" />
            <span className="font-medium">{post.location}</span>
          </div>
        )}

        {/* 用户信息 */}
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 ring-2 ring-gray-100">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 text-sm font-medium">
              {post.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-semibold text-black">{post.author.name}</div>
            <div className="text-xs text-gray-500">{formatTime(post.createdAt)}</div>
          </div>
        </div>
      </CardContent>

      {/* 互动按钮 */}
      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-100 px-5 pb-5">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
            post.isLiked 
              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
        >
          <Heart 
            size={16} 
            className={`transition-all duration-200 ${post.isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`}
          />
          <span className="font-medium">{post.likes}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
        >
          <MessageCircle size={16} className="hover:scale-110 transition-transform" />
          <span className="font-medium">{post.comments}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
            post.isSaved 
              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
              : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSave(post.id);
          }}
        >
          <Bookmark 
            size={16} 
            className={`transition-all duration-200 ${post.isSaved ? 'fill-current scale-110' : 'hover:scale-110'}`}
          />
          <span className="font-medium">{post.saves}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}