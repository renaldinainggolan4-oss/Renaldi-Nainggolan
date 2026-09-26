import React from 'react';
import { Smartphone, Tablet, Monitor, X, Copy, Check, QrCode } from 'lucide-react';

interface MultiDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiDeviceModal: React.FC<MultiDeviceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://bumn-pos.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Akses Multi-Perangkat Staf Toko
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan tablet kasir atau HP staf untuk scan barcode keliling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-center text-xs sm:text-sm">
          {/* Simulated QR Code for URL */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm">
            <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
              <div className="absolute inset-2 grid grid-cols-5 grid-rows-5 gap-1.5 opacity-80">
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xs ${
                      idx % 2 === 0 || idx % 3 === 0 ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="relative z-10 bg-indigo-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                SCAN URL TOKO
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">
              Arahkan kamera HP kasir / tablet ke kode QR ini
            </p>
          </div>

          {/* URL Box */}
          <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Features per device */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-left">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px]">
              <Monitor className="w-4 h-4 text-blue-500 mb-1" />
              <div className="font-bold text-slate-800 dark:text-slate-200">PC / Laptop</div>
              <div className="text-slate-400 text-[10px]">Layar kasir utama & cetak struk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px]">
              <Tablet className="w-4 h-4 text-emerald-500 mb-1" />
              <div className="font-bold text-slate-800 dark:text-slate-200">Tablet Kasir</div>
              <div className="text-slate-400 text-[10px]">POS sentuh & QRIS dinamis</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px]">
              <Smartphone className="w-4 h-4 text-amber-500 mb-1" />
              <div className="font-bold text-slate-800 dark:text-slate-200">HP Staf Toko</div>
              <div className="text-slate-400 text-[10px]">Scan barcode rak & cek stok</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
