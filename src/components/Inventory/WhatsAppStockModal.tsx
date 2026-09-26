import React, { useState } from 'react';
import { MessageCircle, X, Send, AlertTriangle, CheckSquare, Square, Phone, UserCheck } from 'lucide-react';
import { Product, StoreSettings } from '../../types';
import { buildWhatsAppStockMessage, sanitizeWaNumber } from '../../utils/formatters';

interface WhatsAppStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
  preselectedProduct?: Product | null;
}

export const WhatsAppStockModal: React.FC<WhatsAppStockModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  preselectedProduct,
}) => {
  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (preselectedProduct) return [preselectedProduct.id];
    return lowStockProducts.map((p) => p.id);
  });

  const [recipientType, setRecipientType] = useState<'owner' | 'manager' | 'supplier' | 'custom'>(
    'owner'
  );
  const [targetPhone, setTargetPhone] = useState<string>(settings.ownerWaNumber || '6281298765432');

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === lowStockProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(lowStockProducts.map((p) => p.id));
    }
  };

  const handleRecipientTypeChange = (type: 'owner' | 'manager' | 'supplier' | 'custom') => {
    setRecipientType(type);
    if (type === 'owner') setTargetPhone(settings.ownerWaNumber);
    else if (type === 'manager') setTargetPhone(settings.managerWaNumber);
    else if (type === 'supplier') setTargetPhone(settings.supplierWaNumber);
  };

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  // Build live preview URL and message
  const waUrl = buildWhatsAppStockMessage(settings.storeName, selectedProducts, targetPhone);

  const handleSendWA = () => {
    if (selectedProducts.length === 0) {
      alert('Pilih minimal satu barang untuk dikirim ke WhatsApp!');
      return;
    }
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-600 text-white">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 fill-white/20" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Kirim Peringatan Stok Menipis via WhatsApp
              </h2>
              <p className="text-xs text-emerald-100">
                Integrasi notifikasi instan langsung ke pemilik, manajer, atau distributor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Recipient Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Pilih Tujuan Penerima Notifikasi WhatsApp:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { id: 'owner', label: 'Pemilik Toko', sub: 'Renaldi' },
                { id: 'manager', label: 'Manajer Toko', sub: 'Budi S.' },
                { id: 'supplier', label: 'Distributor / Supplier', sub: 'Grosir' },
                { id: 'custom', label: 'Nomor Lain', sub: 'Kustom' },
              ].map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() =>
                    handleRecipientTypeChange(rec.id as 'owner' | 'manager' | 'supplier' | 'custom')
                  }
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                    recipientType === rec.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{rec.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{rec.sub}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="08123456789 atau 628123456789"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                Format: 628... (ID)
              </span>
            </div>
          </div>

          {/* List of Low Stock Products to Include */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Pilih Barang yang Dilaporkan ({selectedIds.length} dipilih):
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                {selectedIds.length === lowStockProducts.length ? (
                  <>
                    <Square className="w-3.5 h-3.5" /> Batal Pilih Semua
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Pilih Semua Kritis
                  </>
                )}
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-center">
                Semua stok barang berada di atas batas minimum. Inventaris aman!
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950">
                {lowStockProducts.map((prod) => {
                  const isChecked = selectedIds.includes(prod.id);
                  const isOut = prod.stock <= 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleSelect(prod.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? 'bg-white dark:bg-slate-800 border border-emerald-500/40 shadow-xs'
                          : 'opacity-60 hover:opacity-100 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 pointer-events-none"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Supplier: {prod.supplier || 'Pemasok Utama'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isOut
                              ? 'bg-rose-500/20 text-rose-500'
                              : 'bg-amber-500/20 text-amber-500'
                          }`}
                        >
                          Sisa: {prod.stock} / Min: {prod.minStock} {prod.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Message Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Pratinjau Pesan Resmi WhatsApp:
            </label>
            <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-800 shadow-inner">
              {`🚨 *PERINGATAN STOK MENIPIS - ${settings.storeName}*\n`}
              {`━━━━━━━━━━━━━━━━━━━━━\n`}
              {selectedProducts.map((p, idx) => (
                <div key={p.id}>
                  {`${idx + 1}. ${p.stock <= 0 ? '🔴' : '🟡'} *${p.name}* (Sisa: ${p.stock} ${p.unit} | Batas Min: ${p.minStock})\n`}
                </div>
              ))}
              {`━━━━━━━━━━━━━━━━━━━━━\n`}
              {`⚠️ Mohon segera lakukan restock atau purchase order ke supplier.\n_Notifikasi otomatis Sistem POS BUMN_`}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>

          <button
            disabled={selectedProducts.length === 0}
            onClick={handleSendWA}
            className={`flex-1 max-w-sm py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              selectedProducts.length === 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
