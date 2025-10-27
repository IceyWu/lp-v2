import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { Post, PostImage } from "../types";

// 将API话题数据转换为前端Post类型（复用之前的逻辑）
const transformApiTopicToPost = (apiTopic: any, currentUserId?: number): Post => {
  // 处理文件列表 - 可能是 fileList 数组或 FileList 数组
  const fileList = apiTopic.fileList || apiTopic.FileList || [];
  const images: PostImage[] = fileList
    .filter((item: any) => {
      const file = item.file || item;
      return file.type && file.type.startsWith("image/");
    })
    .map((item: any) => {
      const file = item.file || item;
      return {
        id: file.id,
        url: file.url,
        width: file.width,
        height: file.height,
        blurhash: file.blurhash,
        type: file.type,
        name: file.name,
      };
    });

  const tags = (apiTopic.TopicTag || []).map((topicTag: any) => topicTag.tag.title);

  const avatar =
    apiTopic.User?.avatarInfo?.url ||
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100";

  const location = apiTopic.User?.ipInfo
    ? `${apiTopic.User.ipInfo.city}·${apiTopic.User.ipInfo.regionName}`
    : undefined;

  // 判断当前用户是否点赞
  const isLiked = currentUserId
    ? (apiTopic.likes || []).some((like: any) => like.userId === currentUserId)
    : apiTopic.like === true;

  // 判断当前用户是否收藏
  const isSaved = currentUserId
    ? (apiTopic.collections || []).some((collection: any) => collection.userId === currentUserId)
    : false;

  return {
    id: String(apiTopic.id),
    title: apiTopic.title,
    content: apiTopic.content,
    images,
    author: {
      id: apiTopic.User?.id || apiTopic.userId,
      name: apiTopic.User?.name || "未知用户",
      avatar,
    },
    tags,
    likes: (apiTopic.likes || []).length,
    comments: (apiTopic.comments || []).length,
    saves: (apiTopic.collections || []).length,
    isLiked,
    isSaved,
    createdAt: apiTopic.createdAt,
    location,
  };
};

// 获取话题详情的hook
export const useTopicDetail = (id: number, userId?: number) =>
  useQuery({
    queryKey: ["topic", id, userId],
    queryFn: async () => {
      const response = await apiService.getTopicDetail(id, userId, true);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result, userId);
      }
      throw new Error(response.msg || "获取话题详情失败");
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

// 获取评论列表的hook
export const useComments = (topicId: number) =>
  useQuery({
    queryKey: ["comments", topicId],
    queryFn: async () => {
      const response = await apiService.getComments({
        topicId,
        page: 1,
        size: 50,
      });
      if (response.code === 200 && response.result) {
        return response.result.data;
      }
      throw new Error(response.msg || "获取评论失败");
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

// 创建评论的hook
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      topicId: number;
      content: string;
      parentId?: number;
    }) => {
      const response = await apiService.createComment(data);
      if (response.code === 200) {
        return response.result;
      }
      throw new Error(response.msg || "创建评论失败");
    },
    onSuccess: (_data, variables) => {
      // 刷新评论列表
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.topicId],
      });
    },
    onError: (_error) => {},
  });
};
