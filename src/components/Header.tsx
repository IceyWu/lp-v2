import { Link, useRouter } from "@tanstack/react-router";
import { Bell, LogOut, Plus, Search, User } from "lucide-react";
import MobileSidebar from "@/components/MobileSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsAuthenticated, useLogout } from "../hooks/useAuth";
import { useUnreadCount } from "../hooks/useNotifications";

interface HeaderProps {
  activeTab: string;
  onCreatePost: () => void;
  onLogin: () => void;
  onTabChange: (tab: string) => void;
}

export default function Header({
  activeTab,
  onCreatePost,
  onLogin,
  onTabChange,
}: HeaderProps) {
  const { isAuthenticated, user } = useIsAuthenticated();
  const logoutMutation = useLogout();
  const router = useRouter();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <TooltipProvider>
      <header className="fixed top-0 right-0 left-0 z-50 border-border border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
          <div className="flex items-center justify-between">
            {/* 移动端菜单 */}
            <div className="md:hidden">
              <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
            </div>

            {/* 简约Logo */}
            <Link
              className="group flex cursor-pointer items-center gap-3"
              to="/"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-sm transition-all duration-300 group-hover:scale-110">
                <span className="font-semibold text-primary-foreground text-sm">
                  L
                </span>
              </div>
              <h1 className="font-light text-2xl text-foreground transition-colors group-hover:text-muted-foreground">
                Life
              </h1>
            </Link>

            {/* 中央搜索区 */}
            <div className="mx-4 hidden max-w-lg flex-1 sm:block md:mx-8">
              <div className="group relative">
                <Search
                  className="-translate-y-1/2 absolute top-1/2 left-4 transform text-muted-foreground transition-colors group-focus-within:text-foreground"
                  size={18}
                />
                <Input
                  className="w-full rounded-full border-0 bg-muted/50 py-3 pr-4 pl-12 text-sm shadow-sm transition-all hover:bg-muted focus:bg-background focus:ring-2 focus:ring-ring"
                  onClick={() => router.navigate({ to: "/search" })}
                  placeholder="搜索有趣的内容..."
                  type="text"
                />
              </div>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-3">
              {/* 主题切换 */}
              <ModeToggle />

              {isAuthenticated ? (
                <>
                  <Button
                    className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground text-sm shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
                    onClick={onCreatePost}
                  >
                    <Plus className="mr-2" size={16} />
                    发布
                  </Button>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/notifications">
                        <Button
                          className="relative h-9 w-9 rounded-full text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
                          size="icon"
                          variant="ghost"
                        >
                          <Bell size={18} />
                          {unreadCount > 0 && (
                            <Badge
                              className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-white text-xs"
                              variant="destructive"
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>通知</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-9 w-9 rounded-full text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                        disabled={logoutMutation.isPending}
                        onClick={() => logoutMutation.mutate()}
                        size="icon"
                        variant="ghost"
                      >
                        <LogOut size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>退出登录</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/profile">
                        <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border transition-all duration-200 hover:scale-110 hover:ring-ring">
                          <AvatarFallback className="bg-muted font-medium text-muted-foreground text-sm">
                            {user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User size={16} />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user?.name || "个人资料"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Button
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground text-sm shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
                  onClick={onLogin}
                >
                  登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
