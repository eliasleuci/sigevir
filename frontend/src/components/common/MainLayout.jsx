import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-blue-50 font-sans antialiased text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>

        <footer className="py-4 sm:py-6 px-4 sm:px-8 border-t border-gray-100 text-center text-sm text-gray-400 font-medium">
          SIGEVIR © {new Date().getFullYear()} - Sistema de Gestión de Vehículos Retenidos
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
