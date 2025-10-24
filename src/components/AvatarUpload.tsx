import { Camera } from "lucide-react";
import { useRef } from "react";
import {
  PROFILE_VALIDATION,
  VALIDATION_MESSAGES,
} from "../constants/validation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface AvatarUploadProps {
  currentAvatar?: string;
  previewAvatar?: string | null;
  onAvatarChange: (file: File, preview: string) => void;
  onError: (error: string) => void;
  error?: string;
}

export default function AvatarUpload({
  currentAvatar,
  previewAvatar,
  onAvatarChange,
  onError,
  error,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (
      !(PROFILE_VALIDATION.AVATAR.ALLOWED_TYPES as readonly string[]).includes(
        file.type
      )
    ) {
      onError(VALIDATION_MESSAGES.AVATAR_INVALID_TYPE);
      return;
    }

    // 验证文件大小
    if (file.size > PROFILE_VALIDATION.AVATAR.MAX_SIZE) {
      onError(VALIDATION_MESSAGES.AVATAR_TOO_LARGE);
      return;
    }

    // 清除之前的错误
    onError("");

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    onAvatarChange(file, previewUrl);
  };

  const displayAvatar = previewAvatar || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage alt="Avatar" src={displayAvatar} />
          <AvatarFallback>头像</AvatarFallback>
        </Avatar>
        <button
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
          onClick={handleClick}
          type="button"
        >
          <Camera size={16} />
        </button>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
