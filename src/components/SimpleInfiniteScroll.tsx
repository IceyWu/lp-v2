import { useCallback, useEffect, useRef } from "react";
import type { Post } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import PostCard from "./PostCard";
import ResponsiveMasonry from "./ResponsiveMasonry";

interface SimpleInfiniteScrollProps {
  posts: Post[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onPostClick: (postId: string) => void;
  className?: string;
}

export default function SimpleInfiniteScroll({
  posts,
  hasMore,
  isLoading,
  onLoadMore,
  onLike,
  onSave,
  onPostClick,
  className = "",
}: SimpleInfiniteScrollProps) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
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

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">暂无内容</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveMasonry gap={16}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            onClick={onPostClick}
            onLike={onLike}
            onSave={onSave}
            post={post}
          />
        ))}
      </ResponsiveMasonry>

      {/* 加载触发器 */}
      <div className="py-8 text-center" ref={loadingRef}>
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="md" />
            <p className="text-gray-500 text-sm">加载中...</p>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-gray-500">已经到底了～</p>
        )}
      </div>
    </div>
  );
}
