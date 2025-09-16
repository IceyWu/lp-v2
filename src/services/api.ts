import { config } from '../config/env';

const API_BASE_URL = config.API_BASE_URL;

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  result: T;
  timestamp: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// 话题相关类型
export interface ApiTopic {
  id: number;
  title: string;
  content: string;
  extraData: any;
  createdAt: string;
  updatedAt: string;
  userId: number;
  fileId: number | null;
  User: {
    id: number;
    username: string | null;
    name: string;
    sex: number;
    avatarInfo?: {
      id: number;
      name: string;
      url: string;
      width: number;
      height: number;
      blurhash: string;
    } | null;
    backgroundInfo?: any;
    ipInfo?: {
      country: string;
      regionName: string;
      city: string;
    };
  };
  TopicTag: Array<{
    tagId: number;
    topicId: number;
    tag: {
      id: number;
      title: string;
      cover: string;
    };
  }>;
  fileList: Array<{
    id: number;
    name: string;
    type: string;
    url: string;
    width: number;
    height: number;
    blurhash: string;
    videoSrc?: string | null;
    fromIphone: boolean;
  }>;
}

// 点赞相关类型
export interface CreateLikeDto {
  topicId: number;
}

// 用户类型
export interface ApiUser {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  constructor() {
    // 从localStorage获取token
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 检查API响应是否成功
      if (data.code !== 200) {
        throw new Error(data.message || 'API请求失败');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 设置认证token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // 清除认证token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // 获取话题列表
  async getTopics(params?: {
    page?: number;
    size?: number;
    sort?: string;
    title?: string;
    keywords?: string;
    tagId?: number;
    userId?: number;
    exif?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<ApiTopic>>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/topic${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<ApiTopic>>(endpoint);
  }

  // 创建话题
  async createTopic(data: {
    title: string;
    content: string;
    images?: string[];
    tags?: string[];
    location?: string;
  }): Promise<ApiResponse<ApiTopic>> {
    return this.request<ApiTopic>('/api/topic', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 点赞话题
  async likeTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request('/api/like', {
      method: 'POST',
      body: JSON.stringify({ topicId }),
    });
  }

  // 取消点赞
  async unlikeTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request('/api/like', {
      method: 'DELETE',
      body: JSON.stringify({ topicId }),
    });
  }

  // 获取话题详情
  async getTopicDetail(id: number, userId?: number, exif?: boolean): Promise<ApiResponse<ApiTopic>> {
    const searchParams = new URLSearchParams();
    if (userId) searchParams.append('userId', String(userId));
    if (exif) searchParams.append('exif', String(exif));
    
    const queryString = searchParams.toString();
    const endpoint = `/api/topic/${id}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ApiTopic>(endpoint);
  }

  // 获取评论列表
  async getComments(params?: {
    page?: number;
    size?: number;
    topicId?: number;
    userId?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/comment${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 创建评论
  async createComment(data: {
    topicId: number;
    content: string;
    parentId?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>('/api/auth/current');
  }

  // 获取点赞统计
  async getLikeStats(topicId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/like/stats/${topicId}`);
  }
}

export const apiService = new ApiService();
export default apiService;