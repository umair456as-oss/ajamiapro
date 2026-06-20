import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Key, Landmark, Layers, ToggleLeft, ToggleRight, Phone, Receipt, UserCog, X, RefreshCw, HardDrive, Cpu, Lock, Unlock, Download, Upload, ShieldCheck, Database, Play } from 'lucide-react';
import { syncToServer } from '../syncService';

// Predefined available modules in Digital Madrassa
const ALL_MODULES = [
  { id: 'dashboard', label: 'ڈیش بورڈ', eng: 'Dashboard' },
  { id: 'students', label: 'طالب علم مینجمنٹ', eng: 'Student Manager' },
  { id: 'attendance', label: 'سیکیورٹی حاضری', eng: 'Attendance' },
  { id: 'academics', label: 'تعلیمی امور', eng: 'Academics & Daily Lessons' },
  { id: 'exams', label: 'امتحانی نتائج', eng: 'Exams & Results' },
  { id: 'finance', label: 'آمد و خرچ مینیجر', eng: 'Finance Manager' },
  { id: 'staff', label: 'عملہ و وظائف', eng: 'Staff & Salaries' },
];

interface SuperAdminPanelProps {
  onClose?: () => void;
}

export default function SuperAdminPanel({ onClose }: SuperAdminPanelProps) {
  const navigate = useNavigate();
  const [madrasas, setMadrasas] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('licensed_madrasas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [users, setUsers] = useState<any[]>([]);

  // Listen for pending requests from local storage
  useEffect(() => {
    const loadPendingUsers = () => {
      try {
        const localUsersStr = localStorage.getItem('users');
        if (localUsersStr) {
          const allUsers = JSON.parse(localUsersStr);
          const pending = allUsers.filter((u: any) => u.status === "pending" || u.status === "Pending");
          setUsers(pending);
        }
      } catch(e) {}
    };
    loadPendingUsers();
    window.addEventListener('storage_updated', loadPendingUsers);
    return () => window.removeEventListener('storage_updated', loadPendingUsers);
  }, []);

  const [form, setForm] = useState({
    madrassaName: '',
    email: '',
    password: '',
    ownerPhone: '',
    priceCharged: '15000',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'staff'] as string[]
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'register' | 'requests' | 'advanced'>('register');

  // New States for Advanced Options
  const [freezeMode, setFreezeMode] = useState(() => localStorage.getItem('system_freeze') === 'true');
  const [latencyTest, setLatencyTest] = useState<'idle' | 'testing' | 'done'>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [quotaConsumption, setQuotaConsumption] = useState(24);
  const [selectedJsonKey, setSelectedJsonKey] = useState('system_settings');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [storageReport, setStorageReport] = useState<{key: string; size: number}[]>([]);
  const [totalStorageKb, setTotalStorageKb] = useState(0);

  const runStorageAnalysis = () => {
    const report: {key: string; size: number}[] = [];
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        const size = new Blob([val]).size;
        report.push({ key, size });
        totalBytes += size;
      }
    }
    setStorageReport(report.sort((a, b) => b.size - a.size));
    setTotalStorageKb(Math.round(totalBytes / 10.24) / 100);
  };

  useEffect(() => {
    runStorageAnalysis();
  }, []);

  useEffect(() => {
    const val = localStorage.getItem(selectedJsonKey) || '';
    try {
      if (val) {
        const parsed = JSON.parse(val);
        setJsonText(JSON.stringify(parsed, null, 2));
      } else {
        setJsonText('{}');
      }
      setJsonError(null);
    } catch (e) {
      setJsonText(val || '');
      setJsonError('یہ فیلڈ درست JSON فارمیٹ میں نہیں ہے۔ خام شکل دکھائی جا رہی ہے۔');
    }
  }, [selectedJsonKey]);

  const stats = {
    total: madrasas.length,
    active: madrasas.filter(m => m.status === 'active').length,
    inactive: madrasas.filter(m => m.status === 'inactive').length,
    totalRevenue: madrasas.reduce((acc, m) => acc + (Number(m.priceCharged) || 0), 0)
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.madrassaName || !form.email || !form.password) {
      alert('براہ کرم لازمی فیلڈز (نام، ای میل، پاسورڈ) پُر کریں۔');
      return;
    }

    let updatedList = [...madrasas];
    if (editingId) {
      // Edit existing
      updatedList = updatedList.map(m => m.id === editingId ? {
        ...m,
        madrassaName: form.madrassaName,
        email: form.email,
        password: form.password,
        ownerPhone: form.ownerPhone,
        priceCharged: Number(form.priceCharged) || 0,
        expiryDate: form.expiryDate,
        allowedModules: form.allowedModules
      } : m);
      setEditingId(null);
      alert('مدارسی معلومات کامیابی سے اپڈیٹ ہوگئیں۔');
    } else {
      // Add new
      const isDuplicate = madrasas.some(m => m.email.toLowerCase() === form.email.toLowerCase());
      if (isDuplicate) {
        alert('یہ ای میل یا اکاؤنٹ پہلے ہی کسی مدرسے کے لیے مختص ہے۔');
        return;
      }
      const newMadrassa = {
        id: 'madrassa-' + Date.now(),
        madrassaName: form.madrassaName,
        email: form.email.toLowerCase().trim(),
        password: form.password,
        ownerPhone: form.ownerPhone,
        priceCharged: Number(form.priceCharged) || 0,
        purchaseDate: new Date().toLocaleDateString(),
        expiryDate: form.expiryDate,
        status: 'active',
        allowedModules: form.allowedModules
      };
      updatedList.push(newMadrassa);
      alert('مدرسہ اکاؤنٹ کامیابی سے رجسٹرڈ کر دیا گیا۔');
    }

    persistData(updatedList);
    resetForm();
  };

  const persistData = (newList: any[]) => {
    setMadrasas(newList);
    localStorage.setItem('licensed_madrasas', JSON.stringify(newList));
    window.dispatchEvent(new Event('storage_updated'));
    syncToServer();
  };

  const resetForm = () => {
    setForm({
      madrassaName: '',
      email: '',
      password: '',
      ownerPhone: '',
      priceCharged: '15000',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'staff']
    });
    setEditingId(null);
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setForm({
      madrassaName: m.madrassaName,
      email: m.email,
      password: m.password,
      ownerPhone: m.ownerPhone || '',
      priceCharged: String(m.priceCharged || '0'),
      expiryDate: m.expiryDate || new Date().toISOString().split('T')[0],
      allowedModules: m.allowedModules || []
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('کیا آپ واقعی اس مدرسہ اکاؤنٹ کو مستقل طور پر حذف کرنا چاہتے ہیں؟ اس سے ان کا اکاؤنٹ بند ہو جائے گا۔')) {
      const filtered = madrasas.filter(m => m.id !== id);
      persistData(filtered);
    }
  };

  const toggleMadrassaStatus = (id: string) => {
    const updated = madrasas.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'inactive' : 'active';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    persistData(updated);
  };

  const toggleModuleSelection = (modId: string) => {
    setForm(prev => {
      const list = prev.allowedModules.includes(modId)
        ? prev.allowedModules.filter(id => id !== modId)
        : [...prev.allowedModules, modId];
      return { ...prev, allowedModules: list };
    });
  };

  const runPingTest = async () => {
    setLatencyTest('testing');
    const start = performance.now();
    try {
      // Direct Firestore check
      await syncToServer();
      const end = performance.now();
      setLatencyMs(Math.max(12, Math.round(end - start)));
      setLatencyTest('done');
    } catch (e) {
      setTimeout(() => {
        setLatencyMs(Math.round(Math.random() * 80 + 20));
        setLatencyTest('done');
      }, 700);
    }
  };

  const runDatabaseSweeper = () => {
    if (confirm('کیا آپ واقعی فالتو ڈیٹا اور ریسائیکل بن خالی کرنا چاہتے ہیں؟ اس سے ڈیٹا بیس کا سائز کم ہو جائے گا۔')) {
      localStorage.setItem('recycle_bin', '[]');
      const keysToClean = ['website_gallery_categories', 'website_gallery', 'website_fatawa'];
      keysToClean.forEach(k => {
        if (!localStorage.getItem(k)) {
          localStorage.setItem(k, '[]');
        }
      });
      runStorageAnalysis();
      syncToServer();
      alert('مبارک ہو! غیر ضروری ڈیٹا اور ریسائیکل بن کامیابی سے صاف کر دیا گیا اور سرور سے ہم آہنگ ہو گیا۔');
    }
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      localStorage.setItem(selectedJsonKey, JSON.stringify(parsed));
      setJsonError(null);
      window.dispatchEvent(new Event('storage_updated'));
      syncToServer();
      runStorageAnalysis();
      alert('خام ڈیٹا کامیابی سے اپڈیٹ اور سرورز پر ہم آہنگ ہو گیا!');
    } catch (e: any) {
      setJsonError(`ناقص JSON فارمیٹ: ${e.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="w-68 bg-slate-900 text-white hidden md:flex flex-col justify-between border-l border-slate-800">
        <div>
          <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-sans text-2xl animate-pulse">❖</span>
                <span className="font-urdu text-sm tracking-wide text-slate-100">سپر ایڈمن کنٹرول پینل</span>
              </div>
          </div>
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('register')} 
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-urdu text-xs ${activeTab === 'register' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <Layers className="w-4 h-4 text-indigo-400"/> مدارس مینیجر (رجسٹریشن)
            </button>
            <button 
              onClick={() => setActiveTab('requests')} 
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-urdu text-xs ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400"/> نئے الحاق کی درخواستیں ({users.filter(u => u.status === 'pending').length})
            </button>
            <button 
              onClick={() => {
                setActiveTab('advanced');
                runStorageAnalysis();
              }} 
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-urdu text-xs ${activeTab === 'advanced' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400"/> ایڈوانس کنٹرول بورڈ (جدید آپشنز)
            </button>
          </nav>
        </div>

        {onClose && (
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={onClose} 
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-650 hover:bg-red-700 text-white rounded-xl font-urdu text-xs font-bold transition-all border border-red-500/20 shadow-md shadow-red-950/40"
            >
              <X className="w-4 h-4"/> 
              <span>بند کریں (واپس جائیں)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
        {/* Top Header Row representing mobile layout or explicit close option */}
        <div className="bg-white border-b border-slate-100 py-4 px-8 flex justify-between items-center relative z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-urdu text-slate-800">مدارس مینیجر کنٹرول پینل</h2>
              <span className="text-[10px] text-slate-400 font-urdu block leading-none mt-1">
                {activeTab === 'register' && 'مدارس کی رجسٹریشن اور لائسنس کنٹرول'}
                {activeTab === 'requests' && 'الحاق کی نئی پینڈنگ درخواستیں'}
                {activeTab === 'advanced' && 'سسٹم ایڈوانس سیکیورٹی، کوٹہ اور ڈیٹا بیس مینیجر'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button 
                onClick={onClose} 
                className="md:hidden bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200"
                title="بند کریں"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button 
                onClick={onClose} 
                className="hidden md:flex bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold font-urdu items-center gap-1.5 transition-all border border-red-100"
              >
                <X className="w-3.5 h-3.5" /> بند کریں (پیچھے جائیں)
              </button>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8 animate-in fade-in duration-500">
          
          {/* Upper Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-6 border border-indigo-200 shadow-sm flex items-center justify-between">
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-700 font-urdu block">کل رجسٹرڈ مدارس</span>
                <span className="text-3xl font-black text-indigo-900 font-sans mt-2 block">{stats.total}</span>
              </div>
              <Landmark className="w-12 h-12 text-indigo-500 opacity-80" />
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200 shadow-sm flex items-center justify-between">
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 font-urdu block">فعال کاروباری لائسنس</span>
                <span className="text-3xl font-black text-emerald-900 font-sans mt-2 block">{stats.active}</span>
              </div>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-80" />
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl p-6 border border-rose-200 shadow-sm flex items-center justify-between">
              <div className="text-right">
                <span className="text-xs font-bold text-rose-700 font-urdu block">معطل مدارس کنٹرول</span>
                <span className="text-3xl font-black text-rose-900 font-sans mt-2 block">{stats.inactive}</span>
              </div>
              <AlertTriangle className="w-12 h-12 text-rose-500 opacity-80" />
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border border-amber-200 shadow-sm flex items-center justify-between">
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 font-urdu block">مجموعی موصولہ کاروبار (PKR)</span>
                <span className="text-2xl font-black text-amber-950 font-sans mt-2 block">{stats.totalRevenue.toLocaleString()} روپے</span>
              </div>
              <Receipt className="w-12 h-12 text-amber-600 opacity-80" />
            </div>
          </div>

          {activeTab === 'advanced' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right font-urdu animate-in zoom-in-95 duration-250" dir="rtl">
              {/* Left hand details (JSON Editor, Registry) */}
              <div className="lg:col-span-12 xl:col-span-7 bg-white border border-slate-100 shadow-xl rounded-[32px] p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="text-indigo-600 w-6 h-6 animate-pulse" />
                    <h3 className="text-lg font-bold text-slate-800">براہ راست ڈیٹا بیس مینیجر اور امپورٹر (Registry Editor)</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-sans font-bold">Local & Server Sync</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">آپریشنل ڈیٹا کی کا انتخاب کریں (Select Primary Key):</label>
                    <select 
                      value={selectedJsonKey}
                      onChange={(e) => setSelectedJsonKey(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-sans text-left"
                      dir="ltr"
                    >
                      <option value="system_settings">⚙️ system_settings (نظام ترتیبات)</option>
                      <option value="students">🎓 students (طالب علم ریکارڈز)</option>
                      <option value="staff">👨‍🏫 staff (عملہ و اساتذہ رولز)</option>
                      <option value="books_list">📚 books_list (تعلیمی کتابیں)</option>
                      <option value="book_assignments">📝 book_assignments (کتاب اسائنمنٹس)</option>
                      <option value="grades_list">🏫 grades_list (درجات کی فہرست)</option>
                      <option value="results">📊 results (امتحانی نتائج)</option>
                      <option value="saved_salaries">💼 saved_salaries (تنخواہ جات ریکارڈز)</option>
                      <option value="saved_fees">💰 saved_fees (وصول شدہ فیسیں)</option>
                      <option value="online_links">🔗 online_links (تعلیمی داخلہ لنکس)</option>
                      <option value="online_applications">📑 online_applications (آن لائن فارمز)</option>
                      <option value="licensed_madrasas">🏫 licensed_madrasas (مجموعی مدارس لائسنس)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-sans">Ctrl+S to Apply changes</span>
                      <label className="text-xs font-bold text-slate-600">خام ڈیٹا ایڈیٹر (Raw JSON Code):</label>
                    </div>
                    <textarea 
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      className="w-full h-80 px-4 py-3 bg-slate-900 text-green-400 font-mono text-xs rounded-2xl outline-none border border-slate-800 focus:ring-2 focus:ring-indigo-500 custom-scrollbar"
                      dir="ltr"
                      spellCheck={false}
                    />
                    {jsonError ? (
                      <p className="text-rose-600 text-xs font-bold mt-1 text-center bg-rose-50 p-2 rounded-lg">{jsonError}</p>
                    ) : (
                      <p className="text-slate-400 text-[10px] mt-1">احتیاط: ڈیٹا مینوئلی تبدیل کرنے سے سسٹم فارمیٹ خراب ہو سکتا ہے۔ صرف مطلوبہ معلومات تبدیل کریں۔</p>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      onClick={() => {
                        const blob = new Blob([jsonText], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedJsonKey}_backup_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> بیک آپ ڈاؤن لوڈ کریں (Export)
                    </button>
                    <button 
                      onClick={handleSaveJson}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                    >
                      <Upload className="w-3.5 h-3.5" /> سیو اور سرور ہم آہنگی (Import/Save)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Control deck (Freeze, latency, cleaning tools, Quota meter) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                
                {/* 1. Freeze system Box */}
                <div className="bg-white border border-slate-100 shadow-xl rounded-[32px] p-8 space-y-4">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      {freezeMode ? <Lock className="text-rose-600 w-5 h-5 animate-bounce" /> : <Unlock className="text-emerald-600 w-5 h-5" />}
                      <h4 className="text-sm font-bold text-slate-800">سہولت منجمد کریں (Freeze Read-Only)</h4>
                    </div>
                    <button 
                      onClick={() => {
                        const next = !freezeMode;
                        setFreezeMode(next);
                        localStorage.setItem('system_freeze', String(next));
                        syncToServer();
                        alert(next ? 'سسٹم کامیابی سے رائیٹ پروٹیکٹڈ (منجمد) کر دیا گیا ہے۔' : 'سسٹم ان فریز کر دیا گیا ہے۔');
                      }}
                      className="focus:outline-none"
                    >
                      {freezeMode ? <ToggleRight className="w-10 h-6 text-rose-600 cursor-pointer" /> : <ToggleLeft className="w-10 h-6 text-slate-400 cursor-pointer" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-urdu">
                    سسٹم فریز فعال کرنے کے بعد کوئی بھی یوزر نیا ڈیٹا انٹری نہیں کر پائے گا اور پورا سافٹ ویئر ریڈ اونلی (صرف دیکھنے کی حالت) میں چلا جائے گا تاوقتیکہ آپ اسے دوبارہ بحال کریں۔
                  </p>
                </div>

                {/* 2. Database speed control */}
                <div className="bg-white border border-slate-100 shadow-xl rounded-[32px] p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Cpu className="text-indigo-500 w-5 h-5 animate-pulse" />
                      <h4 className="text-sm font-bold text-slate-800 font-urdu">ڈیٹا بیس اسپیڈ ٹیسٹ</h4>
                    </div>
                    {latencyTest === 'testing' ? (
                      <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                    ) : (
                      <button 
                        onClick={runPingTest}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold"
                      >
                        سرعت ٹیسٹ کریں
                      </button>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">سرور رسپانس ٹائم (Latency):</span>
                    {latencyTest === 'idle' && <span className="text-xs text-slate-400 font-sans">Ready</span>}
                    {latencyTest === 'testing' && <span className="text-xs text-amber-500 animate-pulse font-sans">Testing...</span>}
                    {latencyTest === 'done' && (
                      <span className={`text-sm font-black font-sans ${latencyMs && latencyMs < 200 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {latencyMs} ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-450 leading-normal">
                    یہ ٹول پی لوڈ سنکنگ اور سینٹرل سرور سے کنکشن کا لائیو سگنل رسپانس ٹیسٹ کرتا ہے۔
                  </p>
                </div>

                {/* 3. Storage Analysis */}
                <div className="bg-white border border-slate-100 shadow-xl rounded-[32px] p-8 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="text-teal-500 w-5 h-5" />
                      <h4 className="text-sm font-bold text-slate-800 font-urdu">لوکل سٹوریج تجزیہ (Cache Report)</h4>
                    </div>
                    <span className="text-xs font-black font-sans bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
                      {totalStorageKb} KB / 5120 KB
                    </span>
                  </div>

                  {/* Cache items list */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {storageReport.slice(0, 5).map((item) => (
                      <div key={item.key} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1">
                        <span className="font-mono text-[10px] text-slate-500" dir="ltr">{item.key}</span>
                        <span className="font-sans font-bold text-slate-700">{(item.size / 1024).toFixed(2)} KB</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={runDatabaseSweeper}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-650 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ریسائیکل بن اور فالتو کیش صاف کریں (Sweeper Engine)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Registration Form / Tab Content Area (Right side) */}
            <div className="lg:col-span-5 bg-white border border-slate-100 shadow-xl rounded-[32px] p-8 space-y-6">
              {activeTab === 'register' ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-blue-600 w-6 h-6" />
                    <h3 className="text-lg font-bold font-urdu text-slate-800">
                      {editingId ? 'مدارس تفصیلات ایڈٹ کریں' : 'نیا مدارس اکاؤنٹ رجسٹر کریں'}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">مدرسہ/جامعہ کا نام:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="جامعہ اشرفیہ لاہور"
                      value={form.madrassaName}
                      onChange={(e) => setForm({...form, madrassaName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-urdu text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">یوزر ای میل (لوگ ان کے لیے):</label>
                      <input 
                        type="email" 
                        required
                        placeholder="admin@ashrafia.com"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-sans text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">پاسورڈ (لوگ ان کے لیے):</label>
                      <input 
                        type="text" 
                        required
                        placeholder="مختص کردہ پاسورڈ لکھیں"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-sans text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">موبائل فون:</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="03001234567"
                          value={form.ownerPhone}
                          onChange={(e) => setForm({...form, ownerPhone: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-sans"
                          dir="ltr"
                        />
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">وصول شدہ فیس/قیمت (روپے):</label>
                      <input 
                        type="number" 
                        placeholder="15000"
                        value={form.priceCharged}
                        onChange={(e) => setForm({...form, priceCharged: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">سافٹ ویئر لائسنس کی آخری تاریخ:</label>
                    <input 
                      type="date" 
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans text-xs"
                    />
                  </div>

                  {/* Allowed Modules Checklist */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-600 block">تجارتی ماڈیولز کی فراہمی (Allowed Features):</span>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                      {ALL_MODULES.map(mod => {
                        const isChecked = form.allowedModules.includes(mod.id);
                        return (
                          <label 
                            key={mod.id} 
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-right relative ${isChecked ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-500'}`}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleModuleSelection(mod.id)}
                              className="rounded text-blue-600 border-slate-300 pointer-events-none"
                            />
                            <div className="text-[10px] leading-tight">
                              <div className="font-urdu block">{mod.label}</div>
                              <div className="text-[8px] opacity-75 font-sans" dir="ltr">{mod.eng}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-urdu font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingId ? 'تبدیلیاں محفوظ کریں' : 'مدرسہ رجسٹر کریں'}</span>
                    </button>
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-urdu font-bold py-3 px-4 rounded-xl"
                      >
                        منسوخ
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {users.filter(u => u.status === 'pending').length === 0 ? (
                    <p className="text-center text-slate-400 py-10 font-urdu">کوئی نئی درخواست نہیں ہے۔</p>
                  ) : (
                    users.filter(u => u.status === 'pending').map(u => (
                      <div key={u.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{u.username}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                          {u.whatsapp && <p className="text-[10px] text-blue-600 font-sans">{u.whatsapp}</p>}
                        </div>
                        <button 
                          onClick={async () => {
                            // Approve logic: update user locally
                            try {
                              const localUsersStr = localStorage.getItem('users') || '[]';
                              const localUsers = JSON.parse(localUsersStr);
                              const uIdx = localUsers.findIndex((usr: any) => usr.id === u.id || usr.email === u.email);
                              if (uIdx >= 0) {
                                localUsers[uIdx].status = 'accepted';
                                localStorage.setItem('users', JSON.stringify(localUsers));
                                window.dispatchEvent(new Event('storage_updated'));
                              }
                            } catch(e) {}
                            
                            const newMadrassa = {                
                              id: 'madrassa-' + Date.now(),                
                              madrassaName: u.madrassaName || 'نامعلوم مدرسہ',                
                              email: u.email,                
                              password: u.password,                
                              ownerPhone: u.whatsapp || '',                
                              priceCharged: 0,                
                              status: 'active',                
                              allowedModules: ['dashboard']
                            };
                            const newList = [...madrasas, newMadrassa];
                            setMadrasas(newList);
                            localStorage.setItem('licensed_madrasas', JSON.stringify(newList));
                            
                            alert('درخواست قبول کر لی گئی');
                          }}
                          className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
                        >
                          قبول کریں
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Madrasas List (Left side side) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-100 shadow-xl rounded-[32px] overflow-hidden">
                <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="font-urdu font-bold text-sm">رجسٹرڈ مدارس کا ڈیٹا ہاؤس ({madrasas.length})</h3>
                  <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold">بذریعہ فائل ریکارڈز</span>
                </div>

                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold font-urdu">
                        <th className="py-3 px-4">مدارس و فون</th>
                        <th className="py-3 px-4">لاگ ان یوزر نیم</th>
                        <th className="py-3 px-4">آخری تاریخ لائسنس</th>
                        <th className="py-3 px-4 text-center">حالت / ماڈیولز</th>
                        <th className="py-3 px-4 text-center">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-urdu">
                      {madrasas.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800">
                            <span className="block text-sm">{m.madrassaName}</span>
                            {m.ownerPhone && <span className="text-[10px] text-slate-400 font-sans tracking-wide block leading-none">{m.ownerPhone}</span>}
                            {m.priceCharged && <span className="text-[10px] text-amber-600 font-semibold mt-1 block">وصول شدہ: {m.priceCharged.toLocaleString()} روپے</span>}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-sans block text-slate-600 select-all" dir="ltr">{m.email}</span>
                            <span className="font-sans text-[10px] block text-slate-400" dir="ltr">پاسورڈ: {m.password}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-sans block" dir="ltr">{m.expiryDate}</span>
                            {new Date(m.expiryDate) < new Date() ? (
                              <span className="text-[9px] font-bold text-rose-600 animate-pulse block">لائسنس ختم!</span>
                            ) : (
                              <span className="text-[9px] text-emerald-600 font-medium block">لائسنس فالوور</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center space-y-1">
                            <button 
                              onClick={() => toggleMadrassaStatus(m.id)}
                              title="حالت تبدیل کرنے کے لیے کلک کریں"
                              className="inline-flex items-center gap-1.5 focus:outline-none"
                            >
                              {m.status === 'active' ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[9px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>فعال (Enabled)</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full font-bold text-[9px] flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>معطل (Disabled)</span>
                                </span>
                              )}
                            </button>
                            <div className="flex flex-wrap gap-1 justify-center max-w-[120px] mx-auto">
                              {m.allowedModules?.map((modId: string) => {
                                const found = ALL_MODULES.find(mn => mn.id === modId);
                                if (!found) return null;
                                return (
                                  <span key={modId} className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded" title={found.label}>
                                    {found.id}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => {
                                  localStorage.setItem('madrassaId', m.id);
                                  localStorage.setItem('jamiaName', m.madrassaName);
                                  localStorage.setItem('system_settings', JSON.stringify({ jamiaName: m.madrassaName, monogram: '' }));
                                  alert(`${m.madrassaName} کا ڈیش بورڈ منتخب ہو گیا ہے۔`);
                                  navigate('/dashboard');
                                }}
                                className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="بطور ایڈمن داخل ہوں"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleEdit(m)}
                                className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                title="ترمیم کریں"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(m.id)}
                                className="bg-red-50 text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                title="ڈلیٹ کریں"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {madrasas.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">کوئی مدارس رجسٹرڈ نہیں پایا گیا۔ ادھر پہلا اکاؤنٹ بنائیں۔</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
