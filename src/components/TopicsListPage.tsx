import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useIsAuthenticated } from "../hooks/useAuth";
import {
  useCollectTopic,
  useInfiniteTopics,
  useLikeTopic,
} from "../hooks/useTopics";
import { apiService } from "../services/api";
import CreatePostModal from "./CreatePostModal";
import LoadingSpinner from "./LoadingSpinner";
import PageLayout from "./PageLayout";
import SimpleImageDetail from "./SimpleImageDetail";
import SimpleInfiniteScroll from "./SimpleInfiniteScroll";

interface TopicsListPageProps {
  activeTab: "home" | "trending" | "likes" | "saved";
  sortBy?: string;
  title?: string;
  icon?: React.ReactNode;
  emptyMessage?: string;
}

export default function TopicsListPage({
  activeTab,
  sortBy = "createdAt,desc",
  title,
  icon,
  emptyMessage = "暂无内容",
}: TopicsListPageProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTopicData, setEditingTopicData] = useState<{
    title: string;
    content: string;
    images?: any[];
  } | null>(null);
  const [_isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: topicsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteTopics({
    size: 20,
    sort: sortBy,
  });

  const { isAuthenticated } = useIsAuthenticated();
  const likeMutation = useLikeTopic();
  const collectMutation = useCollectTopic();

  const posts = topicsData?.pages.flatMap((page: any) => page.items) || [];

  const handleLike = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        setIsLoginModalOpen(true);
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      likeMutation.mutate({
        topicId: Number(postId),
        isLiked: post.isLiked,
      });
    },
    [posts, isAuthenticated, likeMutation]
  );

  const handleSave = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        setIsLoginModalOpen(true);
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      collectMutation.mutate({
        topicId: Number(postId),
        isCollected: post.isSaved,
      });
    },
    [posts, isAuthenticated, collectMutation]
  );

  const handlePostClick = useCallback((postId: string) => {
    setSelectedTopicId(Number(postId));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && posts.length === 0) {
    return (
      <PageLayout activeTab={activeTab}>
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <LoadingSpinner className="mb-4" size="lg" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout activeTab={activeTab}>
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="mb-4 text-red-600">加载失败</p>
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => refetch()}
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activeTab={activeTab}>
      <div className="mx-auto max-w-6xl px-8 py-8">
        {title && (
          <div className="mb-8 flex items-center gap-3">
            {icon}
            <h1 className="font-bold text-2xl text-gray-900">{title}</h1>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <SimpleInfiniteScroll
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLike={handleLike}
              onLoadMore={handleLoadMore}
              onPostClick={handlePostClick}
              onSave={handleSave}
              posts={posts}
            />
          </div>
        )}
      </div>

      {selectedTopicId && (
        <SimpleImageDetail
          isOpen={!!selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onEdit={async (topicId) => {
            try {
              // 加载话题数据
              const response = await apiService.getTopicDetail(topicId);
              if (response.code === 200 && response.result) {
                const topic = response.result;

                // 提取图片列表（从 fileList 字段）
                const images =
                  topic.fileList?.map((file: any) => ({
                    id: file.id,
                    url: file.url,
                    width: 0,
                    height: 0,
                    blurhash: file.blurhash || "",
                    type: file.type || "image/jpeg",
                    name: file.name || "",
                    videoSrc: file.videoSrc || null, // 实况图片的视频源
                  })) || [];

                setEditingTopicId(topicId);
                setEditingTopicData({
                  title: topic.title || "",
                  content: topic.content || "",
                  images: images,
                });
                setSelectedTopicId(null);
              }
            } catch (error) {
              console.error("加载话题失败:", error);
            }
          }}
          onLike={handleLike}
          onSave={handleSave}
          topicId={selectedTopicId}
        />
      )}

      {/* 编辑对话框 */}
      {editingTopicId && editingTopicData && (
        <CreatePostModal
          editMode
          initialData={editingTopicData}
          isOpen={!!editingTopicId}
          onClose={() => {
            setEditingTopicId(null);
            setEditingTopicData(null);
          }}
          onSubmit={async (postData: any) => {
            try {
              // 使用 compareObjects 只传递变动的字段
              const { compareObjects } = await import("@iceywu/utils");

              // 构建原始数据（用于对比）
              const originalData = {
                title: editingTopicData.title,
                content: editingTopicData.content,
                fileIds: editingTopicData.images?.map((img) => img.id) || [],
              };

              // 对比变化
              const changes = compareObjects(originalData, postData);

              // 如果没有变化，直接关闭
              if (Object.keys(changes).length === 0) {
                console.log("没有变化，无需更新");
                return;
              }

              console.log("🔄-----变更字段-----", changes);

              const response = await apiService.updateTopic(
                editingTopicId,
                changes
              );

              if (response.code === 200) {
                // 刷新相关缓存
                queryClient.invalidateQueries({
                  queryKey: ["topic", editingTopicId],
                });
                queryClient.invalidateQueries({ queryKey: ["topics"] });
                refetch();
              } else {
                alert(response.msg || "更新失败");
              }
            } catch (error: any) {
              console.error("更新话题失败:", error);
              alert(error.message || "更新失败，请重试");
            }
          }}
          topicId={editingTopicId}
        />
      )}
    </PageLayout>
  );
}
