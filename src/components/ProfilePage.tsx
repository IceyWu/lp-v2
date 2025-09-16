import { Settings, Grid, Heart, Bookmark, Camera } from 'lucide-react';

export default function ProfilePage() {
  const stats = [
    { label: '动态', value: '23' },
    { label: '关注', value: '156' },
    { label: '粉丝', value: '89' },
  ];

  const tabs = [
    { id: 'posts', icon: Grid, label: '动态' },
    { id: 'liked', icon: Heart, label: '喜欢' },
    { id: 'saved', icon: Bookmark, label: '收藏' },
  ];

  return (
    <div className="space-y-6">
      {/* 紧凑的个人信息区域 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120"
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white">
                <Camera size={12} />
              </button>
            </div>
            
            <div>
              <h1 className="text-xl font-semibold text-black">小雨</h1>
              <p className="text-sm text-gray-600">记录生活中的美好时光 ✨</p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 紧凑的统计数据 */}
        <div className="flex justify-around mt-6 pt-4 border-t border-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xl font-semibold text-black">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 内容切换标签 */}
      <div className="bg-white rounded-2xl p-1 border border-gray-100">
        <div className="flex">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = index === 0; // 默认选中第一个
            
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 主要内容区域 - 这里是重点 */}
      <div className="bg-white rounded-2xl border border-gray-100 min-h-[500px]">
        {/* 内容网格区域 */}
        <div className="p-6">
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有动态</h3>
            <p className="text-gray-500 text-sm mb-6">开始分享你的第一个精彩瞬间</p>
            <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              创建动态
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}