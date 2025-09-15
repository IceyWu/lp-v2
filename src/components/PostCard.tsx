import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: (postId: string) => void;
}

export default function PostCard({ post, onLike, onSave, onClick }: PostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
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
      className="overflow-hidden cursor-pointer group border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500"
      onClick={() => onClick(post.id)}
    >
      {/* 图片部分 */}
      {post.images.length > 0 && (
        <div className="relative overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.title}
            className={`w-full h-56 object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}
          {post.images.length > 1 && (
            <Badge className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white border-0">
              1/{post.images.length}
            </Badge>
          )}
        </div>
      )}

      {/* 内容部分 */}
      <CardContent className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-gray-700 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {/* 位置信息 */}
        {post.location && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <MapPin size={14} />
            <span>{post.location}</span>
          </div>
        )}

        {/* 用户信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-gray-100">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-gray-900">{post.author.name}</div>
              <div className="text-xs text-gray-500">{formatTime(post.createdAt)}</div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 互动按钮 */}
      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-100 px-6 pb-6">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            post.isLiked 
              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
              : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
        >
          <Heart 
            size={16} 
            className={post.isLiked ? 'fill-current' : ''}
          />
          <span className="text-sm font-medium">{post.likes}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
        >
          <MessageCircle size={16} />
          <span className="text-sm font-medium">{post.comments}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            post.isSaved 
              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
              : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSave(post.id);
          }}
        >
          <Bookmark 
            size={16} 
            className={post.isSaved ? 'fill-current' : ''}
          />
          <span className="text-sm font-medium">{post.saves}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}