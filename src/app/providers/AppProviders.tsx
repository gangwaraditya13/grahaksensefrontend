import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/api/queryClient';
import { useAuthInit } from '@/features/auth/hooks/useAuthInit';

interface AppProvidersProps {
  children: React.ReactNode;
}

function AuthSessionManager({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionManager>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            },
          }}
        />
      </AuthSessionManager>
    </QueryClientProvider>
  );
};
