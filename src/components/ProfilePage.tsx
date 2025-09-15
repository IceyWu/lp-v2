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
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* 个人信息卡片 */}
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120"
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-gradient-to-r from-primary-200 to-secondary-200"
              />
              <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white">
                <Camera size={16} />
              </button>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">小雨</h1>
              <p className="text-lg text-gray-600 mb-3">记录生活中的美好时光 ✨</p>
              <p className="text-gray-500">上海·静安区</p>
            </div>
          </div>
          
          <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={24} className="text-gray-600" />
          </button>
        </div>

        {/* 统计数据 */}
        <div className="flex justify-around py-6 border-t border-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 内容切换标签 */}
      <div className="bg-white rounded-2xl p-2 mb-8 shadow-sm border border-gray-100">
        <div className="flex">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = index === 0; // 默认选中第一个
            
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-lg">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="text-center py-16">
        <div className="text-xl text-gray-400 mb-3">个人动态展示</div>
        <div className="text-gray-500">功能开发中，敬请期待...</div>
      </div>
    </div>
  );
}