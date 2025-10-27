import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LivePhotoViewer } from "live-photo";
import {
  GripVertical,
  Hash,
  Image,
  Loader2,
  MapPin,
  Video,
  X,
} from "lucide-react";
import type { Value } from "platejs";
import React, { useMemo, useRef, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { sanitizeHtml } from "../lib/sanitize";
import { serializeToHtml } from "../lib/serializeHtml";
import type { Post, PostImage } from "../types";
import type { FileItem } from "../types/upload";
import { detectLocalLivePhotos } from "../utils/upload/fileProcessor";
import { PlateEditor } from "./PlateEditor";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    postData: Omit<
      Post,
      | "id"
      | "author"
      | "likes"
      | "comments"
      | "saves"
      | "isLiked"
      | "isSaved"
      | "createdAt"
    >
  ) => void;
  editMode?: boolean;
  topicId?: number; // 编辑模式下的话题 ID（暂未使用，保留以备后用）
  initialData?: {
    title: string;
    content: string;
    images?: PostImage[]; // 已有的图片列表
  };
};

// 初始空值
const initialValue: Value = [
  {
    type: "p",
    children: [{ text: "7777" }],
  },
];

// 已有图片项组件（编辑模式）
interface ExistingImageItemProps {
  image: PostImage;
  id: string;
  onRemove: () => void;
}

function SortableExistingImageItem({
  image,
  id,
  onRemove,
}: ExistingImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const livePhotoRef = useRef<HTMLDivElement>(null);
  const isLivePhoto = !!(image as any).videoSrc;
  const isVideo = image.type?.startsWith("video/");

  // 初始化 Live Photo
  React.useEffect(() => {
    if (isLivePhoto && livePhotoRef.current) {
      try {
        new LivePhotoViewer({
          container: livePhotoRef.current,
          photoSrc: image.url,
          videoSrc: (image as any).videoSrc,
          height: "100%",
          width: "100%",
          imageCustomization: {
            styles: {
              objectFit: "cover",
            },
          },
        });
      } catch (error) {
        console.error("Live Photo 初始化失败:", error);
      }
    }
  }, [isLivePhoto, image.url, image]);

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
      ref={setNodeRef}
      style={style}
    >
      {isLivePhoto ? (
        // Live Photo 渲染
        <div className="h-full w-full" ref={livePhotoRef} />
      ) : isVideo ? (
        <video className="h-full w-full object-cover" src={image.url} />
      ) : (
        <img
          alt={image.name}
          className="h-full w-full object-cover"
          src={image.url}
        />
      )}

      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="text-white" size={16} />
      </div>

      {/* 删除按钮 */}
      <button
        className="absolute top-2 right-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
        onClick={onRemove}
        type="button"
      >
        <X className="text-white" size={16} />
      </button>

      {/* 视频标识 */}
      {isVideo && !isLivePhoto && (
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1">
          <Video className="text-white" size={12} />
        </div>
      )}
    </div>
  );
}

// 媒体文件项组件（本地预览）
interface MediaItemProps {
  file: File;
  id: string;
  onRemove: () => void;
  videoFile?: File; // Live Photo 的视频文件
}

