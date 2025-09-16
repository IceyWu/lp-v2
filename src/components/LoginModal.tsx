import { useState } from 'react';
import { X } from 'lucide-react';
import { useLogin, useRegister } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    name: '',
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const result = await loginMutation.mutateAsync({
          account: formData.account,
          password: formData.password,
        });
        
        if (result.code === 200) {
          onSuccess();
          onClose();
          // 重置表单
          setFormData({ account: '', password: '', name: '' });
        }
      } else {
        const result = await registerMutation.mutateAsync({
          account: formData.account,
          password: formData.password,
          name: formData.name,
        });
        
        if (result.code === 200) {
          onSuccess();
          onClose();
          // 重置表单
          setFormData({ account: '', password: '', name: '' });
        }
      }
    } catch (error) {
      // 错误已经在mutation中处理
      console.error('认证失败:', error);
    }
  };

  const currentMutation = isLogin ? loginMutation : registerMutation;
  const error = currentMutation.error as any;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isLogin ? '登录' : '注册'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              账号
            </label>
            <input
              type="text"
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入账号"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入用户名"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error.message || '操作失败，请重试'}
            </div>
          )}

          <button
            type="submit"
            disabled={currentMutation.isPending}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {currentMutation.isPending ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    </div>
  );
}