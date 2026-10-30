import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map(toast => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#27B9F2] shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#F04444] shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[#27B9F2] shrink-0" />
          );

        const borderColor =
          toast.type === 'error'
            ? 'border-[#F04444]/40'
            : toast.type === 'success'
            ? 'border-[#27B9F2]/40'
            : 'border-[#252A30]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-[#111316] border ${borderColor} rounded-[12px] shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#F5F7FA]">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-[#9299A3] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#9299A3] hover:text-[#F5F7FA] transition-colors p-1 rounded-md hover:bg-[#191B1F]"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
