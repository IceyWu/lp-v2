import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Heart, Bookmark, TrendingUp } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import MasonryGrid from './components/MasonryGrid';
import CreatePostModal from './components/CreatePostModal';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import FloatingNavBar from './components/FloatingNavBar';
import { mockPosts } from './data/mockData';
import { Post } from './types';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLike = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
          : post
      )
    );
  }, []);

  const handleSave = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
            ...post,
            isSaved: !post.isSaved,
            saves: post.isSaved ? post.saves - 1 : post.saves + 1
          }
          : post
      )
    );
  }, []);

  const handlePostClick = useCallback((postId: string) => {
    console.log('点击了动态:', postId);
  }, []);

  const handleCreatePost = useCallback((postData: Omit<Post, 'id' | 'author' | 'likes' | 'comments' | 'saves' | 'isLiked' | 'isSaved' | 'createdAt'>) => {
    const newPost: Post = {
      id: Date.now().toString(),
      ...postData,
      author: {
        name: '小雨',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
      },
      likes: 0,
      comments: 0,
      saves: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const renderContent = () => {
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

            <section>
              <MasonryGrid columns={3}>
                {posts
                  .sort((a, b) => (b.likes + b.comments + b.saves) - (a.likes + a.comments + a.saves))
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                      onClick={handlePostClick}
                    />
                  ))}
              </MasonryGrid>
            </section>
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

            <section>
              <MasonryGrid columns={3}>
                {posts
                  .filter(post => post.isLiked)
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                      onClick={handlePostClick}
                    />
                  ))}
              </MasonryGrid>
            </section>
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

            <section>
              <MasonryGrid columns={3}>
                {posts
                  .filter(post => post.isSaved)
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                      onClick={handlePostClick}
                    />
                  ))}
              </MasonryGrid>
            </section>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-8">
            {/* 内容网格 */}
            <section>
              <MasonryGrid columns={3}>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onSave={handleSave}
                    onClick={handlePostClick}
                  />
                ))}
              </MasonryGrid>
            </section>
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
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}