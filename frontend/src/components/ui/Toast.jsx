import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = type === 'error';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${isError ? 'bg-red-600' : 'bg-emerald-600'}`}>
      {isError ? <XCircle size={18} /> : <CheckCircle size={18} />}
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X size={16} /></button>
    </div>
  );
}
