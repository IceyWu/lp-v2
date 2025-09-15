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
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-gray-100">
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
                className={`w-full justify-start gap-4 px-4 py-3 h-auto rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg hover:bg-gray-800'
                    : `text-gray-600 ${item.color}`
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* 统计卡片 */}
        <Card className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <Users size={20} className="text-gray-600" />
              我的数据
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">动态</span>
              <Badge variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">23</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">关注</span>
              <Badge variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">156</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">粉丝</span>
              <Badge variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">89</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 热门标签 */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">热门话题</h3>
          <div className="space-y-2">
            {hotTopics.map((tag, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 h-auto rounded-xl transition-all duration-300"
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="pt-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="justify-start gap-3 w-full p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all duration-300"
          >
            <Settings size={18} />
            <span className="text-sm">设置</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}