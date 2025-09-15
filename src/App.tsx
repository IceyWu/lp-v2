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
      case 'likes':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">我喜欢的</h2>
              <p className="text-xl text-gray-600">收集你最喜爱的精彩内容</p>
            </div>
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">我的收藏</h2>
              <p className="text-xl text-gray-600">保存的美好瞬间</p>
            </div>
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
          <div className="max-w-7xl mx-auto">
            {/* 头部 */}
            <div className="mb-12 text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                发现精彩生活
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                分享每一个美好瞬间，记录生活中的点点滴滴
              </p>
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
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setIsCreateModalOpen(true)}
      />

      {/* 侧边栏 */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 主内容区 */}
      <main className="ml-64 pt-20 min-h-screen">
        <div className="p-8">
          {renderContent()}
        </div>
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