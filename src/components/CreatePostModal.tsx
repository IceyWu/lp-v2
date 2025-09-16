import { useState } from 'react';
import { X, Image, MapPin, Hash } from 'lucide-react';
import { Post } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: Omit<Post, 'id' | 'author' | 'likes' | 'comments' | 'saves' | 'isLiked' | 'isSaved' | 'createdAt'>) => void;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      location: location || undefined,
      images: [], // 简化版本暂不处理图片上传
    };
    
    onSubmit(postData);
    
    // 重置表单
    setTitle('');
    setContent('');
    setTags('');
    setLocation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl transform transition-all">
        {/* 头部 */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-black">创建新动态</h2>
              <p className="text-sm text-gray-500 mt-1">分享你的精彩瞬间</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* 标题输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的动态起个吸引人的标题..."
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/10 transition-all text-base placeholder:text-gray-400"
              required
            />
          </div>

          {/* 内容输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的想法、感受或故事..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl resize-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all text-base placeholder:text-gray-400"
              required
            />
          </div>

          {/* 图片上传区域 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">图片（可选）</label>
            <div className="relative group">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 hover:bg-gray-50/50 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-200 transition-colors">
                  <Image size={16} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">添加图片</p>
                <p className="text-xs text-gray-400">也可以创建纯文字动态</p>
              </div>
            </div>
          </div>

          {/* 标签和位置 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hash size={14} />
                标签
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="添加标签，用逗号分隔（如：旅行, 美食, 生活）"
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/10 transition-all text-sm placeholder:text-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin size={14} />
                位置
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="添加位置信息（可选）"
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/10 transition-all text-sm placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              发布动态
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}