import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '../api/sellerApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { becomeSellerSchema, BecomeSellerFormData } from '@/features/auth/schemas/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Building2, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { activityTracker } from '@/shared/lib/activityTracker';

export const SellerProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Telemetry: Log VIEW_SELLER on mount
  useEffect(() => {
    activityTracker.viewSeller();
  }, []);
  const { data: sellerProfile, isLoading } = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: () => (user?.id ? sellerApi.getSellerProfile(user.id) : null),
    enabled: Boolean(user?.id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BecomeSellerFormData>({
    resolver: zodResolver(becomeSellerSchema),
    defaultValues: {
      companyName: '',
      businessAddress: '',
      businessPhone: '',
    },
  });

  useEffect(() => {
    if (sellerProfile) {
      reset({
        companyName: sellerProfile.companyName || '',
        businessAddress: sellerProfile.businessAddress || '',
        businessPhone: sellerProfile.businessPhone || '',
      });
    }
  }, [sellerProfile, reset]);

  const onSubmit = async (data: BecomeSellerFormData) => {
    setIsUpdating(true);
    try {
      const updated = await sellerApi.updateSellerProfile({
        companyName: data.companyName,
        businessAddress: data.businessAddress,
        businessPhone: data.businessPhone,
      });

      queryClient.setQueryData(['seller-profile', user?.id], updated);
      toast.success('Merchant Profile Updated', {
        description: 'Your business details have been saved.',
      });
    } catch {
      // Handled by centralized error handler
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" />
        <p className="text-xs text-muted">Retrieving merchant credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Merchant Business Profile
            </h1>
            <p className="text-xs text-muted">
              Corporate entity details registered with GrahakSense Marketplace.
            </p>
          </div>
        </div>

        <Badge variant={sellerProfile?.status ? 'success' : 'gold'}>
          {sellerProfile?.status ? 'Active Merchant' : 'Verification In Progress'}
        </Badge>
      </div>

      <Card className="border-border/80 shadow-gold-glow">
        <CardHeader>
          <CardTitle className="text-base">Registered Business Information</CardTitle>
          <CardDescription className="text-xs">
            These details appear on your invoice records and merchant storefront badge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="companyName"
              label="Company / Brand Name"
              placeholder="e.g. Royal Silks Pvt Ltd"
              error={errors.companyName?.message}
              {...register('companyName')}
            />

            <Input
              id="businessAddress"
              label="Registered Business Address"
              placeholder="Corporate headquarters or factory address"
              error={errors.businessAddress?.message}
              {...register('businessAddress')}
            />

            <Input
              id="businessPhone"
              label="Business Contact Phone"
              placeholder="+91 9876543210"
              error={errors.businessPhone?.message}
              {...register('businessPhone')}
            />

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="gold"
                isLoading={isUpdating}
                className="gap-2 shadow-gold-glow"
              >
                <Save className="h-4 w-4" />
                <span>Save Business Profile</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verification details */}
      <div className="p-4 rounded-lg border border-border bg-surface flex items-start gap-3 text-xs text-muted">
        <ShieldCheck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Verified Merchant Guarantee</p>
          <p className="leading-relaxed">
            Your products are flagged with the "Verified Luxury" badge across customer search
            and recommendations, ensuring priority placement and trust.
          </p>
        </div>
      </div>
    </div>
  );
};
