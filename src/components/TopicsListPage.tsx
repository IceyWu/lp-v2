import { useCallback, useState } from "react";
import { useIsAuthenticated } from "../hooks/useAuth";
import {
  useCollectTopic,
  useInfiniteTopics,
  useLikeTopic,
} from "../hooks/useTopics";
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
  const [_isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
          onLike={handleLike}
          onSave={handleSave}
          topicId={selectedTopicId}
        />
      )}
    </PageLayout>
  );
}
