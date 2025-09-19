function parseDMS(dms: string): number {
  const dmsPattern = /(-?\d+)deg (\d+)' (-?\d+\.\d+)"/;
  const match = dms.match(dmsPattern);

  if (match) {
    const degrees = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3]);

    const decimalDegrees = degrees + minutes / 60 + seconds / 3600;

    return decimalDegrees;
  } else {
    return 0;
  }
}

// 通过exif获取经纬度
export function getLngLat(exifData: any): number[] {
  const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef } = exifData;
  let tempData: number[] = [];
  
  if (GPSLatitude?.value && GPSLongitude?.value) {
    let lat = parseDMS(GPSLatitude.value);
    let lng = parseDMS(GPSLongitude.value);
    const latRef = GPSLatitudeRef;
    const lngRef = GPSLongitudeRef;
    
    if (latRef === 'S') {
      lat = -lat;
    }
    if (lngRef === 'W') {
      lng = -lng;
    }
    tempData = [lng, lat];
  }
  return tempData;
}

export function getCover(data: any) {
  // 简化版本的图片数据处理，根据实际需要调整
  return {
    preSrc: data?.url || data?.preSrc,
    url: data?.url,
    blurhash: data?.blurhash
  };
}

export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

export function customDestr(obj: any, options: { customVal?: any } = {}): any {
  if (!obj) return options.customVal || {};
  if (typeof obj === 'string') {
    try {
      return JSON.parse(obj);
    } catch {
      return options.customVal || {};
    }
  }
  return obj;
}