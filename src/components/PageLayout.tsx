import { useState, ReactNode } from 'react'
import Header from './Header'
import CreatePostModal from './CreatePostModal'
import FloatingNavBar from './FloatingNavBar'
import LoginModal from './LoginModal'
import BackToTop from './BackToTop'
import { useIsAuthenticated } from '../hooks/useAuth'
import { useCreateTopic } from '../hooks/useTopics'
import { Post } from '../types'

interface PageLayoutProps {
  activeTab: 'home' | 'trending' | 'search' | 'likes' | 'saved' | 'profile'
  children: ReactNode
  requireAuth?: boolean
  authFallback?: ReactNode
}

export default function PageLayout({ 
  activeTab, 
  children, 
  requireAuth = false, 
  authFallback 
}: PageLayoutProps) {
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

  if (requireAuth && !isAuthenticated && authFallback) {
    return (
      <>
        <Header
          activeTab={activeTab}
          onCreatePost={() => setIsCreateModalOpen(true)}
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <main className="pt-20 min-h-screen pb-24">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {authFallback}
          </div>
        </main>
        <FloatingNavBar
          activeTab={activeTab}
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
        activeTab={activeTab}
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
        {children}
      </main>

      <FloatingNavBar
        activeTab={activeTab}
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