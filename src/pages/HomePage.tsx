import { useState, useCallback } from 'react'
import Header from '../components/Header'
import SimpleInfiniteScroll from '../components/SimpleInfiniteScroll'
import CreatePostModal from '../components/CreatePostModal'
import FloatingNavBar from '../components/FloatingNavBar'
import LoginModal from '../components/LoginModal'
import LoadingSpinner from '../components/LoadingSpinner'
import BackToTop from '../components/BackToTop'
import SimpleImageDetail from '../components/SimpleImageDetail'
import { useInfiniteTopics, useLikeTopic, useCreateTopic } from '../hooks/useTopics'
import { useIsAuthenticated } from '../hooks/useAuth'
import { Post } from '../types'

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)

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
    sort: 'createdAt,desc'
  })

  const { isAuthenticated } = useIsAuthenticated()
  const likeMutation = useLikeTopic()
  const createTopicMutation = useCreateTopic()

  const posts = topicsData?.pages.flatMap((page: any) => page.items) || []

  const handleLike = useCallback((postId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }

    const post = posts.find(p => p.id === postId)
    if (!post) return

    likeMutation.mutate({
      topicId: Number(postId),
      isLiked: post.isLiked
    })
  }, [posts, isAuthenticated, likeMutation])

  const handleSave = useCallback((postId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }
    console.log('收藏功能待实现:', postId)
  }, [isAuthenticated])

  const handlePostClick = useCallback((postId: string) => {
    setSelectedTopicId(Number(postId))
  }, [])

  const handleCreatePost = useCallback((postData: Omit<Post, 'id' | 'author' | 'likes' | 'comments' | 'saves' | 'isLiked' | 'isSaved' | 'createdAt'>) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }

    createTopicMutation.mutate({
      title: postData.title,
      content: postData.content,
      images: postData.images.map(img => img.url),
      tags: postData.tags,
      location: postData.location,
    })
  }, [isAuthenticated, createTopicMutation])

  const handleLoginSuccess = useCallback(() => {
    refetch()
  }, [refetch])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading && posts.length === 0) {
    return (
      <>
        <Header
          activeTab="home"
          onCreatePost={() => setIsCreateModalOpen(true)}
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <main className="pt-20 min-h-screen pb-24">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">加载中...</p>
              </div>
            </div>
          </div>
        </main>
        <FloatingNavBar
          activeTab="home"
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header
          activeTab="home"
          onCreatePost={() => setIsCreateModalOpen(true)}
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <main className="pt-20 min-h-screen pb-24">
          <div className="max-w-6xl mx-auto px-8 py-8">
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
          </div>
        </main>
        <FloatingNavBar
          activeTab="home"
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </>
    )
  }

  return (
    <>
      <Header
        activeTab="home"
        onCreatePost={() => {
          if (!isAuthenticated) {
            setIsLoginModalOpen(true)
          } else {
            setIsCreateModalOpen(true)
          }
        }}
        onLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-8 py-8">
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
        </div>
      </main>

      <FloatingNavBar
        activeTab="home"
        onLogin={() => setIsLoginModalOpen(true)}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {selectedTopicId && (
        <SimpleImageDetail
          topicId={selectedTopicId}
          isOpen={!!selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}

      <BackToTop />
    </>
  )
}