import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// 登录hook
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ account, password }: { account: string; password: string }) => {
      return await apiService.login(account, password);
    },
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        // 登录成功后，刷新当前用户信息
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        queryClient.invalidateQueries({ queryKey: ['topics'] });
      }
    },
  });
};

// 注册hook
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ account, password, name }: { account: string; password: string; name: string }) => {
      return await apiService.register(account, password, name);
    },
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        // 注册成功后，刷新当前用户信息
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        queryClient.invalidateQueries({ queryKey: ['topics'] });
      }
    },
  });
};

// 登出hook
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiService.logout();
    },
    onSuccess: () => {
      // 清除所有用户相关的缓存
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.clear(); // 清除所有缓存
    },
  });
};