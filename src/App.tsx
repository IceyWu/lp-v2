import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Heart, Bookmark, TrendingUp } from 'lucide-react';
import Header from './components/Header';

import SimpleInfiniteScroll from './components/SimpleInfiniteScroll';
import CreatePostModal from './components/CreatePostModal';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import FloatingNavBar from './components/FloatingNavBar';
import LoginModal from './components/LoginModal';
import LoadingSpinner from './components/LoadingSpinner';
import BackToTop from './components/BackToTop';
import ErrorBoundary from './components/ErrorBoundary';
import SimpleImageDetail from './components/SimpleImageDetail';
import { useInfiniteTopics, useLikeTopic, useCreateTopic } from './hooks/useTopics';
import { useIsAuthenticated } from './hooks/useAuth';
import { Post } from './types';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  // 获取话题数据（无限滚动）
  const {
    data: topicsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteTopics({
    size: 20,
    sort: activeTab === 'trending' ? 'likes,desc' : 'createdAt,desc'
  });

  // 获取用户认证状态
  const { isAuthenticated } = useIsAuthenticated();

  // 点赞功能
  const likeMutation = useLikeTopic();

  // 创建话题功能
  const createTopicMutation = useCreateTopic();

  // 合并所有页面的数据
  const posts = topicsData?.pages.flatMap((page: any) => page.items) || [];

  const handleLike = useCallback((postId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    likeMutation.mutate({
      topicId: Number(postId),
      isLiked: post.isLiked
    });
  }, [posts, isAuthenticated, likeMutation]);

  const handleSave = useCallback((postId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    // TODO: 实现收藏功能，需要后端API支持
    console.log('收藏功能待实现:', postId);
  }, [isAuthenticated]);

  const handlePostClick = useCallback((postId: string) => {
    setSelectedTopicId(Number(postId));
  }, []);

  const handleCreatePost = useCallback((postData: Omit<Post, 'id' | 'author' | 'likes' | 'comments' | 'saves' | 'isLiked' | 'isSaved' | 'createdAt'>) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    createTopicMutation.mutate({
      title: postData.title,
      content: postData.content,
      images: postData.images.map(img => img.url),
      tags: postData.tags,
      location: postData.location,
    });
  }, [isAuthenticated, createTopicMutation]);

  const handleLoginSuccess = useCallback(() => {
    // 登录成功后刷新数据
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderContent = () => {
    // 初始加载状态
    if (isLoading && !topicsData) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    // 错误状态
    if (error) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">加载失败</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'profile':
        return <ProfilePage />;
      case 'trending':
        return (
          <div className="space-y-8">
            {/* 简洁的页面标识 */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="p-2 bg-gray-100 rounded-full">
                <TrendingUp size={18} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">热门内容</h2>
                <p className="text-sm text-gray-500 mt-1">发现当下最受欢迎的精彩内容</p>
              </div>
            </div>

            <SimpleInfiniteScroll
              posts={posts.sort((a, b) => (b.likes + b.comments + b.saves) - (a.likes + a.comments + a.saves))}
              hasMore={hasNextPage || false}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              onLike={handleLike}
              onSave={handleSave}
              onPostClick={handlePostClick}
            />
          </div>
        );
      case 'likes':
        return (
          <div className="space-y-8">
            {/* 简洁的页面标识 */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="p-2 bg-red-50 rounded-full">
                <Heart size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">我喜欢的</h2>
                <p className="text-sm text-gray-500 mt-1">收集你最喜爱的精彩内容</p>
              </div>
            </div>

            <SimpleInfiniteScroll
              posts={posts.filter(post => post.isLiked)}
              hasMore={hasNextPage || false}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              onLike={handleLike}
              onSave={handleSave}
              onPostClick={handlePostClick}
            />
          </div>
        );
      case 'saved':
        return (
          <div className="space-y-8">
            {/* 简洁的页面标识 */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="p-2 bg-amber-50 rounded-full">
                <Bookmark size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">我的收藏</h2>
                <p className="text-sm text-gray-500 mt-1">保存的美好瞬间</p>
              </div>
            </div>

            <SimpleInfiniteScroll
              posts={posts.filter(post => post.isSaved)}
              hasMore={hasNextPage || false}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              onLike={handleLike}
              onSave={handleSave}
              onPostClick={handlePostClick}
            />
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-8">
            <SimpleInfiniteScroll
              posts={posts}
              hasMore={hasNextPage || false}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              onLike={handleLike}
              onSave={handleSave}
              onPostClick={handlePostClick}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setIsCreateModalOpen(true)}
      />

      {/* 主容器 */}
      <main className="pt-20 min-h-screen pb-24">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {renderContent()}
        </div>
      </main>

      {/* 浮动导航栏 */}
      <FloatingNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 创建动态模态框 */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* 登录模态框 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* 话题详情模态框 */}
      {selectedTopicId && (
        <SimpleImageDetail
          topicId={selectedTopicId}
          isOpen={!!selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}

      {/* 回到顶部按钮 */}
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}