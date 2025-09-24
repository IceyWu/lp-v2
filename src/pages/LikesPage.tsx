import { Heart } from "lucide-react";
import TopicsListPage from "../components/TopicsListPage";

export default function LikesPage() {
  return (
    <TopicsListPage
      activeTab="likes"
      emptyMessage="还没有点赞任何内容"
      icon={<Heart className="text-red-500" size={28} />}
      sortBy="createdAt,desc"
      title="我的点赞"
    />
  );
}
