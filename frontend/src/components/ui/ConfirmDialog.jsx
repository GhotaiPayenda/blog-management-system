export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
}
