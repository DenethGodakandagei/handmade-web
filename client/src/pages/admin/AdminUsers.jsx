import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, SlidersHorizontal, RefreshCcw, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import userService from '../../api/services/userService';
import DataTable from '../../components/DataTable';
import Spinner from '@/components/ui/Spinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch identity registry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to completely erase ${user.name} from the registry?`)) {
      try {
        await userService.delete(user._id);
        toast.success('Identity eradicated from archives');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEditRole = async (user) => {
    const newRole = prompt(`Enter new role for ${user.name} (user, artisan, admin):`, user.role);
    if (newRole && ['user', 'artisan', 'admin'].includes(newRole)) {
      try {
        await userService.update(user._id, { role: newRole });
        toast.success(`${user.name} promoted to ${newRole.toUpperCase()}`);
        fetchUsers();
      } catch (err) {
        toast.error('Failed to update clearance');
      }
    } else if (newRole) {
      toast.error('Invalid sector clearance level');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const userColumns = [
    { 
      key: 'name', 
      label: 'IDENTITY', 
      render: (val, row) => (
        <div className="flex items-center space-x-4">
           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-xs text-primary border border-gray-100 uppercase tracking-widest">
              {val[0]}
           </div>
           <div className="space-y-1">
              <p className="font-black text-sm uppercase tracking-tighter">{val}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.email}</p>
           </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'SECTOR',
      render: (val) => (
        <Badge variant="outline" className={`text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none ${val === 'admin' ? 'bg-black text-white' : val === 'artisan' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'GENESIS TIMESTAMP',
      render: (val) => (
        <div className="space-y-1">
          <span className="block text-[10px] text-gray-900 font-black uppercase tracking-widest">{new Date(val).toLocaleDateString()}</span>
          <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">{new Date(val).toLocaleTimeString()}</span>
        </div>
      )
    }
  ];

  if (loading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
              <Spinner />
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
              <h1 className="text-3xl font-light tracking-tight text-black">Identity Vault</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Access Registry</p>
          </div>
          <Button
              onClick={fetchUsers}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className="mr-2" />
              Sync Users
          </Button>
      </header>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                  placeholder="LOCATE IDENTITY..."
                  className="w-full bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <DataTable 
          columns={userColumns} 
          data={filteredUsers} 
          isLoading={loading}
          onDelete={handleDelete}
          onEdit={handleEditRole}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
