import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/authSchemas';
import { authApi } from '../api/authApi';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { LockKeyhole, ArrowRight, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      userName: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        userName: data.userName,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      toast.success('Password updated successfully', {
        description: 'You can now sign in with your new password.',
      });

      navigate('/login');
    } catch {
      // Handled by centralized error handler
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-lg bg-gold/15 border border-gold/40 items-center justify-center text-gold mb-2">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Enter New Password
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted">
            Validate OTP & Set Credentials
          </p>
        </div>

        <Card className="border-border/80 shadow-gold-glow">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-medium">Reset Credentials</CardTitle>
            <CardDescription className="text-xs text-muted">
              Enter your username, the OTP code received via email, and your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="userName"
                label="Username"
                placeholder="e.g. aditya13"
                error={errors.userName?.message}
                {...register('userName')}
              />

              <Input
                id="otp"
                label="OTP Verification Code"
                placeholder="Enter 4-6 digit code"
                error={errors.otp?.message}
                {...register('otp')}
              />

              <Input
                id="newPassword"
                type="password"
                label="New Password"
                placeholder="Minimum 6 characters"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Re-enter new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 gap-2"
                isLoading={isLoading}
              >
                <span>Save New Password</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-muted border-t border-border/60 pt-4">
              <Link
                to="/forgot-password"
                className="flex items-center gap-1.5 font-medium text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Resend OTP</span>
              </Link>
              <Link to="/login" className="font-medium text-gold hover:underline">
                Sign In Instead
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
