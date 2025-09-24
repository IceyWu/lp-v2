import { createFileRoute } from "@tanstack/react-router";
import KeepAlivePage from "../components/KeepAlivePage";
import ScrollRestoreContainer from "../components/ScrollRestoreContainer";
import SearchPageWrapper from "../pages/SearchPageWrapper";

export const Route = createFileRoute("/search")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="search">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="search"
      >
        <SearchPageWrapper />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
