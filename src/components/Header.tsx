import React, { useState } from 'react';
import {
  Bell,
  CloudCheck,
  Moon,
  Sun,
  Smartphone,
  MessageCircle,
  LogOut,
  Shield,
  User as UserIcon,
  Store,
  ChevronDown
} from 'lucide-react';
import { AppNotification, StoreSettings, User } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface HeaderProps {
  settings: StoreSettings;
  currentUser: User;
  users: User[];
  notifications: AppNotification[];
  theme: 'dark' | 'light';
  lastCloudSync: string;
  onToggleTheme: () => void;
  onSelectUser: (user: User) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenWhatsAppStockModal: () => void;
  onOpenMultiDeviceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentUser,
  users,
  notifications,
  theme,
  lastCloudSync,
  onToggleTheme,
  onSelectUser,
  onOpenNotifications,
  onOpenSettings,
  onOpenWhatsAppStockModal,
  onOpenMultiDeviceModal,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Pemilik / Super Admin';
      case 'manager':
        return 'Manajer Toko';
      case 'cashier':
        return 'Kasir Toko';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'manager':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cashier':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-extrabold text-xl tracking-wider">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  {settings.storeName}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  POS & Inventaris
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-xs">
                {settings.storeTagline}
              </p>
            </div>
          </div>

          {/* Action Center & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cloud Sync Status Indicator */}
            <div 
              onClick={onOpenSettings}
              title={`Tersinkronisasi ke Cloud Server: ${formatDateIndo(lastCloudSync)}`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CloudCheck className="w-3.5 h-3.5" />
              <span>Cloud Sync: Terhubung</span>
            </div>

            {/* Multi-Device QR Code Access */}
            <button
              onClick={onOpenMultiDeviceModal}
              title="Akses Multi-Perangkat (Buka di HP/Tablet Kasir)"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span className="hidden lg:inline font-medium">Multi-Device</span>
            </button>

            {/* Quick WhatsApp Stock Notification Shortcut */}
            <button
              onClick={onOpenWhatsAppStockModal}
              title="Kirim Notifikasi Stok Menipis via WhatsApp"
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
              <span className="hidden sm:inline">Kirim WA Stok</span>
            </button>

            {/* Stock Alert Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Pemberitahuan Stok & Sistem"
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Active User / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-left"
              >
                <div className={`w-8 h-8 rounded-lg ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border inline-block ${getRoleBadgeColor(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* User switcher dropdown */}
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Masuk Sebagai
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                        {currentUser.name}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block mt-1 ${getRoleBadgeColor(currentUser.role)}`}>
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>

                    <div className="p-1">
                      <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                        Ganti Akun Staf / Role:
                      </p>
                      {users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md ${u.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1 truncate">
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                          </div>
                          {u.id === currentUser.id && (
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700/60 p-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenSettings();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Pengaturan & Hak Akses</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
