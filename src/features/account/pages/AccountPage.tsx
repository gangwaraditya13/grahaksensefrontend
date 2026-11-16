import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  updateUserSchema,
  UpdateUserFormData,
  becomeSellerSchema,
  BecomeSellerFormData,
} from '@/features/auth/schemas/authSchemas';
import { userApi } from '../api/userApi';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/Card';
import {
  User,
  Store,
  Shield,
  Save,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { formatDate } from '@/shared/lib/utils';
import { activityTracker } from '@/shared/lib/activityTracker';

export const AccountPage: React.FC = () => {
  const { user, roles, setUser, clearAuth, hasRole } = useAuthStore();
  const navigate = useNavigate();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isApplyingSeller, setIsApplyingSeller] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile update form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    values: {
      name: user?.name || '',
      userName: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      fullAddress: user?.fullAddress || '',
    },
  });

  // Become a seller form
  const {
    register: registerSeller,
    handleSubmit: handleSubmitSeller,
    reset: resetSellerForm,
    formState: { errors: sellerErrors },
  } = useForm<BecomeSellerFormData>({
    resolver: zodResolver(becomeSellerSchema),
    defaultValues: {
      companyName: '',
      businessAddress: '',
      businessPhone: '',
    },
  });

  const onUpdateProfile = async (data: UpdateUserFormData) => {
    setIsUpdatingProfile(true);
    try {
      const updated = await userApi.updateUser({
        name: data.name,
        userName: data.userName,
        email: data.email,
        phone: data.phone || undefined,
        fullAddress: data.fullAddress || undefined,
      });

      setUser(updated);
      toast.success('Profile updated', {
        description: 'Your account details have been saved.',
      });
    } catch {
      // Handled by centralized error handler
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onBecomeSeller = async (data: BecomeSellerFormData) => {
    if (!user) return;
    setIsApplyingSeller(true);
    try {
      await authApi.registerSeller({
        userId: user.id,
        companyName: data.companyName,
        businessAddress: data.businessAddress,
        businessPhone: data.businessPhone,
      });

      // Update user roles locally
      const updatedRoles = Array.from(new Set([...roles, 'SELLER' as const]));
      setUser({
        ...user,
        roles: updatedRoles,
      });

      resetSellerForm();
      toast.success('Congratulations!', {
        description: 'You are now an authorized seller on GrahakSense. Seller Studio is active.',
      });
    } catch {
      // Handled by centralized error handler
    } finally {
      setIsApplyingSeller(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!deletePassword) {
      toast.error('Password Required', {
        description: 'Please enter your password to confirm account deletion.',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await userApi.deleteUser({
        userId: user.id,
        password: deletePassword,
      });

      clearAuth();
      toast.success('Account Deleted', {
        description: 'Your GrahakSense account has been successfully removed.',
      });
      navigate('/', { replace: true });
    } catch {
      // Handled by centralized error handler
    } finally {
      setIsDeleting(false);
    }
  };

  const isSeller = hasRole('SELLER');
  const isAdmin = hasRole('ADMIN');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profile Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center text-gold shadow-gold-glow">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {user?.name || user?.userName || 'Customer Account'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs text-muted">@{user?.userName}</span>
              <span className="text-muted/40">•</span>
              {roles.map((r) => (
                <Badge
                  key={r}
                  variant={r === 'ADMIN' ? 'gold' : r === 'SELLER' ? 'success' : 'secondary'}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {user?.createdAt && (
          <div className="flex items-center gap-2 text-xs text-muted bg-surface-secondary px-3 py-1.5 rounded-md border border-border">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            <span>Member since {formatDate(user.createdAt)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Information & Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription className="text-xs">
                Update your contact details and default delivery destination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="name"
                    label="Full Name"
                    error={profileErrors.name?.message}
                    {...registerProfile('name')}
                  />
                  <Input
                    id="userName"
                    label="Username"
                    error={profileErrors.userName?.message}
                    {...registerProfile('userName')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="email"
                    type="email"
                    label="Email Address"
                    error={profileErrors.email?.message}
                    {...registerProfile('email')}
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    placeholder="+91 ..."
                    error={profileErrors.phone?.message}
                    {...registerProfile('phone')}
                  />
                </div>

                <Input
                  id="fullAddress"
                  label="Shipping Address"
                  placeholder="Street, City, State, PIN"
                  error={profileErrors.fullAddress?.message}
                  {...registerProfile('fullAddress')}
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="gap-2"
                    isLoading={isUpdatingProfile}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Order History & Returns */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Recent Orders & Returns</span>
                <Badge variant="gold">Insured Purchases</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your recent purchases, track delivery status, and submit return requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-lg border border-border bg-surface-secondary flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">Order #GS-89241</p>
                  <p className="text-[11px] text-muted">Handcrafted Kashmiri Pashmina Shawl (Delivered)</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await activityTracker.refund(2);
                    toast.success('Return Initiated', {
                      description: 'Refund request submitted for Order #GS-89241.',
                    });
                  }}
                  className="text-xs gap-1.5 hover:text-destructive"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Request Refund</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone: Delete Account */}
          <Card className="border-red-500/20 bg-red-500/[0.02]">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Permanently delete your GrahakSense account and all associated order history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showDeleteModal ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </Button>
              ) : (
                <div className="space-y-4 p-4 rounded-md border border-red-500/30 bg-surface">
                  <p className="text-xs text-foreground font-medium">
                    Please confirm your password to permanently delete your account:
                  </p>
                  <Input
                    type="password"
                    placeholder="Enter account password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      isLoading={isDeleting}
                      onClick={handleDeleteAccount}
                    >
                      Confirm Permanent Deletion
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Roles & Seller Workspace Hub */}
        <div className="space-y-6">
          {/* Seller Status Card */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="h-4 w-4 text-gold" />
                  <span>Seller Studio</span>
                </CardTitle>
                <Badge variant={isSeller ? 'success' : 'outline'}>
                  {isSeller ? 'Active Merchant' : 'Not Enrolled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {isSeller ? (
                <div className="space-y-3">
                  <p className="text-muted leading-relaxed">
                    Your seller account is active. You have full access to create, publish,
                    and manage your luxury catalog items in Seller Studio.
                  </p>
                  <Link to="/seller">
                    <Button variant="primary" size="sm" className="w-full gap-2">
                      <span>Launch Seller Studio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted leading-relaxed">
                    Want to sell on GrahakSense? Apply now to onboard your business, upload
                    catalog images via S3, and reach high-intent customers.
                  </p>

                  <form onSubmit={handleSubmitSeller(onBecomeSeller)} className="space-y-3">
                    <Input
                      id="companyName"
                      label="Company / Brand"
                      placeholder="e.g. Royal Silks Pvt Ltd"
                      error={sellerErrors.companyName?.message}
                      {...registerSeller('companyName')}
                    />

                    <Input
                      id="businessAddress"
                      label="Business Address"
                      placeholder="Registered corporate address"
                      error={sellerErrors.businessAddress?.message}
                      {...registerSeller('businessAddress')}
                    />

                    <Input
                      id="businessPhone"
                      label="Business Contact"
                      placeholder="+91 ..."
                      error={sellerErrors.businessPhone?.message}
                      {...registerSeller('businessPhone')}
                    />

                    <Button
                      type="submit"
                      variant="gold"
                      size="sm"
                      className="w-full mt-2"
                      isLoading={isApplyingSeller}
                    >
                      Apply to Become a Seller
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Access Card (If Admin) */}
          {isAdmin && (
            <Card className="border-gold/30 bg-gold/[0.03]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-gold">
                  <Shield className="h-4 w-4" />
                  <span>Administrator Privilege</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted leading-relaxed">
                  You possess system administration privileges. You can oversee registered users,
                  moderate sellers, and inspect real-time Intelligence metrics.
                </p>
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-gold/40 text-gold hover:bg-gold/10">
                    <span>Open Admin Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
