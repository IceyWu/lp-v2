import { User } from "lucide-react";
import PageLayout from "../components/PageLayout";
import ProfilePage from "../components/ProfilePage";

const AuthFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <User className="mx-auto mb-4 text-gray-300" size={48} />
      <h3 className="mb-2 font-semibold text-gray-600 text-lg">请先登录</h3>
      <p className="mb-6 text-gray-500">登录后查看个人中心</p>
    </div>
  </div>
);

export default function ProfilePageWrapper() {
  return (
    <PageLayout
      activeTab="profile"
      authFallback={<AuthFallback />}
      requireAuth={true}
    >
      <div className="mx-auto max-w-6xl px-8 py-8">
        <ProfilePage />
      </div>
    </PageLayout>
  );
}
