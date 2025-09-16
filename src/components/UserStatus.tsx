import { User, LogIn } from 'lucide-react';
import { useIsAuthenticated } from '../hooks/useAuth';

interface UserStatusProps {
  onLogin: () => void;
  className?: string;
}

export default function UserStatus({ onLogin, className = '' }: UserStatusProps) {
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">加载中...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <User size={14} className="text-green-600" />
        </div>
        <span className="text-sm text-gray-700">
          欢迎，{user.name}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onLogin}
      className={`flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors ${className}`}
    >
      <LogIn size={14} />
      <span>点击登录</span>
    </button>
  );
}