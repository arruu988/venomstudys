import { NavLink } from 'react-router-dom';
import { Home, FileText, Download, ShieldAlert, LogOut, Bot, User } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';

export default function Navigation({ isAdmin }: { isAdmin: boolean }) {
  const handleLogout = () => {
    signOut(auth);
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/tests", icon: FileText, label: "Test Papers" },
    { to: "/saved", icon: Download, label: "Saved Files" },
    { to: "/ai-chat", icon: Bot, label: "Neet Breaker AI" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  if (isAdmin) {
    navItems.push({ to: "/admin", icon: ShieldAlert, label: "Admin" });
  }

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 flex justify-around p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute bottom-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40">
        <div className="p-6 flex items-center gap-3">
          <img src="https://i.ibb.co/h14GX9Ps/IMG-20260709-200844-549.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-800 shadow-sm" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">NEET Breakers Archive</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive ? 'text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="desktop-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
