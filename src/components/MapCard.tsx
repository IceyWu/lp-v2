import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { customDestr, isEmpty, getLngLat, getCover } from '../utils/map';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapCard.css';

interface MapCardProps {
  data: any;
  isDark?: boolean;
}

const MapCard: React.FC<MapCardProps> = ({ data = {}, isDark = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hasMapData, setHasMapData] = useState(false);

  const mapStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

  const getLngLatData = useCallback(() => {
    // 首先尝试从主题的exif数据中获取GPS信息
    const topicExif = customDestr(data.exif, { customVal: {} });
    let lnglat = getLngLat(topicExif);
    
    if (!isEmpty(lnglat)) {
      return lnglat;
    }
    
    // 如果主题没有GPS数据，尝试从文件列表中获取
    if (data.fileList && data.fileList.length > 0) {
      for (const file of data.fileList) {
        // 优先尝试从文件的lng/lat字段获取（这是最直接的方式）
        if (file.lng && file.lat && file.lng !== 0 && file.lat !== 0) {
          return [file.lng, file.lat];
        }
        
        // 尝试从文件的exif数据中获取
        const fileExif = customDestr(file.exif, { customVal: {} });
        lnglat = getLngLat(fileExif);
        if (!isEmpty(lnglat)) {
          return lnglat;
        }
      }
    }
    
    return [];
  }, [data]);

  const setMapStyle = useCallback(() => {
    if (map.current) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  // 传入坐标，添加标记
  const addMarker = useCallback((lnglat: number[], data?: any, isSingle?: boolean) => {
    if (!map.current) return;

    // 添加封面图片标记
    if (data) {
      let cover = {};
      const dot = document.createElement('div');
      
      if (isSingle) {
        const { id } = data;
        cover = getCover(data) || {};
        dot.className = `marker-dot-${id} marker-dot`;
      } else {
        const { fileList, id } = data;
        const firstFile = fileList?.[0] || {};
        cover = getCover(firstFile) || {};
        dot.className = `marker-dot-${id} marker-dot`;
      }
      
      if (cover.preSrc || cover.url) {
        dot.style.backgroundImage = `url(${cover.preSrc || cover.url})`;
      } else {
        // 如果没有封面图片，使用默认样式
        dot.style.backgroundColor = '#3b82f6';
        dot.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">📍</div>';
      }
      
      new mapboxgl.Marker(dot).setLngLat(lnglat).addTo(map.current);
    } else {
      // 默认标记
      new mapboxgl.Marker().setLngLat(lnglat).addTo(map.current);
    }
  }, []);

  const initMap = useCallback(() => {
    const lnglat = getLngLatData();
    
    if (isEmpty(lnglat) || !mapContainer.current) {
      return;
    }

    // 设置Mapbox访问令牌
    mapboxgl.accessToken = 'pk.eyJ1IjoidnlrYXd6YXRpcyIsImEiOiJjbHJycm1lYXAwaGxhMmlvMWhwZTA3Zmg2In0.eo2EYOK6v0smB1IRunC8VA';

    const basePos = {
      center: lnglat as [number, number],
      zoom: 10,
      pitch: 0,
      bearing: 0,
    };

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        ...basePos,
      });

      // 添加错误处理
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      // 添加中文语言支持
      map.current.addControl(new MapboxLanguage({ defaultLanguage: 'zh-Hans' }));

      map.current.on('load', () => {
        addMarker(basePos.center, data, true);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [data, mapStyle, getLngLatData, addMarker]);

  const resetMarker = useCallback(() => {
    const lnglat = getLngLatData();
    if (isEmpty(lnglat)) {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setHasMapData(false);
      return;
    }

    setHasMapData(true);
    
    // 如果地图已存在，先清理
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    // 重新初始化
    initMap();
  }, [getLngLatData, initMap]);

  useEffect(() => {
    const lnglat = getLngLatData();
    setHasMapData(!isEmpty(lnglat));
    
    if (!isEmpty(lnglat)) {
      // 添加一个小延迟确保DOM完全渲染
      setTimeout(() => {
        initMap();
      }, 100);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initMap, getLngLatData]);

  useEffect(() => {
    setMapStyle();
  }, [setMapStyle]);

  useEffect(() => {
    resetMarker();
  }, [data, resetMarker]);

  if (!hasMapData) {
    return null;
  }

  return (
    <div className="rounded-xl h-40 w-40 overflow-hidden">
      <div 
        ref={mapContainer} 
        className="map-temp-box h-full w-full relative"
      />
    </div>
  );
};

export default MapCard;