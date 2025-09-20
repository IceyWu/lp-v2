import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapCard.css';

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

interface TrackMapViewProps {
  cities: CityData[];
  isDark?: boolean;
  className?: string;
  onCityClick?: (city: CityData) => void;
}

const TrackMapView: React.FC<TrackMapViewProps> = ({ 
  cities = [], 
  isDark = false, 
  className = "h-96 w-full",
  onCityClick 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

  // 获取城市的颜色主题
  const getCityColor = useCallback((photoCount: number) => {
    if (photoCount >= 50) return '#475569'; // 深灰色 - 热门城市
    if (photoCount >= 20) return '#64748b'; // 中灰色 - 常访城市
    if (photoCount >= 10) return '#94a3b8'; // 浅灰色 - 一般城市
    return '#cbd5e1'; // 最浅灰色 - 少量照片
  }, []);

  // 创建城市标记
  const createCityMarker = useCallback((city: CityData) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'city-marker';
    
    const color = getCityColor(city.photoCount);
    const size = Math.min(Math.max(city.photoCount / 5 + 20, 20), 40);
    
    markerElement.innerHTML = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(size / 3, 10)}px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
        ${city.photoCount}
      </div>
    `;

    // 添加点击事件
    markerElement.addEventListener('click', () => {
      if (onCityClick) {
        onCityClick(city);
      }
    });

    return markerElement;
  }, [getCityColor, onCityClick]);

  // 添加城市标记到地图
  const addCityMarkers = useCallback(() => {
    if (!map.current || !isMapReady) return;

    // 清除现有标记
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // 过滤有坐标的城市
    const citiesWithCoords = cities.filter(city => 
      city.lng && city.lat && city.lng !== 0 && city.lat !== 0
    );

    if (citiesWithCoords.length === 0) return;

    // 添加新标记
    citiesWithCoords.forEach(city => {
      const markerElement = createCityMarker(city);
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([city.lng!, city.lat!])
        .addTo(map.current!);

      // 添加弹出框
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${city.city}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${city.country}</p>
            <p style="margin: 0; font-size: 12px; color: #3b82f6;">${city.photoCount} 张照片</p>
          </div>
        `);

      marker.setPopup(popup);
      markers.current.push(marker);
    });

    // 调整地图视图以包含所有标记
    if (citiesWithCoords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      citiesWithCoords.forEach(city => {
        bounds.extend([city.lng!, city.lat!]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (citiesWithCoords.length === 1) {
      const city = citiesWithCoords[0];
      map.current.setCenter([city.lng!, city.lat!]);
      map.current.setZoom(10);
    }
  }, [cities, isMapReady, createCityMarker]);

  // 初始化地图
  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    // 设置Mapbox访问令牌
    mapboxgl.accessToken = 'pk.eyJ1IjoidnlrYXd6YXRpcyIsImEiOiJjbHJycm1lYXAwaGxhMmlvMWhwZTA3Zmg2In0.eo2EYOK6v0smB1IRunC8VA';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [116.4074, 39.9042], // 默认中心点（北京）
        zoom: 2,
        pitch: 0,
        bearing: 0,
      });

      // 添加错误处理
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      // 添加中文语言支持
      map.current.addControl(new MapboxLanguage({ defaultLanguage: 'zh-Hans' }));
      
      // 添加导航控制
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // 添加全屏控制
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setIsMapReady(true);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }, [mapStyle]);

  // 更新地图样式
  const updateMapStyle = useCallback(() => {
    if (map.current && isMapReady) {
      map.current.setStyle(mapStyle);
      // 样式更新后需要重新添加标记
      map.current.once('styledata', () => {
        addCityMarkers();
      });
    }
  }, [mapStyle, isMapReady, addCityMarkers]);

  // 初始化地图
  useEffect(() => {
    initMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setIsMapReady(false);
    };
  }, [initMap]);

  // 更新地图样式
  useEffect(() => {
    updateMapStyle();
  }, [updateMapStyle]);

  // 添加城市标记
  useEffect(() => {
    addCityMarkers();
  }, [addCityMarkers]);

  if (cities.length === 0) {
    return (
      <div className={`${className} rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center`}>
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无地图数据</h3>
        <p className="text-sm text-gray-500 text-center">上传带有GPS信息的照片后，<br />你的足迹将在这里显示</p>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden border border-gray-200 shadow-lg`}>
      <div 
        ref={mapContainer} 
        className="map-temp-box h-full w-full relative"
      />
      

    </div>
  );
};

export default TrackMapView;