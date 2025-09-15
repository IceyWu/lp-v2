import { Search, Plus, User, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
}

export default function Header({ onTabChange, onCreatePost }: HeaderProps) {
  return (
    <TooltipProvider>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with gradient accent */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onTabChange('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-300">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                Life
              </h1>
            </div>

            {/* 中央搜索区 */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="搜索有趣的内容..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onCreatePost}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-medium hover:bg-gray-800 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                <span>发布</span>
              </Button>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-300">
                    <Bell size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>通知</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar 
                    className="w-11 h-11 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg"
                    onClick={() => onTabChange('profile')}
                  >
                    <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-600 text-white">
                      <User size={18} />
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>个人资料</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}