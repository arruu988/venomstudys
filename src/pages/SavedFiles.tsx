import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, Trash2, ArrowRight } from 'lucide-react';
import { useViewerStore } from '../lib/store';

export default function SavedFiles() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { openViewer } = useViewerStore();

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "users", auth.currentUser.uid, "history"),
        orderBy("viewedAt", "desc")
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "history", id));
    fetchHistory();
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
      className="p-4 md:p-8 max-w-5xl mx-auto space-y-6"
    >
      <motion.div variants={itemAnim} className="mb-8">
        <h1 className="text-3xl font-bold text-gradient-brand tracking-tight">Saved & Recent Files</h1>
        <p className="text-gray-500 mt-1">Your recently viewed test papers</p>
      </motion.div>

      <motion.div variants={itemAnim} className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-purple/30 transition-colors shadow-sm group cursor-pointer"
                  onClick={() => openViewer(item.testDetails.driveLink, item.testDetails.title, item.testDetails.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-gray-500">Viewed: {new Date(item.viewedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleRemove(e, item.id)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-3 bg-brand-purple/10 text-brand-purple rounded-xl hidden md:block">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {history.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 text-gray-500"
              >
                <Download className="w-12 h-12 text-gray-300 mb-3" />
                <p>You haven't viewed any files yet.</p>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
