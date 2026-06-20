import React, { useState, useEffect } from 'react';
import { 
  User, Users, School, Send, CheckCircle2, 
  Trash2, Plus, AlertCircle, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
const PublicAdmissionForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'guardians' | 'schools'>('basic');
  const [token, setToken] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    name: '', fatherName: '', gender: '', cnic: '', age: '', dob: '', 
    admissionDate: new Date().toISOString().split('T')[0],
    education: '', phone: '', currentAddress: '', permanentAddress: '',
    currentDistrict: '', permanentDistrict: '', residentStatus: 'رہائشی',
    aidStatus: 'امدادی', boardStatus: 'وفاقی', otherCourses: '',
    caste: 'پاکستان', village: '', tehsil: 'مانسہرہ', postOffice: '',
    guardianName: ''
  });

  const [guardians, setGuardians] = useState([
    { name: '', relation: '', phone: '', profession: '', email: '', address: '' }
  ]);

  const [schools, setSchools] = useState([
    { year: '', grade: '', institution: '', marks: '' }
  ]);

  const [systemSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      return saved ? JSON.parse(saved) : {
        jamiaName: 'جامعہ عربیہ سراج العلوم',
        monogram: ''
      };
    } catch (e) {
      return { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      const savedLinks = localStorage.getItem('online_links');
      if (savedLinks) {
        const links = JSON.parse(savedLinks);
        const link = links.find((l: any) => l.token === tokenParam);
        if (link && link.remainingUses > 0) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, []);

  const addGuardian = () => setGuardians([...guardians, { name: '', relation: '', phone: '', profession: '', email: '', address: '' }]);
  const removeGuardian = (index: number) => setGuardians(guardians.filter((_, i) => i !== index));

  const addSchool = () => setSchools([...schools, { year: '', grade: '', institution: '', marks: '' }]);
  const removeSchool = (index: number) => setSchools(schools.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // 1. Update Token Uses
    const savedLinks = localStorage.getItem('online_links');
    if (savedLinks) {
      const links = JSON.parse(savedLinks);
      const index = links.findIndex((l: any) => l.token === token);
      if (index !== -1 && links[index].remainingUses > 0) {
        links[index].remainingUses -= 1;
        localStorage.setItem('online_links', JSON.stringify(links));
      } else {
        setIsValid(false);
        return;
      }
    }

    // 2. Save Application
    const application = {
      status: 'pending',
      submittedAt: new Date().toISOString(),
      token,
      data: {
        basicInfo,
        guardians,
        schools
      }
    };

    // Save to local storage (Online Applications) rather than Firebase Firestore
    try {
      const savedAppsStr = localStorage.getItem("online_applications") || "[]";
      const savedApps = JSON.parse(savedAppsStr);
      savedApps.push(application);
      localStorage.setItem("online_applications", JSON.stringify(savedApps));
      window.dispatchEvent(new Event('storage_updated'));

      // Cleanly trigger email notification via backend
      fetch('/api/trigger-admission-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionData: application })
      }).catch(err => console.error('Error triggering email:', err));

      setSubmitted(true);
    } catch (error) {
      console.error("Error saving admission: ", error);
      alert('درخواست جمع کروانے میں غلطی ہوئی۔');
    }
  };

  if (isValid === null) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-urdu">تصدیق ہو رہی ہے...</div>;
  if (!isValid) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-md w-full text-center space-y-6">
        <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold font-urdu text-slate-800">لنک غیر فعال ہے</h2>
        <p className="text-slate-500 font-urdu leading-relaxed">معذرت، یہ لنک اب کارآمد نہیں رہا یا اس کی استعمال کی حد ختم ہو چکی ہے۔ براہ کرم انتظامیہ سے رابطہ کریں۔</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6 font-urdu" dir="rtl">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-2xl w-full text-center space-y-8 animate-in zoom-in duration-500">
        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">درخواست کامیابی سے جمع ہو گئی!</h2>
          <p className="text-slate-500 leading-relaxed text-lg">آپ کی رجسٹریشن کی درخواست انتظامیہ کو موصول ہو گئی ہے۔ آپ کا فارم پینڈنگ میں ہے، انتظامیہ کی طرف سے تصدیق کے بعد آپ کا داخلہ مکمل کر لیا جائے گا۔</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-sm font-bold text-emerald-700">شکریہ! ہم جلد آپ سے رابطہ کریں گے۔</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-urdu" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          {systemSettings.monogram && (
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border-2 border-emerald-50 mb-4 p-2">
              <img src={systemSettings.monogram} alt="Monogram" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-emerald-600 tracking-tight">{systemSettings.jamiaName}</h1>
            <h2 className="text-xl md:text-2xl font-bold text-slate-700">آن لائن داخلہ فارم</h2>
          </div>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed text-sm italic">
            برائے مہربانی درست معلومات بھریں۔ فارم سبمٹ کرنے کے بعد {systemSettings.jamiaName} انتظامیہ کو اس کی اطلاع ضرور دیں یا خود مدرسہ تشریف لے کر جائیں۔ شکریہ!
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
          {[
            { id: 'basic', label: 'بنیادی معلومات', icon: User },
            { id: 'guardians', label: 'سرپرست', icon: Users },
            { id: 'schools', label: 'سابقہ مدارس', icon: School },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                if (activeTab === 'basic' && tab.id !== 'basic') {
                  if (!basicInfo.name || !basicInfo.fatherName || !basicInfo.gender || !basicInfo.admissionDate || !basicInfo.phone) {
                    alert('برائے مہربانی تمام ضروری (*) خانے پُر کریں۔ (نام، والد کا نام، جنس، تاریخ داخلہ، فون نمبر)');
                    return;
                  }
                } else if (activeTab === 'guardians' && tab.id === 'schools') {
                  const hasEmptyGuardian = guardians.some(g => !g.name);
                  if (hasEmptyGuardian) {
                    alert('برائے مہربانی تمام سرپرستوں کے نام درج کریں۔');
                    return;
                  }
                }
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all font-bold ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="md:col-span-3 pb-4 border-b border-slate-50 mb-4">
                    <h3 className="text-emerald-600 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      بنیادی تعلیمی ریکارڈ
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">نام *</label>
                    <input 
                      required
                      type="text" 
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">والد کا نام *</label>
                    <input 
                      required
                      type="text" 
                      value={basicInfo.fatherName}
                      onChange={(e) => setBasicInfo({...basicInfo, fatherName: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">جنس *</label>
                    <select 
                      required
                      value={basicInfo.gender}
                      onChange={(e) => setBasicInfo({...basicInfo, gender: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    >
                      <option value="">-- منتخب کریں --</option>
                      <option value="Male">مرد</option>
                      <option value="Female">عورت</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">شناختی کارڈ / B-Form</label>
                    <input 
                      type="text" 
                      maxLength={15}
                      placeholder="00000-0000000-0"
                      value={basicInfo.cnic}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numbers = val.replace(/\D/g, '');
                        let formatted = numbers;
                        if (numbers.length > 5 && numbers.length <= 12) {
                          formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
                        } else if (numbers.length > 12) {
                          formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
                        }
                        setBasicInfo({...basicInfo, cnic: formatted});
                      }}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">تاریخ پیدائش</label>
                    <input 
                      type="date" 
                      value={basicInfo.dob}
                      onChange={(e) => setBasicInfo({...basicInfo, dob: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">عمر</label>
                    <input 
                      type="text" 
                      value={basicInfo.age}
                      onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">داخلہ کی تاریخ *</label>
                    <input 
                      type="date" 
                      value={basicInfo.admissionDate}
                      onChange={(e) => setBasicInfo({...basicInfo, admissionDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">فون نمبر *</label>
                    <input 
                      required
                      type="text" 
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">قوم / شہریت</label>
                    <input 
                      type="text" 
                      value={basicInfo.caste}
                      onChange={(e) => setBasicInfo({...basicInfo, caste: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">گاؤں</label>
                    <input 
                      type="text" 
                      value={basicInfo.village}
                      onChange={(e) => setBasicInfo({...basicInfo, village: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">تحصیل</label>
                    <input 
                      type="text" 
                      value={basicInfo.tehsil}
                      onChange={(e) => setBasicInfo({...basicInfo, tehsil: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ڈاکخانہ</label>
                    <input 
                      type="text" 
                      value={basicInfo.postOffice}
                      onChange={(e) => setBasicInfo({...basicInfo, postOffice: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">عصری تعلیم</label>
                    <input 
                      type="text" 
                      value={basicInfo.education}
                      onChange={(e) => setBasicInfo({...basicInfo, education: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">موجودہ پتہ</label>
                    <input 
                      type="text" 
                      value={basicInfo.currentAddress}
                      onChange={(e) => setBasicInfo({...basicInfo, currentAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">موجودہ ضلع</label>
                    <input 
                      type="text" 
                      value={basicInfo.currentDistrict}
                      onChange={(e) => setBasicInfo({...basicInfo, currentDistrict: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">مستقل پتہ</label>
                    <input 
                      type="text" 
                      value={basicInfo.permanentAddress}
                      onChange={(e) => setBasicInfo({...basicInfo, permanentAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">مستقل ضلع</label>
                    <input 
                      type="text" 
                      value={basicInfo.permanentDistrict}
                      onChange={(e) => setBasicInfo({...basicInfo, permanentDistrict: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">رہائشی / غیر رہائشی</label>
                    <select 
                      value={basicInfo.residentStatus}
                      onChange={(e) => setBasicInfo({...basicInfo, residentStatus: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    >
                      <option value="رہائشی">رہائشی</option>
                      <option value="غیر رہائشی">غیر رہائشی</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">امدادی / غیر امدادی</label>
                    <select 
                      value={basicInfo.aidStatus}
                      onChange={(e) => setBasicInfo({...basicInfo, aidStatus: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    >
                      <option value="امدادی">امدادی</option>
                      <option value="غیر امدادی">غیر امدادی</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">وفاقی / غیر وفاقی</label>
                    <select 
                      value={basicInfo.boardStatus}
                      onChange={(e) => setBasicInfo({...basicInfo, boardStatus: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    >
                      <option value="وفاقی">وفاقی</option>
                      <option value="غیر وفاقی">غیر وفاقی</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">دیگر کورس</label>
                    <input 
                      type="text" 
                      value={basicInfo.otherCourses}
                      onChange={(e) => setBasicInfo({...basicInfo, otherCourses: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl transition-all outline-none"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'guardians' && (
                <motion.div
                  key="guardians"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="pb-4 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-emerald-600 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      سرپرست کی تفصیلات
                    </h3>
                  </div>

                  {guardians.map((g, idx) => (
                    <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6 relative group">
                      <button 
                        type="button"
                        onClick={() => removeGuardian(idx)}
                        className="absolute top-4 left-4 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">نام *</label>
                          <input 
                            required
                            type="text" 
                            value={g.name}
                            onChange={(e) => {
                              const newG = [...guardians];
                              newG[idx].name = e.target.value;
                              setGuardians(newG);
                            }}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">رشتہ</label>
                          <input 
                            type="text" 
                            value={g.relation}
                            onChange={(e) => {
                              const newG = [...guardians];
                              newG[idx].relation = e.target.value;
                              setGuardians(newG);
                            }}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">فون</label>
                          <input 
                            type="text" 
                            value={g.phone}
                            onChange={(e) => {
                              const newG = [...guardians];
                              newG[idx].phone = e.target.value;
                              setGuardians(newG);
                            }}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">پیشہ</label>
                          <input 
                            type="text" 
                            value={g.profession}
                            onChange={(e) => {
                              const newG = [...guardians];
                              newG[idx].profession = e.target.value;
                              setGuardians(newG);
                            }}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ای میل</label>
                          <input 
                            type="email" 
                            value={g.email}
                            onChange={(e) => {
                              const newG = [...guardians];
                              newG[idx].email = e.target.value;
                              setGuardians(newG);
                            }}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-left font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">پتہ</label>
                          <input 
                            type="text" 
                            value={g.address}
                            onChange={(e) => {
                              const newG = [...guardians];
                              newG[idx].address = e.target.value;
                              setGuardians(newG);
                            }}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={addGuardian}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    <span>مزید سرپرست شامل کریں</span>
                  </button>
                </motion.div>
              )}

              {activeTab === 'schools' && (
                <motion.div
                  key="schools"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="pb-4 border-b border-slate-50">
                    <h3 className="text-emerald-600 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      گزشتہ تعلیمی ریکارڈ
                    </h3>
                  </div>

                  {schools.map((s, idx) => (
                    <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6 relative group">
                      <button 
                        type="button"
                        onClick={() => removeSchool(idx)}
                        className="absolute top-4 left-4 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">سال</label>
                          <input 
                            type="text" 
                            value={s.year}
                            onChange={(e) => {
                              const newS = [...schools];
                              newS[idx].year = e.target.value;
                              setSchools(newS);
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div className="space-y-2 col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">درجہ</label>
                          <input 
                            type="text" 
                            value={s.grade}
                            onChange={(e) => {
                              const newS = [...schools];
                              newS[idx].grade = e.target.value;
                              setSchools(newS);
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ادارہ</label>
                          <input 
                            type="text" 
                            value={s.institution}
                            onChange={(e) => {
                              const newS = [...schools];
                              newS[idx].institution = e.target.value;
                              setSchools(newS);
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">کامیابی / نمبرات</label>
                          <input 
                            type="text" 
                            value={s.marks}
                            onChange={(e) => {
                              const newS = [...schools];
                              newS[idx].marks = e.target.value;
                              setSchools(newS);
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={addSchool}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    <span>مزید ریکارڈ شامل کریں</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-12 border-t border-slate-100">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'schools' ? 'guardians' : 'basic')}
                  className="px-8 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-2 transition-all"
                >
                  <ArrowRight size={18} />
                  <span>پیچھے</span>
                </button>
              )}
              
              {activeTab !== 'schools' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basic') {
                      if (!basicInfo.name || !basicInfo.fatherName || !basicInfo.gender || !basicInfo.admissionDate || !basicInfo.phone) {
                        alert('برائے مہربانی تمام ضروری (*) خانے پُر کریں۔ (نام، والد کا نام، جنس، تاریخ داخلہ، فون نمبر)');
                        return;
                      }
                      setActiveTab('guardians');
                    } else if (activeTab === 'guardians') {
                      const hasEmptyGuardian = guardians.some(g => !g.name);
                      if (hasEmptyGuardian) {
                        alert('برائے مہربانی تمام سرپرستوں کے نام درج کریں۔');
                        return;
                      }
                      setActiveTab('schools');
                    }
                  }}
                  className="mr-auto px-8 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 flex items-center gap-2 transition-all"
                >
                  <span>اگلا مرحلہ</span>
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="mr-auto px-12 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 flex items-center gap-3 transition-all active:scale-95"
                >
                  <Send size={20} />
                  <span>فارم جمع کریں</span>
                </button>
              )}
            </div>
          </div>
        </form>

        <footer className="text-center py-8 text-slate-400 text-xs space-y-1">
          <p>© 2026 {systemSettings.jamiaName} - تمام حقوق محفوظ ہیں</p>
          <p className="font-bold text-[10px] uppercase tracking-wider">Developed by: Abdulrehman Habib</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicAdmissionForm;
