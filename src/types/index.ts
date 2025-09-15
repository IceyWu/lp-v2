export interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
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