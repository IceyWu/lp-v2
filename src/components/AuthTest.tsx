import { useIsAuthenticated } from '../hooks/useAuth';

export default function AuthTest() {
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold mb-2">认证状态测试</h3>
      <div className="space-y-2 text-sm">
        <div>加载中: {isLoading ? '是' : '否'}</div>
        <div>已登录: {isAuthenticated ? '是' : '否'}</div>
        {user && (
          <div className="mt-2">
            <div>用户信息:</div>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}