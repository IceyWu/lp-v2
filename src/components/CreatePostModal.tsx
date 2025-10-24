import { Hash, Image, MapPin, X } from "lucide-react";
import type { Value } from "platejs";
import { useState } from "react";
import { sanitizeHtml } from "../lib/sanitize";
import { serializeToHtml } from "../lib/serializeHtml";
import type { Post } from "../types";
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

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Value>(initialValue);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");

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
      images: [], // 简化版本暂不处理图片上传
    };

    onSubmit(postData);

    // 重置表单
    setTitle("");
    setContent(initialValue);
    setTags("");
    setLocation("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-lg transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* 头部 */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-black text-xl">创建新动态</h2>
              <p className="mt-1 text-gray-500 text-sm">分享你的精彩瞬间</p>
            </div>
            <button
              className="rounded-full p-2 transition-all duration-200 hover:bg-gray-100"
              onClick={onClose}
              type="button"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>
        </div>

        <form
          className="max-h-[calc(85vh-100px)] space-y-6 overflow-y-auto px-6 pb-6"
          onSubmit={handleSubmit}
        >
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

          {/* 图片上传区域 */}
          <div className="space-y-2">
            <label
              className="font-medium text-gray-700 text-sm"
              htmlFor="post-images"
            >
              图片（可选）
            </label>
            <div className="group relative">
              <div className="cursor-pointer rounded-xl border-2 border-gray-200 border-dashed p-6 text-center transition-all hover:border-gray-300 hover:bg-gray-50/50">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200">
                  <Image className="text-gray-400" size={16} />
                </div>
                <p className="mb-1 text-gray-600 text-sm">添加图片</p>
                <p className="text-gray-400 text-xs">也可以创建纯文字动态</p>
              </div>
            </div>
            {/* 隐藏的文件输入以关联 label，实际上传功能后续再实现 */}
            <input className="hidden" id="post-images" type="file" />
          </div>

          {/* 标签和位置 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label
                className="flex items-center gap-2 font-medium text-gray-700 text-sm"
                htmlFor="post-tags"
              >
                <Hash size={14} />
                标签
              </label>
              <input
                className="w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black/10"
                id="post-tags"
                onChange={(e) => setTags(e.target.value)}
                placeholder="添加标签，用逗号分隔（如：旅行, 美食, 生活）"
                type="text"
                value={tags}
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-2 font-medium text-gray-700 text-sm"
                htmlFor="post-location"
              >
                <MapPin size={14} />
                位置
              </label>
              <input
                className="w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black/10"
                id="post-location"
                onChange={(e) => setLocation(e.target.value)}
                placeholder="添加位置信息（可选）"
                type="text"
                value={location}
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="pt-2">
            <button
              className="w-full transform rounded-xl bg-black py-4 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98]"
              type="submit"
            >
              发布动态
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
