import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCircle, Users, Check, Save, Trash2, Mic } from 'lucide-react';
import { syncToServer } from '../syncService';
import VoiceInput from './VoiceInput';

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState<'permissions' | 'maker'>('maker');
  const [roles, setRoles] = useState(['Admin', 'Teacher', 'Staff', 'Parent']);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const [users, setUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Listen for storage updates (from sync)
  useEffect(() => {
    const handleUpdate = (e: any) => {
      // Only update if the event was triggered by another component or sync
      const saved = localStorage.getItem('users');
      if (saved) {
        try {
          setUsers(JSON.parse(saved));
        } catch (err) {}
      }
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Teacher', madrassaName: '', whatsapp: '' });
  
  const defaultPermissions = {
    'Admin': {
      dashboard: true, students: true, attendance: true, academics: true,
      paper_uploader: true, paper_checker: true, paper_reports: true,
      settings: true, finance: true, staff: true, exams: true
    },
    'Teacher': {
      dashboard: true, students: true, attendance: true, academics: false,
      paper_uploader: true, paper_checker: true, paper_reports: true,
      settings: false, finance: false, staff: false, exams: true
    },
    'Staff': {
      dashboard: true, students: true, attendance: true, academics: false,
      paper_uploader: false, paper_checker: false, paper_reports: false,
      settings: false, finance: true, staff: false, exams: false
    },
    'Parent': {
      dashboard: true, students: false, attendance: true, academics: false,
      paper_uploader: false, paper_checker: false, paper_reports: true,
      settings: false, finance: false, staff: false, exams: true
    }
  };

  const [permissions, setPermissions] = useState<any>(() => {
    const saved = localStorage.getItem('role_permissions');
    if (!saved) return defaultPermissions;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const normalized: any = {};
        parsed.forEach((item: any) => {
          normalized[item.role] = typeof item.permissions === 'string' ? JSON.parse(item.permissions) : item.permissions;
        });
        return { ...defaultPermissions, ...normalized };
      }
      return parsed;
    } catch (e) {
      return defaultPermissions;
    }
  });

  const modules = [
    { id: 'dashboard', label: 'ڈیش بورڈ' },
    { id: 'students', label: 'طالب علم' },
    { id: 'attendance', label: 'حاضری' },
    { id: 'academics', label: 'تعلیمی امور' },
    { id: 'exams', label: 'نتائج' },
    { id: 'paper_uploader', label: 'پیپر اپلوڈر' },
    { id: 'paper_checker', label: 'پیپر چیکر' },
    { id: 'paper_reports', label: 'پیپر رپورٹس' },
    { id: 'finance', label: 'آمد و خرچ' },
    { id: 'staff', label: 'عملہ و وظائف' },
    { id: 'settings', label: 'ترتیبات' },
  ];

  const handleSave = async () => {
    const syncFormat = Object.keys(permissions).map(role => ({
      role: role,
      permissions: JSON.stringify(permissions[role])
    }));
    localStorage.setItem('role_permissions', JSON.stringify(syncFormat));
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer();
    showNotice('success', 'اختیارات کامیابی سے محفوظ ہو گئے');
  };

  const togglePermission = (role: string, module: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
  };

  const handleCreateAccount = async () => {
    if (!newUser.username || !newUser.password) {
      showNotice('error', 'یوزر نیم اور پاسورڈ درج کریں');
      return;
    }

    // 1. Get latest from localStorage to avoid overwriting
    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = [...currentUsers, { 
      id: Date.now(), 
      ...newUser, 
      status: 'pending', 
      paymentStatus: 'unpaid' 
    }];
    
    // 2. Update local state and localStorage
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // 3. Clear form
    setNewUser({ username: '', password: '', role: 'Teacher', madrassaName: '', whatsapp: '' });
    
    // 4. Notify and sync
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer(); // Ensure it goes to the server
    showNotice('success', 'اکاؤنٹ کے لیے درخواست بھیج دی گئی');
  };

  const handleUpdateUserStatus = async (id: number, status: string, paymentStatus?: string) => {
    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = currentUsers.map((u: any) => {
      if (u.id === id) {
        return { ...u, status: status || u.status, paymentStatus: paymentStatus || u.paymentStatus || 'unpaid' };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer();
    showNotice('success', 'اکاؤنٹ کی تفصیلات اپ ڈیٹ ہو گئیں');
  };

  const handleDeleteUser = async (id: number) => {
    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = currentUsers.filter((u: any) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer(); // Ensure it goes to the server
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500 p-8" dir="rtl">
      {notification && (
        <div className={`mb-6 p-4 rounded-2xl border font-bold text-sm text-center animate-in fade-in slide-in-from-top duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.text}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">اکاؤنٹ مینجمنٹ (Account Management)</h2>
          <p className="text-sm text-slate-500">مختلف یوزر رولز اور ان کے اختیارات مقرر کریں</p>
          <div className="mt-2 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
             <ShieldCheck className="text-blue-600 w-5 h-5" />
             <div className="text-[10px] text-blue-700 leading-tight">
                <span className="font-bold">مرکزی ایڈمن:</span> {`jamiaarabiasirajululoomjabori@gmail.com`} <br/>
                یہ اکاؤنٹ مستقل ہے اور اسے تمام اختیارات حاصل ہیں۔
             </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('maker')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'maker' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            اکاؤنٹ میکر
          </button>
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'permissions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            اختیارات (Permissions)
          </button>
        </div>
      </div>

      {activeTab === 'maker' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">نیا اکاؤنٹ بنائیں</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-600 block">یوزر نیم (Username)</label>
                  <VoiceInput onTranscript={(text) => setNewUser({...newUser, username: text})} />
                </div>
                <input 
                  type="text" 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">پاسورڈ</label>
                <input 
                  type="text" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">مدرسہ کا نام</label>
                <input 
                  type="text" 
                  value={newUser.madrassaName}
                  onChange={(e) => setNewUser({...newUser, madrassaName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">واٹس ایپ نمبر</label>
                <input 
                  type="text" 
                  value={newUser.whatsapp}
                  onChange={(e) => setNewUser({...newUser, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">رول (Role)</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button 
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                اکاؤنٹ بنائیں
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-right">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="py-4 px-6 font-bold">یوزر نیم</th>
                  <th className="py-4 px-6 font-bold">اسٹیٹس</th>
                  <th className="py-4 px-6 font-bold">پیمنٹ</th>
                  <th className="py-4 px-6 font-bold">عمل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{u.username} ({u.role})</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 
                        u.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                       {u.status !== 'accepted' && <button onClick={() => handleUpdateUserStatus(u.id, 'accepted')} className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded text-xs font-bold hover:bg-emerald-200">قبول کریں</button>}
                       {u.status !== 'rejected' && <button onClick={() => handleUpdateUserStatus(u.id, 'rejected')} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-200">مسترد</button>}
                       {u.paymentStatus !== 'paid' && <button onClick={() => handleUpdateUserStatus(u.id, u.status, 'paid')} className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200">ادائیگی کی</button>}
                       <button onClick={() => handleDeleteUser(u.id)} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold hover:bg-slate-200">ڈیلیٹ</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">کوئی اکاؤنٹ نہیں بنا</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-end mb-4">
            <button 
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-5 h-5" />
              محفوظ کریں
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-[32px]">
            <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="py-4 px-6 text-right font-bold rounded-tr-2xl">ماڈیول / رول</th>
              {roles.map(role => (
                <th key={role} className="py-4 px-6 text-center font-bold">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modules.map(mod => (
              <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-700">{mod.label}</td>
                {roles.map(role => (
                  <td key={`${role}-${mod.id}`} className="py-4 px-6 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={permissions[role]?.[mod.id] || false}
                        onChange={() => togglePermission(role, mod.id)}
                      />
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${permissions[role]?.[mod.id] ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`}>
                        {permissions[role]?.[mod.id] && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
}
