import { useState } from 'react';

interface CancelModalProps {
  deskName: string;
  date: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function CancelModal({ deskName, date, onConfirm, onClose }: CancelModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-slate-800 mb-1">Cancel reservation</h2>
        <p className="text-sm text-slate-500 mb-6">
          Cancel your booking for <span className="font-medium text-slate-700">{deskName}</span> on{' '}
          <span className="font-medium text-slate-700">{date}</span>?
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cancelling…' : 'Cancel reservation'}
          </button>
        </div>
      </div>
    </div>
  );
}
