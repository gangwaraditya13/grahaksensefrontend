import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { ShieldX, Home, LogIn } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

export const ForbiddenPage: React.FC = () => {
  const { isAuthenticated, roles } = useAuthStore();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldX className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Error 403 · Access Restricted
          </span>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Privilege Required
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            You do not have the required role or permissions to view this workspace.
            {isAuthenticated ? (
              <span className="block mt-2 text-xs">
                Your active role(s):{' '}
                <strong className="text-foreground">
                  {roles.length > 0 ? roles.join(', ') : 'None'}
                </strong>
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link to="/">
            <Button variant="primary" className="gap-2">
              <Home className="h-4 w-4" />
              <span>Return to Storefront</span>
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
