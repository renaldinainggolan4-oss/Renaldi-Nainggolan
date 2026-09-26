import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  MessageCircle,
  PackagePlus,
  Coins,
  TrendingUp,
  Boxes,
  Barcode,
  Building,
} from 'lucide-react';
import { Product, StoreSettings, User } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductModal } from './ProductModal';
import { RestockModal } from './RestockModal';
import { WhatsAppStockModal } from './WhatsAppStockModal';

interface InventoryViewProps {
  products: Product[];
  currentUser: User;
  settings: StoreSettings;
  onAddProduct: (product: Partial<Product>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onRestock: (
    productId: string,
    quantityChange: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string
  ) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  currentUser,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'critical' | 'out' | 'safe'>('all');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockTargetProduct, setRestockTargetProduct] = useState<Product | null>(null);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waTargetProduct, setWaTargetProduct] = useState<Product | null>(null);

  const canEdit = currentUser.role === 'owner' || currentUser.role === 'manager';

  // Metrics calculation
  const totalSkuCount = products.length;
  const totalCostValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalSellingValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  const potentialProfit = totalSellingValue - totalCostValue;
  const criticalProducts = products.filter((p) => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;

    let matchesStatus = true;
    if (stockStatusFilter === 'critical') {
      matchesStatus = p.stock <= p.minStock && p.stock > 0;
    } else if (stockStatusFilter === 'out') {
      matchesStatus = p.stock <= 0;
    } else if (stockStatusFilter === 'safe') {
      matchesStatus = p.stock > p.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleRestockClick = (product: Product) => {
    setRestockTargetProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleWaAlertClick = (product?: Product) => {
    setWaTargetProduct(product || null);
    setIsWaModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${name}" dari inventaris?`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 space-y-5">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total SKU */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Katalog
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalSkuCount} SKU
            </div>
            <span className="text-[10px] text-slate-500">Barang terdaftar</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Total Nilai Aset Modal */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Nilai Aset Modal (HPP)
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(totalCostValue)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Modal barang di toko
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Potensi Nilai Jual & Laba */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Potensi Omset Jual
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(totalSellingValue)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Est. Laba: +{formatRupiah(potentialProfit)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Stok Menipis Kritis */}
        <div
          onClick={() => setStockStatusFilter('critical')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-500 transition-all"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Stok Kritis / Habis
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-500 mt-0.5">
              {criticalProducts.length + outOfStockProducts.length} Item
            </div>
            <span className="text-[10px] text-rose-400 font-medium">
              {outOfStockProducts.length} Habis | {criticalProducts.length} Menipis
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and Action Buttons */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, barcode, SKU, atau supplier..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp notification button */}
            <button
              onClick={() => handleWaAlertClick()}
              title="Kirim Peringatan Stok Menipis ke WhatsApp"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Kirim WA Stok ({criticalProducts.length + outOfStockProducts.length})</span>
            </button>

            {/* Add product button */}
            {canEdit && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'critical', label: `⚠️ Menipis (${criticalProducts.length})` },
              { id: 'out', label: `🔴 Habis Total (${outOfStockProducts.length})` },
              { id: 'safe', label: '✅ Stok Aman' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStockStatusFilter(st.id as typeof stockStatusFilter)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  stockStatusFilter === st.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Produk & Barcode</th>
                <th className="py-3 px-4">Kategori & Rak</th>
                <th className="py-3 px-4 text-right">Harga Modal (HPP)</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Margin</th>
                <th className="py-3 px-4 text-center">Stok Fisik / Min</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isCritical = product.stock <= product.minStock && !isOutOfStock;
                  const marginPercent =
                    product.sellingPrice > 0
                      ? (((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(0)
                      : '0';

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                          <span>{product.sku}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {product.barcode}
                          </span>
                        </div>
                      </td>

                      {/* Category & Location */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {product.category}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {product.location || 'Rak Standar'}
                        </div>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatRupiah(product.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-amber-400">
                        {formatRupiah(product.sellingPrice)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          +{marginPercent}%
                        </span>
                      </td>

                      {/* Physical Stock vs Min Threshold */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {product.stock} {product.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Batas min: {product.minStock} {product.unit}
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                            Habis Total
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse">
                            Kritis Menipis
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Stok Aman
                          </span>
                        )}
                      </td>

                      {/* Operations Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Restock button */}
                          <button
                            onClick={() => handleRestockClick(product)}
                            title="Restock / Sesuaikan Stok Barang"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-colors"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>

                          {/* Quick WhatsApp Alert button if critical */}
                          {(isCritical || isOutOfStock) && (
                            <button
                              onClick={() => handleWaAlertClick(product)}
                              title="Kirim Notifikasi WA untuk Barang Ini"
                              className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit button */}
                          {canEdit && (
                            <button
                              onClick={() => handleEditClick(product)}
                              title="Edit Detail & Harga"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button (Owner only) */}
                          {currentUser.role === 'owner' && (
                            <button
                              onClick={() => handleDeleteClick(product.id, product.name)}
                              title="Hapus Barang dari Inventaris"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={(data) => {
          if (editingProduct) {
            onUpdateProduct({ ...editingProduct, ...data } as Product);
          } else {
            onAddProduct(data);
          }
        }}
        productToEdit={editingProduct}
        existingCategories={categories.filter((c) => c !== 'Semua')}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockTargetProduct(null);
        }}
        product={restockTargetProduct}
        currentUser={currentUser}
        onConfirmRestock={onRestock}
      />

      <WhatsAppStockModal
        isOpen={isWaModalOpen}
        onClose={() => {
          setIsWaModalOpen(false);
          setWaTargetProduct(null);
        }}
        products={products}
        settings={settings}
        preselectedProduct={waTargetProduct}
      />
    </div>
  );
};
