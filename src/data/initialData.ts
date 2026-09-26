import { Product, StoreSettings, Transaction, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Renaldi Nainggolan',
    username: 'renaldi',
    role: 'owner',
    pin: '1234',
    phone: '081298765432',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'user-2',
    name: 'Budi Simanjuntak',
    username: 'budi',
    role: 'manager',
    pin: '2345',
    phone: '081345678901',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'user-3',
    name: 'Siti Hutapea',
    username: 'siti',
    role: 'cashier',
    pin: '3456',
    phone: '081512345678',
    avatarColor: 'bg-amber-600',
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'BUMN',
  storeTagline: 'Badan Usaha Milik Nainggolan',
  address: 'Jl. Pemuda No. 88, Balige - Toba, Sumatera Utara',
  phone: '0812-9876-5432',
  ownerWaNumber: '6281298765432',
  managerWaNumber: '6281345678901',
  supplierWaNumber: '6281122334455',
  taxRatePercent: 11,
  enableTaxByDefault: false,
  currency: 'IDR',
  receiptFooter: 'Terima kasih atas kunjungan Anda di Toko BUMN!\nBarang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.',
  autoPushNotification: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'BUMN-SKU-001',
    barcode: '8999999001014',
    name: 'Beras Pandan Wangi Premium 5kg',
    category: 'Sembako',
    unit: 'karung',
    costPrice: 68000,
    sellingPrice: 78000,
    stock: 4, // Low stock (min: 8)
    minStock: 8,
    supplier: 'CV Toba Agro Jaya',
    location: 'Rak Sembako A1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    sku: 'BUMN-SKU-002',
    barcode: '8999999001021',
    name: 'Minyak Goreng Sania Pouch 2L',
    category: 'Sembako',
    unit: 'pouch',
    costPrice: 32000,
    sellingPrice: 38500,
    stock: 3, // Low stock (min: 10)
    minStock: 10,
    supplier: 'PT Wilmar Distribusi',
    location: 'Rak Sembako A2',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'BUMN-SKU-003',
    barcode: '8999999001038',
    name: 'Gula Pasir Gulaku Tebu Murni 1kg',
    category: 'Sembako',
    unit: 'kg',
    costPrice: 15500,
    sellingPrice: 18000,
    stock: 25,
    minStock: 10,
    supplier: 'PT Sugar Group',
    location: 'Rak Sembako A3',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    sku: 'BUMN-SKU-004',
    barcode: '8998866200215',
    name: 'Indomie Goreng Spesial 85g',
    category: 'Makanan Ringan',
    unit: 'pcs',
    costPrice: 2800,
    sellingPrice: 3500,
    stock: 96,
    minStock: 24,
    supplier: 'PT Indomarco Adi Prima',
    location: 'Rak Mi B1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    sku: 'BUMN-SKU-005',
    barcode: '8998866200222',
    name: 'Indomie Kuah Ayam Bawang 69g',
    category: 'Makanan Ringan',
    unit: 'pcs',
    costPrice: 2750,
    sellingPrice: 3500,
    stock: 72,
    minStock: 20,
    supplier: 'PT Indomarco Adi Prima',
    location: 'Rak Mi B1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    sku: 'BUMN-SKU-006',
    barcode: '8992753210118',
    name: 'Kopi Kapal Api Special Mix 10s',
    category: 'Minuman',
    unit: 'renteng',
    costPrice: 14200,
    sellingPrice: 17000,
    stock: 18,
    minStock: 5,
    supplier: 'PT Santos Jaya Abadi',
    location: 'Rak Kopi C1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    sku: 'BUMN-SKU-007',
    barcode: '8992761001111',
    name: 'Teh Botol Sosro Kotak 250ml',
    category: 'Minuman',
    unit: 'kotak',
    costPrice: 3200,
    sellingPrice: 4500,
    stock: 5, // Low stock (min: 12)
    minStock: 12,
    supplier: 'PT Sinar Sosro',
    location: 'Kulkas Minuman D1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    sku: 'BUMN-SKU-008',
    barcode: '8992753210996',
    name: 'Susu Ultra Milk UHT Cokelat 250ml',
    category: 'Minuman',
    unit: 'kotak',
    costPrice: 5800,
    sellingPrice: 7500,
    stock: 28,
    minStock: 12,
    supplier: 'PT Ultrajaya Milk',
    location: 'Kulkas Minuman D2',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    sku: 'BUMN-SKU-009',
    barcode: '8999999551012',
    name: 'Telur Ayam Ras Segar 1kg',
    category: 'Sembako',
    unit: 'kg',
    costPrice: 26000,
    sellingPrice: 30000,
    stock: 2, // Critical low stock (min: 15)
    minStock: 15,
    supplier: 'Peternakan Silindung',
    location: 'Meja Depan Kasir',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    sku: 'BUMN-SKU-010',
    barcode: '8999999772213',
    name: 'Sunlight Jeruk Nipis Pencuci Piring 650ml',
    category: 'Kebutuhan Rumah',
    unit: 'pouch',
    costPrice: 14000,
    sellingPrice: 17500,
    stock: 14,
    minStock: 6,
    supplier: 'PT Unilever Indonesia',
    location: 'Rak Sabun E1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    sku: 'BUMN-SKU-011',
    barcode: '8999999883314',
    name: 'Deterjen Rinso Molto Bubuk 770g',
    category: 'Kebutuhan Rumah',
    unit: 'pack',
    costPrice: 21500,
    sellingPrice: 26000,
    stock: 9,
    minStock: 5,
    supplier: 'PT Unilever Indonesia',
    location: 'Rak Sabun E2',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    sku: 'BUMN-SKU-012',
    barcode: '8991234567890',
    name: 'Biskuit Roma Kelapa 300g',
    category: 'Makanan Ringan',
    unit: 'pack',
    costPrice: 8500,
    sellingPrice: 11000,
    stock: 22,
    minStock: 8,
    supplier: 'PT Mayora Indah',
    location: 'Rak Snack B2',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-13',
    sku: 'BUMN-SKU-013',
    barcode: '8998989123451',
    name: 'Shampoo Pantene Anti Ketombe 160ml',
    category: 'Perawatan Tubuh',
    unit: 'botol',
    costPrice: 23000,
    sellingPrice: 28500,
    stock: 11,
    minStock: 4,
    supplier: 'PT Procter & Gamble',
    location: 'Rak Kosmetik F1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'prod-14',
    sku: 'BUMN-SKU-014',
    barcode: '8991001234567',
    name: 'Aqua Air Mineral Botol 600ml',
    category: 'Minuman',
    unit: 'botol',
    costPrice: 2800,
    sellingPrice: 4000,
    stock: 48,
    minStock: 24,
    supplier: 'PT Danone Aqua',
    location: 'Kulkas Minuman D3',
    lastUpdated: new Date().toISOString(),
  },
];

