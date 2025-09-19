import TopicsListPage from '../components/TopicsListPage'

export default function HomePage() {
  return (
    <TopicsListPage 
      activeTab="home" 
      sortBy="createdAt,desc"
      emptyMessage="暂无动态"
    />
  )
}