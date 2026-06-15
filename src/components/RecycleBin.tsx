import React, { useState, useEffect } from 'react';
import { ArrowRight, Trash2, RefreshCw, AlertTriangle, FolderOpen, Users, BookOpen, CreditCard, UserCog, GraduationCap, FileText, X, RotateCcw, Clock, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecycleBinProps {
  onBack: () => void;
}

export interface DeletedItem {
  id: string;
  originalId: string;
  module: string;
  moduleName: string;
  itemName: string;
  data: any;
  deletedAt: number; // timestamp
  expiresAt: number; // timestamp (7 days after deletion)
  deletedBy?: string;
}

const RECYCLE_BIN_KEY = 'recycle_bin';
const DAYS_7 = 7 * 24 * 60 * 60 * 1000;

// Module definitions with icons and colors
const MODULE_CONFIG: Record<string, { name: string; icon: React.ElementType; color: string; bgColor: string; restoreKey: string }> = {
  students: {
    name: 'طالب علم',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    restoreKey: 'students'
  },
  staff: {
    name: 'عملہ (اساتذہ)',
    icon: UserCog,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    restoreKey: 'staff'
  },
  grades: {
    name: 'تعلیمی امور (درجے)',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    restoreKey: 'grades_list'
  },
  books: {
    name: 'کتب',
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    restoreKey: 'books_list'
  },
  finance: {
    name: 'مالیاتی لین دین',
    icon: CreditCard,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    restoreKey: 'fin_transactions'
  },
  exams: {
    name: 'نتائج / امتحانات',
    icon: FileText,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
    restoreKey: 'all_exam_results'
  },
};

// Helper to get all recycle bin items
export const getRecycleBinItems = (): DeletedItem[] => {
  try {
    const data = localStorage.getItem(RECYCLE_BIN_KEY);
    if (!data) return [];
    const items: DeletedItem[] = JSON.parse(data);
    const now = Date.now();
    // Filter out expired items
    return items.filter(item => item.expiresAt > now);
  } catch {
    return [];
  }
};

// Helper to add item to recycle bin
export const addToRecycleBin = (module: string, item: any, itemNameField = 'name') => {
  try {
    const existing = getRecycleBinItems();
    const now = Date.now();
    const config = MODULE_CONFIG[module];
    
    const deletedItem: DeletedItem = {
      id: `rb-${now}-${Math.random().toString(36).substr(2, 9)}`,
      originalId: String(item.id || item._id || ''),
      module,
      moduleName: config?.name || module,
      itemName: item[itemNameField] || item.name || item.title || item.urduName || 'نامعلوم',
      data: item,
      deletedAt: now,
      expiresAt: now + DAYS_7,
      deletedBy: localStorage.getItem('currentUserRole') || 'Admin'
    };

    const updated = [...existing, deletedItem];
    localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add to recycle bin:', e);
  }
};

// Helper to remove from recycle bin
export const removeFromRecycleBin = (rbId: string) => {
  const existing = getRecycleBinItems();
  const updated = existing.filter(item => item.id !== rbId);
  localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(updated));
};

// Helper to restore item
export const restoreFromRecycleBin = (rbItem: DeletedItem): boolean => {
  try {
    const config = MODULE_CONFIG[rbItem.module];
    if (!config) return false;
    
    const existingRaw = localStorage.getItem(config.restoreKey);
    const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    // Avoid duplicates
    const alreadyExists = existing.some(e => String(e.id) === String(rbItem.originalId));
    if (alreadyExists) return false;
    
    existing.push(rbItem.data);
    localStorage.setItem(config.restoreKey, JSON.stringify(existing));
    removeFromRecycleBin(rbItem.id);
    return true;
  } catch (e) {
    console.error('Failed to restore:', e);
    return false;
  }
};

