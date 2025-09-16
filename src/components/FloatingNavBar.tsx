import { Home, Search, Plus, Heart, User, Bookmark, TrendingUp } from 'lucide-react';

interface FloatingNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function FloatingNavBar({ activeTab, onTabChange }: FloatingNavBarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'search', icon: Search, label: '发现' },
    { id: 'trending', icon: TrendingUp, label: '热门' },
    { id: 'likes', icon: Heart, label: '喜欢' },
    { id: 'saved', icon: Bookmark, label: '收藏' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-full px-4 py-3 shadow-2xl border border-gray-200/50">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                className={`relative p-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-black text-white shadow-lg scale-110'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100 hover:scale-105'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon size={18} className={isActive ? 'drop-shadow-sm' : ''} />
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}