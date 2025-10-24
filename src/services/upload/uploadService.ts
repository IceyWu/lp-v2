import type {
  FileItem,
  UploadErrorCode,
  UploadOptions,
  UploadProgress,
} from "../../types/upload";
import { UploadError } from "../../types/upload";
import { generateBlurhash } from "../../utils/upload/blurhash";
import {
  compressImage,
  shouldCompress,
} from "../../utils/upload/imageCompress";
import { calculateMD5 } from "../../utils/upload/md5";
import { getOSSSignature, saveFileInfo, uploadToOSS } from "./ossService";

/**
 * 获取文件类型
 */
function getFileType(file: File): string {
  const type = file.type.split("/")[0];
  return type.toUpperCase();
}

/**
 * 判断是否为视频文件
 */
function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * 上传单个文件
 * @param file 文件对象
 * @param options 上传配置
 * @returns 上传后的文件信息
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<FileItem> {
  const { compressPNG = false, compressJPEG = false, onProgress } = options;
  console.log("🍪-----options-----", options);

  let processedFile = file;

  try {
    // 1. 图片压缩（如需要）
    if ((compressPNG || compressJPEG) && shouldCompress(file)) {
      onProgress?.({ stage: "compress", percent: 0 });
      try {
        processedFile = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });
        onProgress?.({ stage: "compress", percent: 100 });
      } catch (error) {
        console.warn("图片压缩失败，使用原文件:", error);
        processedFile = file;
      }
    }

    // 2. 计算 MD5
    onProgress?.({ stage: "md5", percent: 0 });
    const md5 = await calculateMD5(processedFile, (percent) => {
      onProgress?.({ stage: "md5", percent });
    });

    // 3. 获取 OSS 签名
    const signatureResponse = await getOSSSignature(md5);

    if (signatureResponse.code !== 200) {
      throw new UploadError(
        signatureResponse.msg || "获取 OSS 签名失败",
        "SIGNATURE_FAILED" as UploadErrorCode,
        "upload"
      );
    }

    const ossData = signatureResponse.result;
    console.log(ossData, "--------------ossData");

    // 4. 检查是否已上传
    if (ossData.hasUpload && ossData.url) {
      // 文件已存在，直接返回
      return {
        id: md5,
        name: file.name,
        type: file.type,
        url: ossData.url,
        size: file.size,
        md5,
      };
    }

    // 5. 上传到 OSS
    onProgress?.({ stage: "upload", percent: 0 });
    const fileUrl = await uploadToOSS(processedFile, ossData, (percent) => {
      onProgress?.({ stage: "upload", percent });
    });

    // 6. 生成 Blurhash（仅图片）
    let blurhash: string | undefined;
    if (!isVideoFile(processedFile)) {
      try {
        onProgress?.({ stage: "blurhash", percent: 0 });
        blurhash = await generateBlurhash(processedFile);
        onProgress?.({ stage: "blurhash", percent: 100 });
      } catch (error) {
        console.warn("Blurhash 生成失败:", error);
      }
    }

    // 7. 保存文件信息到服务器
    onProgress?.({ stage: "save", percent: 0 });
    const saveResponse = await saveFileInfo({
      fileUrl,
      fileMd5: md5,
      size: processedFile.size,
      type: processedFile.type,
      name: processedFile.name,
      dir: ossData.dir,
      hashCode: blurhash,
    });

    if (saveResponse.code !== 200) {
      throw new UploadError(
        saveResponse.msg || "保存文件信息失败",
        "SAVE_FAILED" as UploadErrorCode,
        "save"
      );
    }

    onProgress?.({ stage: "save", percent: 100 });

    // 8. 返回文件信息
    return saveResponse.result;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }

    // 包装其他错误
    throw new UploadError(
      error instanceof Error ? error.message : "上传失败",
      "UPLOAD_FAILED" as UploadErrorCode,
      "upload"
    );
  }
}

/**
 * 批量上传文件（带重试机制）
 * @param files 文件列表
 * @param options 上传配置
 * @param maxRetries 最大重试次数
 * @returns 上传后的文件信息列表
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {},
  maxRetries = 3
): Promise<FileItem[]> {
  const results: FileItem[] = [];

  for (const file of files) {
    let retries = 0;
    let success = false;
    let lastError: Error | null = null;

    while (retries < maxRetries && !success) {
      try {
        const result = await uploadFile(file, options);
        results.push(result);
        success = true;
      } catch (error) {
        lastError = error as Error;
        retries++;

        if (retries < maxRetries) {
          console.warn(
            `文件 ${file.name} 上传失败，正在重试 (${retries}/${maxRetries})...`
          );
          // 等待一段时间后重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    if (!success && lastError) {
      console.error(`文件 ${file.name} 上传失败:`, lastError);
      throw lastError;
    }
  }

  return results;
}
