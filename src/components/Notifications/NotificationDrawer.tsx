import React from 'react';
import { Bell, X, CheckCheck, AlertTriangle, AlertCircle, Trash2, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { AppNotification } from '../../types';
import { formatDateIndo } from '../../utils/formatters';
import { soundService } from '../../services/soundEffects';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onOpenWhatsAppStockModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onOpenWhatsAppStockModal,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Notifikasi Otomatis BUMN
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} peringatan belum dibaca`
                    : 'Semua peringatan telah dibaca'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleSound}
                title={soundEnabled ? 'Matikan Suara Beep/Alarm' : 'Nyalakan Suara Beep/Alarm'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-850 flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800">
            {unreadCount > 0 ? (
              <button
                onClick={onMarkAllAsRead}
                className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            ) : (
              <span className="text-slate-400">Status: Mutakhir</span>
            )}

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-rose-500 font-medium flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
                <Bell className="w-12 h-12 mb-2 stroke-1 opacity-40 text-amber-500" />
                <p className="text-sm font-semibold">Tidak ada pemberitahuan</p>
                <p className="text-xs text-slate-500 max-w-xs mt-0.5">
                  Sistem otomatis memunculkan notifikasi push jika stok barang mencapai batas minimum.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isAlert = notif.type === 'alert';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs ${
                      !notif.read
                        ? isAlert
                          ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                          : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isAlert
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {isAlert ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          )}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                          <span>{formatDateIndo(notif.timestamp)}</span>

                          <button
                            onClick={() => {
                              onClose();
                              onOpenWhatsAppStockModal();
                            }}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Kirim ke WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenWhatsAppStockModal();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Broadcast WA Stok Kritis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
