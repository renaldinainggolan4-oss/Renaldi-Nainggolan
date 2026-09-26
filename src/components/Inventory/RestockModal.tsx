import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, PackagePlus, AlertCircle } from 'lucide-react';
import { Product, User } from '../../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentUser: User;
  onConfirmRestock: (
    productId: string,
    quantityChange: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string
  ) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  product,
  currentUser,
  onConfirmRestock,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('Restock kiriman dari distributor');

  if (!isOpen || !product) return null;

  const currentStock = product.stock;
  const newCalculatedStock =
    adjustmentType === 'in'
      ? currentStock + quantity
      : adjustmentType === 'out'
      ? Math.max(0, currentStock - quantity)
      : quantity; // Direct opname override

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 && adjustmentType !== 'adjustment') {
      alert('Jumlah perubahan stok harus lebih besar dari 0!');
      return;
    }
    const finalChange =
      adjustmentType === 'in'
        ? quantity
        : adjustmentType === 'out'
        ? -quantity
        : quantity - currentStock;

    onConfirmRestock(product.id, finalChange, adjustmentType, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Penyesuaian Stok / Restock
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Target Product Summary */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {product.name}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>SKU: {product.sku}</span>
              <span>
                Stok Saat Ini:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {product.stock} {product.unit}
                </strong>
              </span>
            </div>
          </div>

          {/* Adjustment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Jenis Aktivitas Inventaris:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('in');
                  setReason('Restock kiriman dari distributor');
                }}
                className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  adjustmentType === 'in'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                <span>Stok Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('out');
                  setReason('Barang rusak / bocor / kadaluwarsa');
                }}
                className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  adjustmentType === 'out'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                <span>Stok Keluar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('adjustment');
                  setReason('Hasil stock opname fisik toko');
                }}
                className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  adjustmentType === 'adjustment'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Opname Fisik</span>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {adjustmentType === 'adjustment'
                ? 'Hasil Hitungan Fisik Akhir (Stok Baru):'
                : `Jumlah ${adjustmentType === 'in' ? 'Tambahan Restock' : 'Pengurangan'} (${product.unit}):`}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-base text-slate-900 dark:text-white"
            />
          </div>

          {/* Preview of resulting stock */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Proyeksi Stok Baru Toko:
            </span>
            <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
              {newCalculatedStock} {product.unit}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alasan / Keterangan Penyesuaian:
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
            >
              Terapkan Penyesuaian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
