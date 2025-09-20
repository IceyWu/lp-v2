import { Home, Search, Heart, Bookmark, TrendingUp, Users, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: '首页', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { id: 'search', icon: Search, label: '发现', color: 'hover:bg-purple-50 hover:text-purple-600' },
    { id: 'likes', icon: Heart, label: '喜欢', color: 'hover:bg-red-50 hover:text-red-600' },
    { id: 'saved', icon: Bookmark, label: '收藏', color: 'hover:bg-yellow-50 hover:text-yellow-600' },
    { id: 'trending', icon: TrendingUp, label: '热门', color: 'hover:bg-green-50 hover:text-green-600' },
  ];

  const hotTopics = ['摄影', '旅行', '美食', '设计', '生活'];

  return (
    <aside className="fixed left-0 top-24 bottom-0 w-72 bg-background/80 backdrop-blur-xl border-r border-border">
      <div className="p-8 h-full flex flex-col">
        {/* 主导航 */}
        <nav className="space-y-3 mb-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-5 px-6 py-4 h-auto rounded-3xl transition-all duration-300 text-base ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90'
                    : `text-muted-foreground hover:text-foreground hover:bg-accent/80 ${item.color}`
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon size={22} />
                <span className="font-semibold">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* 统计卡片 */}
        <Card className="mb-10 bg-card/80 border border-border shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4 text-lg">
              <div className="p-2 bg-primary rounded-2xl">
                <Users size={20} className="text-primary-foreground" />
              </div>
              我的数据
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">动态</span>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-full">23</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">关注</span>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-full">156</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">粉丝</span>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-full">89</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 热门标签 */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            热门话题
          </h3>
          <div className="space-y-2">
            {hotTopics.map((tag, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start w-full text-left text-muted-foreground hover:text-foreground hover:bg-accent/80 px-4 py-3 h-auto rounded-2xl transition-all duration-300 font-medium"
              >
                <span className="text-green-600 mr-2">#</span>{tag}
              </Button>
            ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="pt-6 border-t border-border">
          <Button 
            variant="ghost" 
            className="justify-start gap-4 w-full px-6 py-4 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-3xl transition-all duration-300"
          >
            <Settings size={20} />
            <span className="font-semibold">设置</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}