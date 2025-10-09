import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { ApiUser } from "../services/api";
import AvatarUpload from "./AvatarUpload";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Textarea } from "./ui/textarea";

interface ProfileEditDialogProps {
  user: ApiUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormErrors {
  name?: string;
  signature?: string;
  avatar?: string;
}

export default function ProfileEditDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ProfileEditDialogProps) {
  const [name, setName] = useState(user.name || "");
  const [signature, setSignature] = useState(user.signature || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateProfile = useUpdateProfile();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // 检查表单是否有修改
  const hasChanges = () => {
    return (
      name !== (user.name || "") ||
      signature !== (user.signature || "") ||
      avatarFile !== null
    );
  };

  // 验证昵称
  const validateName = (value: string): string | undefined => {
    if (!value || value.trim().length === 0) {
      return "昵称不能为空";
    }
    if (value.length > 20) {
      return "昵称不能超过20个字符";
    }
    return undefined;
  };

  // 验证签名
  const validateSignature = (value: string): string | undefined => {
    if (value.length > 100) {
      return "签名不能超过100个字符";
    }
    return undefined;
  };

  // 使用 useCallback 优化性能
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      const error = validateName(value);
      setErrors((prev) => ({ ...prev, name: error }));
    },
    []
  );

  const handleSignatureChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setSignature(value);
      const error = validateSignature(value);
      setErrors((prev) => ({ ...prev, signature: error }));
    },
    []
  );

  // 处理头像变化
  const handleAvatarChange = (file: File, preview: string) => {
    setAvatarFile(file);
    setAvatarPreview(preview);
  };

  // 处理头像错误
  const handleAvatarError = (error: string) => {
    setErrors((prev) => ({ ...prev, avatar: error }));
  };

  // 处理保存
  const handleSave = async () => {
    // 验证所有字段
    const nameError = validateName(name);
    const signatureError = validateSignature(signature);

    if (nameError || signatureError) {
      setErrors({
        name: nameError,
        signature: signatureError,
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name !== user.name ? name : undefined,
        signature: signature !== user.signature ? signature : undefined,
        avatarFile,
      });

      toast.success("保存成功", {
        description: "个人资料已更新",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "操作失败，请稍后重试";
      toast.error("保存失败", {
        description: errorMessage,
      });
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm("确定要放弃修改吗？")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  // 检查是否可以保存
  const canSave = () => {
    return (
      hasChanges() &&
      !errors.name &&
      !errors.signature &&
      !errors.avatar &&
      !updateProfile.isPending
    );
  };

  const formContent = (
    <div className="space-y-6 py-4">
      {/* 头像上传 */}
      <AvatarUpload
        currentAvatar={user.avatarInfo?.url}
        error={errors.avatar}
        onAvatarChange={handleAvatarChange}
        onError={handleAvatarError}
        previewAvatar={avatarPreview}
      />

      {/* 昵称输入 */}
      <div className="space-y-2">
        <Label htmlFor="name">昵称</Label>
        <Input
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          className="min-h-[44px]"
          id="name"
          maxLength={20}
          onChange={handleNameChange}
          placeholder="请输入昵称"
          value={name}
        />
        {errors.name && (
          <p className="text-sm text-red-500" id="name-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* 签名输入 */}
      <div className="space-y-2">
        <Label htmlFor="signature">个性签名</Label>
        <Textarea
          aria-describedby={
            errors.signature ? "signature-error" : "signature-count"
          }
          aria-invalid={!!errors.signature}
          className="min-h-[44px]"
          id="signature"
          maxLength={100}
          onChange={handleSignatureChange}
          placeholder="记录生活中的美好时光 ✨"
          rows={3}
          value={signature}
        />
        <div className="flex items-center justify-between">
          {errors.signature && (
            <p
              className="text-sm text-red-500"
              id="signature-error"
              role="alert"
            >
              {errors.signature}
            </p>
          )}
          <p
            aria-live="polite"
            className="ml-auto text-xs text-gray-500"
            id="signature-count"
          >
            {signature.length}/100
          </p>
        </div>
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        className="min-h-[44px]"
        disabled={updateProfile.isPending}
        onClick={handleCancel}
        type="button"
        variant="outline"
      >
        取消
      </Button>
      <Button
        className="min-h-[44px]"
        disabled={!canSave()}
        onClick={handleSave}
        type="button"
      >
        {updateProfile.isPending ? "保存中..." : "保存"}
      </Button>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑个人资料</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter>{footerButtons}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="h-[90vh]" side="bottom">
        <SheetHeader>
          <SheetTitle>编辑个人资料</SheetTitle>
        </SheetHeader>
        {formContent}
        <SheetFooter className="gap-2">{footerButtons}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
