import React from 'react';
import { Settings, RefreshCcw, Database, ShieldCheck, HardDrive, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

import DashboardHeader from '../../components/dashboard/DashboardHeader';

const AdminSettings = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <DashboardHeader title="System Heart" subtitle="Core Configuration Phase" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        <div className="card-premium p-10 bg-white border border-gray-100 rounded-3xl relative overflow-hidden group shadow-xl shadow-black/5">
           <div className="space-y-6">
             <Database size={24} className="text-primary" />
             <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-black">Database Integrity</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Run periodic garbage collection</p>
             </div>
             <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest border-gray-200">
                <RefreshCcw size={14} className="mr-2" /> Clean Cache
             </Button>
           </div>
        </div>

        <div className="card-premium p-10 bg-white border border-gray-100 rounded-3xl relative overflow-hidden group shadow-xl shadow-black/5">
           <div className="space-y-6">
             <ShieldCheck size={24} className="text-primary" />
             <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-black">Security Protocol</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Audit and rotate auth tokens</p>
             </div>
             <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50">
                <KeyRound size={14} className="mr-2" /> Force Global Logout
             </Button>
           </div>
        </div>

        <div className="card-premium p-10 bg-black text-white rounded-3xl relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
           <div className="relative space-y-6">
             <HardDrive size={24} className="text-primary" />
             <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-white">Instance Management</h3>
               <p className="text-[10px] font-medium text-gray-400 uppercase mt-2">Server runtime overrides</p>
             </div>
             <Button className="btn-artisan w-full text-[9px] font-black uppercase tracking-widest">
                Restart Telemetry
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
