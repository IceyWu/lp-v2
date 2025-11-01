import { useCallback, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import NotificationItem from "./NotificationItem";
import LoadingSpinner from "./LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationMessage } from "@/types";

interface NotificationListProps {
  notifications: NotificationMessage[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRefresh?: () => void;
}

// 骨架屏组件
function NotificationSkeleton() {
  return (
    <div className="border-border border-b p-4">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationList({
  notifications,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  onRefresh,
}: NotificationListProps) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isFetchingNextPage) {
        onLoadMore();
      }
    },
    [hasMore, isFetchingNextPage, onLoadMore]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  // 初始加载状态
  if (isLoading && notifications.length === 0) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 空状态
  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Bell className="text-muted-foreground" size={40} />
        </div>
        <p className="mb-2 font-medium text-foreground text-lg">暂无通知</p>
        <p className="text-muted-foreground text-sm">
          当有人与你的内容互动时，通知会显示在这里
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 通知列表 */}
      <div className="divide-y divide-border">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {/* 加载触发器 */}
      <div className="py-8 text-center" ref={loadingRef}>
        {isFetchingNextPage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="md" />
            <p className="text-muted-foreground text-sm">加载中...</p>
          </div>
        )}
        {!hasMore && notifications.length > 0 && (
          <p className="text-muted-foreground text-sm">已经到底了～</p>
        )}
      </div>
    </div>
  );
}
