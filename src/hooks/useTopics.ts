import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { type ApiTopic, apiService } from "../services/api";
import type { Post, PostImage } from "../types";

// 将API话题数据转换为前端Post类型
const transformApiTopicToPost = (apiTopic: ApiTopic): Post => {
  // 提取图片信息，包含完整的元数据
  const images: PostImage[] = apiTopic.fileList
    .filter((file) => file.type.startsWith("image/"))
    .map((file) => ({
      id: file.id,
      url: file.url,
      width: file.width,
      height: file.height,
      blurhash: file.blurhash,
      type: file.type,
      name: file.name,
    }));

  // 提取标签
  const tags = apiTopic.topicTags.map((topicTag) => topicTag.tag.title);

  // 构建用户头像URL
  const avatar =
    apiTopic.user.avatarInfo?.url ||
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100";

  // 构建位置信息
  const location = apiTopic.user.ipInfo
    ? `${apiTopic.user.ipInfo.city}·${apiTopic.user.ipInfo.regionName}`
    : undefined;

  return {
    id: String(apiTopic.id),
    title: apiTopic.title,
    content: apiTopic.content,
    images,
    author: {
      name: apiTopic.user.name,
      avatar,
    },
    tags,
    likes: apiTopic.likesCount || 0,
    comments: apiTopic.commentsCount || 0,
    saves: apiTopic.collectionsCount || 0,
    isLiked: apiTopic.isLiked || false,
    isSaved: apiTopic.isCollected || false,
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
    queryKey: ["topics", "infinite", params],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getTopics({
        ...params,
        page: pageParam,
        size: params?.size || 20,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage:
            response.result.pagination.page <
            response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取话题列表失败");
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 10 * 60 * 1000, // 增加到10分钟
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
    retry: 2,
    refetchOnWindowFocus: false, // 配合keep-alive，避免不必要的重新获取
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
    queryKey: ["topics", params],
    queryFn: async () => {
      const response = await apiService.getTopics(params);
      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取话题列表失败");
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
    retry: 2,
    refetchOnWindowFocus: false, // 配合keep-alive，避免不必要的重新获取
  });
};

// 点赞话题的hook
export const useLikeTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      isLiked,
    }: {
      topicId: number;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        return await apiService.unlikeTopic(topicId);
      }
      return await apiService.likeTopic(topicId);
    },
    onSuccess: (_data, variables) => {
      // 更新缓存中的话题数据
      queryClient.setQueryData(["topics"], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

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
      queryClient.setQueryData(["topics", "infinite"], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

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
    onError: (_error) => {},
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
      fileIds?: (number | string)[];
      tagIds?: (number | string)[];
    }) => {
      const response = await apiService.createTopic(data);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || "创建话题失败");
    },
    onSuccess: (newPost) => {
      // 将新话题添加到普通查询缓存的开头
      queryClient.setQueryData(["topics"], (oldData: any) => {
        if (!oldData) {
          return {
            items: [newPost],
            total: 1,
            page: 1,
            size: 10,
            totalPages: 1,
          };
        }

        return {
          ...oldData,
          items: [newPost, ...oldData.items],
          total: oldData.total + 1,
        };
      });

      // 将新话题添加到无限查询缓存的开头
      queryClient.invalidateQueries({ queryKey: ["topics", "infinite"] });
    },
    onError: (_error) => {},
  });
};

// 获取用户喜欢的话题列表（无限滚动版本）
export const useInfiniteLikedTopics = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ["likedTopics", "infinite", userId],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) {
        return {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          totalPages: 0,
          hasNextPage: false,
        };
      }

      const response = await apiService.getUserLikedTopics(userId, {
        page: pageParam,
        size: 20,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage:
            response.result.pagination.page <
            response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取喜欢列表失败");
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 收藏话题的hook
export const useCollectTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      isCollected,
    }: {
      topicId: number;
      isCollected: boolean;
    }) => {
      if (isCollected) {
        return await apiService.uncollectTopic(topicId);
      }
      return await apiService.collectTopic(topicId);
    },
    onSuccess: (_data, variables) => {
      // 更新缓存中的话题数据
      queryClient.setQueryData(["topics"], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          items: oldData.items.map((post: Post) => {
            if (post.id === String(variables.topicId)) {
              return {
                ...post,
                isSaved: !variables.isCollected,
                saves: variables.isCollected ? post.saves - 1 : post.saves + 1,
              };
            }
            return post;
          }),
        };
      });

      // 也更新无限查询的缓存
      queryClient.setQueryData(["topics", "infinite"], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((post: Post) => {
              if (post.id === String(variables.topicId)) {
                return {
                  ...post,
                  isSaved: !variables.isCollected,
                  saves: variables.isCollected
                    ? post.saves - 1
                    : post.saves + 1,
                };
              }
              return post;
            }),
          })),
        };
      });

      // 使收藏列表缓存失效
      queryClient.invalidateQueries({ queryKey: ["collectedTopics"] });
    },
    onError: (_error) => {},
  });
};

// 获取用户收藏的话题列表（无限滚动版本）
export const useInfiniteCollectedTopics = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ["collectedTopics", "infinite", userId],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) {
        return {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          totalPages: 0,
          hasNextPage: false,
        };
      }

      const response = await apiService.getUserCollectedTopics(userId, {
        page: pageParam,
        size: 20,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage:
            response.result.pagination.page <
            response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取收藏列表失败");
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 更新话题的hook
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        content?: string;
        fileIds?: (number | string)[];
        tagIds?: (number | string)[];
      };
    }) => {
      const response = await apiService.updateTopic(id, data);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || "更新话题失败");
    },
    onSuccess: (_data, variables) => {
      // 刷新话题详情缓存
      queryClient.invalidateQueries({ queryKey: ["topic", variables.id] });
      // 刷新话题列表缓存
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (_error) => {},
  });
};
