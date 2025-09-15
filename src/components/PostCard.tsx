import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MapPin } from 'lucide-react';
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
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group animate-fade-in border border-gray-100"
      onClick={() => onClick(post.id)}
    >
      {/* 图片部分 */}
      <div className="relative overflow-hidden">
        {post.images.length > 0 && (
          <div className="relative">
            <img
              src={post.images[0]}
              alt={post.title}
              className={`w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
            )}
            {post.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                1/{post.images.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 内容部分 */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg">{post.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-sm px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 位置信息 */}
        {post.location && (
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
            <MapPin size={14} />
            <span>{post.location}</span>
          </div>
        )}

        {/* 用户信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700 font-medium">{post.author.name}</span>
          </div>
          <span className="text-sm text-gray-500">{formatTime(post.createdAt)}</span>
        </div>

        {/* 互动按钮 */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
          >
            <Heart 
              size={18} 
              className={post.isLiked ? 'text-red-500 fill-current' : ''}
            />
            <span>{post.likes}</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
            <MessageCircle size={18} />
            <span>{post.comments}</span>
          </button>
          
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSave(post.id);
            }}
          >
            <Bookmark 
              size={18} 
              className={post.isSaved ? 'text-yellow-500 fill-current' : ''}
            />
            <span>{post.saves}</span>
          </button>
        </div>
      </div>
    </div>
  );
}