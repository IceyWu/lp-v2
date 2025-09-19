import { useState, useCallback } from 'react'
import PageLayout from './PageLayout'
import SimpleInfiniteScroll from './SimpleInfiniteScroll'
import SimpleImageDetail from './SimpleImageDetail'
import LoadingSpinner from './LoadingSpinner'
import { useInfiniteTopics, useLikeTopic } from '../hooks/useTopics'
import { useIsAuthenticated } from '../hooks/useAuth'

interface TopicsListPageProps {
  activeTab: 'home' | 'trending' | 'likes' | 'saved'
  sortBy?: string
  title?: string
  icon?: React.ReactNode
  emptyMessage?: string
}

export default function TopicsListPage({ 
  activeTab, 
  sortBy = 'createdAt,desc',
  title,
  icon,
  emptyMessage = '暂无内容'
}: TopicsListPageProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

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
    sort: sortBy
  })

  const { isAuthenticated } = useIsAuthenticated()
  const likeMutation = useLikeTopic()

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

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading && posts.length === 0) {
    return (
      <PageLayout activeTab={activeTab}>
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout activeTab={activeTab}>
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
      </PageLayout>
    )
  }

  return (
    <PageLayout activeTab={activeTab}>
      <div className="max-w-6xl mx-auto px-8 py-8">
        {title && (
          <div className="flex items-center gap-3 mb-8">
            {icon}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
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
              posts={posts}
              hasMore={hasNextPage || false}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              onLike={handleLike}
              onSave={handleSave}
              onPostClick={handlePostClick}
            />
          </div>
        )}
      </div>

      {selectedTopicId && (
        <SimpleImageDetail
          topicId={selectedTopicId}
          isOpen={!!selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}
    </PageLayout>
  )
}