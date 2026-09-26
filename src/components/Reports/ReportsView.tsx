import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { Product, StoreSettings, Transaction } from '../../types';
import { exportToCSV, formatDateIndo, formatNumber, formatRupiah } from '../../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  products: Product[];
  settings: StoreSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  products,
  settings,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'inventory' | 'income'>('sales');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'week'>('month');

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterPeriod === 'all') return true;
    const now = new Date();
    const txDate = new Date(tx.date);

    if (filterPeriod === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return txDate >= weekAgo;
    }
    if (filterPeriod === 'month') {
      return (
        txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Totals for sales report
  const totalSalesRevenue = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalSalesCost = filteredTransactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalSalesProfit = filteredTransactions.reduce((acc, t) => acc + t.totalProfit, 0);
  const totalDiscounts = filteredTransactions.reduce((acc, t) => acc + t.discountTotal, 0);

  // Totals for inventory report
  const totalStockQty = products.reduce((acc, p) => acc + p.stock, 0);
  const totalAssetCost = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const totalAssetSelling = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const totalPotentialProfit = totalAssetSelling - totalAssetCost;

  // Handle Export to Excel / CSV
  const handleExportExcel = () => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (activeReportTab === 'sales') {
      const headers = [
        'No Faktur',
        'Tanggal & Waktu',
        'Nama Kasir',
        'Nama Pelanggan',
        'Jumlah Item',
        'Metode Pembayaran',
        'Subtotal (Rp)',
        'Diskon (Rp)',
        'Total Omset (Rp)',
        'HPP Modal (Rp)',
        'Laba Bersih (Rp)',
      ];

      const rows = filteredTransactions.map((tx) => [
        tx.invoiceNumber,
        formatDateIndo(tx.date),
        tx.cashierName,
        tx.customerName || 'Umum',
        tx.items.reduce((s, i) => s + i.quantity, 0),
        tx.paymentMethod.toUpperCase(),
        tx.subtotal,
        tx.discountTotal,
        tx.total,
        tx.totalCost,
        tx.totalProfit,
      ]);

      exportToCSV(`Laporan_Penjualan_BUMN_${timestamp}`, headers, rows);
    } else if (activeReportTab === 'inventory') {
      const headers = [
        'Kode SKU',
        'Barcode',
        'Nama Produk',
        'Kategori',
        'Satuan',
        'Stok Fisik',
        'Batas Min',
        'Harga Modal (Rp)',
        'Total Nilai Modal (Rp)',
        'Harga Jual (Rp)',
        'Potensi Omset (Rp)',
        'Potensi Laba (Rp)',
        'Supplier',
      ];

      const rows = products.map((p) => [
        p.sku,
        p.barcode,
        p.name,
        p.category,
        p.unit,
        p.stock,
        p.minStock,
        p.costPrice,
        p.costPrice * p.stock,
        p.sellingPrice,
        p.sellingPrice * p.stock,
        (p.sellingPrice - p.costPrice) * p.stock,
        p.supplier || '-',
      ]);

      exportToCSV(`Laporan_Inventaris_Aset_BUMN_${timestamp}`, headers, rows);
    } else {
      // Income statement
      const headers = ['Pos Akuntansi Keuangan', 'Jumlah (Rp)'];
      const rows = [
        ['Pendapatan Penjualan Kotor (Gross Revenue)', totalSalesRevenue + totalDiscounts],
        ['Potongan Diskon Penjualan', -totalDiscounts],
        ['Pendapatan Bersih (Net Revenue)', totalSalesRevenue],
        ['Harga Pokok Penjualan / Modal (HPP)', -totalSalesCost],
        ['Laba Kotor Operasional (Gross Profit)', totalSalesProfit],
        ['Margin Laba Bersih (%)', `${((totalSalesProfit / (totalSalesRevenue || 1)) * 100).toFixed(1)}%`],
      ];

      exportToCSV(`Laporan_Laba_Rugi_Akuntansi_BUMN_${timestamp}`, headers, rows);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 space-y-6">
      {/* Printable Report Wrapper */}
      <div className="print-report-container max-w-6xl mx-auto space-y-6">
        {/* Printable Official Header (Shown in browser print / PDF) */}
        <div className="print-only text-center pb-4 border-b-2 border-slate-900 mb-6">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            {settings.storeName}
          </h1>
          <h2 className="text-sm font-bold text-slate-700">
            {settings.storeTagline}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {settings.address} | Telp: {settings.phone}
          </p>
          <div className="mt-3 py-1 px-3 bg-slate-100 border border-slate-300 inline-block rounded font-bold text-xs">
            DOKUMEN RESMI AKUNTANSI & INVENTARIS TOKO
          </div>
        </div>

        {/* Screen Controls Header (Hidden in Print) */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Pusat Pelaporan & Ekspor Akuntansi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unduh format Excel (.CSV) untuk pembukuan atau cetak dokumen resmi PDF
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Format Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>

        {/* Report Type Tabs & Filters (Hidden in print) */}
        <div className="no-print bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'sales', label: '1. Laporan Penjualan (Harian/Bulanan)' },
              { id: 'inventory', label: '2. Laporan Stok & Nilai Aset' },
              { id: 'income', label: '3. Ringkasan Laba Rugi Akuntansi' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as typeof activeReportTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeReportTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Period Filter */}
          {activeReportTab !== 'inventory' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Periode:</span>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as typeof filterPeriod)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="month">Bulan Ini (September 2026)</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="all">Semua Riwayat</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: LAPORAN PENJUALAN */}
        {activeReportTab === 'sales' && (
          <div className="space-y-4">
            {/* Sales Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Omset</span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {formatRupiah(totalSalesRevenue)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Modal (HPP)</span>
                <div className="text-base sm:text-lg font-black text-slate-700 dark:text-slate-300">
                  {formatRupiah(totalSalesCost)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-500">Laba Bersih</span>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(totalSalesProfit)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Transaksi</span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {filteredTransactions.length} Struk
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">No. Faktur</th>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Kasir</th>
                      <th className="py-2.5 px-3">Pelanggan</th>
                      <th className="py-2.5 px-3 text-center">Metode</th>
                      <th className="py-2.5 px-3 text-right">Omset (Rp)</th>
                      <th className="py-2.5 px-3 text-right">HPP Modal</th>
                      <th className="py-2.5 px-3 text-right text-emerald-600">Laba (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {tx.invoiceNumber}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{formatDateIndo(tx.date)}</td>
                        <td className="py-2 px-3 font-medium">{tx.cashierName}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                          {tx.customerName || '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatRupiah(tx.total)}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500">
                          {formatRupiah(tx.totalCost)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatRupiah(tx.totalProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN NILAI ASET & STOK */}
        {activeReportTab === 'inventory' && (
          <div className="space-y-4">
            {/* Inventory Valuation Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Kuantitas Fisik</span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {formatNumber(totalStockQty)} Unit
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-blue-500">Nilai Aset Modal</span>
                <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
                  {formatRupiah(totalAssetCost)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-amber-500">Potensi Nilai Jual</span>
                <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                  {formatRupiah(totalAssetSelling)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-500">Potensi Laba Toko</span>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                  +{formatRupiah(totalPotentialProfit)}
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">SKU / Barcode</th>
                      <th className="py-2.5 px-3">Nama Produk</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-center">Stok Fisik</th>
                      <th className="py-2.5 px-3 text-right">Modal Satuan</th>
                      <th className="py-2.5 px-3 text-right">Total Aset Modal</th>
                      <th className="py-2.5 px-3 text-right">Harga Jual</th>
                      <th className="py-2.5 px-3 text-right">Potensi Omset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {products.map((p) => {
                      const assetCost = p.costPrice * p.stock;
                      const assetSelling = p.sellingPrice * p.stock;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                            {p.sku}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </td>
                          <td className="py-2 px-3">{p.category}</td>
                          <td className="py-2 px-3 text-center font-bold">
                            {p.stock} {p.unit}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500">
                            {formatRupiah(p.costPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                            {formatRupiah(assetCost)}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatRupiah(p.sellingPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                            {formatRupiah(assetSelling)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LAPORAN LABA RUGI SEDERHANA */}
        {activeReportTab === 'income' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Laporan Laba Rugi Operasional Toko
              </h2>
              <p className="text-xs text-slate-500">
                Badan Usaha Milik Nainggolan (BUMN)
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Pendapatan Penjualan Kotor (Gross Revenue)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatRupiah(totalSalesRevenue + totalDiscounts)}
                </span>
              </div>

              {totalDiscounts > 0 && (
                <div className="flex justify-between py-1 text-rose-500">
                  <span>Potongan Diskon Penjualan Toko</span>
                  <span>-{formatRupiah(totalDiscounts)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-800/40 px-2 rounded-lg">
                <span>Penjualan Bersih (Net Sales)</span>
                <span>{formatRupiah(totalSalesRevenue)}</span>
              </div>

              <div className="flex justify-between py-2 text-slate-600 dark:text-slate-400">
                <span>Harga Pokok Penjualan / Modal Barang (HPP)</span>
                <span className="font-semibold">-{formatRupiah(totalSalesCost)}</span>
              </div>

              <div className="flex justify-between py-3 border-t-2 border-slate-900 dark:border-slate-600 font-black text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 rounded-xl">
                <span>LABA KOTOR OPERASIONAL (GROSS PROFIT)</span>
                <span>+{formatRupiah(totalSalesProfit)}</span>
              </div>

              <div className="text-xs text-slate-500 text-right pt-1">
                Margin Laba Bersih:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {((totalSalesProfit / (totalSalesRevenue || 1)) * 100).toFixed(1)}%
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Official Signatures Section (Shown in PDF/Print) */}
        <div className="print-only pt-12 mt-8 border-t border-slate-400 text-xs text-slate-800">
          <div className="flex justify-between text-center px-8">
            <div className="space-y-16">
              <p className="font-semibold">Dibuat oleh (Kasir / Staf):</p>
              <div>
                <p className="font-bold underline">Siti Hutapea / Budi S.</p>
                <p className="text-[10px] text-slate-500">Staf Operasional Toko</p>
              </div>
            </div>

            <div className="space-y-16">
              <p className="font-semibold">Disetujui oleh (Pemilik Toko):</p>
              <div>
                <p className="font-bold underline">Renaldi Nainggolan</p>
                <p className="text-[10px] text-slate-500">Pemilik / Super Admin BUMN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
