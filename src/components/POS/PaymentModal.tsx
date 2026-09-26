import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Banknote,
  Smartphone,
  CreditCard,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CartItem, PaymentMethod, StoreSettings } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { soundService } from '../../services/soundEffects';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  settings: StoreSettings;
  onCompletePayment: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discountTotal,
  tax,
  total,
  settings,
  onCompletePayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [cashGiven, setCashGiven] = useState<number>(total);
  const [customCashInput, setCustomCashInput] = useState<string>(String(total));
  const [qrisTimer, setQrisTimer] = useState<number>(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ewalletPhone, setEwalletPhone] = useState<string>('081298765432');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');

  useEffect(() => {
    if (isOpen) {
      setCashGiven(total);
      setCustomCashInput(String(total));
      setQrisTimer(300);
      setIsProcessing(false);
    }
  }, [isOpen, total]);

  // QRIS Countdown timer
  useEffect(() => {
    if (!isOpen || method !== 'qris') return;
    const interval = setInterval(() => {
      setQrisTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, method]);

  if (!isOpen) return null;

  const change = Math.max(0, cashGiven - total);
  const isCashInsufficient = method === 'cash' && cashGiven < total;

  const handleCashInputChange = (val: string) => {
    const numeric = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    setCustomCashInput(val);
    setCashGiven(numeric);
  };

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
    setCustomCashInput(String(amount));
  };

  const handleAddCash = (amount: number) => {
    const newAmount = cashGiven + amount;
    setCashGiven(newAmount);
    setCustomCashInput(String(newAmount));
  };

  const handleConfirm = () => {
    if (isCashInsufficient) return;
    setIsProcessing(true);

    setTimeout(() => {
      soundService.playSuccess();
      const paid = method === 'cash' ? cashGiven : total;
      const returnedChange = method === 'cash' ? change : 0;
      onCompletePayment(method, paid, returnedChange);
      setIsProcessing(false);
    }, 600);
  };

  const minutes = Math.floor(qrisTimer / 60);
  const seconds = qrisTimer % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Penyelesaian Pembayaran Kasir
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih metode pembayaran terintegrasi untuk {cartItems.length} barang
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Total Ringkasan Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-4 sm:p-5 text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950/80">
                Total Tagihan Belanja
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {formatRupiah(total)}
              </div>
            </div>
            <div className="mt-2 sm:mt-0 text-xs font-medium text-amber-950/90 text-left sm:text-right">
              <div>Subtotal: {formatRupiah(subtotal)}</div>
              {discountTotal > 0 && <div>Diskon: -{formatRupiah(discountTotal)}</div>}
              {tax > 0 && <div>PPN ({settings.taxRatePercent}%): {formatRupiah(tax)}</div>}
            </div>
          </div>

          {/* Payment Method Selector Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setMethod('qris')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                  method === 'qris'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-6 h-6 mb-1 text-red-500" />
                <span>QRIS Dinamis</span>
                <span className="text-[10px] text-slate-400 font-normal">Instant Realtime</span>
              </button>

              <button
                onClick={() => setMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                  method === 'cash'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-6 h-6 mb-1 text-emerald-500" />
                <span>Uang Tunai</span>
                <span className="text-[10px] text-slate-400 font-normal">Kalkulator Kembalian</span>
              </button>

              <button
                onClick={() => setMethod('gopay')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                  ['gopay', 'ovo', 'dana', 'shopeepay'].includes(method)
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-1 text-blue-500" />
                <span>E-Wallet</span>
                <span className="text-[10px] text-slate-400 font-normal">GoPay, DANA, OVO</span>
              </button>

              <button
                onClick={() => setMethod('debit')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                  method === 'debit'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-1 text-purple-500" />
                <span>Kartu / Debit</span>
                <span className="text-[10px] text-slate-400 font-normal">Mesin EDC Bank</span>
              </button>
            </div>
          </div>

          {/* Method 1: QRIS Dinamis Content */}
          {method === 'qris' && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center animate-in fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600 text-white tracking-wider">
                  QRIS
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Pembayaran Standar Nasional
                </span>
              </div>

              {/* Dynamic QR Display */}
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200 my-2">
                <div className="w-48 h-48 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden">
                  {/* Stylized QR Code Pattern */}
                  <div className="absolute inset-2 grid grid-cols-6 grid-rows-6 gap-1 opacity-90">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 5 === 0) && i !== 14 && i !== 21
                            ? 'bg-white'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Corner Targets */}
                  <div className="absolute top-2 left-2 w-9 h-9 border-4 border-white bg-slate-900 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white"></div>
                  </div>
                  <div className="absolute top-2 right-2 w-9 h-9 border-4 border-white bg-slate-900 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white"></div>
                  </div>
                  <div className="absolute bottom-2 left-2 w-9 h-9 border-4 border-white bg-slate-900 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white"></div>
                  </div>

                  {/* Center Badge */}
                  <div className="relative z-10 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                    BUMN PAY
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  NMID: ID102026BUMN8899
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                <Clock className="w-4 h-4 animate-spin text-amber-500" />
                <span>Batas Waktu: {timerDisplay}</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Pelanggan dapat scan menggunakan aplikasi BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA, atau Livin&apos;.
              </p>

              <button
                onClick={handleConfirm}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulasi: Pembayaran QRIS Terdeteksi</span>
              </button>
            </div>
          )}

          {/* Method 2: Uang Tunai / Cash Content */}
          {method === 'cash' && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Uang Diterima dari Pelanggan:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={customCashInput}
                    onChange={(e) => handleCashInputChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Tombol Cepat Uang Pas & Pecahan:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickCash(total)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-xs hover:bg-amber-600"
                  >
                    Uang Pas ({formatRupiah(total)})
                  </button>
                  <button
                    onClick={() => handleQuickCash(50000)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Rp 50.000
                  </button>
                  <button
                    onClick={() => handleQuickCash(100000)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Rp 100.000
                  </button>
                  <button
                    onClick={() => handleQuickCash(200000)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Rp 200.000
                  </button>
                  <button
                    onClick={() => handleAddCash(10000)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
                  >
                    + Rp 10.000
                  </button>
                  <button
                    onClick={() => handleAddCash(50000)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
                  >
                    + Rp 50.000
                  </button>
                </div>
              </div>

              {/* Kembalian Display Box */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider block">
                    {isCashInsufficient ? 'Uang Masih Kurang' : 'Kembalian Pelanggan'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black">
                    {isCashInsufficient
                      ? `Kurang ${formatRupiah(total - cashGiven)}`
                      : formatRupiah(change)}
                  </div>
                </div>
                {!isCashInsufficient && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Method 3: E-Wallet Content */}
          {['gopay', 'ovo', 'dana', 'shopeepay'].includes(method) && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Layanan E-Wallet:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'gopay', name: 'GoPay', color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' },
                    { id: 'ovo', name: 'OVO', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30' },
                    { id: 'dana', name: 'DANA', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30' },
                    { id: 'shopeepay', name: 'ShopeePay', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setMethod(w.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        method === w.id
                          ? `${w.color} ring-2 ring-amber-500`
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor HP Akun Terdaftar:
                </label>
                <input
                  type="text"
                  value={ewalletPhone}
                  onChange={(e) => setEwalletPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Permintaan push notifikasi pembayaran akan dikirimkan ke aplikasi pelanggan.</span>
              </div>
            </div>
          )}

          {/* Method 4: Kartu Debit / EDC */}
          {method === 'debit' && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Mesin EDC / Bank Kartu:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border font-bold text-xs text-center transition-all ${
                        selectedBank === bank
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      EDC {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Terminal EDC:</span>
                  <span>POS-BUMN-{selectedBank}-01</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Biaya Transaksi (MDR):</span>
                  <span className="text-emerald-600 font-bold">0% (Gratis Promo)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>

          <button
            disabled={isCashInsufficient || isProcessing}
            onClick={handleConfirm}
            className={`flex-1 max-w-sm py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isCashInsufficient || isProcessing
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {isProcessing ? (
              <span>Memproses Transaksi...</span>
            ) : (
              <>
                <span>Selesaikan Transaksi & Struk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
