import React from 'react';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';

const DashboardLayout = ({ children }) => {
  const { user } = useAuthStore();
  
  return (
    <div className="flex bg-[#F9F9F9] min-h-screen">
      <Sidebar role={user?.role} />
      <main className="flex-1 px-8 lg:px-12 py-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
