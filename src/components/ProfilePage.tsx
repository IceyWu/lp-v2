import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Camera, Grid, Heart, Map, Settings } from "lucide-react";
import { useCallback, useState } from "react";
import { useIsAuthenticated } from "../hooks/useAuth";
import {
  useCollectTopic,
  useInfiniteCollectedTopics,
  useInfiniteLikedTopics,
  useInfiniteTopics,
  useLikeTopic,
} from "../hooks/useTopics";
import { useUserStats } from "../hooks/useUserStats";
import { apiService } from "../services/api";
import CreatePostModal from "./CreatePostModal";
import LoadingSpinner from "./LoadingSpinner";
import ProfileEditDialog from "./ProfileEditDialog";
import SimpleImageDetail from "./SimpleImageDetail";
import SimpleInfiniteScroll from "./SimpleInfiniteScroll";
import TrackPage from "./TrackPage";

export default function ProfilePage() {
  const { user, isLoading } = useIsAuthenticated();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTopicData, setEditingTopicData] = useState<{
    title: string;
    content: string;
    images?: any[];
  } | null>(null);
  const queryClient = useQueryClient();

  // 获取用户动态数据
  const {
    data: topicsData,
    isLoading: isLoadingTopics,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTopics({
    userId: user?.id,
    size: 20,
    sort: "createdAt,desc",
  });

  // 获取用户喜欢的动态数据
  const {
    data: likedTopicsData,
    isLoading: isLoadingLikedTopics,
    fetchNextPage: fetchNextLikedPage,
    hasNextPage: hasNextLikedPage,
    isFetchingNextPage: isFetchingNextLikedPage,
  } = useInfiniteLikedTopics(user?.id);

  // 获取用户收藏的动态数据
  const {
    data: collectedTopicsData,
    isLoading: isLoadingCollectedTopics,
    fetchNextPage: fetchNextCollectedPage,
    hasNextPage: hasNextCollectedPage,
    isFetchingNextPage: isFetchingNextCollectedPage,
  } = useInfiniteCollectedTopics(user?.id);

  const likeMutation = useLikeTopic();
  const collectMutation = useCollectTopic();

  // 获取用户统计数据
  const { data: userStats } = useUserStats(user?.id);

  const posts = topicsData?.pages.flatMap((page: any) => page.items) || [];
  const likedPosts =
    likedTopicsData?.pages.flatMap((page: any) => page.items) || [];
  const collectedPosts =
    collectedTopicsData?.pages.flatMap((page: any) => page.items) || [];

  const handleLike = useCallback(
    (postId: string) => {
      const allPosts = [...posts, ...likedPosts, ...collectedPosts];
      const post = allPosts.find((p) => p.id === postId);
      if (!post) return;

      likeMutation.mutate({
        topicId: Number(postId),
        isLiked: post.isLiked,
      });
    },
    [posts, likedPosts, collectedPosts, likeMutation]
  );

  const handleSave = useCallback(
    (postId: string) => {
      const allPosts = [...posts, ...likedPosts, ...collectedPosts];
      const post = allPosts.find((p) => p.id === postId);
      if (!post) return;

      collectMutation.mutate({
        topicId: Number(postId),
        isCollected: post.isSaved,
      });
    },
    [posts, likedPosts, collectedPosts, collectMutation]
  );

  const handlePostClick = useCallback((postId: string) => {
    setSelectedTopicId(Number(postId));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (activeTab === "posts") {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    } else if (activeTab === "liked") {
      if (hasNextLikedPage && !isFetchingNextLikedPage) {
        fetchNextLikedPage();
      }
    } else if (activeTab === "saved") {
      if (hasNextCollectedPage && !isFetchingNextCollectedPage) {
        fetchNextCollectedPage();
      }
    }
  }, [
    activeTab,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasNextLikedPage,
    isFetchingNextLikedPage,
    fetchNextLikedPage,
    hasNextCollectedPage,
    isFetchingNextCollectedPage,
    fetchNextCollectedPage,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">用户信息加载失败</p>
        </div>
      </div>
    );
  }

  // 统计数据
  const stats = [
    { label: "动态", value: posts.length.toString() },
    {
      label: "关注",
      value: userStats?.followingCount?.toString() || "0",
    },
    {
      label: "粉丝",
      value: userStats?.followerCount?.toString() || "0",
    },
  ];

  const tabs = [
    {
      id: "posts",
      icon: Grid,
      label: "动态",
      count: topicsData?.pages[0]?.total,
    },
    { id: "track", icon: Map, label: "轨迹" },
    {
      id: "liked",
      icon: Heart,
      label: "喜欢",
      count: userStats?.likeCount,
    },
    {
      id: "saved",
      icon: Bookmark,
      label: "收藏",
      count: userStats?.collectionCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 紧凑的个人信息区域 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover"
                src={
                  user.avatarInfo?.url ||
                  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120"
                }
              />
              <button className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                <Camera size={12} />
              </button>
            </div>

            <div>
              <h1 className="font-semibold text-black text-xl">
                {user.name || user.account}
              </h1>
              <p className="text-gray-600 text-sm">
                {user.signature || "记录生活中的美好时光 ✨"}
              </p>
            </div>
          </div>

          <button
            aria-label="编辑个人资料"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Settings className="text-gray-500" size={18} />
          </button>
        </div>

        {/* 紧凑的统计数据 */}
        <div className="mt-6 flex justify-around border-gray-100 border-t pt-4">
          {stats.map((stat, index) => (
            <div className="text-center" key={index}>
              <div className="font-semibold text-black text-xl">
                {stat.value}
              </div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 内容切换标签 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-1">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 transition-all ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 主要内容区域 */}
      {activeTab === "track" ? (
        <TrackPage />
      ) : activeTab === "posts" ? (
        <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white">
          <div className="p-6">
            {isLoadingTopics && posts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Grid className="text-gray-400" size={20} />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  还没有动态
                </h3>
                <p className="mb-6 text-gray-500 text-sm">
                  开始分享你的第一个精彩瞬间
                </p>
                <button className="rounded-full bg-black px-6 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800">
                  创建动态
                </button>
              </div>
            ) : (
              <SimpleInfiniteScroll
                hasMore={hasNextPage}
                isLoading={isFetchingNextPage}
                onLike={handleLike}
                onLoadMore={handleLoadMore}
                onPostClick={handlePostClick}
                onSave={handleSave}
                posts={posts}
              />
            )}
          </div>
        </div>
      ) : activeTab === "liked" ? (
        <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white">
          <div className="p-6">
            {isLoadingLikedTopics && likedPosts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Heart className="text-gray-400" size={20} />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  还没有喜欢的内容
                </h3>
                <p className="mb-6 text-gray-500 text-sm">点赞你喜欢的内容</p>
              </div>
            ) : (
              <SimpleInfiniteScroll
                hasMore={hasNextLikedPage}
                isLoading={isFetchingNextLikedPage}
                onLike={handleLike}
                onLoadMore={handleLoadMore}
                onPostClick={handlePostClick}
                onSave={handleSave}
                posts={likedPosts}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white">
          <div className="p-6">
            {isLoadingCollectedTopics && collectedPosts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : collectedPosts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Bookmark className="text-gray-400" size={20} />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  还没有收藏的内容
                </h3>
                <p className="mb-6 text-gray-500 text-sm">收藏你感兴趣的内容</p>
              </div>
            ) : (
              <SimpleInfiniteScroll
                hasMore={hasNextCollectedPage}
                isLoading={isFetchingNextCollectedPage}
                onLike={handleLike}
                onLoadMore={handleLoadMore}
                onPostClick={handlePostClick}
                onSave={handleSave}
                posts={collectedPosts}
              />
            )}
          </div>
        </div>
      )}

      {/* 编辑对话框 */}
      {user && (
        <ProfileEditDialog
          onOpenChange={setIsEditDialogOpen}
          open={isEditDialogOpen}
          user={user}
        />
      )}

      {/* 图片详情弹窗 */}
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
                fetchNextPage();
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
    </div>
  );
}
