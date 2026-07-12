import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestPapers from './pages/TestPapers';
import SavedFiles from './pages/SavedFiles';
import Admin from './pages/Admin';
import AIChat from './components/AIChat';
import PDFViewerModal from './components/PDFViewerModal';
import { useThemeStore } from './lib/store';
import { Sun, Moon, Lock, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsLocked(data.isLocked === true);
      }
    }, (error) => {
      console.error("Error fetching settings:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>;
  }

  const isAdmin = user?.email === 'nottmeeeeeeeee@gmail.com' || user?.email === 'singhffrn@gmail.com';

  if (isLocked && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Site Temporarily Disabled</h1>
          <p className="text-gray-500 dark:text-gray-400">
            The site has been temporarily locked by the administrator. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Theme Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {user && <Navigation isAdmin={isAdmin} />}
      
      <div className={user ? "pb-24 pt-4 md:pt-0 md:pl-64 md:pb-0 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col" : "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col"}>
        <div className="flex-1">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/tests" element={user ? <TestPapers /> : <Navigate to="/login" />} />
            <Route path="/saved" element={user ? <SavedFiles /> : <Navigate to="/login" />} />
            
            {/* Admin Route - Only accessible by specific email */}
            <Route path="/admin" element={user && isAdmin ? <Admin /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>

      {user && <AIChat />}
      <PDFViewerModal />
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
