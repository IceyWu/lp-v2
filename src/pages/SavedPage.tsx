import { Bookmark } from "lucide-react";
import TopicsListPage from "../components/TopicsListPage";

export default function SavedPage() {
  return (
    <TopicsListPage
      activeTab="saved"
      emptyMessage="还没有收藏任何内容"
      icon={<Bookmark className="text-blue-500" size={28} />}
      sortBy="createdAt,desc"
      title="我的收藏"
    />
  );
}
