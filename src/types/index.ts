export interface PostImage {
  id: number;
  url: string;
  width: number;
  height: number;
  blurhash: string;
  type: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  images?: PostImage[];
  fileIds?: (number | string)[];
  author: {
    id?: number;
    name: string;
    avatar: string;
  };
  tags?: string[];
  likes: number;
  comments: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  location?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

// 用户资料更新相关类型
export interface UpdateProfileData {
  name?: string;
  signature?: string;
  avatarFile?: File | null;
}

export interface FormErrors {
  name?: string;
  signature?: string;
  avatar?: string;
}

// 通知相关类型
export interface NotificationUserInfo {
  id: number;
  mobile?: string;
  name: string;
  password?: string;
  avatar?: string;
  github?: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  sex: number;
  birthday?: string | null;
  city?: string | null;
  job?: string | null;
  company?: string | null;
  signature?: string | null;
  email?: string | null;
  website?: string | null;
  freezed: boolean;
  uuId?: string | null;
  background?: string | null;
  chatRoomId?: number | null;
  avatarFileMd5?: string;
  backgroundInfoFileMd5?: string;
  username?: string | null;
  userId?: number | null;
  openid?: string;
  ipInfoId?: number;
}

export interface NotificationObjectInfo {
  id: number;
  title: string;
  content: string;
  extraData?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  isPinned?: boolean;
}

export interface NotificationMessage {
  id: number;
  type: "like" | "comment" | "collection" | "follow";
  content: string;
  createdAt: string;
  updatedAt: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  objId: number;
  sendUserInfo: NotificationUserInfo;
  receiveUserInfo: NotificationUserInfo;
  objInfo: NotificationObjectInfo;
}

export interface NotificationListResponse {
  list: NotificationMessage[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
