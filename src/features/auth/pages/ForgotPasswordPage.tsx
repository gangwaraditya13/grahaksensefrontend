import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/authSchemas';
import { authApi } from '../api/authApi';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      toast.success('Reset Code Sent', {
        description: 'Please check your email for the verification OTP.',
      });
      // Navigate to reset password page with email/username context
      navigate('/reset-password');
    } catch {
      // Error handled by centralized Axios handler
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-lg bg-gold/15 border border-gold/40 items-center justify-center text-gold mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted">
            Recover Account Access
          </p>
        </div>

        <Card className="border-border/80 shadow-gold-glow">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-medium">Verify Email</CardTitle>
            <CardDescription className="text-xs text-muted">
              Enter the email address registered with your account to receive a one-time reset code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Registered Email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 gap-2"
                isLoading={isLoading}
              >
                <span>Send OTP Code</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-muted border-t border-border/60 pt-4">
              <Link
                to="/login"
                className="flex items-center gap-1.5 font-medium text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
              <Link
                to="/reset-password"
                className="font-medium text-gold hover:underline"
              >
                Already have an OTP?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
