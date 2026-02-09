import { useState, useCallback, useEffect } from 'react';

let showToastFn: ((message: string) => void) | null = null;

export function toast(message: string) {
  showToastFn?.(message);
}

export function ToastProvider() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(30, 30, 30, 0.9)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 500,
      zIndex: 9999,
      animation: 'toastFadeIn 0.2s ease',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}
