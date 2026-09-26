import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_USERS, generateInitialTransactions } from '../data/initialData';
import { AppNotification, Product, StockLog, StoreSettings, Transaction, User } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'bumn_products_v1',
  TRANSACTIONS: 'bumn_transactions_v1',
  USERS: 'bumn_users_v1',
  SETTINGS: 'bumn_settings_v1',
  NOTIFICATIONS: 'bumn_notifications_v1',
  STOCK_LOGS: 'bumn_stock_logs_v1',
  ACTIVE_USER_ID: 'bumn_active_user_id',
  THEME: 'bumn_theme',
  LAST_CLOUD_SYNC: 'bumn_last_cloud_sync',
};

export const storage = {
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.updateCloudSyncTimestamp();
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  },

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : generateInitialTransactions();
    } catch {
      return generateInitialTransactions();
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      this.updateCloudSyncTimestamp();
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.updateCloudSyncTimestamp();
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: StoreSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      this.updateCloudSyncTimestamp();
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
      
      // Auto generate initial notifications for products below minStock
      const products = this.getProducts();
      const initialAlerts: AppNotification[] = products
        .filter(p => p.stock <= p.minStock)
        .map(p => ({
          id: `notif-${p.id}`,
          title: p.stock === 0 ? '⚠️ Stok Habis Total!' : '⚠️ Stok Menipis Kritis',
          message: `${p.name} tersisa ${p.stock} ${p.unit} (Batas minimum: ${p.minStock} ${p.unit}). Segera lakukan restock!`,
          type: p.stock === 0 ? 'alert' : 'warning',
          productId: p.id,
          timestamp: new Date().toISOString(),
          read: false,
        }));
      return initialAlerts;
    } catch {
      return [];
    }
  },

  saveNotifications(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  },

  getStockLogs(): StockLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStockLogs(logs: StockLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save stock logs:', e);
    }
  },

  getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'user-1';
  },

  saveActiveUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  },

  getTheme(): 'dark' | 'light' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark';
  },

  saveTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getLastCloudSync(): string {
    const ts = localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_SYNC);
    return ts || new Date().toISOString();
  },

  updateCloudSyncTimestamp(): string {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, now);
    return now;
  },

  exportDatabaseJSON(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      store: INITIAL_SETTINGS.storeName,
      products: this.getProducts(),
      transactions: this.getTransactions(),
      users: this.getUsers(),
      settings: this.getSettings(),
      notifications: this.getNotifications(),
      stockLogs: this.getStockLogs(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        this.saveProducts(data.products);
      }
      if (data.transactions && Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }
      if (data.users && Array.isArray(data.users)) {
        this.saveUsers(data.users);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        this.saveNotifications(data.notifications);
      }
      if (data.stockLogs && Array.isArray(data.stockLogs)) {
        this.saveStockLogs(data.stockLogs);
      }
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.STOCK_LOGS);
    this.updateCloudSyncTimestamp();
  }
};
