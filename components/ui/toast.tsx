'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

type ToastProps = {
  message: string;
  variant: 'success' | 'error';
  onDismiss: () => void;
};

export function Toast({ message, variant, onDismiss }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, variant === 'error' ? 4000 : 3000);
    return () => clearTimeout(id);
  }, [onDismiss, variant]);

  const ok = variant === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-[84px] left-1/2 z-50 -translate-x-1/2"
    >
      <div
        className="flex items-center gap-2.5 rounded-2xl px-4 py-3 backdrop-blur-md"
        style={{
          background: ok ? 'rgba(6,12,0,0.93)' : 'rgba(18,4,4,0.93)',
          border: `1px solid ${ok ? 'rgba(170,255,0,0.22)' : 'rgba(239,68,68,0.22)'}`,
          boxShadow: ok
            ? '0 0 20px rgba(170,255,0,0.08), 0 8px 32px rgba(0,0,0,0.5)'
            : '0 0 20px rgba(239,68,68,0.08), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {ok ? (
          <CheckCircle2 size={15} color="#aaff00" />
        ) : (
          <XCircle size={15} color="#ef4444" />
        )}
        <span
          className="whitespace-nowrap text-[13px] font-semibold"
          style={{ color: ok ? '#aaff00' : '#f87171' }}
        >
          {message}
        </span>
      </div>
    </motion.div>
  );
}
