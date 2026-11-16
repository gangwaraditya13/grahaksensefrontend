import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { signupSchema, SignupFormData } from '../schemas/authSchemas';
import { authApi } from '../api/authApi';
import { userApi } from '@/features/account/api/userApi';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { activityTracker } from '@/shared/lib/activityTracker';

export const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      userName: '',
      email: '',
      password: '',
      phone: '',
      fullAddress: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // 1. Create User via /Auth/signup
      await authApi.signup({
        name: data.name,
        userName: data.userName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        fullAddress: data.fullAddress || undefined,
      });

      // Telemetry: Log SIGN_UP event
      activityTracker.signUp();

      toast.success('Account created successfully', {
        description: 'Logging you in automatically...',
      });

      // 2. Automatically log in to obtain JWT tokens
      try {
        const tokenResponse = await authApi.login({
          userName: data.userName,
          password: data.password,
        });

        setTokens(tokenResponse.jwtToken, tokenResponse.refreshToken);

        const profile = await userApi.getUserByUserName(data.userName);
        setUser(profile);

        const destination = returnTo ? decodeURIComponent(returnTo) : '/';
        navigate(destination, { replace: true });
      } catch {
        // If auto-login fails, redirect to /login
        navigate('/login', { replace: true });
      }
    } catch {
      // Error handled by centralized Axios handler
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-lg bg-gold/15 border border-gold/40 items-center justify-center text-gold mb-2">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Create an Account
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted">
            Join GrahakSense E-Commerce
          </p>
        </div>

        <Card className="border-border/80 shadow-gold-glow">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-medium">Customer Registration</CardTitle>
            <CardDescription className="text-xs text-muted">
              Enter your profile details to unlock seamless shopping and merchant access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="e.g. Aditya Kumar"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  id="userName"
                  label="Username"
                  placeholder="e.g. aditya13"
                  error={errors.userName?.message}
                  {...register('userName')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Minimum 6 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="phone"
                  label="Phone (Optional)"
                  placeholder="+91 9876543210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  id="fullAddress"
                  label="Delivery Address (Optional)"
                  placeholder="Street, City, PIN"
                  error={errors.fullAddress?.message}
                  {...register('fullAddress')}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 gap-2"
                isLoading={isLoading}
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted border-t border-border/60 pt-4">
              Already have an account?{' '}
              <Link
                to={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'}
                className="font-medium text-gold hover:underline"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
