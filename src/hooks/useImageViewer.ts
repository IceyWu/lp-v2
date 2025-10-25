import { useCallback, useEffect, useRef, useState } from "react";
import { type ImageObj, ViewerPro, type ViewerProOptions } from "viewer-pro";
import type { PostImage } from "../types";

export type { ImageObj, ViewerProOptions };

export function useImageViewer(initialOptions: ViewerProOptions = {}) {
  const [images, setImages] = useState<ImageObj[]>(initialOptions.images || []);
  const viewerRef = useRef<ViewerPro | null>(null);

  // 自定义加载节点
  const createCustomLoadingNode = useCallback(() => {
    const customLoading = document.createElement("div");
    customLoading.innerHTML = `
      <div style="color: #fff; font-size: 18px; display: flex; flex-direction: column; align-items: center;">
        <svg width="32" height="32" viewBox="0 0 50 50">
          <circle 
            cx="25" 
            cy="25" 
            r="20" 
            fill="none" 
            stroke="#3B82F6" 
            stroke-width="5" 
            stroke-linecap="round" 
            stroke-dasharray="31.4 31.4" 
            transform="rotate(-90 25 25)"
          >
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="0 25 25" 
              to="360 25 25" 
              dur="1s" 
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <span>图片加载中，请稍候...</span>
      </div>
    `;
    return customLoading;
  }, []);

  // 自定义渲染节点
  const createCustomRenderNode = useCallback((imgObj: ImageObj) => {
    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.height = "100%";
    box.innerHTML = `
      <img 
        src="${imgObj.src}" 
        style="max-width:90%;max-height:90%;border-radius:12px;box-shadow:0 2px 16px #0004;"
        alt="${imgObj.title || ""}"
      >
      ${imgObj.title ? `<div style="color:#fff;margin-top:8px;">${imgObj.title}</div>` : ""}
    `;
    return box;
  }, []);

  // 初始化图片查看器
  const initViewer = useCallback(async () => {
    if (images.length === 0) {
      return;
    }

    const viewerOptions: ViewerProOptions = {
      images,
      loadingNode: initialOptions.loadingNode || createCustomLoadingNode(),
      renderNode: initialOptions.renderNode || createCustomRenderNode,
      onImageLoad: initialOptions.onImageLoad || ((_imgObj, _idx) => {}),
    };

    viewerRef.current = new ViewerPro(viewerOptions);
    viewerRef.current.init();
  }, [images, initialOptions, createCustomLoadingNode, createCustomRenderNode]);

  // 打开图片预览
  const openPreview = useCallback(
    (index: number) => {
      if (viewerRef.current && index >= 0 && index < images.length) {
        viewerRef.current.open(index);
      }
    },
    [images.length]
  );

  // 关闭图片预览
  const closePreview = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.close();
    }
  }, []);

  // 添加图片
  const addImages = useCallback((newImages: ImageObj[]) => {
    setImages((prev) => [...prev, ...newImages]);
    if (viewerRef.current) {
      viewerRef.current.addImages(newImages);
    }
  }, []);

  // 设置图片列表
  const updateImages = useCallback((newImages: ImageObj[]) => {
    setImages(newImages);
  }, []);

  // 根据图片 URL 查找索引
  const findImageIndex = useCallback(
    (src: string) => images.findIndex((img) => img.src === src),
    [images]
  );

  // 打开指定 URL 的图片
  const openImageBySrc = useCallback(
    (src: string) => {
      const index = findImageIndex(src);
      if (index !== -1) {
        openPreview(index);
      }
    },
    [findImageIndex, openPreview]
  );

  // 从 PostImage 数组转换为 ImageObj 数组
  const convertPostImagesToImageObj = useCallback(
    (postImages: PostImage[]): ImageObj[] => {
      return postImages.map((img) => ({
        src: img.url,
        thumbnail: `${img.url}?x-oss-process=image/resize,w_300,h_200,m_lfit/quality,q_60/format,webp`,
        title: img.name,
      }));
    },
    []
  );

  // 使用 PostImage 初始化查看器
  const initWithPostImages = useCallback(
    (postImages: PostImage[]) => {
      const imageObjs = convertPostImagesToImageObj(postImages);
      updateImages(imageObjs);
    },
    [convertPostImagesToImageObj, updateImages]
  );

  // 初始化和清理
  useEffect(() => {
    if (images.length > 0) {
      initViewer();
    }
  }, [images, initViewer]);

  useEffect(
    () => () => {
      if (viewerRef.current) {
        viewerRef.current.close();
      }
    },
    []
  );

  return {
    viewer: viewerRef.current,
    images,
    openPreview,
    closePreview,
    addImages,
    updateImages,
    findImageIndex,
    openImageBySrc,
    initViewer,
    convertPostImagesToImageObj,
    initWithPostImages,
  };
}
