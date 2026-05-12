import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield, User, Key, Search } from 'lucide-react';
import { toast } from 'sonner';

import { adminManagementApi, roleManagementApi } from '../../../api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const AdminTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [perPage] = useState(10);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-management', { page, per_page: perPage, search: debouncedSearch }],
    queryFn: () => adminManagementApi.getAll({
      page,
      per_page: perPage,
      search: debouncedSearch || undefined,
    }).then(res => res.data.data),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['role-management'],
    queryFn: () => roleManagementApi.getAll().then((res) => res.data.data),
  });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as number[],
  });

  const handleRoleChange = (roleId: number) => {
    setFormData(prev => {
      const isSelected = prev.roles.includes(roleId);
      if (isSelected) {
        return { ...prev, roles: prev.roles.filter(r => r !== roleId) };
      } else {
        return { ...prev, roles: [...prev.roles, roleId] };
      }
    });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedAdminId(null);
    setFormData({ name: '', email: '', password: '', roles: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (admin: any) => {
    setIsEditMode(true);
    setSelectedAdminId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      roles: admin.roles?.map((r: any) => r.id) || [],
    });
    setIsModalOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminManagementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-management'] });
      toast.success('Admin berhasil ditambahkan');
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menambah admin')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => adminManagementApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-management'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal memperbarui admin')
  });

  const syncRolesMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { roles: number[] } }) => adminManagementApi.syncRoles(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-management'] }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      toast.error('Pilih setidaknya satu role');
      return;
    }

    if (isEditMode && selectedAdminId) {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;
      delete payload.roles; // Roles are handled separately
      
      try {
        await updateMutation.mutateAsync({ id: selectedAdminId, data: payload });
        await syncRolesMutation.mutateAsync({ id: selectedAdminId, data: { roles: formData.roles } });
        toast.success('Admin berhasil diperbarui');
        setIsModalOpen(false);
      } catch (e) {
        // Error handling inside mutations
      }
    } else {
      if (!formData.password) {
        toast.error('Password wajib diisi untuk admin baru');
        return;
      }
      createMutation.mutate(formData);
    }
  };

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminManagementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-management'] });
      toast.success('Admin berhasil dihapus');
      setDeleteConfirmOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menghapus admin')
  });

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="w-full sm:w-80"
          />
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Tambah Admin Baru
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Roles (Akses)</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data?.map((admin: any) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {admin.roles?.map((role: any) => (
                          <span key={role.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                            <Shield className="w-3 h-3" /> {role.display_name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => openEditModal(admin)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(admin.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada admin ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="mt-4 flex justify-between items-center bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-sm text-gray-700">
            Total {data.meta.total} pengguna
          </span>
          <Pagination 
            currentPage={page}
            lastPage={data.meta.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Admin' : 'Tambah Admin Baru'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Lengkap"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            leftIcon={<User className="w-4 h-4 text-gray-500" />}
          />
          <Input
            label="Alamat Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            leftIcon={<User className="w-4 h-4 text-gray-500" />}
          />
          <Input
            label={isEditMode ? 'Password (Kosongkan jika tidak ingin mengubah)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!isEditMode}
            leftIcon={<Key className="w-4 h-4 text-gray-500" />}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Penetapan Akses (Roles) <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 border rounded-lg max-h-48 overflow-y-auto">
              {rolesData?.map((role: any) => (
                <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{role.display_name}</span>
                </label>
              ))}
              {!rolesData && (
                <span className="text-sm text-gray-500">Memuat roles...</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Pilih role sesuai bidang tugas untuk membatasi akses pada menu sidebar.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending || syncRolesMutation.isPending}>
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Admin'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => idToDelete && deleteMutation.mutate(idToDelete)}
        title="Hapus Admin"
        message="Apakah Anda yakin ingin menghapus akun admin ini? Tindakan ini dapat memengaruhi histori input data."
        confirmText="Hapus"
      />
    </div>
  );
};

export default AdminTab;