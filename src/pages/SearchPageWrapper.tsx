import { useState } from 'react'
import Header from '../components/Header'
import SearchPage from '../components/SearchPage'
import CreatePostModal from '../components/CreatePostModal'
import FloatingNavBar from '../components/FloatingNavBar'
import LoginModal from '../components/LoginModal'
import BackToTop from '../components/BackToTop'
import { useIsAuthenticated } from '../hooks/useAuth'
import { useCreateTopic } from '../hooks/useTopics'
import { Post } from '../types'

export default function SearchPageWrapper() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const { isAuthenticated } = useIsAuthenticated()
  const createTopicMutation = useCreateTopic()

  const handleCreatePost = (postData: Omit<Post, 'id' | 'author' | 'likes' | 'comments' | 'saves' | 'isLiked' | 'isSaved' | 'createdAt'>) => {
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
  }

  const handleLoginSuccess = () => {
    // 登录成功后的处理
  }

  return (
    <>
      <Header
        activeTab="search"
        onCreatePost={() => {
          if (!isAuthenticated) {
            setIsLoginModalOpen(true)
          } else {
            setIsCreateModalOpen(true)
          }
        }}
        onLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="pt-20 min-h-screen pb-24">
        <SearchPage />
      </main>

      <FloatingNavBar
        activeTab="search"
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

      <BackToTop />
    </>
  )
}