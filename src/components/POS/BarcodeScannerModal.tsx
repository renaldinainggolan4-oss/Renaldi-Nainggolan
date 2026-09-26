import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Zap, CheckCircle2, ScanLine, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { soundService } from '../../services/soundEffects';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  products,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung pada browser ini.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Rear camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isMounted) {
          setStream(mediaStream);
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn('Camera access issue:', err);
          setHasCameraPermission(false);
          setCameraError(
            err instanceof Error
              ? err.message
              : 'Izin kamera ditolak atau tidak tersedia. Gunakan tombol simulasi scan cepat di bawah.'
          );
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBarcodeHit = (barcode: string, prodName?: string) => {
    soundService.playBeep();
    setScannedFeedback(prodName || barcode);
    setTimeout(() => {
      onScanSuccess(barcode);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-bold text-base">Pemindai Barcode Kamera</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[300px]">
          {hasCameraPermission ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center text-slate-400 flex flex-col items-center max-w-xs">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-slate-200">
                {cameraError || 'Menghubungkan ke sensor kamera...'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Anda juga dapat memilih simulasi barcode produk langsung di bawah untuk pengujian cepat.
              </p>
            </div>
          )}

          {/* Scanner target overlay frame */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-64 h-40 border-2 border-dashed border-amber-400/80 rounded-xl flex items-center justify-center bg-amber-400/5 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1"></div>

              {/* Animated laser line */}
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-bounce shadow-[0_0_8px_#ef4444]"></div>

              <div className="text-[11px] font-medium text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded shadow">
                Arahkan Barcode ke Sini
              </div>
            </div>
          </div>

          {/* Scanned success overlay */}
          {scannedFeedback && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 animate-in zoom-in-95">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
              <p className="text-emerald-200 font-bold text-base mt-2">Barcode Terdeteksi!</p>
              <p className="text-white text-sm font-semibold max-w-xs text-center truncate mt-0.5">
                {scannedFeedback}
              </p>
            </div>
          )}
        </div>

        {/* Quick Test Barcodes section (Crucial for instant testing without camera) */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Tes Scan Cepat Produk (Klik Langsung):
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {products.slice(0, 6).map((p) => (
              <button
                key={p.id}
                onClick={() => handleBarcodeHit(p.barcode, p.name)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="truncate mr-1">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {p.barcode}
                  </div>
                </div>
                <ScanLine className="w-4 h-4 text-slate-400 group-hover:text-amber-400 shrink-0" />
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Dukungan Barcode Scanner USB / Bluetooth fisik aktif otomatis.</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
