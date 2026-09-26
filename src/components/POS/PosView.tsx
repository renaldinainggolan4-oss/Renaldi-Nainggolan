import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Camera,
  Barcode,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Tag,
  UserCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CartItem, PaymentMethod, Product, StoreSettings, Transaction, User } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { soundService } from '../../services/soundEffects';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

interface PosViewProps {
  products: Product[];
  currentUser: User;
  settings: StoreSettings;
  onTransactionCompleted: (newTransaction: Transaction, updatedProducts: Product[]) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  currentUser,
  settings,
  onTransactionCompleted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderDiscount, setOrderDiscount] = useState<number>(0); // percent or flat Rp
  const [applyTax, setApplyTax] = useState<boolean>(settings.enableTaxByDefault);
  
  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // Hardware Barcode Scanner listener (captures rapid keyboard inputs ending with Enter)
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      // Hardware scanners type very rapidly (< 50ms per key)
      if (currentTime - lastKeyTimeRef.current > 100) {
        barcodeBufferRef.current = '';
      }
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 4) {
          handleBarcodeScanned(barcodeBufferRef.current);
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Extract distinct categories
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      soundService.playWarning();
      return;
    }

    soundService.playBeep();
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        if (currentQty >= product.stock) {
          soundService.playWarning();
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1,
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1, discountPercent: 0 }];
      }
    });
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    const trimmed = scannedCode.trim();
    const product = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    if (product) {
      addToCart(product);
      setManualBarcode('');
    } else {
      soundService.playWarning();
      alert(`Barang dengan barcode/SKU "${trimmed}" tidak ditemukan dalam sistem inventaris BUMN.`);
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          const cappedQty = Math.min(newQty, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const updateDiscount = (productId: string, discount: number) => {
    const cleanDiscount = Math.max(0, Math.min(100, discount));
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, discountPercent: cleanDiscount } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setOrderDiscount(0);
  };

  // Subtotal calculation
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.sellingPrice * item.quantity;
    const discountAmount = item.discountPercent
      ? (itemTotal * item.discountPercent) / 100
      : 0;
    return sum + (itemTotal - discountAmount);
  }, 0);

  const discountTotal = (subtotal * orderDiscount) / 100;
  const taxableAmount = subtotal - discountTotal;
  const tax = applyTax ? (taxableAmount * settings.taxRatePercent) / 100 : 0;
  const total = Math.max(0, taxableAmount + tax);

  // Complete Payment & Decrement Stock
  const handleCompletePayment = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    change: number
  ) => {
    const now = new Date();
    const invoiceNumber = `BUMN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const txItems = cart.map((item) => {
      const itemSubtotal =
        item.product.sellingPrice * item.quantity * (1 - (item.discountPercent || 0) / 100);
      const itemCost = item.product.costPrice * item.quantity;
      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        unit: item.product.unit,
        quantity: item.quantity,
        costPrice: item.product.costPrice,
        sellingPrice: item.product.sellingPrice,
        discountPercent: item.discountPercent || 0,
        subtotal: itemSubtotal,
        profit: itemSubtotal - itemCost,
      };
    });

    const totalCost = txItems.reduce((acc, curr) => acc + curr.costPrice * curr.quantity, 0);
    const totalProfit = total - totalCost;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      date: now.toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: txItems,
      subtotal,
      discountTotal,
      tax,
      total,
      totalCost,
      totalProfit,
      paymentMethod,
      amountPaid,
      change,
      customerName: customerName.trim() || undefined,
      status: 'completed',
    };

    // Real-time stock decrement
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((c) => c.product.id === prod.id);
      if (cartItem) {
        const remainingStock = Math.max(0, prod.stock - cartItem.quantity);
        return {
          ...prod,
          stock: remainingStock,
          lastUpdated: now.toISOString(),
        };
      }
      return prod;
    });

    setIsPaymentOpen(false);
    setCompletedTransaction(newTx);
    setIsReceiptOpen(true);
    setCart([]);
    setCustomerName('');
    setOrderDiscount(0);

    onTransactionCompleted(newTx, updatedProducts);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* LEFT SECTION: Catalog & Barcode Scanner */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 border-r border-slate-200 dark:border-slate-800">
        {/* Search, Barcode Input, and Camera Trigger Bar */}
        <div className="space-y-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang, barcode (EAN-13), atau SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Camera Barcode Scanner Trigger Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-md text-xs transition-all shrink-0 active:scale-95"
              title="Buka Kamera Barcode Scanner"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Kamera</span>
            </button>
          </div>

          {/* Quick Barcode Keypad Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualBarcode.trim()) handleBarcodeScanned(manualBarcode);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Input barcode scanner manual lalu Enter..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              + Masukkan
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
              <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-semibold">Produk tidak ditemukan</p>
              <p className="text-xs">Coba kata kunci lain atau pilih kategori Semua</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock <= product.minStock && !isOutOfStock;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`group relative p-3 rounded-xl border bg-white dark:bg-slate-900 flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-50 border-rose-300 dark:border-rose-900/40 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/80 hover:shadow-md cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Category & Stock Status Pill */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
                          {product.category}
                        </span>
                        {isOutOfStock ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                            Kritis: {product.stock}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Stok: {product.stock} {product.unit}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                        {product.barcode}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                        {formatRupiah(product.sellingPrice)}
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-500/15 group-hover:bg-amber-500 text-amber-600 group-hover:text-slate-950 font-bold'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart Panel & Fast Checkout */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white dark:bg-slate-900 flex flex-col h-auto lg:h-full border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 shadow-xl z-10">
        {/* Cart Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Keranjang Kasir
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} item
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Kosongkan Keranjang"
              className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}
        </div>

        {/* Customer Name & Staff Details */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <div className="relative flex-1">
            <UserCheck className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama Pelanggan (opsional)"
              className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            Kasir: <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center">
              <ShoppingBag className="w-12 h-12 mb-2 stroke-1 opacity-40 text-amber-500" />
              <p className="text-xs font-semibold">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-500 max-w-[200px]">
                Scan barcode barang atau klik produk di katalog sebelah kiri.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.sellingPrice * item.quantity;
              const hasDiscount = (item.discountPercent || 0) > 0;
              const finalSubtotal = hasDiscount
                ? itemTotal * (1 - (item.discountPercent || 0) / 100)
                : itemTotal;

              return (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-white leading-tight">
                        {item.product.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatRupiah(item.product.sellingPrice)} / {item.product.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-amber-400">
                        {formatRupiah(finalSubtotal)}
                      </div>
                      {hasDiscount && (
                        <div className="text-[10px] text-rose-500 line-through">
                          {formatRupiah(itemTotal)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Discount Controls */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product.id, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-10 text-center font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Discount Tag */}
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400">Disc:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent || ''}
                        onChange={(e) =>
                          updateDiscount(item.product.id, parseInt(e.target.value, 10) || 0)
                        }
                        placeholder="0"
                        className="w-9 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-[10px] font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-[10px] text-slate-400">%</span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-1 p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Calculation & Checkout Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>

          {/* Tax toggle */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={applyTax}
                onChange={(e) => setApplyTax(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>PPN ({settings.taxRatePercent}%)</span>
            </label>
            <span className="text-slate-600 dark:text-slate-400">
              {applyTax ? formatRupiah(tax) : 'Rp 0'}
            </span>
          </div>

          {/* Order Level Discount */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Diskon Transaksi (%)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={orderDiscount || ''}
                onChange={(e) => setOrderDiscount(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                placeholder="0"
                className="w-12 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          </div>

          {/* Total Tagihan */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                Total Tagihan
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatRupiah(total)}
              </span>
            </div>

            {/* Pay Button */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className={`py-3 px-6 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
                cart.length === 0
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25 active:scale-95'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar ({cart.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
        products={products}
      />

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cart}
        subtotal={subtotal}
        discountTotal={discountTotal}
        tax={tax}
        total={total}
        settings={settings}
        onCompletePayment={handleCompletePayment}
      />

      {/* Receipt Modal */}
      {completedTransaction && (
        <ReceiptModal
          transaction={completedTransaction}
          settings={settings}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          onNewTransaction={() => {
            setIsReceiptOpen(false);
            setCompletedTransaction(null);
          }}
        />
      )}
    </div>
  );
};
