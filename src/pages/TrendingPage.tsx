import { TrendingUp } from "lucide-react";
import TopicsListPage from "../components/TopicsListPage";

export default function TrendingPage() {
  return (
    <TopicsListPage
      activeTab="trending"
      emptyMessage="暂无热门内容"
      icon={<TrendingUp className="text-orange-500" size={28} />}
      sortBy="likes,desc"
      title="热门内容"
    />
  );
}
