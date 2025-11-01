import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PROFILE_VALIDATION,
  VALIDATION_MESSAGES,
} from "../constants/validation";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { ApiUser } from "../services/api";
import { FormErrors } from "../types";
import AvatarUpload from "./AvatarUpload";
import BackgroundUpload from "./BackgroundUpload";
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

export default function ProfileEditDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ProfileEditDialogProps) {
  const [name, setName] = useState(user.name || "");
  const [signature, setSignature] = useState(user.signature || "");
  const [email, setEmail] = useState(user.email || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [city, setCity] = useState(user.city || "");
  const [job, setJob] = useState(user.job || "");
  const [company, setCompany] = useState(user.company || "");
  const [website, setWebsite] = useState(user.website || "");
  const [github, setGithub] = useState(user.github || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const updateProfile = useUpdateProfile();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // 当对话框打开时重置状态
  useEffect(() => {
    if (open) {
      setName(user.name || "");
      setSignature(user.signature || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setCity(user.city || "");
      setJob(user.job || "");
      setCompany(user.company || "");
      setWebsite(user.website || "");
      setGithub(user.github || "");
      setAvatarFile(null);
      setAvatarPreview(null);
      setBackgroundFile(null);
      setBackgroundPreview(null);
      setErrors({});
    }
  }, [open, user]);

  // 检查表单是否有修改
  const hasChanges = () => {
    return (
      name !== (user.name || "") ||
      signature !== (user.signature || "") ||
      email !== (user.email || "") ||
      mobile !== (user.mobile || "") ||
      city !== (user.city || "") ||
      job !== (user.job || "") ||
      company !== (user.company || "") ||
      website !== (user.website || "") ||
      github !== (user.github || "") ||
      avatarFile !== null ||
      backgroundFile !== null
    );
  };

  // 验证昵称
  const validateName = (value: string): string | undefined => {
    if (!value || value.trim().length === 0) {
      return VALIDATION_MESSAGES.NAME_REQUIRED;
    }
    if (value.length > PROFILE_VALIDATION.NAME.MAX_LENGTH) {
      return VALIDATION_MESSAGES.NAME_TOO_LONG;
    }
    return undefined;
  };

  // 验证签名
  const validateSignature = (value: string): string | undefined => {
    if (value.length > PROFILE_VALIDATION.SIGNATURE.MAX_LENGTH) {
      return VALIDATION_MESSAGES.SIGNATURE_TOO_LONG;
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

  // 处理背景图片变化
  const handleBackgroundChange = (file: File, preview: string) => {
    setBackgroundFile(file);
    setBackgroundPreview(preview);
  };

  // 处理背景图片错误
  const handleBackgroundError = (error: string) => {
    setErrors((prev) => ({ ...prev, background: error }));
  };

  // 移除背景图片
  const handleRemoveBackground = () => {
    setBackgroundFile(null);
    setBackgroundPreview(null);
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
        email: email !== (user.email || "") ? email : undefined,
        mobile: mobile !== (user.mobile || "") ? mobile : undefined,
        city: city !== (user.city || "") ? city : undefined,
        job: job !== (user.job || "") ? job : undefined,
        company: company !== (user.company || "") ? company : undefined,
        website: website !== (user.website || "") ? website : undefined,
        github: github !== (user.github || "") ? github : undefined,
        avatarFile,
        backgroundFile,
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
    <div className="max-h-[65vh] space-y-8 overflow-y-auto py-6 pr-2">
      {/* 头像上传 */}
      <div className="flex justify-center border-border border-b pb-8">
        <AvatarUpload
          currentAvatar={user.avatarInfo?.url}
          error={errors.avatar}
          onAvatarChange={handleAvatarChange}
          onError={handleAvatarError}
          previewAvatar={avatarPreview}
        />
      </div>

      {/* 背景图片上传 */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 font-semibold text-base text-foreground">
          <span className="h-5 w-1 rounded-full bg-primary" />
          背景图片
        </h3>
        <BackgroundUpload
          currentBackground={user.backgroundInfo?.url}
          error={errors.background}
          onBackgroundChange={handleBackgroundChange}
          onError={handleBackgroundError}
          onRemove={handleRemoveBackground}
          previewBackground={backgroundPreview}
        />
      </div>

      {/* 基本信息 */}
      <div className="space-y-5">
        <h3 className="flex items-center gap-2 font-semibold text-base text-foreground">
          <span className="h-5 w-1 rounded-full bg-primary" />
          基本信息
        </h3>
        <div className="grid gap-5 md:grid-cols-2">

          {/* 昵称输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="name">
              昵称 <span className="text-red-500">*</span>
            </Label>
            <Input
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
              className="h-11"
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

          {/* 邮箱输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="email">
              邮箱
            </Label>
            <Input
              className="h-11"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              type="email"
              value={email}
            />
          </div>

          {/* 手机号输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="mobile">
              手机号
            </Label>
            <Input
              className="h-11"
              id="mobile"
              onChange={(e) => setMobile(e.target.value)}
              placeholder="请输入手机号"
              type="tel"
              value={mobile}
            />
          </div>

          {/* 城市输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="city">
              城市
            </Label>
            <Input
              className="h-11"
              id="city"
              onChange={(e) => setCity(e.target.value)}
              placeholder="请输入城市"
              value={city}
            />
          </div>
        </div>

        {/* 签名输入 - 全宽 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium" htmlFor="signature">
            个性签名
          </Label>
          <Textarea
            aria-describedby={
              errors.signature ? "signature-error" : "signature-count"
            }
            aria-invalid={!!errors.signature}
            className="min-h-[80px] resize-none"
            id="signature"
            maxLength={100}
            onChange={handleSignatureChange}
            placeholder="记录生活中的美好时光 ✨"
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
              className="ml-auto text-muted-foreground text-xs"
              id="signature-count"
            >
              {signature.length}/100
            </p>
          </div>
        </div>
      </div>

      {/* 职业信息 */}
      <div className="space-y-5">
        <h3 className="flex items-center gap-2 font-semibold text-base text-foreground">
          <span className="h-5 w-1 rounded-full bg-primary" />
          职业信息
        </h3>
        <div className="grid gap-5 md:grid-cols-2">
          {/* 职业输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="job">
              职业
            </Label>
            <Input
              className="h-11"
              id="job"
              onChange={(e) => setJob(e.target.value)}
              placeholder="请输入职业"
              value={job}
            />
          </div>

          {/* 公司输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="company">
              公司
            </Label>
            <Input
              className="h-11"
              id="company"
              onChange={(e) => setCompany(e.target.value)}
              placeholder="请输入公司"
              value={company}
            />
          </div>
        </div>
      </div>

      {/* 社交信息 */}
      <div className="space-y-5">
        <h3 className="flex items-center gap-2 font-semibold text-base text-foreground">
          <span className="h-5 w-1 rounded-full bg-primary" />
          社交信息
        </h3>
        <div className="grid gap-5 md:grid-cols-2">
          {/* 网站输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="website">
              个人网站
            </Label>
            <Input
              className="h-11"
              id="website"
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              type="url"
              value={website}
            />
          </div>

          {/* GitHub 输入 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="github">
              GitHub
            </Label>
            <Input
              className="h-11"
              id="github"
              onChange={(e) => setGithub(e.target.value)}
              placeholder="请输入 GitHub 用户名"
              value={github}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        className="h-11 flex-1 md:flex-none md:min-w-[120px]"
        disabled={updateProfile.isPending}
        onClick={handleCancel}
        type="button"
        variant="outline"
      >
        取消
      </Button>
      <Button
        className="h-11 flex-1 md:flex-none md:min-w-[120px]"
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">编辑个人资料</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter className="gap-2">{footerButtons}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="h-[95vh] w-full" side="bottom">
        <SheetHeader>
          <SheetTitle className="text-xl">编辑个人资料</SheetTitle>
        </SheetHeader>
        {formContent}
        <SheetFooter className="gap-2 pt-4">{footerButtons}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
