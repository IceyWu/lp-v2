import { Bookmark } from 'lucide-react'
import TopicsListPage from '../components/TopicsListPage'

export default function SavedPage() {
  return (
    <TopicsListPage 
      activeTab="saved" 
      sortBy="createdAt,desc"
      title="我的收藏"
      icon={<Bookmark size={28} className="text-blue-500" />}
      emptyMessage="还没有收藏任何内容"
    />
  )
}