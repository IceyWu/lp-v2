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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            {/* 简约Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onTabChange('home')}
            >
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
                <span className="text-white font-semibold text-sm">L</span>
              </div>
              <h1 className="text-2xl font-light text-black group-hover:text-gray-700 transition-colors">
                Life
              </h1>
            </div>

            {/* 中央搜索区 */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="搜索有趣的内容..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-black/10 focus:bg-white hover:bg-gray-100 transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-4">
              <Button
                onClick={onCreatePost}
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={16} className="mr-2" />
                发布
              </Button>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200">
                    <Bell size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>通知</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar 
                    className="w-9 h-9 cursor-pointer hover:scale-110 transition-all duration-200 ring-2 ring-gray-100 hover:ring-gray-200"
                    onClick={() => onTabChange('profile')}
                  >
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium">
                      <User size={16} />
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