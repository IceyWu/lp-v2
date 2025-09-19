import { Heart } from 'lucide-react'
import TopicsListPage from '../components/TopicsListPage'

export default function LikesPage() {
  return (
    <TopicsListPage 
      activeTab="likes" 
      sortBy="createdAt,desc"
      title="我的点赞"
      icon={<Heart size={28} className="text-red-500" />}
      emptyMessage="还没有点赞任何内容"
    />
  )
}