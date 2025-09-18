import { useState } from 'react'
import { User } from 'lucide-react'
import Header from '../components/Header'
import ProfilePage from '../components/ProfilePage'
import CreatePostModal from '../components/CreatePostModal'
import FloatingNavBar from '../components/FloatingNavBar'
import LoginModal from '../components/LoginModal'
import BackToTop from '../components/BackToTop'
import { useIsAuthenticated } from '../hooks/useAuth'
import { useCreateTopic } from '../hooks/useTopics'
import { Post } from '../types'

export default function ProfilePageWrapper() {
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

  if (!isAuthenticated) {
    return (
      <>
        <Header
          activeTab="profile"
          onCreatePost={() => setIsCreateModalOpen(true)}
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <main className="pt-20 min-h-screen pb-24">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <User size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">请先登录</h3>
                <p className="text-gray-500 mb-6">登录后查看个人中心</p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  立即登录
                </button>
              </div>
            </div>
          </div>
        </main>
        <FloatingNavBar
          activeTab="profile"
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
        activeTab="profile"
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
        <div className="max-w-6xl mx-auto px-8 py-8">
          <ProfilePage />
        </div>
      </main>

      <FloatingNavBar
        activeTab="profile"
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