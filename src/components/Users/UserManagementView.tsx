import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Key,
  Phone,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onSelectUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'cashier' as UserRole,
    pin: '1234',
    phone: '',
    avatarColor: 'bg-indigo-600',
  });

  const isSuperAdmin = currentUser.role === 'owner';

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      role: 'cashier',
      pin: '1234',
      phone: '',
      avatarColor: 'bg-emerald-600',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      role: user.role,
      pin: user.pin,
      phone: user.phone || '',
      avatarColor: user.avatarColor,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) {
      alert('Nama dan username wajib diisi!');
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData,
      });
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif!');
      return;
    }
    if (confirm(`Yakin ingin menghapus staf "${name}"?`)) {
      onDeleteUser(id);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'Pemilik / Super Admin';
      case 'manager': return 'Manajer Toko';
      case 'cashier': return 'Kasir Frontliner';
      default: return role;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'manager':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'cashier':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };

  // Matrix of permissions
  const permissions = [
    { feature: 'Sistem Kasir & Transaksi POS', owner: true, manager: true, cashier: true },
    { feature: 'Scan Barcode Kamera & USB', owner: true, manager: true, cashier: true },
    { feature: 'Penerimaan QRIS, Tunai & E-Wallet', owner: true, manager: true, cashier: true },
    { feature: 'Cetak & Unduh Struk Belanja', owner: true, manager: true, cashier: true },
    { feature: 'Melihat Katalog & Stok Fisik', owner: true, manager: true, cashier: true },
    { feature: 'Input Restock & Opname Barang', owner: true, manager: true, cashier: false },
    { feature: 'Ubah Harga Jual & Harga Modal HPP', owner: true, manager: true, cashier: false },
    { feature: 'Kirim Notifikasi Stok via WhatsApp', owner: true, manager: true, cashier: false },
    { feature: 'Dasbor Analitik & Grafik Penjualan', owner: true, manager: true, cashier: false },
    { feature: 'Ekspor Akuntansi ke Excel (.CSV) & PDF', owner: true, manager: true, cashier: false },
    { feature: 'Manajemen Staf & Hak Akses Peran', owner: true, manager: false, cashier: false },
    { feature: 'Sinkronisasi Cloud & Backup Database', owner: true, manager: false, cashier: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Manajemen Akun Staf & Hak Akses Berbasis Peran
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur peran pengguna (Owner, Manajer, Kasir) untuk membatasi fitur sensitif seperti laba rugi dan harga modal
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan Baru</span>
          </button>
        )}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u) => {
          const isActive = u.id === currentUser.id;

          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-2xl ${u.avatarColor} text-white font-extrabold text-lg flex items-center justify-center shadow`}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {u.name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400">
                      @{u.username}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                    u.role
                  )}`}
                >
                  {getRoleLabel(u.role)}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Key className="w-3.5 h-3.5" /> PIN Kasir:
                  </span>
                  <span className="font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200">
                    {u.pin}
                  </span>
                </div>
                {u.phone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Phone className="w-3.5 h-3.5" /> No. WhatsApp:
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {u.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectUser(u)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isActive ? '✓ Sedang Masuk' : 'Beralih Akun'}
                </button>

                {isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      title="Edit Staf"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        title="Hapus Staf"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Matriks Hak Akses & Pembatasan Fitur (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Peran Kasir hanya dapat melayani transaksi belanja dan melihat stok untuk melindungi data finansial dan akuntansi rahasia
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fitur / Modul Sistem BUMN</th>
                <th className="py-2.5 px-3 text-center">Pemilik (Renaldi)</th>
                <th className="py-2.5 px-3 text-center">Manajer (Budi)</th>
                <th className="py-2.5 px-3 text-center">Kasir (Siti)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {p.feature}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.owner ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.manager ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.cashier ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 mx-auto opacity-40" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {editingUser ? 'Edit Data Karyawan' : 'Tambah Staf Karyawan Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Staf <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Anton Silaban"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Contoh: anton"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peran / Hak Akses (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="cashier">Kasir Frontliner (POS & Struk)</option>
                  <option value="manager">Manajer Toko (Inventaris & Laporan)</option>
                  <option value="owner">Pemilik / Super Admin (Akses Mutlak)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Kasir (4 Digit)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center tracking-widest font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
