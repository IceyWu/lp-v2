import { createFileRoute } from "@tanstack/react-router";
import KeepAlivePage from "../components/KeepAlivePage";
import ScrollRestoreContainer from "../components/ScrollRestoreContainer";
import TrendingPage from "../pages/TrendingPage";

export const Route = createFileRoute("/trending")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="trending">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="trending"
      >
        <TrendingPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
