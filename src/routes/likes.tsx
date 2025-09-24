import { createFileRoute } from "@tanstack/react-router";
import KeepAlivePage from "../components/KeepAlivePage";
import ScrollRestoreContainer from "../components/ScrollRestoreContainer";
import LikesPage from "../pages/LikesPage";

export const Route = createFileRoute("/likes")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="likes">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="likes"
      >
        <LikesPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
