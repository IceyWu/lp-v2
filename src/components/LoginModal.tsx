import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MESSAGES } from "../constants/messages";
import { useLogin, useRegister } from "../hooks/useAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
}: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    account: "",
    password: "",
    name: "",
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const result = await loginMutation.mutateAsync({
          account: formData.account,
          password: formData.password,
        });

        if (result.code === 200) {
          onSuccess();
          onClose();
          // 重置表单
          setFormData({ account: "", password: "", name: "" });
        }
      } else {
        const result = await registerMutation.mutateAsync({
          account: formData.account,
          password: formData.password,
          name: formData.name,
        });

        if (result.code === 200) {
          onSuccess();
          onClose();
          // 重置表单
          setFormData({ account: "", password: "", name: "" });
        }
      }
    } catch (_error) {
      // intentionally swallow error; user feedback handled via mutation error state
    }
  };

  const currentMutation = isLogin ? loginMutation : registerMutation;
  const error = currentMutation.error as any;

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLogin ? MESSAGES.FORM.LOGIN : MESSAGES.FORM.REGISTER}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="account">{MESSAGES.FORM.ACCOUNT}</Label>
            <Input
              id="account"
              onChange={(e) =>
                setFormData({ ...formData, account: e.target.value })
              }
              placeholder={MESSAGES.FORM.PLACEHOLDER.ACCOUNT}
              required
              type="text"
              value={formData.account}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">{MESSAGES.FORM.USERNAME}</Label>
              <Input
                id="name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={MESSAGES.FORM.PLACEHOLDER.USERNAME}
                required
                type="text"
                value={formData.name}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">{MESSAGES.FORM.PASSWORD}</Label>
            <Input
              id="password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD}
              required
              type="password"
              value={formData.password}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm">
              {error.message || MESSAGES.ERROR.OPERATION_FAILED}
            </div>
          )}

          <Button
            className="w-full"
            disabled={currentMutation.isPending}
            type="submit"
          >
            {currentMutation.isPending
              ? MESSAGES.FORM.PROCESSING
              : isLogin
                ? MESSAGES.FORM.LOGIN
                : MESSAGES.FORM.REGISTER}
          </Button>
        </form>

        <div className="text-center">
          <Button
            className="text-sm"
            onClick={() => setIsLogin(!isLogin)}
            variant="link"
          >
            {isLogin
              ? MESSAGES.BUTTON.NO_ACCOUNT_REGISTER
              : MESSAGES.BUTTON.HAS_ACCOUNT_LOGIN}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
