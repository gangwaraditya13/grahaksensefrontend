import { useState, useCallback, useEffect, useRef } from 'react';
import { sellerApi } from '../api/sellerApi';
import { uploadToS3 } from '@/shared/api/client';
import { extractS3Key } from '@/shared/lib/s3Utils';
import { toast } from 'sonner';

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_IMAGES_PER_PRODUCT = 5;
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

export function resolveMimeType(file: File): string {
  if (file.type && file.type !== 'image/jpg') {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export interface UploadedImageItem {
  id: string;
  file?: File;
  previewUrl: string;
  s3Key?: string;
  cloudfrontUrl?: string;
  isUploading: boolean;
  progress: number;
  error?: string;
}

export function useImageUpload(initialUrls: string[] = []) {
  // Initialize with any existing CloudFront image URLs (for editing products)
  const [images, setImages] = useState<UploadedImageItem[]>(() =>
    initialUrls.map((url, idx) => ({
      id: `existing-${idx}-${Date.now()}`,
      previewUrl: url,
      cloudfrontUrl: url,
      s3Key: extractS3Key(url),
      isUploading: false,
      progress: 100,
    }))
  );

  const activeUploadsRef = useRef<Map<string, Promise<{ key: string; url: string }>>>(
    new Map()
  );

  // Synchronize when initialUrls loads asynchronously (e.g. from existingProduct query)
  useEffect(() => {
    if (initialUrls && initialUrls.length > 0) {
      setImages((prev) => {
        if (prev.length > 0) return prev;
        return initialUrls.map((url, idx) => ({
          id: `existing-${idx}-${Date.now()}`,
          previewUrl: url,
          cloudfrontUrl: url,
          s3Key: extractS3Key(url),
          isUploading: false,
          progress: 100,
        }));
      });
    }
  }, [initialUrls]);

  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  /**
   * Execute direct S3 upload for a single item
   */
  const executeUpload = useCallback(
    async (item: UploadedImageItem): Promise<{ key: string; url: string }> => {
      const file = item.file;
      if (!file) throw new Error('Missing file binary');

      // Reuse in-flight upload promise if already active
      const existingPromise = activeUploadsRef.current.get(item.id);
      if (existingPromise) {
        return existingPromise;
      }

      const uploadPromise = (async () => {
        // Update state: uploading
        setImages((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, isUploading: true, progress: 15, error: undefined }
              : i
          )
        );

        try {
          const mimeType = resolveMimeType(file);

          // 1. Request pre-signed S3 URL from backend
          const presignedData = await sellerApi.getUploadUrl({
            contentType: mimeType,
            size: file.size,
          });

          // 2. Upload directly to S3 via PUT (without Authorization header)
          await uploadToS3(presignedData.uploadUrl, file, mimeType, (percent) => {
            setImages((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, progress: percent } : i))
            );
          });

          // Update state: complete with key and cloudfront URL
          setImages((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    isUploading: false,
                    progress: 100,
                    s3Key: presignedData.key,
                    cloudfrontUrl: presignedData.imageUrl,
                    error: undefined,
                  }
                : i
            )
          );

          return { key: presignedData.key, url: presignedData.imageUrl };
        } catch (uploadError: any) {
          setImages((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    isUploading: false,
                    progress: 0,
                    error: uploadError?.message || 'Upload to storage failed',
                  }
                : i
            )
          );
          throw uploadError;
        } finally {
          activeUploadsRef.current.delete(item.id);
        }
      })();

      activeUploadsRef.current.set(item.id, uploadPromise);
      return uploadPromise;
    },
    []
  );

  /**
   * Validate and queue new image files, auto-starting uploads immediately
   */
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (images.length + fileArray.length > MAX_IMAGES_PER_PRODUCT) {
        toast.error('Image Limit Exceeded', {
          description: `You can upload a maximum of ${MAX_IMAGES_PER_PRODUCT} images per product.`,
        });
        return;
      }

      const newItems: UploadedImageItem[] = [];

      for (const file of fileArray) {
        const mimeType = resolveMimeType(file);

        // 1. Format validation
        if (
          !ALLOWED_MIME_TYPES.includes(file.type) &&
          !ALLOWED_MIME_TYPES.includes(mimeType)
        ) {
          toast.error('Unsupported Format', {
            description: `${file.name} is not allowed. Only JPG, PNG, and WEBP are accepted.`,
          });
          continue;
        }

        // 2. Size validation (Max 2 MB)
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error('File Too Large', {
            description: `${file.name} exceeds the 2 MB maximum size limit.`,
          });
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const item: UploadedImageItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl,
          isUploading: true,
          progress: 10,
        };
        newItems.push(item);
      }

      if (newItems.length > 0) {
        setImages((prev) => [...prev, ...newItems]);

        // Auto-trigger upload immediately
        newItems.forEach((item) => {
          executeUpload(item).catch(() => {
            // Handled within executeUpload
          });
        });
      }
    },
    [images.length, executeUpload]
  );

  /**
   * Retry failed upload
   */
  const retryUpload = useCallback(
    (id: string) => {
      const target = images.find((i) => i.id === id);
      if (target && target.file) {
        executeUpload(target).catch(() => {});
      }
    },
    [images, executeUpload]
  );

  /**
   * Remove an image from the list
   */
  const removeImage = useCallback((id: string) => {
    activeUploadsRef.current.delete(id);
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  /**
   * Upload all pending images to S3 and return final keys
   */
  const uploadPendingImages = useCallback(async (): Promise<{
    imageKeys: string[];
    imageUrls: string[];
  }> => {
    setIsProcessingQueue(true);

    try {
      // Collect any active or pending uploads
      const pending = images.filter((img) => !img.s3Key && img.file);

      if (pending.length > 0) {
        await Promise.all(
          pending.map(async (item) => {
            return executeUpload(item);
          })
        );
      }

      // Collect all keys (existing + newly uploaded)
      const allFinalKeys: string[] = [];
      const allFinalUrls: string[] = [];

      // Read from latest state
      setImages((latest) => {
        latest.forEach((img) => {
          if (img.s3Key && !allFinalKeys.includes(img.s3Key)) {
            allFinalKeys.push(img.s3Key);
            allFinalUrls.push(img.cloudfrontUrl || img.previewUrl);
          }
        });
        return latest;
      });

      return { imageKeys: allFinalKeys, imageUrls: allFinalUrls };
    } finally {
      setIsProcessingQueue(false);
    }
  }, [images, executeUpload]);

  return {
    images,
    addFiles,
    retryUpload,
    removeImage,
    uploadPendingImages,
    isProcessingQueue,
    hasPendingUploads: images.some((i) => !i.s3Key && i.file),
  };
}
