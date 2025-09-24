import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { Post, PostImage } from "../types";

// 将API话题数据转换为前端Post类型（复用之前的逻辑）
const transformApiTopicToPost = (apiTopic: any): Post => {
  const images: PostImage[] = apiTopic.fileList
    .filter((file: any) => file.type.startsWith("image/"))
    .map((file: any) => ({
      id: file.id,
      url: file.url,
      width: file.width,
      height: file.height,
      blurhash: file.blurhash,
      type: file.type,
      name: file.name,
    }));

  const tags = apiTopic.TopicTag.map((topicTag: any) => topicTag.tag.title);

  const avatar =
    apiTopic.User.avatarInfo?.url ||
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100";

  const location = apiTopic.User.ipInfo
    ? `${apiTopic.User.ipInfo.city}·${apiTopic.User.ipInfo.regionName}`
    : undefined;

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

// 获取话题详情的hook
export const useTopicDetail = (id: number, userId?: number) =>
  useQuery({
    queryKey: ["topic", id, userId],
    queryFn: async () => {
      const response = await apiService.getTopicDetail(id, userId, true);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || "获取话题详情失败");
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
      throw new Error(response.message || "获取评论失败");
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
      throw new Error(response.message || "创建评论失败");
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
