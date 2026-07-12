import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, Activity, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useViewerStore } from '../lib/store';

export default function Profile() {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const { openViewer } = useViewerStore();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "users", auth.currentUser.uid, "history"),
          orderBy("viewedAt", "desc"),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const testsSnapshot = await getDocs(collection(db, "tests"));
        const allTests = new Map(testsSnapshot.docs.map(d => [d.id, d.data()]));
        
        const enrichedHistory = historyData.map((h: any) => ({
          ...h,
          testDetails: allTests.get(h.testId)
        })).filter((h: any) => h.testDetails);
        
        setHistory(enrichedHistory);
      } catch (error: any) {
        console.error("Error fetching history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0, transition: { duration: 0.2 } },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="p-4 md:p-8 max-w-5xl mx-auto space-y-8"
    >
      <motion.div variants={itemAnim}>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 tracking-tight">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and view activity.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={itemAnim} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Info</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={auth.currentUser?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !displayName.trim() || displayName === auth.currentUser?.displayName}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70 mt-4"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        <motion.div variants={itemAnim} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>

          <div className="space-y-3">
            {historyLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading activity...</div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => openViewer(item.testDetails.driveLink, item.testDetails.title, item.testDetails.id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.testDetails.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Viewed on {new Date(item.viewedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity to show.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
