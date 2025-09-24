import { createFileRoute } from "@tanstack/react-router";
import KeepAlivePage from "../components/KeepAlivePage";
import ScrollRestoreContainer from "../components/ScrollRestoreContainer";
import SavedPage from "../pages/SavedPage";

export const Route = createFileRoute("/saved")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="saved">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="saved"
      >
        <SavedPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
