import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, orderBy, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, ChevronRight } from 'lucide-react';
import { useViewerStore } from '../lib/store';

export default function TestPapers() {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Aakash', 'Allen']);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Aakash');
  const [loading, setLoading] = useState(true);
  const { openViewer } = useViewerStore();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const q = query(collection(db, "tests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error: any) {
        console.error("Error fetching tests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();

    const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().categories) {
        setCategories(docSnap.data().categories);
        if (!docSnap.data().categories.includes(activeTab)) {
          setActiveTab(docSnap.data().categories[0] || '');
        }
      }
    }, (error) => {
      console.log("Settings not accessible or do not exist yet.");
    });

    return () => unsubscribeSettings();
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase());
      const matchesTab = test.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [tests, search, activeTab]);

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
      className="p-4 md:p-8 max-w-5xl mx-auto space-y-6"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 tracking-tight">Test Papers</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Browse and view all test materials</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by file name or test number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all shadow-sm text-gray-900 dark:text-white"
        />
      </motion.div>

      {/* Dynamic Tabs */}
      <motion.div variants={item} className="flex overflow-x-auto p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm relative scrollbar-hide">
        {(Array.from(new Set(categories)) as string[]).map((cat, idx) => (
          <button
            key={`tab-${idx}-${cat}`}
            onClick={() => setActiveTab(cat)}
            className={`flex-1 min-w-[120px] py-3 px-4 text-center font-semibold rounded-xl transition-all relative z-10 ${
              activeTab === cat 
                ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-indigo-600/20' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Test List */}
      <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTests.map((test) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={test.id}
                  onClick={() => openViewer(test.driveLink, test.title, test.id)}
                  className="text-left flex items-center justify-between p-4 md:p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-700 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{test.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(test.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </motion.button>
              ))}
            </div>
            {filteredTests.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400"
              >
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p>No tests found for {activeTab}.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
}
