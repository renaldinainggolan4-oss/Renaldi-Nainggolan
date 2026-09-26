import React from 'react';
import {
  ShoppingCart,
  Package,
  BarChart3,
  FileSpreadsheet,
  Users,
  Settings,
  AlertTriangle,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../types';

export type NavigationTab = 'pos' | 'inventory' | 'analytics' | 'reports' | 'users' | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  userRole: UserRole;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  lowStockCount,
}) => {
  const isOwner = userRole === 'owner';
  const isManager = userRole === 'manager' || isOwner;

  const navItems = [
    {
      id: 'pos' as NavigationTab,
      label: 'Kasir / POS',
      icon: ShoppingCart,
      allowed: true,
      description: 'Sistem Kasir & Scan Barcode',
    },
    {
      id: 'inventory' as NavigationTab,
      label: 'Inventaris & Stok',
      icon: Package,
      allowed: true,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-rose-500 text-white',
      description: 'Katalog, Restock & Opname',
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Dasbor Analitik',
      icon: BarChart3,
      allowed: isManager,
      description: 'Tren Penjualan Harian & Bulanan',
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Laporan & Ekspor',
      icon: FileSpreadsheet,
      allowed: isManager,
      description: 'Ekspor PDF & Excel Akuntansi',
    },
    {
      id: 'users' as NavigationTab,
      label: 'Manajemen Staf',
      icon: Users,
      allowed: isOwner,
      description: 'Hak Akses & Peran Karyawan',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Pengaturan Toko',
      icon: Settings,
      allowed: isOwner || isManager,
      description: 'WhatsApp & Cloud Sync',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-colors">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama BUMN
        </div>

        {navItems.map((item) => {
          if (!item.allowed) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 dark:bg-amber-500 dark:text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white dark:text-slate-950' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="text-left leading-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor} animate-pulse`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role access badge info */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Keamanan Hak Akses</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {userRole === 'owner' && 'Akses Penuh Super Admin: Laba rugi, audit, dan kontrol pengguna aktif.'}
          {userRole === 'manager' && 'Akses Manajerial: Manajemen stok, restock, kasir, dan laporan.'}
          {userRole === 'cashier' && 'Mode Kasir Terbatas: POS, input barcode, dan penerimaan transaksi.'}
        </p>
      </div>
    </aside>
  );
};
