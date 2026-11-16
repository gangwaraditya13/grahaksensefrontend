import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { SearchX, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-muted">
          <SearchX className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Error 404 · Page Not Found
          </span>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Lost in Decisions
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            The page you are looking for does not exist or has been moved to a new destination.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/">
            <Button variant="primary" className="gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
