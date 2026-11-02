import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none animate-bounceIn">
      <div
        className={`px-5 py-3 rounded-full shadow-lg font-head text-sm text-white flex items-center gap-2.5 backdrop-blur-xs transition-all ${
          isError ? 'bg-[#B56576]' : 'bg-[#4A5338]'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-4 h-4 shrink-0 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 shrink-0 text-[#DDA15E]" />
        )}
        <span className="tracking-wide font-medium">{toast.text}</span>
      </div>
    </div>
  );
};
