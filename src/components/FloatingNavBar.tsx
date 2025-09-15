import { Home, Search, Plus, Heart, User } from 'lucide-react';

interface FloatingNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
}

export default function FloatingNavBar({ activeTab, onTabChange, onCreatePost }: FloatingNavBarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'search', icon: Search, label: '发现' },
    { id: 'create', icon: Plus, label: '发布', isCreate: true },
    { id: 'likes', icon: Heart, label: '喜欢' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/80 backdrop-blur-xl rounded-full px-4 py-3 shadow-lg border border-white/20">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCreate = item.isCreate;
            
            return (
              <button
                key={item.id}
                className={`relative p-3 rounded-full transition-all duration-300 ${
                  isCreate
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:scale-110'
                    : isActive
                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (isCreate) {
                    onCreatePost();
                  } else {
                    onTabChange(item.id);
                  }
                }}
              >
                <Icon size={isCreate ? 22 : 20} />
                {isActive && !isCreate && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}