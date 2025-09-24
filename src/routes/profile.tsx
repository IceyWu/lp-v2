import { createFileRoute } from "@tanstack/react-router";
import KeepAlivePage from "../components/KeepAlivePage";
import ScrollRestoreContainer from "../components/ScrollRestoreContainer";
import ProfilePageWrapper from "../pages/ProfilePageWrapper";

export const Route = createFileRoute("/profile")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="profile">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="profile"
      >
        <ProfilePageWrapper />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
