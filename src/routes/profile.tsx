import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import ProfilePageWrapper from '../pages/ProfilePageWrapper'

export const Route = createFileRoute('/profile')({
  component: () => (
    <KeepAlivePage name="profile" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="profile" className="h-screen overflow-auto">
        <ProfilePageWrapper />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})