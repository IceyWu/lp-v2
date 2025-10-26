import { Link, useRouter } from "@tanstack/react-router";
import { Home, Search, User } from "lucide-react";
import { useIsAuthenticated } from "../hooks/useAuth";

interface FloatingNavBarProps {
  activeTab: string;
  onLogin: () => void;
}

export default function FloatingNavBar({
  activeTab,
  onLogin,
}: FloatingNavBarProps) {
  const { isAuthenticated } = useIsAuthenticated();
  const router = useRouter();

  const navItems = [
    { id: "home", icon: Home, label: "首页", requireAuth: false, path: "/" },
    {
      id: "search",
      icon: Search,
      label: "发现",
      requireAuth: false,
      path: "/search",
    },
    {
      id: "profile",
      icon: User,
      label: "我的",
      requireAuth: true,
      path: "/profile",
    },
  ];

  const handleTabClick = (path: string, requireAuth: boolean) => {
    if (requireAuth && !isAuthenticated) {
      onLogin();
      return;
    }
    router.navigate({ to: path });
  };

  return (
    <div className="-translate-x-1/2 fixed bottom-8 left-1/2 z-50 transform">
      <div className="rounded-full border border-gray-200/50 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requireAuth && !isAuthenticated;

            if (isDisabled) {
              return (
                <button
                  className="relative cursor-not-allowed rounded-full p-3 text-gray-300 transition-all duration-300"
                  key={item.id}
                  onClick={() => handleTabClick(item.path, item.requireAuth)}
                  type="button"
                >
                  <Icon size={18} />
                  <div className="-top-1 -right-1 absolute h-2 w-2 rounded-full bg-red-400" />
                </button>
              );
            }

            return (
              <Link
                className={`relative rounded-full p-3 transition-all duration-300 ${
                  isActive
                    ? "scale-110 bg-black text-white shadow-lg"
                    : "text-gray-500 hover:scale-105 hover:bg-gray-100 hover:text-black"
                }`}
                key={item.id}
                title={item.label}
                to={item.path}
              >
                <Icon className={isActive ? "drop-shadow-sm" : ""} size={18} />
                {isActive && (
                  <div className="-top-1 -translate-x-1/2 absolute left-1/2 h-1 w-1 transform animate-pulse rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
