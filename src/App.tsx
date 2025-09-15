import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import MasonryGrid from './components/MasonryGrid';
import CreatePostModal from './components/CreatePostModal';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
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

  const handleCreatePost = useCallback((postData: any) => {
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
      case 'likes':
        return (
          <div className="max-w-6xl mx-auto px-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">我喜欢的</h2>
            <MasonryGrid columns={3}>
              {posts
                .filter(post => post.isLiked)
                .map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onSave={handleSave}
                    onClick={handlePostClick}
                  />
                ))}
            </MasonryGrid>
          </div>
        );
      case 'saved':
        return (
          <div className="max-w-6xl mx-auto px-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">我的收藏</h2>
            <MasonryGrid columns={3}>
              {posts
                .filter(post => post.isSaved)
                .map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onSave={handleSave}
                    onClick={handlePostClick}
                  />
                ))}
            </MasonryGrid>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="max-w-6xl mx-auto px-8 py-8">
            {/* 头部 */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                发现精彩生活
              </h1>
              <p className="text-xl text-gray-600">分享每一个美好瞬间</p>
            </div>

            {/* 动态列表 */}
            <MasonryGrid columns={3}>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onSave={handleSave}
                  onClick={handlePostClick}
                />
              ))}
            </MasonryGrid>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-200/20 to-secondary-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-secondary-200/20 to-primary-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* 顶部导航 */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setIsCreateModalOpen(true)}
      />

      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="relative z-10 ml-64 pt-20">
        {renderContent()}
      </main>

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