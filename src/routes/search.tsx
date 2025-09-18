import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import SearchPageWrapper from '../pages/SearchPageWrapper'

export const Route = createFileRoute('/search')({
  component: () => (
    <KeepAlivePage name="search" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="search" className="h-screen overflow-auto">
        <SearchPageWrapper />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})