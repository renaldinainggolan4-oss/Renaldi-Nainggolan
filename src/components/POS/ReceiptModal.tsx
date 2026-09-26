import React from 'react';
import { Printer, Download, CheckCircle, X, ShoppingBag } from 'lucide-react';
import { StoreSettings, Transaction } from '../../types';
import { formatDateIndo, formatRupiah } from '../../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  settings,
  isOpen,
  onClose,
  onNewTransaction,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'qris': return 'QRIS Dinamis (Verified)';
      case 'cash': return 'Tunai / Cash';
      case 'gopay': return 'GoPay';
      case 'ovo': return 'OVO';
      case 'dana': return 'DANA';
      case 'shopeepay': return 'ShopeePay';
      case 'debit': return 'Kartu Debit EDC';
      case 'transfer': return 'Transfer Bank';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="no-print p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-base">Transaksi Berhasil</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex justify-center">
          {/* Authentic Thermal Receipt Paper */}
          <div className="print-receipt-container w-full max-w-[340px] bg-white text-slate-900 p-5 rounded-lg shadow-sm border border-slate-200 font-mono text-xs leading-relaxed">
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-extrabold tracking-tight uppercase">
                {settings.storeName}
              </h2>
              <p className="text-[11px] font-semibold text-slate-700">
                {settings.storeTagline}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {settings.address}
              </p>
              <p className="text-[10px] text-slate-500">
                Telp: {settings.phone}
              </p>
            </div>

            {/* Transaction Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Faktur:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateIndo(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span className="font-semibold">{transaction.customerName}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-semibold text-slate-900">
                    {item.productName}
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.sellingPrice)}
                      {item.discountPercent > 0 && ` (Disc ${item.discountPercent}%)`}
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Totals */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon Toko</span>
                  <span>-{formatRupiah(transaction.discountTotal)}</span>
                </div>
              )}

              {transaction.tax > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>PPN ({settings.taxRatePercent}%)</span>
                  <span>{formatRupiah(transaction.tax)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-1 border-t border-slate-200">
                <span>TOTAL AKHIR</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>

              <div className="flex justify-between pt-1 text-[11px]">
                <span className="text-slate-500">Pembayaran</span>
                <span className="font-bold">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Dibayar</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>

              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembalian</span>
                <span>{formatRupiah(transaction.change)}</span>
              </div>
            </div>

            {/* QR Verification & Footer */}
            <div className="pt-3 text-center text-[10px] text-slate-500 space-y-2">
              <div className="inline-block p-1.5 bg-slate-100 rounded border border-slate-200">
                {/* Simulated receipt QR */}
                <div className="w-16 h-16 bg-slate-900 mx-auto flex items-center justify-center text-white text-[8px] font-mono p-1">
                  BUMN-QR
                </div>
              </div>
              <p className="whitespace-pre-line leading-tight">
                {settings.receiptFooter}
              </p>
              <p className="text-[9px] text-slate-400">
                Simpan struk ini sebagai bukti pembayaran yang sah.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk (Print/PDF)</span>
          </button>
          
          <button
            onClick={() => {
              onClose();
              onNewTransaction();
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
