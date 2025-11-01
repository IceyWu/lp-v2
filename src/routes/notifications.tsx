import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/AuthGuard";
import KeepAlivePage from "@/components/KeepAlivePage";
import ScrollRestoreContainer from "@/components/ScrollRestoreContainer";
import NotificationList from "@/components/NotificationList";
import NotificationFilter from "@/components/NotificationFilter";
import {
  useNotifications,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import type { NotificationMessage } from "@/types";

function NotificationsPage() {
  const [activeType, setActiveType] = useState<string>("all");
  const markAllAsReadMutation = useMarkAllAsRead();

  // 根据筛选类型获取通知
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useNotifications({
    type: activeType === "all" ? undefined : activeType,
    pageSize: 10,
  });

  // 合并所有页面的通知数据
  const notifications = useMemo(() => {
    if (!data?.pages) {
      return [];
    }
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // 计算各类型的通知数量
  const counts = useMemo(() => {
    const allNotifications = data?.pages.flatMap((page) => page.items) || [];
    return {
      all: allNotifications.length,
      like: allNotifications.filter((n: NotificationMessage) => n.type === "like").length,
      comment: allNotifications.filter((n: NotificationMessage) => n.type === "comment")
        .length,
      collection: allNotifications.filter(
        (n: NotificationMessage) => n.type === "collection"
      ).length,
    };
  }, [data]);

  // 处理全部标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("已将所有通知标记为已读");
    } catch (error) {
      toast.error("操作失败，请重试");
    }
  };

  // 处理类型切换
  const handleTypeChange = (type: string) => {
    setActiveType(type);
  };

  return (
    <AuthGuard>
      <div className="mx-auto min-h-screen max-w-3xl bg-background">
        {/* 页面标题 */}
        <div className="border-border border-b bg-background px-4 py-4">
          <h1 className="font-semibold text-foreground text-xl">通知</h1>
        </div>

        {/* 筛选栏 */}
        <NotificationFilter
          activeType={activeType}
          counts={counts}
          onTypeChange={handleTypeChange}
        />

        {/* 操作栏 */}
        {notifications.length > 0 && (
          <div className="border-border border-b bg-background px-4 py-3">
            <Button
              className="text-sm"
              disabled={markAllAsReadMutation.isPending}
              onClick={handleMarkAllAsRead}
              size="sm"
              variant="outline"
            >
              {markAllAsReadMutation.isPending
                ? "标记中..."
                : "全部标记为已读"}
            </Button>
          </div>
        )}

        {/* 通知列表 */}
        <NotificationList
          hasMore={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          notifications={notifications}
          onLoadMore={() => fetchNextPage()}
          onRefresh={() => refetch()}
        />
      </div>
    </AuthGuard>
  );
}

export const Route = createFileRoute("/notifications")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="notifications">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="notifications"
      >
        <NotificationsPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
