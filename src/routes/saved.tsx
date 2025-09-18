import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import SavedPage from '../pages/SavedPage'

export const Route = createFileRoute('/saved')({
  component: () => (
    <KeepAlivePage name="saved" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="saved" className="h-screen overflow-auto">
        <SavedPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})