import { User } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import ProfilePage from '../components/ProfilePage'

const AuthFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <User size={48} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">请先登录</h3>
      <p className="text-gray-500 mb-6">登录后查看个人中心</p>
    </div>
  </div>
)

export default function ProfilePageWrapper() {
  return (
    <PageLayout 
      activeTab="profile" 
      requireAuth={true}
      authFallback={<AuthFallback />}
    >
      <div className="max-w-6xl mx-auto px-8 py-8">
        <ProfilePage />
      </div>
    </PageLayout>
  )
}