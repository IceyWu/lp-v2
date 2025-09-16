import { useQuery } from '@tanstack/react-query';
import { apiService, ApiUser } from '../services/api';

// 获取当前用户信息的hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await apiService.getCurrentUser();
        if (response.code === 200 && response.result) {
          return response.result;
        }
        return null;
      } catch (error) {
        // 如果未登录或token无效，返回null而不是抛出错误
        console.log('用户未登录或token无效');
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    retry: false, // 不重试，避免频繁的401错误
  });
};

// 检查用户是否已登录
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
};