import { TrendingUp } from 'lucide-react'
import TopicsListPage from '../components/TopicsListPage'

export default function TrendingPage() {
  return (
    <TopicsListPage 
      activeTab="trending" 
      sortBy="likes,desc"
      title="热门内容"
      icon={<TrendingUp size={28} className="text-orange-500" />}
      emptyMessage="暂无热门内容"
    />
  )
}