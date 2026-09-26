import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  productToEdit?: Product | null;
  existingCategories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  existingCategories,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Sembako',
    unit: 'pcs',
    costPrice: 0,
    sellingPrice: 0,
    stock: 10,
    minStock: 5,
    supplier: '',
    location: '',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        barcode: productToEdit.barcode,
        category: productToEdit.category,
        unit: productToEdit.unit,
        costPrice: productToEdit.costPrice,
        sellingPrice: productToEdit.sellingPrice,
        stock: productToEdit.stock,
        minStock: productToEdit.minStock,
        supplier: productToEdit.supplier || '',
        location: productToEdit.location || '',
      });
    } else {
      // Auto generate random SKU & Barcode for new item
      const randomSku = `BUMN-SKU-${Math.floor(100 + Math.random() * 900)}`;
      const randomBarcode = `899${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setFormData({
        name: '',
        sku: randomSku,
        barcode: randomBarcode,
        category: 'Sembako',
        unit: 'pcs',
        costPrice: 10000,
        sellingPrice: 13000,
        stock: 20,
        minStock: 5,
        supplier: 'CV Toba Agro Jaya',
        location: 'Rak Utama',
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const profitRp = formData.sellingPrice - formData.costPrice;
  const profitMarginPercent =
    formData.sellingPrice > 0 ? ((profitRp / formData.sellingPrice) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama barang wajib diisi!');
      return;
    }
    onSave(formData);
    onClose();
  };

  const units = ['pcs', 'kg', 'karung', 'pouch', 'botol', 'kotak', 'pack', 'dus', 'renteng', 'ikat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {productToEdit ? 'Edit Data Barang Inventaris' : 'Tambah Produk Baru ke Katalog'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola harga modal, harga jual, dan batas peringatan stok minimum BUMN
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Product Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Produk / Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Beras Ramos Sentra Cianjur 5kg"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* SKU & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode SKU Inventaris
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Barcode (EAN-13 / Scanner)
              </label>
              <input
                type="text"
                required
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Barang
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Satuan Kemasan (Unit)
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Profit Calculation */}
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-3">
            <span className="font-extrabold text-amber-800 dark:text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Kalkulasi Harga & Margin Keuntungan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Modal Beli (HPP) Rp
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Jual Kasir Rp
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-500/20 text-slate-700 dark:text-slate-300">
              <div>
                Estimasi Laba per Unit:{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(profitRp)}
                </span>
              </div>
              <div>
                Margin Keuntungan:{' '}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {profitMarginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Stock & Minimum Threshold (Crucial for user request!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Stok Fisik Saat Ini
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Batas Minimum Stok (Pemicu Peringatan)
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/50 dark:border-amber-500/50 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                Notifikasi push & WhatsApp akan aktif otomatis jika stok ≤ angka ini.
              </span>
            </div>
          </div>

          {/* Supplier & Rak Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Distributor / Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Contoh: CV Toba Agro Jaya"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Rak Toko
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: Rak Sembako A1"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
            >
              {productToEdit ? 'Simpan Perubahan' : 'Tambahkan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