function SortableMediaItem({ file, id, onRemove, videoFile }: MediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [preview, setPreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const livePhotoRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  React.useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  // 初始化 Live Photo
  React.useEffect(() => {
    if (videoFile && preview && videoPreview && livePhotoRef.current) {
      try {
        new LivePhotoViewer({
          container: livePhotoRef.current,
          photoSrc: preview,
          videoSrc: videoPreview,
          height: "100%",
          width: "100%",
          imageCustomization: {
            styles: {
              objectFit: "cover",
            },
          },
        });
      } catch (error) {
        console.error("Live Photo 初始化失败:", error);
      }
    }
  }, [preview, videoPreview, videoFile]);

  const isVideo = file.type.startsWith("video/");
  const isLivePhoto = !!videoFile;

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
      ref={setNodeRef}
      style={style}
    >
      {isLivePhoto ? (
        // Live Photo 渲染
        <div className="h-full w-full" ref={livePhotoRef} />
      ) : isVideo ? (
        <video className="h-full w-full object-cover" src={preview} />
      ) : (
        <img alt="" className="h-full w-full object-cover" src={preview} />
      )}

      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="text-white" size={16} />
      </div>

      {/* 删除按钮 */}
      <button
        className="absolute top-2 right-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
        onClick={onRemove}
        type="button"
      >
        <X className="text-white" size={16} />
      </button>

      {/* 视频标识 */}
      {isVideo && !isLivePhoto && (
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1">
          <Video className="text-white" size={12} />
        </div>
      )}
    </div>
  );
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  editMode = false,
  topicId,
  initialData,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Value>(initialValue);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // 选中的文件（未上传）
  const [existingImages, setExistingImages] = useState<PostImage[]>([]); // 编辑模式下已有的图片
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用文件上传 Hook
  const { uploadState, uploadMultipleFiles } = useFileUpload();

  // 编辑模式：加载初始数据
  React.useEffect(() => {
    if (isOpen && editMode && initialData) {
      setTitle(initialData.title || "");

      // 将 HTML 内容转换回 Plate Value
      // 简单处理：如果是纯文本就直接设置，否则保持初始值
      if (initialData.content) {
        // TODO: 如果需要完整的 HTML 解析，需要实现 deserializeHtml 函数
        // 目前简单处理为纯文本
        setContent([
          {
            type: "p",
            children: [{ text: initialData.content.replace(/<[^>]*>/g, '') }],
          },
        ]);
      }
      
      // 回显已有图片
      if (initialData.images && initialData.images.length > 0) {
        setExistingImages(initialData.images);
      } else {
        setExistingImages([]);
      }
    } else if (isOpen && !editMode) {
      // 创建模式：重置表单
      setTitle("");
      setContent(initialValue);
      setTags("");
      setLocation("");
      setSelectedFiles([]);
      setExistingImages([]);
    }
  }, [isOpen, editMode, initialData]);

  // 拖拽排序传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 检测 Live Photo 配对
  const livePhotoPairs = useMemo(() => {
    return detectLocalLivePhotos(selectedFiles);
  }, [selectedFiles]);

  // 创建 Live Photo 映射（图片索引 -> 视频文件）
  const livePhotoMap = useMemo(() => {
    const map = new Map<number, File>();
    livePhotoPairs.forEach((pair) => {
      map.set(pair.imageIndex, pair.videoFile);
    });
    return map;
  }, [livePhotoPairs]);

  // 过滤掉已配对的 MOV 文件，只显示图片和未配对的视频
  const displayFiles = useMemo(() => {
    const pairedVideoIndices = new Set(
      livePhotoPairs.map((pair) => pair.videoIndex)
    );
    return selectedFiles.filter((_, index) => !pairedVideoIndices.has(index));
  }, [selectedFiles, livePhotoPairs]);

  // 为每个文件生成唯一 ID（用于预览）
  const mediaItems = useMemo(() => {
    return displayFiles.map((file, displayIndex) => {
      // 找到原始索引
      const originalIndex = selectedFiles.indexOf(file);
      const videoFile = livePhotoMap.get(originalIndex);

      return {
        file,
        videoFile,
        id: `${file.name}-${displayIndex}`,
        originalIndex,
      };
    });
  }, [displayFiles, selectedFiles, livePhotoMap]);

  if (!isOpen) {
    return null;
  }

  // 处理已有图片拖拽排序
  const handleExistingImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // 从 ID 中提取索引
      const oldIndex = Number(String(active.id).replace("existing-", ""));
      const newIndex = Number(String(over.id).replace("existing-", ""));

      const newImages = arrayMove(existingImages, oldIndex, newIndex);
      setExistingImages(newImages);
    }
  };

  // 处理新上传文件拖拽排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldDisplayIndex = mediaItems.findIndex(
        (item) => item.id === active.id
      );
      const newDisplayIndex = mediaItems.findIndex(
        (item) => item.id === over.id
      );

      // 使用 originalIndex 来移动原始文件数组
      const oldOriginalIndex = mediaItems[oldDisplayIndex].originalIndex;
      const newOriginalIndex = mediaItems[newDisplayIndex].originalIndex;

      const newFiles = arrayMove(
        selectedFiles,
        oldOriginalIndex,
        newOriginalIndex
      );
      setSelectedFiles(newFiles);
    }
  };

  // 处理文件选择（仅预览，不上传）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 添加到选中文件列表
    setSelectedFiles((prev) => [...prev, ...files]);

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (files.length === 0) return;

    // 添加到选中文件列表
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // 删除文件（如果是 Live Photo，同时删除图片和视频）
  const handleRemoveFile = (displayIndex: number) => {
    const item = mediaItems[displayIndex];
    if (!item) return;

    const originalIndex = item.originalIndex;

    setSelectedFiles((prev) => {
      // 检查是否是 Live Photo
      const videoFile = livePhotoMap.get(originalIndex);
      if (videoFile) {
        // 找到视频文件的索引
        const videoIndex = prev.indexOf(videoFile);
        // 同时删除图片和视频
        return prev.filter((_, i) => i !== originalIndex && i !== videoIndex);
      }

      // 普通文件，直接删除
      return prev.filter((_, i) => i !== originalIndex);
    });
  };

  // 检查内容是否为空
  const isContentEmpty = (value: Value) => {
    return value.every((node) => {
      if ("children" in node) {
        return node.children.every((child) => {
          if (typeof child === "object" && child !== null && "text" in child) {
            return typeof child.text === "string" && child.text.trim() === "";
          }
          return false;
        });
      }
      return false;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证内容不为空
    if (isContentEmpty(content)) {
      alert("请输入内容");
      return;
    }

    try {
      // 1. 先上传文件（如果有新文件）
      let uploadedFiles: FileItem[] = [];
      if (selectedFiles.length > 0) {
        const rawUploadedFiles = await uploadMultipleFiles(selectedFiles, {
          compressPNG: false,
          compressJPEG: false,
        });

        // 2. 处理 Live Photo 文件关联
        const { processLivePhotoFiles } = await import(
          "../utils/upload/fileProcessor"
        );
        uploadedFiles = await processLivePhotoFiles(rawUploadedFiles);
        console.log("🌈-----uploadedFiles-----", uploadedFiles);
      }

      // 3. 将 Plate Value 转换为 HTML 字符串
      const htmlContent = serializeToHtml(content);

      // 4. 清理 HTML 以防止 XSS 攻击
      const sanitizedContent = sanitizeHtml(htmlContent);

      // 5. 构建提交数据
      const postData: any = {
        title,
        content: sanitizedContent,
      };

      // 编辑模式下合并已有图片和新上传的图片
      if (editMode) {
        // 保留已有图片的 ID
        const existingFileIds = existingImages.map((img) => img.id);
        // 添加新上传的图片 ID
        const newFileIds = uploadedFiles.map((file) => file.id);
        // 合并（已有图片在前，新图片在后）
        if (existingFileIds.length > 0 || newFileIds.length > 0) {
          postData.fileIds = [...existingFileIds, ...newFileIds];
        }
      } else {
        // 创建模式
        postData.tagIds = [1];
        postData.fileIds = uploadedFiles.map((file) => file.id).reverse();
      }

      // 6. 实际提交
      console.log(editMode ? "🔄-----更新数据-----" : "🍪-----创建数据-----", postData);
      onSubmit(postData);

      // 7. 重置表单（仅在创建模式）
      if (!editMode) {
        setTitle("");
        setContent(initialValue);
        setTags("");
        setLocation("");
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
      onClose();
    } catch (error) {
      console.error(editMode ? "更新失败:" : "提交失败:", error);
      alert(editMode ? "更新失败，请重试" : "提交失败，请重试");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-lg flex-col transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* 头部 */}
        <div className="relative flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-black text-xl">
                {editMode ? "编辑动态" : "创建新动态"}
              </h2>
              <p className="mt-1 text-gray-500 text-sm">
                {editMode ? "修改你的动态内容" : "分享你的精彩瞬间"}
              </p>
            </div>
            <button
              className="rounded-full p-2 transition-all duration-200 hover:bg-gray-100"
              disabled={uploadState.isUploading}
              onClick={onClose}
              type="button"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>
        </div>

        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          {/* 可滚动内容区域 */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6">
            {/* 标题输入 */}
            <div className="space-y-2">
              <label
                className="font-medium text-gray-700 text-sm"
                htmlFor="post-title"
              >
                标题
              </label>
              <input
                className="w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black/10"
                disabled={uploadState.isUploading}
                id="post-title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的动态起个吸引人的标题..."
                required
                type="text"
                value={title}
              />
            </div>

            {/* 内容输入 */}
            <div className="space-y-2">
              <label
                className="font-medium text-gray-700 text-sm"
                htmlFor="post-content"
              >
                内容
              </label>
              <PlateEditor
                onChange={setContent}
                placeholder="分享你的想法、感受或故事..."
                value={content}
              />
            </div>

            {/* 媒体上传区域 */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700 text-sm">
                图片/视频（可选）
              </label>
              <div
                className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${isDragging
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  } ${uploadState.isUploading ? "pointer-events-none opacity-50" : ""}`}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label
                  className="group block cursor-pointer"
                  htmlFor="post-media"
                >
                  <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200">
                    <Image className="text-gray-400" size={14} />
                  </div>
                  <p className="text-gray-600 text-xs">
                    点击或拖拽上传图片/视频
                  </p>
                  <p className="text-gray-400 text-xs">
                    支持 JPG、PNG、MP4 等格式
                  </p>
                </label>
                <input
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={uploadState.isUploading}
                  id="post-media"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />
              </div>

              {/* 上传进度 */}
              {uploadState.isUploading && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={16}
                      />
                      <span className="font-medium text-blue-900 text-sm">
                        {uploadState.stageText}
                      </span>
                    </div>
                    <span className="text-blue-700 text-sm">
                      {uploadState.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-blue-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 已有图片预览（编辑模式，支持拖拽排序） */}
              {editMode && existingImages.length > 0 && (
                <div className="mt-3 max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 p-2">
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleExistingImageDragEnd}
                    sensors={sensors}
                  >
                    <SortableContext
                      items={existingImages.map((_, idx) => `existing-${idx}`)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((image, index) => (
                          <SortableExistingImageItem
                            id={`existing-${index}`}
                            image={image}
                            key={`existing-${index}`}
                            onRemove={() => {
                              setExistingImages((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* 新上传文件预览网格 */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 p-2">
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                  >
                    <SortableContext
                      items={mediaItems.map((item) => item.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {mediaItems.map((item, index) => (
                          <SortableMediaItem
                            file={item.file}
                            id={item.id}
                            key={item.id}
                            onRemove={() => handleRemoveFile(index)}
                            videoFile={item.videoFile}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>

            {/* 标签和位置 */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <label
                  className="flex items-center gap-1.5 font-medium text-gray-700 text-sm"
                  htmlFor="post-tags"
                >
                  <Hash size={14} />
                  标签
                </label>
                <input
                  className="w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black/10"
                  disabled={uploadState.isUploading}
                  id="post-tags"
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="添加标签，用逗号分隔（如：旅行, 美食, 生活）"
                  type="text"
                  value={tags}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="flex items-center gap-1.5 font-medium text-gray-700 text-sm"
                  htmlFor="post-location"
                >
                  <MapPin size={14} />
                  位置
                </label>
                <input
                  className="w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black/10"
                  disabled={uploadState.isUploading}
                  id="post-location"
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="添加位置信息（可选）"
                  type="text"
                  value={location}
                />
              </div>
            </div>
          </div>

          {/* 固定底部提交按钮 */}
          <div className="flex-shrink-0 border-t border-gray-100 p-6">
            <button
              className="w-full transform rounded-xl bg-black py-3.5 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              disabled={uploadState.isUploading}
              type="submit"
            >
              {uploadState.isUploading
                ? "上传中..."
                : editMode
                  ? "保存修改"
                  : "发布动态"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
