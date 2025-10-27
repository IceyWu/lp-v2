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
  tagIds?: (number | string)[];
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
