import { Bookmark, Camera, Grid, Heart, Map, Settings } from "lucide-react";
import { useState } from "react";
import { useIsAuthenticated } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import ProfileEditDialog from "./ProfileEditDialog";
import TrackPage from "./TrackPage";

export default function ProfilePage() {
  const { user, isLoading } = useIsAuthenticated();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">用户信息加载失败</p>
        </div>
      </div>
    );
  }

  // 模拟统计数据，后续可以通过API获取
  const stats = [
    { label: "动态", value: "0" },
    { label: "关注", value: "0" },
    { label: "粉丝", value: "0" },
  ];

  const tabs = [
    { id: "posts", icon: Grid, label: "动态" },
    { id: "track", icon: Map, label: "轨迹" },
    { id: "liked", icon: Heart, label: "喜欢" },
    { id: "saved", icon: Bookmark, label: "收藏" },
  ];

  return (
    <div className="space-y-6">
      {/* 紧凑的个人信息区域 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover"
                src={
                  user.avatarInfo?.url ||
                  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120"
                }
              />
              <button className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                <Camera size={12} />
              </button>
            </div>

            <div>
              <h1 className="font-semibold text-black text-xl">
                {user.name || user.account}
              </h1>
              <p className="text-gray-600 text-sm">
                {user.signature || "记录生活中的美好时光 ✨"}
              </p>
            </div>
          </div>

          <button
            aria-label="编辑个人资料"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Settings className="text-gray-500" size={18} />
          </button>
        </div>

        {/* 紧凑的统计数据 */}
        <div className="mt-6 flex justify-around border-gray-100 border-t pt-4">
          {stats.map((stat, index) => (
            <div className="text-center" key={index}>
              <div className="font-semibold text-black text-xl">
                {stat.value}
              </div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 内容切换标签 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-1">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 transition-all ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 主要内容区域 */}
      {activeTab === "track" ? (
        <TrackPage />
      ) : (
        <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white">
          {/* 内容网格区域 */}
          <div className="p-6">
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                {activeTab === "posts" && (
                  <Grid className="text-gray-400" size={20} />
                )}
                {activeTab === "liked" && (
                  <Heart className="text-gray-400" size={20} />
                )}
                {activeTab === "saved" && (
                  <Bookmark className="text-gray-400" size={20} />
                )}
              </div>
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                {activeTab === "posts" && "还没有动态"}
                {activeTab === "liked" && "还没有喜欢的内容"}
                {activeTab === "saved" && "还没有收藏的内容"}
              </h3>
              <p className="mb-6 text-gray-500 text-sm">
                {activeTab === "posts" && "开始分享你的第一个精彩瞬间"}
                {activeTab === "liked" && "点赞你喜欢的内容"}
                {activeTab === "saved" && "收藏你感兴趣的内容"}
              </p>
              {activeTab === "posts" && (
                <button className="rounded-full bg-black px-6 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800">
                  创建动态
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 编辑对话框 */}
      {user && (
        <ProfileEditDialog
          onOpenChange={setIsEditDialogOpen}
          open={isEditDialogOpen}
          user={user}
        />
      )}
    </div>
  );
}
