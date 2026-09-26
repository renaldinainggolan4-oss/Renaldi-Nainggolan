import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Calendar,
  Award,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Product, Transaction } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  products: Product[];
  onNavigateToReports: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  products,
  onNavigateToReports,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | '30days' | 'all'>('30days');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{
    label: string;
    revenue: number;
    profit: number;
    count: number;
  } | null>(null);

  // Filter transactions by timeRange
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (timeRange === 'today') {
        return txDate >= startOfToday;
      }
      if (timeRange === '7days') {
        const d = new Date(startOfToday);
        d.setDate(d.getDate() - 7);
        return txDate >= d;
      }
      if (timeRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return txDate >= startOfMonth;
      }
      if (timeRange === '30days') {
        const d = new Date(startOfToday);
        d.setDate(d.getDate() - 30);
        return txDate >= d;
      }
      return true; // 'all'
    });
  }, [transactions, timeRange]);

  // Key KPI metrics
  const totalRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);
  const totalProfit = filteredTransactions.reduce((acc, curr) => acc + curr.totalProfit, 0);
  const transactionCount = filteredTransactions.length;
  const avgTicketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;
  const profitMarginPercent =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Aggregate daily data for interactive chart
  const chartData = useMemo(() => {
    const map = new Map<string, { label: string; revenue: number; profit: number; count: number }>();

    // Determine span in days
    const days = timeRange === 'today' ? 1 : timeRange === '7days' ? 7 : 30;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      map.set(key, { label, revenue: 0, profit: 0, count: 0 });
    }

    filteredTransactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(
        txDate.getDate()
      ).padStart(2, '0')}`;
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.revenue += tx.total;
        entry.profit += tx.totalProfit;
        entry.count += 1;
      }
    });

    return Array.from(map.values());
  }, [filteredTransactions, timeRange]);

  // Payment methods distribution
  const paymentBreakdown = useMemo(() => {
    const counts: Record<string, { total: number; count: number }> = {};
    filteredTransactions.forEach((tx) => {
      let m = tx.paymentMethod as string;
      if (['gopay', 'ovo', 'dana', 'shopeepay'].includes(m)) m = 'E-Wallet';
      else if (m === 'qris') m = 'QRIS';
      else if (m === 'cash') m = 'Tunai';
      else if (m === 'debit') m = 'Kartu / Debit';

      if (!counts[m]) counts[m] = { total: 0, count: 0 };
      counts[m].total += tx.total;
      counts[m].count += 1;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      percent: totalRevenue > 0 ? ((data.total / totalRevenue) * 100).toFixed(1) : '0',
    }));
  }, [filteredTransactions, totalRevenue]);

  // Top 5 Products by Sales
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    filteredTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        if (!map.has(item.productId)) {
          map.set(item.productId, { name: item.productName, quantity: 0, revenue: 0 });
        }
        const entry = map.get(item.productId)!;
        entry.quantity += item.quantity;
        entry.revenue += item.subtotal;
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Max value for chart scaling
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100000);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 space-y-6">
      {/* Header & Time Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dasbor Analitik Penjualan BUMN
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau tren omset harian, estimasi laba bersih, dan performa produk secara real-time
          </p>
        </div>

        {/* Time Filter Pills & Reports Link */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari' },
              { id: 'month', label: 'Bulan Ini' },
              { id: '30days', label: '30 Hari' },
              { id: 'all', label: 'Semua' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as typeof timeRange)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === t.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={onNavigateToReports}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Laporan Lengkap</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Omset */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Omset Penjualan
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Dari {transactionCount} transaksi lunas</span>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estimasi Laba Bersih
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(totalProfit)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Margin: <strong className="text-emerald-500">{profitMarginPercent}%</strong> dari total omset
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Volume Transaksi
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatNumber(transactionCount)} Transaksi
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Rata-rata: {formatNumber(Math.round(transactionCount / (chartData.length || 1)))} struk/hari
          </div>
        </div>

        {/* Average Basket Size */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rata-rata Belanja / Kasir
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(avgTicketSize)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Nilai keranjang rata-rata per pembeli
          </div>
        </div>
      </div>

      {/* Main Interactive Chart: Penjualan & Laba Harian */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Grafik Tren Penjualan & Keuntungan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arahkan kursor (hover) pada batang grafik untuk melihat detail omset dan laba per tanggal
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
              <span className="text-slate-700 dark:text-slate-300">Omset Penjualan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span className="text-slate-700 dark:text-slate-300">Laba Bersih</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart Visualization */}
        <div className="relative pt-6 pb-2">
          {/* Tooltip Overlay */}
          {hoveredDataPoint && (
            <div className="absolute top-0 right-4 p-2.5 bg-slate-900/90 text-white rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md z-10 animate-in fade-in">
              <div className="font-bold text-amber-400 mb-1">{hoveredDataPoint.label}</div>
              <div>Omset: <span className="font-bold">{formatRupiah(hoveredDataPoint.revenue)}</span></div>
              <div className="text-emerald-400">Laba: <span className="font-bold">{formatRupiah(hoveredDataPoint.profit)}</span></div>
              <div className="text-slate-400 text-[10px]">{hoveredDataPoint.count} Transaksi</div>
            </div>
          )}

          {/* SVG / HTML Responsive Graph Bars */}
          <div className="h-56 sm:h-64 flex items-end gap-1 sm:gap-2 px-1 border-b border-slate-200 dark:border-slate-800">
            {chartData.map((d, index) => {
              const revHeight = (d.revenue / maxRevenue) * 100;
              const profitHeight = (d.profit / maxRevenue) * 100;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredDataPoint(d)}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
                >
                  <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-full">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${Math.max(revHeight, 4)}%` }}
                      className="w-1/2 bg-amber-500/80 group-hover:bg-amber-400 rounded-t-sm transition-all"
                    />
                    {/* Profit Bar */}
                    <div
                      style={{ height: `${Math.max(profitHeight, 3)}%` }}
                      className="w-1/2 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t-sm transition-all"
                    />
                  </div>

                  {/* Date label (sample every few days on mobile) */}
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {chartData.length > 14 && index % 2 !== 0 ? '' : d.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Payment Method Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Metode Pembayaran Donut Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Distribusi Metode Pembayaran
            </h3>
            <span className="text-xs text-slate-400">Total: {formatRupiah(totalRevenue)}</span>
          </div>

          <div className="space-y-3">
            {paymentBreakdown.map((pm, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{pm.name}</span>
                  <div className="space-x-2">
                    <span className="text-slate-400">({pm.count} transaksi)</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatRupiah(pm.total)} ({pm.percent}%)
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${pm.percent}%` }}
                    className={`h-full rounded-full ${
                      pm.name.includes('QRIS')
                        ? 'bg-red-500'
                        : pm.name.includes('Tunai')
                        ? 'bg-emerald-500'
                        : pm.name.includes('E-Wallet')
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Produk Terlaris */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top 5 Produk Terlaris
            </h3>
            <span className="text-xs text-slate-400">Berdasarkan Total Omset</span>
          </div>

          <div className="space-y-3">
            {topProducts.map((prod, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center space-x-3 truncate mr-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                    {index + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      {prod.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Terjual: <strong>{prod.quantity}</strong> unit
                    </div>
                  </div>
                </div>

                <div className="text-right font-black text-amber-600 dark:text-amber-400 shrink-0">
                  {formatRupiah(prod.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
