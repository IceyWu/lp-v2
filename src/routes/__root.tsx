import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AliveScope } from "react-activation";
import ErrorBoundary from "../components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
      gcTime: 30 * 60 * 1000, // 30分钟后清理缓存
      retry: 2,
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
      refetchOnMount: false, // 组件挂载时不自动重新获取（配合keep-alive）
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AliveScope>
          <div className="min-h-screen bg-white">
            <Outlet />
          </div>
        </AliveScope>
      </ErrorBoundary>
    </QueryClientProvider>
  ),
});
