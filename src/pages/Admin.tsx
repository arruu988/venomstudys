import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Plus, Trash2, ShieldAlert, Users, Lock, Unlock, Loader2, Activity, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const [tests, setTests] = useState<any[]>([]);
  const [newTest, setNewTest] = useState({ title: '', type: '', driveLink: '' });
  const [categories, setCategories] = useState<string[]>(['Aakash', 'Allen']);
  const [newCategory, setNewCategory] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0 });
  const [loading, setLoading] = useState(false);
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ text: '', time: 'Today', isNew: false });

  const fetchTests = async () => {
    try {
      const q = query(collection(db, "tests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      console.error("Error fetching tests:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Basic count fallback since getCountFromServer may fail due to rules
      const usersSnap = await getDocs(collection(db, "users"));
      const testsSnap = await getDocs(collection(db, "tests"));
      setStats({
        totalUsers: usersSnap.docs.length,
        totalTests: testsSnap.docs.length
      });
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchStats();

    const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsLocked(data.isLocked || false);
        setBroadcastMessage(data.broadcastMessage || '');
        setBroadcastActive(data.broadcastActive || false);
        if (data.categories) {
          setCategories(data.categories);
        }
        if (data.dashboardAnnouncements) {
          setDashboardAnnouncements(data.dashboardAnnouncements);
        }
      } else {
        // Initialize settings if they don't exist
        const defaultAnnouncements = [
          { id: '1', isNew: true, time: 'Today', text: 'NEET 2026 Test Series schedule has been updated. Check the new dates!' },
          { id: '2', isNew: false, time: '2 days ago', text: 'Aakash Major Test 3 syllabus uploaded in the test section.' }
        ];
        
        setDoc(doc(db, "settings", "general"), {
          isLocked: false,
          categories: ['Aakash', 'Allen', 'PW'],
          broadcastMessage: '',
          broadcastActive: false,
          dashboardAnnouncements: defaultAnnouncements
        });
      }
    }, (error) => {
      console.log("Settings not accessible or do not exist yet.");
    });

    return () => unsubscribeSettings();
  }, []);

  const handleToggleLock = async () => {
    try {
      await setDoc(doc(db, "settings", "general"), { isLocked: !isLocked }, { merge: true });
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert("Permission denied or error updating settings");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const updatedCategories = [...categories, newCategory.trim()];
      await setDoc(doc(db, "settings", "general"), { categories: updatedCategories }, { merge: true });
      setNewCategory('');
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleRemoveCategory = async (catToRemove: string) => {
    try {
      const updatedCategories = categories.filter(c => c !== catToRemove);
      await setDoc(doc(db, "settings", "general"), { categories: updatedCategories }, { merge: true });
    } catch (error) {
      console.error("Error removing category:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "tests"), {
        ...newTest,
        createdAt: new Date().toISOString()
      });
      setNewTest({ title: '', type: categories[0] || '', driveLink: '' });
      fetchTests();
      fetchStats();
      toast.success("Paper uploaded successfully!");
    } catch (error: any) {
      toast.error("Error adding test: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      try {
        await deleteDoc(doc(db, "tests", id));
        fetchTests();
        fetchStats();
        toast.success("Paper deleted successfully!");
      } catch (error: any) {
        toast.error("Error deleting test: " + error.message);
      }
    }
  };

  const handleUpdateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "general"), { 
        broadcastMessage, 
        broadcastActive 
      }, { merge: true });
      toast.success("Announcement settings updated!");
    } catch (error: any) {
      toast.error("Error updating announcement: " + error.message);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.text.trim()) return;
    try {
      const updated = [{
        id: Date.now().toString(),
        ...newAnnouncement
      }, ...dashboardAnnouncements];
      await setDoc(doc(db, "settings", "general"), { dashboardAnnouncements: updated }, { merge: true });
      setNewAnnouncement({ text: '', time: 'Today', isNew: false });
      toast.success("Dashboard announcement added!");
    } catch (error: any) {
      toast.error("Error adding announcement: " + error.message);
    }
  };

  const handleRemoveAnnouncement = async (id: string) => {
    try {
      const updated = dashboardAnnouncements.filter(a => a.id !== id);
      await setDoc(doc(db, "settings", "general"), { dashboardAnnouncements: updated }, { merge: true });
      toast.success("Announcement removed!");
    } catch (error: any) {
      toast.error("Error removing announcement: " + error.message);
    }
  };

  const uniqueCategories: string[] = Array.from(new Set(categories));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage site settings, categories, and test papers</p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Tests</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTests}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Site Access Control</p>
          <button
            onClick={handleToggleLock}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
              isLocked 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
            }`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            {isLocked ? 'Site Locked (Unlock)' : 'Site Active (Lock Site)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Forms */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Announcement Message */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Announcement Message</h2>
            <form onSubmit={handleUpdateBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                  placeholder="Enter an announcement for the dashboard..."
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={broadcastActive}
                    onChange={e => setBroadcastActive(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Update Announcement
              </button>
            </form>
          </div>

          {/* Dashboard Announcements (Static List) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Announcements</h2>
            
            <form onSubmit={handleAddAnnouncement} className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Message text..."
                value={newAnnouncement.text}
                onChange={e => setNewAnnouncement({...newAnnouncement, text: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Time (e.g. Today)"
                  value={newAnnouncement.time}
                  onChange={e => setNewAnnouncement({...newAnnouncement, time: e.target.value})}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <label className="flex items-center gap-2 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.isNew}
                    onChange={e => setNewAnnouncement({...newAnnouncement, isNew: e.target.checked})}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Tag</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Add Announcement
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {dashboardAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl relative group">
                  <div className="flex items-center gap-2 mb-1">
                    {announcement.isNew && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded">NEW</span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{announcement.time}</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium pr-8">{announcement.text}</p>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveAnnouncement(announcement.id)}
                    className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {dashboardAnnouncements.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No announcements added.</p>
              )}
            </div>
          </div>

          {/* Manage Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Slots</h2>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New slot (e.g. PW)"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </form>

            <div className="space-y-2">
              {uniqueCategories.map((cat, idx) => (
                <div key={`cat-${idx}`} className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No slots defined.</p>
              )}
            </div>
          </div>

          {/* Add New Test */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload New Paper</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTest.title}
                  onChange={e => setNewTest({...newTest, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Minor Test 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type / Slot</label>
                <select
                  required
                  value={newTest.type}
                  onChange={e => setNewTest({...newTest, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select slot</option>
                  {uniqueCategories.map((cat, idx) => (
                    <option key={`opt-${idx}-${cat}`} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Drive PDF Link</label>
                <input
                  type="url"
                  required
                  value={newTest.driveLink}
                  onChange={e => setNewTest({...newTest, driveLink: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Add Paper
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-[800px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Uploaded Papers</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {tests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg">
                        {test.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] md:max-w-xs">
                        {test.driveLink}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {tests.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>No tests found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
