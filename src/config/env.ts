// 环境配置
export const config = {
  API_BASE_URL: "http://localhost:3001",
  // 可以根据环境变量来切换不同的API地址
  // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://test.wktest.cn:3001',
} as const;
