import React, { useState } from 'react';
import {
  X,
  Store,
  Cloud,
  CloudCheck,
  Download,
  Upload,
  RefreshCw,
  Phone,
  MessageCircle,
  ShieldAlert,
  Percent,
  Receipt,
  FileJson,
  CheckCircle2,
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { formatDateIndo } from '../../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  lastCloudSync: string;
  onSaveSettings: (settings: StoreSettings) => void;
  onTriggerCloudSync: () => void;
  onExportDatabase: () => void;
  onImportDatabase: (jsonContent: string) => boolean;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  lastCloudSync,
  onSaveSettings,
  onTriggerCloudSync,
  onExportDatabase,
  onImportDatabase,
  onResetData,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerCloudSync();
      setIsSyncing(false);
      setSyncSuccessMessage(true);
      setTimeout(() => setSyncSuccessMessage(false), 3000);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportDatabase(content);
        if (success) {
          alert('Database BUMN berhasil dipulihkan dari file JSON!');
          window.location.reload();
        } else {
          alert('Gagal memulihkan database. Format file tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pengaturan Toko & Sinkronisasi Cloud
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola profil usaha, integrasi WhatsApp, dan keamanan data cloud
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Section 1: Cloud Sync Engine Status */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md">
                  <CloudCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Sinkronisasi Cloud BUMN-Central
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terhubung & Otomatis</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-500/15">
              <span>Terakhir Tersinkronisasi:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {formatDateIndo(lastCloudSync)}
              </span>
            </div>

            {syncSuccessMessage && (
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Data inventaris dan kasir berhasil diperbarui ke server cloud!</span>
              </div>
            )}
          </div>

          {/* Section 2: Store Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Identitas Toko BUMN
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Resmi Toko
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kepanjangan / Slogan Usaha
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeTagline}
                  onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Toko Fisik (Tercetak di Struk)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Section 3: WhatsApp Notifications Target Configuration */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              Konfigurasi Nomor Notifikasi WhatsApp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. WA Pemilik (Renaldi)
                </label>
                <input
                  type="text"
                  value={formData.ownerWaNumber}
                  onChange={(e) => setFormData({ ...formData, ownerWaNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. WA Manajer (Budi)
                </label>
                <input
                  type="text"
                  value={formData.managerWaNumber}
                  onChange={(e) => setFormData({ ...formData, managerWaNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. WA Supplier / Grosir
                </label>
                <input
                  type="text"
                  value={formData.supplierWaNumber}
                  onChange={(e) => setFormData({ ...formData, supplierWaNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Receipt Footer Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pesan Catatan Kaki Struk Kasir
            </label>
            <textarea
              rows={2}
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Section 5: Data Backup, Restore, and Reset */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5 text-indigo-500" />
              Cadangan & Pemulihan Database (Backup / Restore)
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExportDatabase}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Pulihkan Database (Upload JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mengatur ulang data ke setelan demo awal?')) {
                    onResetData();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Reset ke Data Demo Awal</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
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
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
