import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, FileText, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useViewerStore } from '../lib/store';

export default function Dashboard() {
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState<any[]>([]);
  const { openViewer } = useViewerStore();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const q = query(collection(db, "tests"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        setRecentTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error: any) {
        console.error("Error fetching recent tests:", error);
      }
    };
    
    fetchRecent();

    const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBroadcastMessage(data.broadcastMessage || '');
        setBroadcastActive(data.broadcastActive === true);
        if (data.dashboardAnnouncements) {
          setDashboardAnnouncements(data.dashboardAnnouncements);
        } else {
          // Fallback if not populated yet
          setDashboardAnnouncements([
            { id: '1', isNew: true, time: 'Today', text: 'NEET 2026 Test Series schedule has been updated. Check the new dates!' },
            { id: '2', isNew: false, time: '2 days ago', text: 'Aakash Major Test 3 syllabus uploaded in the test section.' }
          ]);
        }
      }
    }, (error) => {
      console.log("Settings not accessible or do not exist yet.");
    });

    return () => unsubscribeSettings();
  }, []);

  const container = {
    hidden: { opacity: 0, transition: { duration: 0.2 } },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
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
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to NEET Breakers Archive Platform</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Announcements</h2>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {broadcastActive && broadcastMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-md">LIVE UPDATE</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Just now</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{broadcastMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {dashboardAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  {announcement.isNew && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-md">NEW</span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {announcement.time}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{announcement.text}</p>
              </div>
            ))}
            
            {dashboardAnnouncements.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No announcements right now.</p>
            )}
          </div>
        </motion.div>

        {/* Recently Uploaded */}
        <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Uploaded</h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {recentTests.map((test) => (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={test.id}
                onClick={() => openViewer(test.driveLink, test.title, test.id)}
                className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{test.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{test.type}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </motion.button>
            ))}
            {recentTests.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent uploads</p>
            )}
          </div>
          
          <Link to="/tests" className="mt-4 block text-center py-3 bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            View All Test Papers
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
