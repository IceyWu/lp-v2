import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Map, Camera, Calendar, MapPin } from 'lucide-react';
import MapCard from './MapCard';
import MapCardLarge from './MapCardLarge';
import LoadingSpinner from './LoadingSpinner';
import { isEmpty, getLngLat, customDestr } from '../utils/map';
import { useIsAuthenticated } from '../hooks/useAuth';
import { apiService, type ApiTopic } from '../services/api';

// 使用API服务中定义的类型

const TrackPage: React.FC = () => {
  const { user } = useIsAuthenticated();
  const [selectedTopic, setSelectedTopic] = useState<ApiTopic | null>(null);

  const { data: topicsData, isLoading, error } = useQuery({
    queryKey: ['topics', user?.id, 'exif'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      
      return apiService.getTopics({
        page: 1,
        size: 100,
        userId: user.id,
        exif: true
      });
    },
    enabled: !!user?.id,
  });

  // 过滤有GPS数据的主题
  const topicsWithGPS = topicsData?.result?.data?.filter(topic => {
    // 检查主题本身是否有GPS数据
    const topicExif = customDestr(topic.exif, { customVal: {} });
    const topicLngLat = getLngLat(topicExif);
    if (!isEmpty(topicLngLat)) return true;

    // 检查文件列表中是否有GPS数据
    return topic.fileList?.some(file => {
      // 检查直接的lng/lat字段
      if (file.lng && file.lat && file.lng !== 0 && file.lat !== 0) {
        return true;
      }
      
      // 检查exif中的GPS数据
      const fileExif = customDestr(file.exif, { customVal: {} });
      const fileLngLat = getLngLat(fileExif);
      return !isEmpty(fileLngLat);
    });
  }) || [];

  const handleTopicClick = (topic: ApiTopic) => {
    setSelectedTopic(topic);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600">加载轨迹数据失败</p>
        </div>
      </div>
    );
  }

  if (topicsWithGPS.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-[500px]">
        <div className="p-6">
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有轨迹数据</h3>
            <p className="text-gray-500 text-sm mb-6">开始拍摄带有GPS信息的照片来记录你的足迹</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 轨迹统计 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Map size={16} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">我的轨迹</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{topicsWithGPS.length}</div>
            <div className="text-sm text-gray-500">地点</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {topicsWithGPS.reduce((acc, topic) => acc + (topic.fileList?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">照片</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(topicsWithGPS.map(topic => formatDate(topic.createdAt).split(' ')[0])).size}
            </div>
            <div className="text-sm text-gray-500">天数</div>
          </div>
        </div>
      </div>

      {/* 轨迹列表 */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">轨迹记录</h3>
          
          <div className="space-y-4">
            {topicsWithGPS.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                onClick={() => handleTopicClick(topic)}
              >
                {/* 地图预览 */}
                <div className="flex-shrink-0">
                  <MapCard data={topic} isDark={false} />
                </div>

                {/* 内容信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{topic.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{topic.content}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(topic.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Camera size={12} />
                      <span>{topic.fileList?.length || 0} 张照片</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>GPS定位</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 选中主题的详细信息弹窗 - 可以后续添加 */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedTopic.title}</h3>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedTopic.content}</p>
                
                {/* 大地图 */}
                <MapCardLarge data={selectedTopic} className="h-64 w-full" />
                
                {/* 照片网格 */}
                {selectedTopic.fileList && selectedTopic.fileList.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">相关照片</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedTopic.fileList.map((file, index) => (
                        <div key={file.id} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => {
                              // 使用 viewer-pro 查看图片
                              import('viewer-pro').then(({ default: Viewer }) => {
                                const viewer = new Viewer({
                                  images: selectedTopic.fileList.map(f => f.url),
                                  index: index,
                                });
                                viewer.show();
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;