import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import HomePage from '../pages/HomePage'

export const Route = createFileRoute('/')({
  component: () => (
    <KeepAlivePage name="home" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="home" className="h-screen overflow-auto">
        <HomePage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})