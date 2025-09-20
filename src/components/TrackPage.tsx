import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Map, Camera, Calendar, MapPin, Globe, TrendingUp, Clock, Star, Filter, Search, BarChart3 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useIsAuthenticated } from '../hooks/useAuth';
import { apiService } from '../services/api';
import TrackMapView from './TrackMapView';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

// 城市数据类型
interface CityData {
  id: number;
  country: string;
  city: string;
  photoCount: number;
  firstVisitAt: string;
  lastVisitAt: string;
  lng?: number;
  lat?: number;
}

// 旅行统计数据类型
interface TravelStats {
  totalCities: number;
  totalPhotos: number;
  totalCountries: number;
  recentCities: CityData[];
  topCities: CityData[];
  countryBreakdown: Array<{
    country: string;
    cityCount: number;
    photoCount: number;
  }>;
}

const TrackPage: React.FC = () => {
  const { user } = useIsAuthenticated();
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [sortBy, setSortBy] = useState<'photoCount' | 'lastVisitAt' | 'firstVisitAt'>('photoCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 获取用户旅行统计
  const { data: travelStatsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['user-travel-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      return apiService.getUserTravelStats(user.id);
    },
    enabled: !!user?.id,
  });

  const travelStats = travelStatsResponse?.result as TravelStats;

  // 获取用户访问过的城市
  const { data: citiesResponse, isLoading: citiesLoading } = useQuery({
    queryKey: ['user-cities', user?.id, sortBy, sortOrder, countryFilter],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      return apiService.getUserCities(user.id, {
        page: 1,
        limit: 100,
        sortBy,
        sortOrder,
        country: countryFilter || undefined,
      });
    },
    enabled: !!user?.id,
  });

  const citiesData = citiesResponse?.result?.data as CityData[];

  const isLoading = statsLoading || citiesLoading;

  const handleCityClick = (city: CityData) => {
    setSelectedCity(city);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return '今天';
    if (diffInDays === 1) return '昨天';
    if (diffInDays < 7) return `${diffInDays}天前`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}个月前`;
    return `${Math.floor(diffInDays / 365)}年前`;
  };

  const getCityFlag = (country: string) => {
    const flags: Record<string, string> = {
      '中国': '🇨🇳',
      '美国': '🇺🇸',
      '日本': '🇯🇵',
      '韩国': '🇰🇷',
      '英国': '🇬🇧',
      '法国': '🇫🇷',
      '德国': '🇩🇪',
      '意大利': '🇮🇹',
      '西班牙': '🇪🇸',
      '澳大利亚': '🇦🇺',
      '加拿大': '🇨🇦',
      '新加坡': '🇸🇬',
      '泰国': '🇹🇭',
      '马来西亚': '🇲🇾',
    };
    return flags[country] || '🌍';
  };

  // 城市坐标映射（用于地图显示）
  const getCityCoordinates = (city: string): [number, number] | null => {
    const cityCoords: Record<string, [number, number]> = {
      // 中国主要城市
      '北京市': [116.4074, 39.9042],
      '上海市': [121.4737, 31.2304],
      '广州市': [113.2644, 23.1291],
      '深圳市': [114.0579, 22.5431],
      '杭州市': [120.1551, 30.2741],
      '南京市': [118.7969, 32.0603],
      '成都市': [104.0668, 30.5728],
      '重庆市': [106.5516, 29.5630],
      '西安市': [108.9402, 34.3416],
      '武汉市': [114.3054, 30.5931],
      '天津市': [117.1901, 39.1235],
      '苏州市': [120.6197, 31.3017],
      '青岛市': [120.3826, 36.0671],
      '大连市': [121.6147, 38.9140],
      '厦门市': [118.1689, 24.4797],
      '昆明市': [102.8329, 24.8801],
      '长沙市': [112.9388, 28.2282],
      '福州市': [119.3063, 26.0745],
      '郑州市': [113.6254, 34.7466],
      '石家庄市': [114.5149, 38.0428],
      '济南市': [117.1205, 36.6519],
      '沈阳市': [123.4315, 41.8057],
      '长春市': [125.3245, 43.8171],
      '哈尔滨市': [126.5358, 45.8023],
      '南昌市': [115.8921, 28.6765],
      '合肥市': [117.2272, 31.8206],
      '太原市': [112.5489, 37.8706],
      '南宁市': [108.3669, 22.8170],
      '海口市': [110.3312, 20.0311],
      '贵阳市': [106.7135, 26.5783],
      '兰州市': [103.8236, 36.0581],
      '西宁市': [101.7782, 36.6171],
      '银川市': [106.2309, 38.4872],
      '乌鲁木齐市': [87.6168, 43.8256],
      '拉萨市': [91.1409, 29.6456],
      '呼和浩特市': [111.7519, 40.8414],

      // 国际城市
      '纽约': [-74.0060, 40.7128],
      '洛杉矶': [-118.2437, 34.0522],
      '芝加哥': [-87.6298, 41.8781],
      '旧金山': [-122.4194, 37.7749],
      '西雅图': [-122.3321, 47.6062],
      '波士顿': [-71.0589, 42.3601],
      '华盛顿': [-77.0369, 38.9072],
      '迈阿密': [-80.1918, 25.7617],
      '拉斯维加斯': [-115.1398, 36.1699],

      '东京': [139.6917, 35.6895],
      '大阪': [135.5023, 34.6937],
      '京都': [135.7681, 35.0116],
      '横滨': [139.6380, 35.4437],
      '名古屋': [136.9066, 35.1815],

      '首尔': [126.9780, 37.5665],
      '釜山': [129.0756, 35.1796],

      '伦敦': [-0.1276, 51.5074],
      '曼彻斯特': [-2.2426, 53.4808],
      '爱丁堡': [-3.1883, 55.9533],

      '巴黎': [2.3522, 48.8566],
      '马赛': [5.3698, 43.2965],
      '里昂': [4.8357, 45.7640],

      '柏林': [13.4050, 52.5200],
      '慕尼黑': [11.5820, 48.1351],
      '汉堡': [9.9937, 53.5511],

      '罗马': [12.4964, 41.9028],
      '米兰': [9.1900, 45.4642],
      '威尼斯': [12.3155, 45.4408],
      '佛罗伦萨': [11.2558, 43.7696],

      '马德里': [-3.7038, 40.4168],
      '巴塞罗那': [2.1734, 41.3851],

      '悉尼': [151.2093, -33.8688],
      '墨尔本': [144.9631, -37.8136],
      '布里斯班': [153.0251, -27.4698],
      '珀斯': [115.8605, -31.9505],

      '多伦多': [-79.3832, 43.6532],
      '温哥华': [-123.1207, 49.2827],
      '蒙特利尔': [-73.5673, 45.5017],

      '新加坡': [103.8198, 1.3521],

      '曼谷': [100.5018, 13.7563],
      '清迈': [98.9817, 18.7883],

      '吉隆坡': [101.6869, 3.1390],
    };

    const key = `${city}`;
    return cityCoords[key] || null;
  };

  // 为城市数据添加坐标并进行搜索过滤
  const citiesWithCoords = useMemo(() => {
    let cities = citiesData?.map(city => ({
      ...city,
      lng: city.lng || getCityCoordinates(city.city)?.[0],
      lat: city.lat || getCityCoordinates(city.city)?.[1],
    })) || [];

    // 搜索过滤
    if (searchQuery.trim()) {
      cities = cities.filter(city =>
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return cities;
  }, [citiesData, searchQuery]);

  // 获取所有国家列表
  const availableCountries = useMemo(() => {
    const countries = new Set(citiesData?.map(city => city.country) || []);
    return Array.from(countries).sort();
  }, [citiesData]);

  // 计算一些统计数据


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!travelStats || travelStats.totalCities === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-[500px]">
        <div className="p-6">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">开始你的旅行足迹</h3>
            <p className="text-gray-500 text-sm mb-6">上传带有GPS信息的照片，记录你走过的每一个地方</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm">
              <Camera size={16} />
              <span>拍照记录足迹</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 旅行统计概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">我的足迹地图</CardTitle>
              <p className="text-sm text-muted-foreground">探索世界，记录美好</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-200">
                <MapPin size={24} className="text-slate-600" />
              </div>
              <div className="text-3xl font-bold text-slate-700 mb-1">{travelStats.totalCities}</div>
              <div className="text-sm text-muted-foreground">个城市</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-200">
                <Camera size={24} className="text-slate-600" />
              </div>
              <div className="text-3xl font-bold text-slate-700 mb-1">{travelStats.totalPhotos}</div>
              <div className="text-sm text-muted-foreground">张照片</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-200">
                <Globe size={24} className="text-slate-600" />
              </div>
              <div className="text-3xl font-bold text-slate-700 mb-1">{travelStats.totalCountries}</div>
              <div className="text-sm text-muted-foreground">个国家</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 地图视图 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map size={20} className="text-slate-600" />
            足迹地图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrackMapView
            cities={citiesWithCoords}
            className="h-80 w-full"
            onCityClick={handleCityClick}
          />
        </CardContent>
      </Card>

      {/* 城市足迹控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-slate-600" />
                城市足迹
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{citiesWithCoords.length} 个城市</p>
            </div>

            {/* 视图切换 */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                网格
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="h-8"
              >
                地图
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和过滤栏 */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索城市或国家..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 国家过滤 */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-input rounded-md bg-background"
            >
              <option value="">所有国家</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            {/* 排序控制 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 text-sm border border-input rounded-md bg-background"
            >
              <option value="photoCount">按照片数量</option>
              <option value="lastVisitAt">按最近访问</option>
              <option value="firstVisitAt">按首次访问</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? '降序' : '升序'}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </Button>
          </div>

          {/* 城市内容 - 根据视图模式显示 */}
          {viewMode === 'grid' ? (
            /* 城市网格 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {citiesWithCoords?.map((city) => {

                return (
                  <Card
                    key={city.id}
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
                    onClick={() => handleCityClick(city)}
                  >
                    <CardContent className="p-4">
                      {/* 城市头部 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{getCityFlag(city.country)}</div>
                          <div>
                            <h4 className="font-bold text-foreground group-hover:text-slate-700 transition-colors text-lg">
                              {city.city}
                            </h4>
                            <p className="text-sm text-muted-foreground">{city.country}</p>
                          </div>
                        </div>

                        <Badge variant="secondary">
                          {city.photoCount} 张
                        </Badge>
                      </div>

                      {/* 访问时间信息 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Star size={14} />
                            <span>首次访问</span>
                          </div>
                          <span className="font-medium">{formatDate(city.firstVisitAt)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={14} />
                            <span>最近访问</span>
                          </div>
                          <span className="font-medium">{formatRelativeTime(city.lastVisitAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* 地图视图 */
            <div className="h-96">
              <TrackMapView
                cities={citiesWithCoords}
                className="h-full w-full"
                onCityClick={handleCityClick}
              />
            </div>
          )}

          {/* 空状态 */}
          {citiesWithCoords?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                {searchQuery || countryFilter ? (
                  <Search size={24} className="text-muted-foreground" />
                ) : (
                  <MapPin size={24} className="text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || countryFilter ? '没有找到匹配的城市' : '还没有访问过任何城市'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || countryFilter ? '尝试调整搜索条件或过滤器' : '开始拍摄带有GPS信息的照片来记录你的足迹'}
              </p>
              {(searchQuery || countryFilter) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setCountryFilter('');
                  }}
                >
                  清除筛选条件
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 国家统计 */}
      {travelStats.countryBreakdown && travelStats.countryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} className="text-slate-600" />
              国家分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelStats.countryBreakdown.map((country) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCityFlag(country.country)}</span>
                    <div>
                      <h4 className="font-medium">{country.country}</h4>
                      <p className="text-sm text-muted-foreground">{country.cityCount} 个城市</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">{country.photoCount}</div>
                    <div className="text-xs text-muted-foreground">张照片</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

        {/* 选中城市的详细信息弹窗 */}
        <Dialog open={!!selectedCity} onOpenChange={() => setSelectedCity(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{selectedCity && getCityFlag(selectedCity.country)}</span>
                <div>
                  <div className="text-xl font-bold">{selectedCity?.city}</div>
                  <div className="text-sm text-muted-foreground font-normal">{selectedCity?.country}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedCity && (
              <div className="space-y-6">
                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold mb-1">{selectedCity.photoCount}</div>
                    <div className="text-xs text-muted-foreground">张照片</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {Math.ceil((new Date(selectedCity.lastVisitAt).getTime() - new Date(selectedCity.firstVisitAt).getTime()) / (1000 * 60 * 60 * 24)) || 1}
                    </div>
                    <div className="text-xs text-muted-foreground">天跨度</div>
                  </div>
                </div>

                {/* 访问记录 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-muted-foreground" />
                      <span className="text-sm">首次访问</span>
                    </div>
                    <span className="text-sm font-medium">{formatDate(selectedCity.firstVisitAt)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm">最近访问</span>
                    </div>
                    <span className="text-sm font-medium">{formatRelativeTime(selectedCity.lastVisitAt)}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      console.log('查看城市照片:', selectedCity.city);
                    }}
                  >
                    <Camera size={16} className="mr-2" />
                    查看城市照片
                  </Button>

                  {selectedCity.lng && selectedCity.lat && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setViewMode('map');
                        setSelectedCity(null);
                      }}
                    >
                      <MapPin size={16} className="mr-2" />
                      在地图上查看
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default TrackPage;