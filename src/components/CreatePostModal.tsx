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
import type { Post } from "../types";
import type { FileItem } from "../types/upload";
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
};

// 初始空值
const initialValue: Value = [
  {
    type: "p",
    children: [{ text: "" }],
  },
];

// 媒体文件项组件（已上传）
interface UploadedMediaItemProps {
  file: FileItem;
  id: string;
  onRemove: () => void;
}

function SortableUploadedMediaItem({
  file,
  id,
  onRemove,
}: UploadedMediaItemProps) {
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

  const isVideo = file.type.startsWith("video/");

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
      ref={setNodeRef}
      style={style}
    >
      {isVideo ? (
        <video className="h-full w-full object-cover" src={file.url} />
      ) : (
        <img
          alt={file.name}
          className="h-full w-full object-cover"
          src={file.url}
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
      {isVideo && (
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
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Value>(initialValue);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用文件上传 Hook
  const { uploadState, uploadMultipleFiles } = useFileUpload();

  // 拖拽排序传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 为每个文件生成唯一 ID
  const mediaItems = useMemo(
    () => uploadedFiles.map((file) => ({ file, id: file.id })),
    [uploadedFiles]
  );

  if (!isOpen) {
    return null;
  }

  // 处理拖拽排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mediaItems.findIndex((item) => item.id === active.id);
      const newIndex = mediaItems.findIndex((item) => item.id === over.id);
      const newFiles = arrayMove(uploadedFiles, oldIndex, newIndex);
      setUploadedFiles(newFiles);
    }
  };

  // 处理文件选择并上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // 上传文件
      const results = await uploadMultipleFiles(files, {
        compressPNG: false,
        compressJPEG: false,
      });

      // 添加到已上传列表
      setUploadedFiles((prev) => [...prev, ...results]);

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("上传失败:", error);
      alert("文件上传失败，请重试");
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (files.length === 0) return;

    try {
      const results = await uploadMultipleFiles(files, {
        compressPNG: false,
        compressJPEG: false,
      });

      setUploadedFiles((prev) => [...prev, ...results]);
    } catch (error) {
      console.error("上传失败:", error);
      alert("文件上传失败，请重试");
    }
  };

  // 删除文件
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证内容不为空
    if (isContentEmpty(content)) {
      alert("请输入内容");
      return;
    }

    // 将 Plate Value 转换为 HTML 字符串
    const htmlContent = serializeToHtml(content);

    // 清理 HTML 以防止 XSS 攻击
    const sanitizedContent = sanitizeHtml(htmlContent);

    const postData = {
      title,
      content: sanitizedContent,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      location: location || undefined,
      images: uploadedFiles.map((file) => ({
        id: Number(file.id) || 0,
        url: file.url,
        width: file.width || 0,
        height: file.height || 0,
        blurhash: file.blurhash || "",
        type: file.type,
        name: file.name,
      })),
    };

    // 打印参数查看
    console.log("提交的数据：", postData);
    console.log("上传的文件：", uploadedFiles);

    // 实际提交
    onSubmit(postData);

    // 重置表单
    setTitle("");
    setContent(initialValue);
    setTags("");
    setLocation("");
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-lg flex-col transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* 头部 */}
        <div className="relative flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-black text-xl">创建新动态</h2>
              <p className="mt-1 text-gray-500 text-sm">分享你的精彩瞬间</p>
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
                className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragging
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

              {/* 媒体预览网格 */}
              {uploadedFiles.length > 0 && (
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
                          <SortableUploadedMediaItem
                            file={item.file}
                            id={item.id}
                            key={item.id}
                            onRemove={() => handleRemoveFile(index)}
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
              {uploadState.isUploading ? "上传中..." : "发布动态"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
