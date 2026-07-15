import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Shield, IdCard, Calculator, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Inicio', icon: HomeIcon, path: '/' },
    { id: 'admin', label: 'Administración', icon: Shield, path: '/admin' },
    { id: 'employee', label: 'Actividades', icon: IdCard, path: '/employee' },
    { id: 'sales', label: 'Ventas', icon: Calculator, path: '/sales' },
  ];

  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE] text-[#1A1C1E] overflow-hidden">
      {/* Header */}
      {!isSettingsPage && (
        <header className="bg-[#001540] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-4">
            <h1 
              onClick={() => navigate('/')}
              className="text-xl font-bold tracking-tight cursor-pointer hover:text-white/80 active:scale-98 transition-all"
            >
              Frutería Axel
            </h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#F0F2F9] border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-8 shrink-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-[#001540]' : 'text-gray-500'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-[#DCE1F9]' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
