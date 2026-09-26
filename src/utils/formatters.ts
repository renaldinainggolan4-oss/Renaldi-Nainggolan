// Format utilities for currency, date, WhatsApp, and CSV export

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateOnly(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Clean Indonesian WhatsApp number (0812... -> 62812...)
export function sanitizeWaNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

// Generate WhatsApp direct URL with formatted message
export function buildWhatsAppStockMessage(
  storeName: string,
  items: Array<{ name: string; stock: number; minStock: number; unit: string; supplier?: string }>,
  targetPhone: string
): string {
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());

  let text = `🚨 *PERINGATAN STOK MENIPIS - ${storeName}*\n`;
  text += `📅 Tanggal: ${dateFormatted}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Berikut daftar barang yang telah mencapai atau di bawah *batas minimum*: \n\n`;

  items.forEach((item, index) => {
    const isOut = item.stock <= 0;
    const icon = isOut ? '🔴' : '🟡';
    const status = isOut ? '*HABIS TOTAL*' : '*MENIPIS*';
    text += `${index + 1}. ${icon} *${item.name}*\n`;
    text += `   • Sisa Stok: *${item.stock} ${item.unit}* (Batas Min: ${item.minStock} ${item.unit})\n`;
    text += `   • Status: ${status}\n`;
    if (item.supplier) {
      text += `   • Rekomendasi Supplier: ${item.supplier}\n`;
    }
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚠️ *Tindakan Diperlukan:* Mohon segera buat pesanan pembelian (Purchase Order) atau koordinasikan restock.\n`;
  text += `_Notifikasi otomatis dikirim dari Sistem POS & Inventaris BUMN._`;

  const phone = sanitizeWaNumber(targetPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Export array of objects to CSV with UTF-8 BOM so Excel opens cleanly
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const bom = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row =>
      row.map(cell => {
        const val = cell === null || cell === undefined ? '' : String(cell);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(';')
    ),
  ].join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
