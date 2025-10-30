import { Hash, Loader2, MapPin, X } from "lucide-react";
import type { Value } from "platejs";
import React, { useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { sanitizeHtml } from "../lib/sanitize";
import { serializeToHtml } from "../lib/serializeHtml";
import type { Post, PostImage } from "../types";
import type { FileItem } from "../types/upload";
import { MediaUploader, type UnifiedMediaItem } from "./MediaUploader";
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
  topicId?: number;
  initialData?: {
    title: string;
    content: string;
    images?: PostImage[];
    topicTags?: Array<{
      tag: {
        title: string;
      };
    }>;
  };
};

// 初始空值
const initialValue: Value = [
  {
    type: "p",
    children: [{ text: "7777" }],
  },
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  editMode = false,
  topicId: _topicId,
  initialData,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Value>(initialValue);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [mediaItems, setMediaItems] = useState<UnifiedMediaItem[]>([]);

  // 使用文件上传 Hook
  const { uploadState, uploadMultipleFiles } = useFileUpload();

  // 编辑模式：加载初始数据
  React.useEffect(() => {
    if (isOpen && editMode && initialData) {
      setTitle(initialData.title || "");

      // 将 HTML 内容转换回 Plate Value
      if (initialData.content) {
        setContent([
          {
            type: "p",
            children: [{ text: initialData.content.replace(/<[^>]*>/g, "") }],
          },
        ]);
      }

      // 回显标签
      if (initialData.topicTags && initialData.topicTags.length > 0) {
        const tagNames = initialData.topicTags.map((tt) => tt.tag.title);
        setTags(tagNames.join(", "));
      } else {
        setTags("");
      }
    } else if (isOpen && !editMode) {
      // 创建模式：重置表单
      setTitle("");
      setContent(initialValue);
      setTags("");
      setLocation("");
      setMediaItems([]);
    }
  }, [isOpen, editMode, initialData]);

  if (!isOpen) {
    return null;
  }

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
      // 1. 上传新文件
      const newItems = mediaItems.filter((item) => item.type === "new");
      let uploadedFiles: FileItem[] = [];

      if (newItems.length > 0) {
        const filesToUpload = newItems.map((item) => item.data.file);
        const rawUploadedFiles = await uploadMultipleFiles(filesToUpload, {
          compressPNG: false,
          compressJPEG: false,
        });

        // 处理 Live Photo 文件关联
        const { processLivePhotoFiles } = await import(
          "../utils/upload/fileProcessor"
        );
        uploadedFiles = await processLivePhotoFiles(rawUploadedFiles);
        console.log("🌈-----uploadedFiles-----", uploadedFiles);
      }

      // 2. 将 Plate Value 转换为 HTML 字符串
      const htmlContent = serializeToHtml(content);

      // 3. 清理 HTML 以防止 XSS 攻击
      const sanitizedContent = sanitizeHtml(htmlContent);

      // 4. 构建提交数据
      const postData: any = {
        title,
        content: sanitizedContent,
      };

      // 处理标签
      if (tags && tags.trim()) {
        postData.tags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }

      // 5. 按照 mediaItems 的顺序构建 fileIds
      const fileIds: number[] = [];
      let newFileIndex = 0;

      for (const item of mediaItems) {
        if (item.type === "existing") {
          fileIds.push(item.data.id);
        } else {
          fileIds.push(Number(uploadedFiles[newFileIndex].id));
          newFileIndex++;
        }
      }

      if (fileIds.length > 0) {
        postData.fileIds = fileIds.reverse();
      }

      // 6. 实际提交
      console.log(
        editMode ? "🔄-----更新数据-----" : "🍪-----创建数据-----",
        postData
      );
      onSubmit(postData);

      // 7. 重置表单（仅在创建模式）
      if (!editMode) {
        setTitle("");
        setContent(initialValue);
        setTags("");
        setLocation("");
        setMediaItems([]);
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
            <MediaUploader
              disabled={uploadState.isUploading}
              initialImages={initialData?.images}
              onChange={setMediaItems}
            />

            {/* 上传进度 */}
            {uploadState.isUploading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={16} />
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
