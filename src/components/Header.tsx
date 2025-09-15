import { Search, Bell, Plus, User, Home, Compass, Heart, Bookmark } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
}

export default function Header({ activeTab, onTabChange, onCreatePost }: HeaderProps) {
  const navItems = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'search', icon: Compass, label: '发现' },
    { id: 'likes', icon: Heart, label: '喜欢' },
    { id: 'saved', icon: Bookmark, label: '收藏' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">生</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              生活记录
            </h1>
          </div>

          {/* 导航菜单 */}
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索内容..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            {/* 发布按钮 */}
            <button
              onClick={onCreatePost}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              <span className="font-medium">发布</span>
            </button>

            {/* 通知 */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={20} />
            </button>

            {/* 用户头像 */}
            <button 
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => onTabChange('profile')}
            >
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40"
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}