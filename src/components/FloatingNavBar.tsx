import { Home, Search, Plus, Heart, User, Bookmark, TrendingUp } from 'lucide-react';
import { Link, useRouter } from '@tanstack/react-router';
import { useIsAuthenticated } from '../hooks/useAuth';

interface FloatingNavBarProps {
  activeTab: string;
  onLogin: () => void;
}

export default function FloatingNavBar({ activeTab, onLogin }: FloatingNavBarProps) {
  const { isAuthenticated } = useIsAuthenticated();
  const router = useRouter();

  const navItems = [
    { id: 'home', icon: Home, label: '首页', requireAuth: false, path: '/' },
    { id: 'search', icon: Search, label: '发现', requireAuth: false, path: '/search' },
    { id: 'trending', icon: TrendingUp, label: '热门', requireAuth: false, path: '/trending' },
    { id: 'likes', icon: Heart, label: '喜欢', requireAuth: true, path: '/likes' },
    { id: 'saved', icon: Bookmark, label: '收藏', requireAuth: true, path: '/saved' },
    { id: 'profile', icon: User, label: '我的', requireAuth: true, path: '/profile' },
  ];

  const handleTabClick = (path: string, requireAuth: boolean) => {
    if (requireAuth && !isAuthenticated) {
      onLogin();
      return;
    }
    router.navigate({ to: path });
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-full px-4 py-3 shadow-2xl border border-gray-200/50">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requireAuth && !isAuthenticated;
            
            if (isDisabled) {
              return (
                <button
                  key={item.id}
                  className="relative p-3 rounded-full transition-all duration-300 text-gray-300 cursor-not-allowed"
                  onClick={() => handleTabClick(item.path, item.requireAuth)}
                >
                  <Icon size={18} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                </button>
              );
            }
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative p-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-black text-white shadow-lg scale-110'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <Icon size={18} className={isActive ? 'drop-shadow-sm' : ''} />
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}