function getTimeLeft(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'میعاد ختم';
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days} دن باقی`;
  return `${hours} گھنٹے باقی`;
}

function getUrgencyColor(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  const days = diff / (24 * 60 * 60 * 1000);
  if (days < 1) return 'text-red-500 bg-red-50';
  if (days < 3) return 'text-orange-500 bg-orange-50';
  return 'text-emerald-600 bg-emerald-50';
}

const RecycleBin: React.FC<RecycleBinProps> = ({ onBack }) => {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const loadItems = () => {
    const data = getRecycleBinItems();
    // Sort by deletedAt desc
    data.sort((a, b) => b.deletedAt - a.deletedAt);
    setItems(data);
  };

  useEffect(() => {
    loadItems();
    // Auto-refresh every minute to update time-left
    const interval = setInterval(loadItems, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get module counts
  const moduleCounts = items.reduce((acc, item) => {
    acc[item.module] = (acc[item.module] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredItems = selectedModule === 'all' ? items : items.filter(i => i.module === selectedModule);

  const handleRestore = (item: DeletedItem) => {
    const success = restoreFromRecycleBin(item);
    if (success) {
      setShowRestoreSuccess(item.itemName);
      loadItems();
      setTimeout(() => setShowRestoreSuccess(null), 2500);
    } else {
      alert('یہ ریکارڈ پہلے سے موجود ہے یا واپس نہیں لایا جا سکتا۔');
    }
  };

  const handlePermanentDelete = (rbId: string) => {
    removeFromRecycleBin(rbId);
    setConfirmDelete(null);
    setShowDeleteSuccess(true);
    loadItems();
    setTimeout(() => setShowDeleteSuccess(false), 2000);
  };

  const handleEmptyBin = () => {
    if (confirm('کیا آپ واقعی ریسائیکل بن خالی کرنا چاہتے ہیں؟ تمام ڈیٹا مستقل طور پر ختم ہو جائے گا!')) {
      const filtered = items.filter(i => selectedModule !== 'all' && i.module !== selectedModule);
      localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(filtered));
      loadItems();
    }
  };

  const modulesPresent = Object.keys(moduleCounts);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      {/* Toast Notifications */}
      <AnimatePresence>
        {showRestoreSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>"{showRestoreSuccess}" کامیابی سے واپس لایا گیا!</span>
          </motion.div>
        )}
        {showDeleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>ریکارڈ مستقل طور پر ختم کر دیا گیا</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">مستقل حذف</h3>
                  <p className="text-sm text-slate-500">یہ عمل واپس نہیں ہو سکتا</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">کیا آپ یہ ریکارڈ ہمیشہ کے لیے ختم کرنا چاہتے ہیں؟</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePermanentDelete(confirmDelete)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  ہاں، ختم کریں
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  منسوخ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-l from-slate-800 to-slate-900 text-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-all font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>ڈیش بورڈ</span>
            </button>
            {items.length > 0 && (
              <button
                onClick={handleEmptyBin}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-200 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>بن خالی کریں</span>
              </button>
            )}
            <button
              onClick={loadItems}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-2xl font-bold">ریسائیکل بن</h1>
              <p className="text-white/60 text-xs">Recycle Bin - حذف شدہ ریکارڈز</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-200 text-sm">
            حذف شدہ ریکارڈز <span className="font-bold text-white">7 دن</span> تک یہاں محفوظ رہتے ہیں۔ اس کے بعد خودکار مستقل طور پر ختم ہو جاتے ہیں۔
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Module Folders */}
        <div className="w-72 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0 shadow-sm">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">فولڈرز</h3>
            
            {/* All Items */}
            <button
              onClick={() => setSelectedModule('all')}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all ${selectedModule === 'all' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                <span className="font-bold text-sm">تمام ریکارڈز</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedModule === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {items.length}
              </span>
            </button>

            <div className="h-px bg-slate-100 my-3" />

            {/* Module Folders */}
            {Object.entries(MODULE_CONFIG).map(([moduleKey, config]) => {
              const count = moduleCounts[moduleKey] || 0;
              const Icon = config.icon;
              const isActive = selectedModule === moduleKey;
              return (
                <button
                  key={moduleKey}
                  onClick={() => setSelectedModule(moduleKey)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all ${isActive ? 'bg-slate-800 text-white' : count === 0 ? 'opacity-40 hover:opacity-60 hover:bg-slate-50 text-slate-500' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{config.name}</span>
                  </div>
                  {count > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {modulesPresent.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">ریسائیکل بن خالی ہے</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-10 h-10 opacity-40" />
                </div>
                <h3 className="text-lg font-bold text-slate-500 mb-2">یہ فولڈر خالی ہے</h3>
                <p className="text-sm text-slate-400">اس قسم کا کوئی حذف شدہ ریکارڈ موجود نہیں</p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-700 font-bold text-base">
                  {selectedModule === 'all' ? 'تمام حذف شدہ ریکارڈز' : MODULE_CONFIG[selectedModule]?.name || selectedModule}
                  <span className="text-slate-400 font-normal text-sm mr-2">({filteredItems.length} ریکارڈ)</span>
                </h2>
              </div>

              {filteredItems.map((item) => {
                const config = MODULE_CONFIG[item.module] || {
                  name: item.module,
                  icon: FolderOpen,
                  color: 'text-slate-600',
                  bgColor: 'bg-slate-50 border-slate-200',
                  restoreKey: item.module
                };
                const Icon = config.icon;
                const timeLeft = getTimeLeft(item.expiresAt);
                const urgencyColor = getUrgencyColor(item.expiresAt);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${config.bgColor}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border ${config.bgColor}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{item.itemName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.color} bg-white`}>
                              {config.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(item.deletedAt).toLocaleDateString('ur-PK')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${urgencyColor}`}>
                          <Clock className="w-3 h-3 inline ml-1" />
                          {timeLeft}
                        </span>
                        
                        <button
                          onClick={() => handleRestore(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          title="واپس لائیں"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          واپس لائیں
                        </button>
                        
                        <button
                          onClick={() => setConfirmDelete(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all"
                          title="مستقل حذف کریں"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Data Preview */}
                    <div className="mt-3 pt-3 border-t border-white/80 grid grid-cols-3 gap-2">
                      {Object.entries(item.data).slice(0, 6).map(([k, v]) => {
                        if (!v || typeof v === 'object' || k === 'id' || k === 'photo') return null;
                        return (
                          <div key={k} className="text-right">
                            <span className="text-[10px] text-slate-400 block">{k}</span>
                            <span className="text-xs text-slate-700 font-medium block truncate">{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
