import React, { useEffect, useState } from 'react';
import { subscribeToColdStart } from '@/shared/api/client';
import { Loader2, Server } from 'lucide-react';

export const ColdStartBanner: React.FC = () => {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    return subscribeToColdStart((status) => {
      setIsWakingUp(status);
    });
  }, []);

  if (!isWakingUp) return null;

  return (
    <div className="bg-gold/10 border-b border-gold/30 px-4 py-2.5 text-xs text-foreground transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-gold animate-pulse shrink-0" />
          <span>
            <strong className="text-gold font-semibold">Backend Waking Up:</strong> Our server
            on Render is spinning up from idle state. This usually takes 15–30 seconds.
            Thank you for your patience!
          </span>
        </div>
        <Loader2 className="h-3.5 w-3.5 text-gold animate-spin shrink-0" />
      </div>
    </div>
  );
};
