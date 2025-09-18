import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import TrendingPage from '../pages/TrendingPage'

export const Route = createFileRoute('/trending')({
  component: () => (
    <KeepAlivePage name="trending" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="trending" className="h-screen overflow-auto">
        <TrendingPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})