export type UserRole = 'owner' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string;
  phone?: string;
  avatarColor: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string; // pcs, kg, dus, botol, pack, karung, pouch
  costPrice: number; // Harga Modal (HPP)
  sellingPrice: number; // Harga Jual
  stock: number;
  minStock: number; // Batas Minimum Stok
  supplier: string;
  location?: string;
  lastUpdated: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent?: number; // 0 - 100
  notes?: string;
}

export type PaymentMethod = 'qris' | 'cash' | 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'debit' | 'transfer';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  discountPercent: number;
  subtotal: number;
  profit: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierId: string;
  cashierName: string;
  items: TransactionItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  totalCost: number;
  totalProfit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerName?: string;
  status: 'completed' | 'refunded';
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'sale' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  userId: string;
  userName: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  productId?: string;
  timestamp: string;
  read: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  address: string;
  phone: string;
  ownerWaNumber: string;
  managerWaNumber: string;
  supplierWaNumber: string;
  taxRatePercent: number;
  enableTaxByDefault: boolean;
  currency: string;
  receiptFooter: string;
  autoPushNotification: boolean;
}
