import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '../api/sellerApi';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useImageUpload } from '../hooks/useImageUpload';
import { extractS3Key } from '@/shared/lib/s3Utils';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import {
  UploadCloud,
  X,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const productSchema = z.object({
  productName: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .trim(),
  productDescription: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .trim(),
  price: z
    .number({ invalid_type_error: 'Price must be a valid number' })
    .positive('Price must be greater than 0'),
  discount: z
    .number({ invalid_type_error: 'Discount must be a number' })
    .min(0, 'Discount cannot be negative')
    .max(99, 'Discount cannot exceed 99%')
    .default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

export const SellerProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const productId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch seller profile to get sellerId
  const { data: sellerProfile } = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: () => (user?.id ? sellerApi.getSellerProfile(user.id) : null),
    enabled: Boolean(user?.id),
  });

  const sellerId = sellerProfile?.id || user?.id || 1;

  // If editing, fetch current product details
  const { data: existingProduct, isLoading: isFetchingProduct } = useQuery({
    queryKey: ['product-detail-edit', productId],
    queryFn: () => catalogApi.getProductById(productId),
    enabled: isEditing && !isNaN(productId),
  });

  // Image upload manager
  const {
    images,
    addFiles,
    retryUpload,
    removeImage,
    uploadPendingImages,
    isProcessingQueue,
  } = useImageUpload(existingProduct?.imageUrls || []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      price: 0,
      discount: 0,
    },
  });

  // Populate form if editing
  useEffect(() => {
    if (existingProduct) {
      reset({
        productName: existingProduct.productName,
        productDescription: existingProduct.productDescription,
        price: existingProduct.price,
        discount: existingProduct.discount,
      });
    }
  }, [existingProduct, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Upload any pending new files directly to S3 via pre-signed URL
      let imageKeys: string[] = [];
      try {
        const uploadResult = await uploadPendingImages();
        imageKeys = uploadResult.imageKeys;
      } catch (uploadError: any) {
        toast.error('Image Upload Incomplete', {
          description:
            uploadError?.message ||
            'Could not upload new image to S3 storage. You can save product details without this image, or retry.',
          action: {
            label: 'Save Without New Images',
            onClick: () => {
              // Remove pending files and proceed
              images.filter((i) => i.file).forEach((i) => removeImage(i.id));
              // Small timeout to allow state to settle
              setTimeout(() => {
                onSubmit(data);
              }, 50);
            },
          },
        });
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        // Preserve existing product image keys if no new keys were uploaded
        const finalImageKeys =
          imageKeys.length > 0
            ? imageKeys
            : (existingProduct?.imageUrls || []).map((url) => extractS3Key(url));

        // Update product via PUT /product/update
        await sellerApi.updateProduct({
          id: productId,
          productName: data.productName,
          productDescription: data.productDescription,
          price: data.price,
          discount: data.discount,
          adminDiscount: existingProduct?.adminDiscount || 0,
          imageKeys: finalImageKeys,
        });

        toast.success('Product Updated', {
          description: `${data.productName} has been successfully updated.`,
        });
      } else {
        // Create product via POST /product/create
        await sellerApi.createProduct({
          sellerId,
          productName: data.productName,
          productDescription: data.productDescription,
          price: data.price,
          discount: data.discount,
          adminDiscount: 0,
          imageKeys,
        });

        toast.success('Product Created', {
          description: `${data.productName} has been published to the catalog.`,
        });
      }

      // Invalidate queries so products refresh
      queryClient.invalidateQueries({ queryKey: ['seller-products', sellerId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      navigate('/seller');
    } catch {
      // Handled by centralized error handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = ''; // Reset input to allow selecting same file again if desired
    }
  };

  if (isEditing && isFetchingProduct) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" />
        <p className="text-xs text-muted">Loading product specifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Seller Dashboard</span>
        </Link>
      </div>

      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          {isEditing ? 'Edit Product Listing' : 'Publish New Product'}
        </h1>
        <p className="text-xs text-muted mt-1">
          Provide accurate specifications, pricing in INR, and high-resolution asset images.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Details */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Product Information</CardTitle>
            <CardDescription className="text-xs">
              Basic identification and customer-facing title and description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="productName"
              label="Product Title"
              placeholder="e.g. Handcrafted Kashmiri Pashmina Shawl"
              error={errors.productName?.message}
              {...register('productName')}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="productDescription"
                className="block text-xs font-medium uppercase tracking-wider text-muted"
              >
                Detailed Description
              </label>
              <textarea
                id="productDescription"
                rows={4}
                placeholder="Describe materials, origin, dimensions, and craft details..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                {...register('productDescription')}
              />
              {errors.productDescription && (
                <p className="text-xs text-destructive">
                  {errors.productDescription.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Discounts */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Pricing & Discounts (INR)</CardTitle>
            <CardDescription className="text-xs">
              Set standard retail price and optional promotional seller discount.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="price"
                type="number"
                step="any"
                label="Base Price (₹ INR)"
                placeholder="e.g. 14999"
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />

              <Input
                id="discount"
                type="number"
                min="0"
                max="99"
                label="Seller Discount (%)"
                placeholder="e.g. 15 for 15% OFF"
                error={errors.discount?.message}
                {...register('discount', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Images (S3 Pre-signed direct upload) */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Product Photography</span>
              <span className="text-xs text-muted font-normal">
                {images.length} / 5 Images
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Upload up to 5 images (JPG, PNG, WEBP, maximum 2 MB each). Assets are uploaded
              directly to secure S3 storage and distributed via CloudFront CDN.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-md border border-border bg-surface-secondary overflow-hidden group"
                  >
                    <img
                      src={item.previewUrl}
                      alt="Product preview"
                      className="h-full w-full object-cover object-center"
                    />

                    {/* Progress / Status Overlay */}
                    {item.isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-1">
                        <Loader2 className="h-4 w-4 animate-spin text-gold" />
                        <span>{item.progress}%</span>
                      </div>
                    )}

                    {/* Error Overlay */}
                    {item.error && !item.isUploading && (
                      <div className="absolute inset-0 bg-destructive/90 flex flex-col items-center justify-center text-white text-xs gap-1 p-2 text-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-medium leading-tight">Upload failed</span>
                        <button
                          type="button"
                          onClick={() => retryUpload(item.id)}
                          className="mt-1 px-2 py-0.5 text-[10px] font-semibold bg-white text-destructive rounded hover:bg-white/90"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {item.s3Key && (
                      <div className="absolute top-1 left-1 bg-black/70 rounded-full p-0.5 text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Dropzone / Picker */}
            {images.length < 5 && (
              <label
                htmlFor="imagePicker"
                className="border-2 border-dashed border-border/80 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gold/60 hover:bg-gold/[0.02] transition-colors"
              >
                <UploadCloud className="h-8 w-8 text-gold mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Click to select images or drag and drop
                </p>
                <p className="text-[11px] text-muted mt-1">
                  JPG, PNG, or WEBP (up to 2 MB each, max 5 images total)
                </p>
                <input
                  id="imagePicker"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Link to="/seller">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="gold"
            isLoading={isSubmitting || isProcessingQueue}
            className="gap-2 shadow-gold-glow"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