// Helper to generate simulated past transactions across last 30 days
export function generateInitialTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Sample basket archetypes
  const scenarios = [
    {
      items: [
        { prod: INITIAL_PRODUCTS[0], qty: 1 }, // Beras 5kg
        { prod: INITIAL_PRODUCTS[1], qty: 1 }, // Minyak 2L
        { prod: INITIAL_PRODUCTS[3], qty: 5 }, // Indomie
      ],
      method: 'qris' as const,
      customer: 'Ibu Ratna',
    },
    {
      items: [
        { prod: INITIAL_PRODUCTS[3], qty: 10 }, // Indomie
        { prod: INITIAL_PRODUCTS[5], qty: 2 },  // Kopi
        { prod: INITIAL_PRODUCTS[7], qty: 3 },  // Susu
      ],
      method: 'cash' as const,
      customer: 'Pak Siregar',
    },
    {
      items: [
        { prod: INITIAL_PRODUCTS[2], qty: 2 }, // Gula
        { prod: INITIAL_PRODUCTS[8], qty: 1 }, // Telur 1kg
        { prod: INITIAL_PRODUCTS[9], qty: 1 }, // Sunlight
      ],
      method: 'gopay' as const,
      customer: 'Kak Jessica',
    },
    {
      items: [
        { prod: INITIAL_PRODUCTS[0], qty: 2 }, // Beras 2 karung
        { prod: INITIAL_PRODUCTS[1], qty: 2 }, // Minyak
        { prod: INITIAL_PRODUCTS[2], qty: 3 }, // Gula
      ],
      method: 'debit' as const,
      customer: 'Warung Bu Nababan',
    },
    {
      items: [
        { prod: INITIAL_PRODUCTS[6], qty: 4 }, // Teh Botol
        { prod: INITIAL_PRODUCTS[11], qty: 2 }, // Roma
      ],
      method: 'dana' as const,
      customer: 'David Tampubolon',
    },
    {
      items: [
        { prod: INITIAL_PRODUCTS[10], qty: 2 }, // Rinso
        { prod: INITIAL_PRODUCTS[9], qty: 2 },  // Sunlight
        { prod: INITIAL_PRODUCTS[12], qty: 1 }, // Pantene
      ],
      method: 'shopeepay' as const,
      customer: 'Mama Kevin',
    },
  ];

  let counter = 100;
  // Generate data over the past 28 days
  for (let daysAgo = 28; daysAgo >= 0; daysAgo--) {
    // Generate 2-5 transactions per day
    const txCount = daysAgo === 0 ? 4 : (daysAgo % 4) + 2;
    for (let i = 0; i < txCount; i++) {
      counter++;
      const scenarioIndex = (daysAgo + i) % scenarios.length;
      const scenario = scenarios[scenarioIndex];
      
      const txDate = new Date(now);
      txDate.setDate(txDate.getDate() - daysAgo);
      txDate.setHours(9 + (i * 2) + Math.floor(Math.random() * 2), Math.floor(Math.random() * 59), 0);

      const items = scenario.items.map(item => {
        const subtotal = item.prod.sellingPrice * item.qty;
        const cost = item.prod.costPrice * item.qty;
        return {
          productId: item.prod.id,
          productName: item.prod.name,
          sku: item.prod.sku,
          unit: item.prod.unit,
          quantity: item.qty,
          costPrice: item.prod.costPrice,
          sellingPrice: item.prod.sellingPrice,
          discountPercent: 0,
          subtotal,
          profit: subtotal - cost,
        };
      });

      const subtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
      const totalCost = items.reduce((acc, curr) => acc + (curr.costPrice * curr.quantity), 0);
      const totalProfit = subtotal - totalCost;
      const total = subtotal;
      
      const paymentMethod = scenario.method;
      let amountPaid = total;
      let change = 0;

      if (paymentMethod === 'cash') {
        amountPaid = Math.ceil(total / 10000) * 10000;
        if (amountPaid === total) amountPaid += 10000;
        change = amountPaid - total;
      }

      transactions.push({
        id: `tx-${counter}`,
        invoiceNumber: `BUMN-${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}-${String(counter).slice(-4)}`,
        date: txDate.toISOString(),
        cashierId: i % 2 === 0 ? 'user-3' : 'user-2',
        cashierName: i % 2 === 0 ? 'Siti Hutapea' : 'Budi Simanjuntak',
        items,
        subtotal,
        discountTotal: 0,
        tax: 0,
        total,
        totalCost,
        totalProfit,
        paymentMethod,
        amountPaid,
        change,
        customerName: scenario.customer,
        status: 'completed',
      });
    }
  }

  return transactions;
}
