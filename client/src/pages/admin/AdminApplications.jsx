import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, SlidersHorizontal, RefreshCcw, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import authService from '../../api/services/authService';
import DataTable from '../../components/DataTable';
import Spinner from '@/components/ui/Spinner';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllApplications();
      setApplications(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (application) => {
    // We'll implement a modal/popup here for now just show info
    alert(JSON.stringify(application, null, 2));
  };

  const handleApprove = async (application) => {
    if (window.confirm(`Are you sure you want to approve ${application.name}'s application?`)) {
      try {
        await authService.approveApplication(application._id);
        toast.success(`${application.name}'s application approved!`);
        fetchApplications();
      } catch (err) {
        toast.error('Failed to approve application');
      }
    }
  };

  const handleReject = async (application) => {
    if (window.confirm(`Are you sure you want to reject ${application.name}'s application?`)) {
      try {
        await authService.rejectApplication(application._id);
        toast.success(`${application.name}'s application rejected.`);
        fetchApplications();
      } catch (err) {
        toast.error('Failed to reject application');
      }
    }
  };

  const filteredApplications = applications.filter(app =>
    app.name?.toLowerCase().includes(search.toLowerCase()) ||
    app.email?.toLowerCase().includes(search.toLowerCase())
  );

  const applicationColumns = [
    {
      key: 'name',
      label: 'APPLICANT',
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
      key: 'studioName',
      label: 'STUDIO',
      render: (val) => (
        <span className="text-[9px] font-black uppercase tracking-widest">{val || '-'}</span>
      )
    },
    {
      key: 'category',
      label: 'CATEGORY',
      render: (val) => (
        <Badge variant="outline" className="text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none bg-gray-100 text-gray-500">
          {val || '-' }
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'APPLIED',
      render: (val) => (
        <div className="space-y-1">
          <span className="block text-[10px] text-gray-900 font-black uppercase tracking-widest">{new Date(val).toLocaleDateString()}</span>
          <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">{new Date(val).toLocaleTimeString()}</span>
        </div>
      )
    },
    {
      key: 'sellerRequestStatus',
      label: 'STATUS',
      render: (val) => (
        <Badge
          variant={val === 'pending' ? 'outline' : 'secondary'}
          className={`text-[8px] h-5 px-3 uppercase font-black border-none ${val === 'pending' ? 'bg-primary/10 text-primary' : val === 'approved' ? 'bg-black text-white' : 'bg-red-100 text-red-500'}`}
        >
          {val.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (_, row) => (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(row)}
            className="hover:bg-gray-50"
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleApprove(row)}
            className="bg-primary text-white px-3 py-1.5 text-xs rounded-none hover:bg-primary/90"
            disabled={row.sellerRequestStatus !== 'pending'}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleReject(row)}
            className="bg-red-50 text-red-600 px-3 py-1.5 text-xs rounded-none hover:bg-red-100 hover:text-red-600"
            disabled={row.sellerRequestStatus !== 'pending'}
          >
            Reject
          </Button>
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
              <h1 className="text-3xl font-light tracking-tight text-black">Application Vault</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Pending Registrations</p>
          </div>
          <Button
              onClick={fetchApplications}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className="mr-2" />
              Sync Applications
          </Button>
      </header>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                  placeholder="LOCATE APPLICANT..."
                  className="w-full bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <DataTable
          columns={applicationColumns}
          data={filteredApplications}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default AdminApplications;