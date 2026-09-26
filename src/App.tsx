import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { PosView } from './components/POS/PosView';
import { InventoryView } from './components/Inventory/InventoryView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ReportsView } from './components/Reports/ReportsView';
import { UserManagementView } from './components/Users/UserManagementView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { WhatsAppStockModal } from './components/Inventory/WhatsAppStockModal';
import { MultiDeviceModal } from './components/MultiDevice/MultiDeviceModal';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { storage } from './services/storage';
import { soundService } from './services/soundEffects';
import { AppNotification, Product, StockLog, StoreSettings, Transaction, User } from './types';

export default function App() {
  // Application Data States
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [settings, setSettings] = useState<StoreSettings>(() => storage.getSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => storage.getNotifications());
  const [lastCloudSync, setLastCloudSync] = useState<string>(() => storage.getLastCloudSync());

  // Active User & Authentication
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = storage.getActiveUserId();
    const existingUsers = storage.getUsers();
    return existingUsers.find((u) => u.id === savedId) || existingUsers[0];
  });

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<NavigationTab>('pos');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storage.getTheme());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Global Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhatsAppStockOpen, setIsWhatsAppStockOpen] = useState(false);
  const [isMultiDeviceOpen, setIsMultiDeviceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundService.setEnabled(newState);
  };

  // Switch Active User
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    storage.saveActiveUserId(user.id);
  };

  // Stock check helper that triggers push notification if item <= minStock
  const checkStockAndNotify = (prevProds: Product[], newProds: Product[]) => {
    const newAlerts: AppNotification[] = [];

    newProds.forEach((np) => {
      const prev = prevProds.find((p) => p.id === np.id);
      // Trigger if stock became <= minStock
      if (np.stock <= np.minStock) {
        if (!prev || prev.stock > np.minStock || np.stock === 0) {
          const isOut = np.stock === 0;
          newAlerts.push({
            id: `notif-${np.id}-${Date.now()}`,
            title: isOut ? '🚨 STOK HABIS TOTAL!' : '⚠️ STOK MENCAPAI BATAS MINIMUM!',
            message: `Produk "${np.name}" tersisa ${np.stock} ${np.unit} (Batas minimum: ${np.minStock} ${np.unit}). Segera pesan ke supplier!`,
            type: isOut ? 'alert' : 'warning',
            productId: np.id,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      soundService.playWarning();
      setNotifications((prev) => {
        const merged = [...newAlerts, ...prev];
        storage.saveNotifications(merged);
        return merged;
      });
    }
  };

  // Transaction completed callback
  const handleTransactionCompleted = (
    newTx: Transaction,
    updatedProducts: Product[]
  ) => {
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      storage.saveTransactions(updated);
      return updated;
    });

    checkStockAndNotify(products, updatedProducts);

    setProducts(updatedProducts);
    storage.saveProducts(updatedProducts);
    setLastCloudSync(storage.updateCloudSyncTimestamp());
  };

  // Inventory Management Actions
  const handleAddProduct = (newProdData: Partial<Product>) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: newProdData.sku || `BUMN-SKU-${Math.floor(100 + Math.random() * 900)}`,
      barcode: newProdData.barcode || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: newProdData.name || 'Produk Baru',
      category: newProdData.category || 'Sembako',
      unit: newProdData.unit || 'pcs',
      costPrice: newProdData.costPrice || 0,
      sellingPrice: newProdData.sellingPrice || 0,
      stock: newProdData.stock || 0,
      minStock: newProdData.minStock || 5,
      supplier: newProdData.supplier || '',
      location: newProdData.location || '',
      lastUpdated: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    checkStockAndNotify(products, updated);
    setProducts(updated);
    storage.saveProducts(updated);
    setLastCloudSync(storage.updateCloudSyncTimestamp());
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map((p) =>
      p.id === updatedProduct.id
        ? { ...updatedProduct, lastUpdated: new Date().toISOString() }
        : p
    );
    checkStockAndNotify(products, updated);
    setProducts(updated);
    storage.saveProducts(updated);
    setLastCloudSync(storage.updateCloudSyncTimestamp());
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    storage.saveProducts(updated);
    setLastCloudSync(storage.updateCloudSyncTimestamp());
  };

  const handleRestock = (
    productId: string,
    quantityChange: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const previousStock = targetProduct.stock;
    const newStock =
      type === 'in'
        ? previousStock + quantityChange
        : type === 'out'
        ? Math.max(0, previousStock + quantityChange)
        : previousStock + quantityChange;

    const updated = products.map((p) =>
      p.id === productId
        ? { ...p, stock: newStock, lastUpdated: new Date().toISOString() }
        : p
    );

    // Save stock log
    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      productId,
      productName: targetProduct.name,
      type,
      quantity: quantityChange,
      previousStock,
      newStock,
      reason,
      date: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    };
    const logs = storage.getStockLogs();
    storage.saveStockLogs([newLog, ...logs]);

    checkStockAndNotify(products, updated);
    setProducts(updated);
    storage.saveProducts(updated);
    setLastCloudSync(storage.updateCloudSyncTimestamp());
  };

  // User Management Actions
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    storage.saveUsers(updated);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    storage.saveUsers(updated);
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    storage.saveUsers(updated);
  };

  // Notification Actions
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    storage.saveNotifications([]);
  };

  // Settings Actions
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    setLastCloudSync(storage.updateCloudSyncTimestamp());
  };

  const handleTriggerCloudSync = () => {
    const ts = storage.updateCloudSyncTimestamp();
    setLastCloudSync(ts);
  };

  const handleExportDatabase = () => {
    const jsonStr = storage.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BUMN_Backup_Database_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDatabase = (jsonContent: string) => {
    return storage.importDatabaseJSON(jsonContent);
  };

  const handleResetData = () => {
    storage.resetToDefault();
    window.location.reload();
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-white transition-colors">
      {/* Top Application Header */}
      <Header
        settings={settings}
        currentUser={currentUser}
        users={users}
        notifications={notifications}
        theme={theme}
        lastCloudSync={lastCloudSync}
        onToggleTheme={toggleTheme}
        onSelectUser={handleSelectUser}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWhatsAppStockModal={() => setIsWhatsAppStockOpen(true)}
        onOpenMultiDeviceModal={() => setIsMultiDeviceOpen(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          userRole={currentUser.role}
          lowStockCount={lowStockCount}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'pos' && (
            <PosView
              products={products}
              currentUser={currentUser}
              settings={settings}
              onTransactionCompleted={handleTransactionCompleted}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              currentUser={currentUser}
              settings={settings}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onRestock={handleRestock}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              products={products}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              products={products}
              settings={settings}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              currentUser={currentUser}
              onSelectUser={handleSelectUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        lastCloudSync={lastCloudSync}
        onSaveSettings={handleSaveSettings}
        onTriggerCloudSync={handleTriggerCloudSync}
        onExportDatabase={handleExportDatabase}
        onImportDatabase={handleImportDatabase}
        onResetData={handleResetData}
      />

      <WhatsAppStockModal
        isOpen={isWhatsAppStockOpen}
        onClose={() => setIsWhatsAppStockOpen(false)}
        products={products}
        settings={settings}
      />

      <MultiDeviceModal
        isOpen={isMultiDeviceOpen}
        onClose={() => setIsMultiDeviceOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onOpenWhatsAppStockModal={() => {
          setIsNotificationsOpen(false);
          setIsWhatsAppStockOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
    </div>
  );
}
