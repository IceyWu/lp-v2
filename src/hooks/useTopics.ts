import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiService, ApiTopic, PaginatedResponse } from '../services/api';
import { Post, PostImage } from '../types';

// 将API话题数据转换为前端Post类型
const transformApiTopicToPost = (apiTopic: ApiTopic): Post => {
  // 提取图片信息，包含完整的元数据
  const images: PostImage[] = apiTopic.fileList
    .filter(file => file.type.startsWith('image/'))
    .map(file => ({
      id: file.id,
      url: file.url,
      width: file.width,
      height: file.height,
      blurhash: file.blurhash,
      type: file.type,
      name: file.name,
    }));

  // 提取标签
  const tags = apiTopic.TopicTag.map(topicTag => topicTag.tag.title);

  // 构建用户头像URL
  const avatar = apiTopic.User.avatarInfo?.url || 
    `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100`;

  // 构建位置信息
  const location = apiTopic.User.ipInfo ? 
    `${apiTopic.User.ipInfo.city}·${apiTopic.User.ipInfo.regionName}` : 
    undefined;

  return {
    id: String(apiTopic.id),
    title: apiTopic.title,
    content: apiTopic.content,
    images,
    author: {
      name: apiTopic.User.name,
      avatar,
    },
    tags,
    likes: 0, // TODO: 需要从点赞接口获取
    comments: 0, // TODO: 需要从评论接口获取
    saves: 0, // TODO: 需要从收藏接口获取
    isLiked: false, // TODO: 需要根据用户状态判断
    isSaved: false, // TODO: 需要根据用户状态判断
    createdAt: apiTopic.createdAt,
    location,
  };
};

// 获取话题列表的hook（无限滚动版本）
export const useInfiniteTopics = (params?: {
  size?: number;
  sort?: string;
  title?: string;
  keywords?: string;
  tagId?: number;
  userId?: number;
  exif?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: ['topics', 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getTopics({
        ...params,
        page: pageParam,
        size: params?.size || 20,
      });
      
      if (response.code === 200 && response.result) {
        return {
          items: response.result.data.map(transformApiTopicToPost),
          total: response.result.meta.totalElements,
          page: response.result.meta.current_page,
          size: response.result.meta.size,
          totalPages: response.result.meta.totalPages,
          hasNextPage: response.result.meta.current_page < response.result.meta.totalPages,
        };
      }
      throw new Error(response.message || '获取话题列表失败');
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// 获取话题列表的hook（普通版本，保持向后兼容）
export const useTopics = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  title?: string;
  keywords?: string;
  tagId?: number;
  userId?: number;
  exif?: boolean;
}) => {
  return useQuery({
    queryKey: ['topics', params],
    queryFn: async () => {
      const response = await apiService.getTopics(params);
      if (response.code === 200 && response.result) {
        return {
          items: response.result.data.map(transformApiTopicToPost),
          total: response.result.meta.totalElements,
          page: response.result.meta.current_page,
          size: response.result.meta.size,
          totalPages: response.result.meta.totalPages,
        };
      }
      throw new Error(response.message || '获取话题列表失败');
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    retry: 2,
  });
};

// 点赞话题的hook
export const useLikeTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isLiked }: { topicId: number; isLiked: boolean }) => {
      if (isLiked) {
        return await apiService.unlikeTopic(topicId);
      } else {
        return await apiService.likeTopic(topicId);
      }
    },
    onSuccess: (data, variables) => {
      // 更新缓存中的话题数据
      queryClient.setQueryData(['topics'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map((post: Post) => {
            if (post.id === String(variables.topicId)) {
              return {
                ...post,
                isLiked: !variables.isLiked,
                likes: variables.isLiked ? post.likes - 1 : post.likes + 1,
              };
            }
            return post;
          }),
        };
      });

      // 也更新无限查询的缓存
      queryClient.setQueryData(['topics', 'infinite'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((post: Post) => {
              if (post.id === String(variables.topicId)) {
                return {
                  ...post,
                  isLiked: !variables.isLiked,
                  likes: variables.isLiked ? post.likes - 1 : post.likes + 1,
                };
              }
              return post;
            }),
          })),
        };
      });
    },
    onError: (error) => {
      console.error('点赞操作失败:', error);
    },
  });
};

// 创建话题的hook
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      images?: string[];
      tags?: string[];
      location?: string;
    }) => {
      const response = await apiService.createTopic(data);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || '创建话题失败');
    },
    onSuccess: (newPost) => {
      // 将新话题添加到普通查询缓存的开头
      queryClient.setQueryData(['topics'], (oldData: any) => {
        if (!oldData) return { items: [newPost], total: 1, page: 1, size: 10, totalPages: 1 };
        
        return {
          ...oldData,
          items: [newPost, ...oldData.items],
          total: oldData.total + 1,
        };
      });

      // 将新话题添加到无限查询缓存的开头
      queryClient.invalidateQueries({ queryKey: ['topics', 'infinite'] });
    },
    onError: (error) => {
      console.error('创建话题失败:', error);
    },
  });
};