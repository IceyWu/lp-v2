import PageLayout from '../components/PageLayout'
import SearchPage from '../components/SearchPage'

export default function SearchPageWrapper() {
  return (
    <PageLayout activeTab="search">
      <SearchPage />
    </PageLayout>
  )
}