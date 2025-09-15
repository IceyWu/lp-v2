import { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: '1',
    title: '今日午后的咖啡时光',
    content: '在这个慵懒的午后，一杯香浓的拿铁配上窗外的阳光，感觉整个世界都慢了下来。生活中的小确幸就是这样简单美好。',
    images: [
      'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    author: {
      name: '小雨',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    tags: ['咖啡', '午后时光', '生活美学'],
    likes: 128,
    comments: 23,
    saves: 45,
    isLiked: false,
    isSaved: false,
    createdAt: '2025-01-10T14:30:00Z',
    location: '上海·静安区'
  },
  {
    id: '2',
    title: '周末烘焙小记',
    content: '第一次尝试做马卡龙，虽然卖相不够完美，但是味道还不错！烘焙真的是一件很治愈的事情。',
    images: [
      'https://images.pexels.com/photos/1030945/pexels-photo-1030945.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    author: {
      name: '甜甜圈',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    tags: ['烘焙', '马卡龙', '手作'],
    likes: 89,
    comments: 12,
    saves: 67,
    isLiked: true,
    isSaved: false,
    createdAt: '2025-01-10T10:15:00Z'
  },
  {
    id: '3',
    title: '城市夜景漫步',
    content: '夜晚的城市有着独特的魅力，霓虹闪烁，车水马龙，每一处风景都在诉说着这座城市的故事。',
    images: [
      'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1796736/pexels-photo-1796736.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    author: {
      name: '夜行者',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    tags: ['夜景', '城市', '摄影'],
    likes: 256,
    comments: 34,
    saves: 89,
    isLiked: false,
    isSaved: true,
    createdAt: '2025-01-09T21:45:00Z',
    location: '北京·朝阳区'
  },
  {
    id: '4',
    title: '阅读时光',
    content: '今天读完了一本很棒的小说，书中的故事让我思考了很多关于人生的问题。阅读真的是最好的精神食粮。',
    images: [
      'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    author: {
      name: '书虫小姐',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    tags: ['阅读', '书籍', '思考'],
    likes: 76,
    comments: 18,
    saves: 92,
    isLiked: false,
    isSaved: false,
    createdAt: '2025-01-09T16:20:00Z'
  },
  {
    id: '5',
    title: '春日花开',
    content: '公园里的樱花开了，粉色的花瓣随风飘散，仿佛下起了一场浪漫的花雨。春天真的来了！',
    images: [
      'https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    author: {
      name: '花花世界',
      avatar: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    tags: ['樱花', '春天', '自然'],
    likes: 189,
    comments: 27,
    saves: 156,
    isLiked: true,
    isSaved: true,
    createdAt: '2025-01-09T09:30:00Z',
    location: '杭州·西湖区'
  }
];