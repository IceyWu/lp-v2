import { TrendingUp, Users, Calendar, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const quickLinks = [
    { icon: TrendingUp, label: '热门话题', count: '12' },
    { icon: Users, label: '关注的人', count: '156' },
    { icon: Calendar, label: '今日推荐', count: '8' },
  ];

  const categories = [
    '美食记录', '旅行见闻', '生活日常', '学习笔记', 
    '健身打卡', '读书分享', '摄影作品', '手工制作'
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white/50 backdrop-blur-sm border-r border-gray-200/50 p-6 overflow-y-auto">
      {/* 快捷链接 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">快捷导航</h3>
        <div className="space-y-2">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center justify-between p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{link.label}</span>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {link.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 分类标签 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">热门分类</h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className="block w-full text-left p-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              #{category}
            </button>
          ))}
        </div>
      </div>

      {/* 底部链接 */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="space-y-2">
          <button className="flex items-center gap-3 w-full p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors">
            <Settings size={16} />
            <span className="text-sm">设置</span>
          </button>
          <button className="flex items-center gap-3 w-full p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors">
            <HelpCircle size={16} />
            <span className="text-sm">帮助</span>
          </button>
        </div>
      </div>
    </aside>
  );
}