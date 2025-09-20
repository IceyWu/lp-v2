import { Search, Plus, User, Bell, LogOut } from 'lucide-react';
import { Link, useRouter } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import MobileSidebar from "@/components/MobileSidebar";
import { useIsAuthenticated, useLogout } from '../hooks/useAuth';

interface HeaderProps {
  activeTab: string;
  onCreatePost: () => void;
  onLogin: () => void;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onCreatePost, onLogin, onTabChange }: HeaderProps) {
  const { isAuthenticated, user } = useIsAuthenticated();
  const logoutMutation = useLogout();
  const router = useRouter();
  
  return (
    <TooltipProvider>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between">
            {/* 移动端菜单 */}
            <div className="md:hidden">
              <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
            </div>
            
            {/* 简约Logo */}
            <Link to="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
                <span className="text-primary-foreground font-semibold text-sm">L</span>
              </div>
              <h1 className="text-2xl font-light text-foreground group-hover:text-muted-foreground transition-colors">
                Life
              </h1>
            </Link>

            {/* 中央搜索区 */}
            <div className="flex-1 max-w-lg mx-4 md:mx-8 hidden sm:block">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input
                  type="text"
                  placeholder="搜索有趣的内容..."
                  className="w-full pl-12 pr-4 py-3 bg-muted/50 border-0 rounded-full focus:ring-2 focus:ring-ring focus:bg-background hover:bg-muted transition-all text-sm shadow-sm"
                  onClick={() => router.navigate({ to: '/search' })}
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
                    onClick={onCreatePost}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={16} className="mr-2" />
                    发布
                  </Button>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all duration-200">
                        <Bell size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>通知</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
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
                        <Avatar className="w-9 h-9 cursor-pointer hover:scale-110 transition-all duration-200 ring-2 ring-border hover:ring-ring">
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user?.name || '个人资料'}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Button
                  onClick={onLogin}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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