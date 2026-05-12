import React, { useState } from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import AdminTab from './components/AdminTab';
import RoleTab from './components/RoleTab';

const AdminManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'role'>('admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Admin & Role</h1>
        <p className="text-gray-500">Kelola pengguna sistem dan hak akses (RBAC)</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Kelola Admin
          </button>
          <button
            onClick={() => setActiveTab('role')}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'role'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Kelola Role
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'admin' && <AdminTab />}
        {activeTab === 'role' && <RoleTab />}
      </div>
    </div>
  );
};

export default AdminManagementPage;