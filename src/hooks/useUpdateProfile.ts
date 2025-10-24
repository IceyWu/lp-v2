import { useMutation, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { PROFILE_VALIDATION } from "../constants/validation";
import { apiService } from "../services/api";
import { UpdateProfileData } from "../types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      let avatarMd5: string | undefined;

      // 如果有头像文件，先上传头像
      if (data.avatarFile) {
        // 压缩图片
        const compressedFile = await imageCompression(data.avatarFile, {
          maxSizeMB: PROFILE_VALIDATION.AVATAR.COMPRESSION.MAX_SIZE_MB,
          maxWidthOrHeight:
            PROFILE_VALIDATION.AVATAR.COMPRESSION.MAX_WIDTH_OR_HEIGHT,
          useWebWorker: true,
        });

        // 上传头像
        const uploadResponse = await apiService.uploadAvatar(compressedFile);
        if (uploadResponse.code === 200 && uploadResponse.result) {
          avatarMd5 = uploadResponse.result.md5;
        }
      }

      // 更新用户信息
      const profileData: { name?: string; signature?: string } = {};
      if (data.name !== undefined) {
        profileData.name = data.name;
      }
      if (data.signature !== undefined) {
        profileData.signature = data.signature;
      }

      // 如果有基本信息需要更新
      if (Object.keys(profileData).length > 0) {
        await apiService.updateUserProfile(profileData);
      }

      // 如果有头像需要更新
      if (avatarMd5) {
        await apiService.updateUserAvatar(avatarMd5);
      }

      // 返回最新的用户信息
      const userResponse = await apiService.getCurrentUser();
      return userResponse.result;
    },
    onSuccess: () => {
      // 刷新用户数据缓存
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      // 错误会被组件捕获并处理
    },
  });
};
