import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import useAuthStore from '../../store/authStore';

const AdminLayout = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="flex bg-[#F9F9F9] min-h-screen">
      <Sidebar role={user?.role} />
      <main className="flex-1 px-8 lg:px-12 py-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
