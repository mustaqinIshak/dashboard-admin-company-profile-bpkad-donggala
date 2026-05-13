import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { roleManagementApi } from '../../../api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const RoleTab: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['role-management'],
    queryFn: () => roleManagementApi.getAll().then((res) => res.data.data),
  });

  const { data: permissionsData } = useQuery({
    queryKey: ['permissions-list'],
    queryFn: () => roleManagementApi.getPermissions().then((res) => res.data.data),
  });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as number[],
  });

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedRoleId(null);
    setFormData({ name: '', display_name: '', description: '', permissions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setIsEditMode(true);
    setSelectedRoleId(role.id);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      permissions: role.permissions?.map((p: any) => p.id) || [],
    });
    setIsModalOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => roleManagementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-management'] });
      toast.success('Role berhasil ditambahkan');
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menambah role'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => roleManagementApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-management'] });
      toast.success('Role berhasil diperbarui');
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal memperbarui role'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && selectedRoleId) {
      updateMutation.mutate({ id: selectedRoleId, data: { display_name: formData.display_name, description: formData.description, permissions: formData.permissions } });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleManagementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-management'] });
      toast.success('Role berhasil dihapus');
      setDeleteConfirmOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Gagal menghapus role'),
  });

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handlePermissionToggle = (permId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Role</h2>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Role Baru
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
                  <th className="px-6 py-4">Nama Role</th>
                  <th className="px-6 py-4">Kode (Name)</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Jumlah Admin</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.map((role: any) => (
                  <tr key={role.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      {role.display_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{role.name}</td>
                    <td className="px-6 py-4 text-gray-600">{role.description || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {role.admins_count || 0} Pengguna
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => openEditModal(role)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(role.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!data || data.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data role
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Role' : 'Tambah Role Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditMode && (
            <Input
              label="Kode Role (Name)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="contoh: super_admin"
            />
          )}
          <Input
            label="Nama Tampilan (Display Name)"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            required
            placeholder="contoh: Super Admin"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Penjelasan hak akses role ini"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border border-gray-200 p-3 rounded-md bg-gray-50">
              {permissionsData?.map((perm: any) => (
                <label key={perm.id} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.id)}
                    onChange={() => handlePermissionToggle(perm.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <strong>{perm.name}</strong> 
                    <span className="text-gray-500 text-xs ml-1 block">{perm.description}</span>
                  </span>
                </label>
              ))}
              {(!permissionsData || permissionsData.length === 0) && (
                <div className="text-sm text-gray-500 col-span-full text-center py-2">
                  Tidak ada permission yang tersedia
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {isEditMode ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => idToDelete && deleteMutation.mutate(idToDelete)}
        title="Hapus Role"
        message="Apakah Anda yakin ingin menghapus role ini? Pastikan tidak ada admin yang masih terkait dengan role ini."
        confirmText="Hapus"
      />
    </div>
  );
};

export default RoleTab;