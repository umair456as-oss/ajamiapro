import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Key, Landmark, Layers, ToggleLeft, ToggleRight, Phone, Receipt, UserCog } from 'lucide-react';
import { syncToServer } from '../syncService';
import { collection, onSnapshot, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

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

export default function SuperAdminPanel() {
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

  // Listen for pending requests from Firestore
  useEffect(() => {
    const q = query(collection(db, "users"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    });
    return () => unsubscribe();
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

  const [activeTab, setActiveTab] = useState<'register' | 'requests'>('register');

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

  return (
    <div className="flex min-h-screen bg-slate-100" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-5 text-xl font-bold border-b border-slate-700 flex items-center gap-2">
            <span className="text-emerald-400">❖</span>
            <span>انتظامی سسٹم</span>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={() => setActiveTab('register')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Layers className="w-5 h-5"/> ڈیش بورڈ
          </button>
          <button onClick={() => setActiveTab('requests')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'requests' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <ShieldAlert className="w-5 h-5"/> درخواستیں ({users.filter(u => u.status === 'pending').length})
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
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
                            // Approve logic: update user in Firestore
                            await updateDoc(doc(db, "users", u.id), { status: 'accepted' });
                            
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
        </div>
      </div>
    </div>
  );
}
