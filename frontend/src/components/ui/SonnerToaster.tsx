import React from 'react';
import { Toaster } from 'sonner';

export const SonnerToaster: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        className: 'glass text-slate-100 border-white/15 text-xs py-3 px-4 shadow-2xl',
        duration: 3500
      }}
    />
  );
};

export { toast } from 'sonner';
