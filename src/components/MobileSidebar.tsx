import { Home, Search, Heart, Bookmark, TrendingUp, Users, Settings, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileSidebar({ activeTab, onTabChange }: MobileSidebarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: '首页', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { id: 'search', icon: Search, label: '发现', color: 'hover:bg-purple-50 hover:text-purple-600' },
    { id: 'likes', icon: Heart, label: '喜欢', color: 'hover:bg-red-50 hover:text-red-600' },
    { id: 'saved', icon: Bookmark, label: '收藏', color: 'hover:bg-yellow-50 hover:text-yellow-600' },
    { id: 'trending', icon: TrendingUp, label: '热门', color: 'hover:bg-green-50 hover:text-green-600' },
  ];

  const hotTopics = ['摄影', '旅行', '美食', '设计', '生活'];

  const SidebarContent = () => (
    <div className="p-6 h-full flex flex-col">
      {/* 主导航 */}
      <nav className="space-y-2 mb-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-4 px-4 py-3 h-auto rounded-2xl transition-all duration-300 text-base ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90'
                  : `text-muted-foreground hover:text-foreground hover:bg-accent/80 ${item.color}`
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* 统计卡片 */}
      <Card className="mb-8 bg-card/80 border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 bg-primary rounded-xl">
              <Users size={16} className="text-primary-foreground" />
            </div>
            我的数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">动态</span>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded-full text-xs">23</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">关注</span>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded-full text-xs">156</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">粉丝</span>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded-full text-xs">89</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 热门标签 */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          热门话题
        </h3>
        <div className="space-y-1">
          {hotTopics.map((tag, index) => (
            <Button
              key={index}
              variant="ghost"
              className="justify-start w-full text-left text-muted-foreground hover:text-foreground hover:bg-accent/80 px-3 py-2 h-auto rounded-xl transition-all duration-300 text-sm font-medium"
            >
              <span className="text-green-600 mr-2">#</span>{tag}
            </Button>
          ))}
        </div>
      </div>

      {/* 底部设置 */}
      <div className="pt-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="justify-start gap-3 w-full px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-2xl transition-all duration-300"
        >
          <Settings size={18} />
          <span className="font-semibold">设置</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu size={20} />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}