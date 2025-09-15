import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const trendingTags = [
    '咖啡时光', '烘焙日记', '城市夜景', '阅读笔记', '春日花开',
    '美食记录', '旅行见闻', '手工制作', '健身打卡', '音乐分享'
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* 搜索框 */}
      <div className="relative mb-12">
        <Search size={24} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索感兴趣的内容..."
          className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg"
        />
      </div>

      {/* 热门标签 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={24} className="text-primary-500" />
          <h2 className="text-2xl font-semibold text-gray-900">热门标签</h2>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {trendingTags.map((tag, index) => (
            <button
              key={index}
              className="px-6 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 rounded-full border border-primary-200 hover:from-primary-100 hover:to-secondary-100 transition-all duration-300 text-lg"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索结果占位 */}
      {searchQuery && (
        <div className="text-center py-16">
          <div className="text-xl text-gray-400 mb-3">搜索 "{searchQuery}" 的结果</div>
          <div className="text-gray-500">功能开发中，敬请期待...</div>
        </div>
      )}
    </div>
  );
}