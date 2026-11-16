import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import { authApi } from '../api/authApi';
import { userApi } from '@/features/account/api/userApi';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { activityTracker } from '@/shared/lib/activityTracker';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // 1. Authenticate with backend
      const tokenResponse = await authApi.login({
        userName: data.userName,
        password: data.password,
      });

      setTokens(tokenResponse.jwtToken, tokenResponse.refreshToken);

      // 2. Fetch full profile details including roles
      try {
        const userProfile = await userApi.getUserByUserName(data.userName);
        setUser(userProfile);
      } catch {
        // Fallback profile if endpoint is pending
        setUser({
          id: 1,
          name: data.userName,
          userName: data.userName,
          email: '',
          roles: ['USER'],
          status: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Telemetry: Log LOGIN event
      activityTracker.login();

      toast.success('Welcome back', {
        description: `Signed in successfully as ${data.userName}`,
      });

      // 3. Return to previous intended destination or home
      const destination = returnTo ? decodeURIComponent(returnTo) : '/';
      navigate(destination, { replace: true });
    } catch {
      // Error handled by centralized Axios handler
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-lg bg-gold/15 border border-gold/40 items-center justify-center text-gold mb-2">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Sign In to Grahak<span className="text-gold">Sense</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted">
            Beyond Data, Toward Decisions
          </p>
        </div>

        <Card className="border-border/80 shadow-gold-glow">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-medium">Access Workspace</CardTitle>
            <CardDescription className="text-xs text-muted">
              Enter your credentials to manage your orders, catalog, or platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Input
                  id="userName"
                  label="Username"
                  placeholder="e.g. aditya_merchant"
                  autoComplete="username"
                  error={errors.userName?.message}
                  {...register('userName')}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium uppercase tracking-wider text-muted"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-gold hover:underline transition-all"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 gap-2"
                isLoading={isLoading}
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted border-t border-border/60 pt-4">
              Don't have an account?{' '}
              <Link
                to={returnTo ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : '/signup'}
                className="font-medium text-gold hover:underline"
              >
                Create one now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
