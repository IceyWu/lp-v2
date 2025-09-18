import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import LikesPage from '../pages/LikesPage'

export const Route = createFileRoute('/likes')({
  component: () => (
    <KeepAlivePage name="likes" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="likes" className="h-screen overflow-auto">
        <LikesPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})