import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, X, Book, GraduationCap, MapPin, Clock, FileText, 
  ShieldCheck, UserCircle, QrCode, Trash2, RefreshCcw, Plus,
  Download, Upload, AlertCircle
} from 'lucide-react';
import { API_BASE_URL, customFetch } from '../config';
import AccountManagement from './AccountManagement';
import SuperAdminPanel from './SuperAdminPanel';

interface SettingsProps {
  onBack: () => void;
  onSubViewChange?: (view: string) => void;
}

const SettingButton = ({ label, icon: Icon, color = "bg-blue-600", active = false, onClick }: { label: string, icon?: React.ElementType, color?: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all ${active ? 'bg-cyan-400 shadow-lg shadow-cyan-400/20' : `${color} hover:opacity-90 shadow-lg shadow-blue-500/10`} text-white font-urdu text-sm`}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span>{label}</span>
  </button>
);

const SubViewHeader = ({ title, onBack, extraActions }: { title: string, onBack: () => void, extraActions?: React.ReactNode }) => (
  <div className="bg-slate-800 p-4 flex items-center justify-between text-white rounded-t-2xl">
    <div className="flex items-center gap-2">
      <button onClick={onBack} className="hover:bg-white/10 p-1 rounded-lg transition-all pr-4">
        <X className="w-5 h-5" />
      </button>
      {extraActions}
    </div>
    <h3 className="font-urdu font-bold text-lg">{title}</h3>
  </div>
);

export default function Settings({ onBack, onSubViewChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [currentSubView, setCurrentSubView] = useState<string | null>(null);
  const [gradingTab, setGradingTab] = useState<'grades' | 'positions'>('grades');
  const [addressTab, setAddressTab] = useState<'address' | 'district'>('address');
  const [systemActiveTab, setSystemActiveTab] = useState('basic_monogram');

  // System Settings State
  const [systemSettings, setSystemSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      return saved ? JSON.parse(saved) : {
        jamiaName: 'جامعہ عربیہ سراج ا',
        registrationPrefix: 'JASM-',
        contactNumber: '0300-1234567',
        academicYear: '1442',
        passingMarks: 40,
        minAttendance: 75,
        monogram: ''
      };
    } catch (e) {
      return { jamiaName: 'جامعہ عربیہ سراج ا', registrationPrefix: 'JASM-', contactNumber: '0300-1234567', academicYear: '1442', passingMarks: 40, minAttendance: 75, monogram: '' };
    }
  });

  // Dynamic Lists State with localStorage persistence
  const [grades, setGrades] = useState(() => {
    try {
      const saved = localStorage.getItem('grades');
      return saved ? JSON.parse(saved) : [{ id: 1, name: 'اولیٰ', code: '01' }];
    } catch (e) { return [{ id: 1, name: 'اولیٰ', code: '01' }]; }
  });

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('addresses');
      return saved ? JSON.parse(saved) : [
        "چک 1/40-ایلا۔ محلہ تخت محلواں، شوکت آباد، ملتان",
        "لاہور", "ٹونکی", "سکھر", "خیبر"
      ];
    } catch (e) { return ["لاہور", "کراچی", "اسلام آباد"]; }
  });

  const [districts, setDistricts] = useState(() => {
    try {
      const saved = localStorage.getItem('districts');
      const defaultDistricts = [
        "لاہور", "کراچی", "اسلام آباد", "راولپنڈی", "پشاور", "کوئٹہ", "ملتان", "فیصل آباد", 
        "گوجرانوالہ", "سیالکوٹ", "بہاولپور", "سکھر", "حیدرآباد", "ڈیرہ غازی خان", "ڈیرہ اسماعیل خان", 
        "مردان", "سوات", "ایبٹ آباد", "گجرات", "سرگودھا", "ساہیوال", "شیخوپورہ", "قصور", "جھنگ", 
        "مظفر گڑھ", "رحیم یار خان", "لاڑکانہ", "نواب شاہ", "میرپور خاص", "کوہاٹ", "بنوں", "چارسدہ", 
        "صوابی", "نوشہرہ", "گوادر", "خضدار", "سبی", "لورالائی", "چمن", "زیارت", "گلگت", "سکردو", 
        "چترال", "مظفر آباد", "میرپور", "راولاکوٹ", "کوٹلی", "بھمبر", "باغ", "ہنزہ", "غذر", "استور", 
        "دیامر", "شگر", "کھرمنگ", "گھانچے", "چلاس"
      ];
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...defaultDistricts, ...parsed]));
      }
      return defaultDistricts;
    } catch (e) { return ["لاہور", "کراچی", "اسلام آباد"]; }
  });

  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('books');
      return saved ? JSON.parse(saved) : ["قاعدہ", "نماز و دعائیں", "تجوید", "ہجاء", "پہنگی"];
    } catch (e) { return ["قاعدہ"]; }
  });

  const [madrasas, setMadrasas] = useState(() => {
    try {
      const saved = localStorage.getItem('madrasas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [exams, setExams] = useState(() => {
    try {
      const saved = localStorage.getItem('exams');
      return saved ? JSON.parse(saved) : ["سالانہ", "ششماہی", "سہ ماہی"];
    } catch (e) { return ["سالانہ"]; }
  });

  const [hours, setHours] = useState(() => {
    try {
      const saved = localStorage.getItem('hours');
      return saved ? JSON.parse(saved) : ["مغرب", "فجر", "صبح"];
    } catch (e) { return ["فجر"]; }
  });

  const [expulsions, setExpulsions] = useState(() => {
    try {
      const saved = localStorage.getItem('expulsions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [gradeSettings, setGradeSettings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('gradeSettings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [minPositionPercentage, setMinPositionPercentage] = useState(() => {
    try {
      const saved = localStorage.getItem('minPositionPercentage');
      return saved ? Number(saved) : 70;
    } catch (e) { return 70; }
  });

  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('positions');
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'اول' },
        { id: 2, name: 'دوم' },
        { id: 3, name: 'سوم' }
      ];
    } catch (e) { return [{ id: 1, name: 'اول' }]; }
  });

  const [onlineLinks, setOnlineLinks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('online_links');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [onlineApplications, setOnlineApplications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('online_applications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [generatedLink, setGeneratedLink] = useState<any>(null);
  const [onlineTab, setOnlineTab] = useState<'links' | 'requests'>('links');

  // Persist states to localStorage
  React.useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
    localStorage.setItem('addresses', JSON.stringify(addresses));
    localStorage.setItem('districts', JSON.stringify(districts));
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('madrasas', JSON.stringify(madrasas));
    localStorage.setItem('exams', JSON.stringify(exams));
    localStorage.setItem('hours', JSON.stringify(hours));
    localStorage.setItem('expulsions', JSON.stringify(expulsions));
    localStorage.setItem('gradeSettings', JSON.stringify(gradeSettings));
    localStorage.setItem('minPositionPercentage', String(minPositionPercentage));
    localStorage.setItem('positions', JSON.stringify(positions));
    localStorage.setItem('online_links', JSON.stringify(onlineLinks));
    localStorage.setItem('online_applications', JSON.stringify(onlineApplications));
    localStorage.setItem('system_settings', JSON.stringify(systemSettings));
  }, [grades, addresses, districts, books, madrasas, exams, hours, expulsions, gradeSettings, minPositionPercentage, positions, onlineLinks, onlineApplications, systemSettings]);

  const generateAdmissionLink = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const uses = formInput.linkUses || 1;
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + 1);

    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}?form=admission&token=${token}`;

    const newLink = {
      id: Date.now(),
      token,
      createdAt: now.toLocaleDateString('en-GB'),
      expiryDate: expiry.toLocaleDateString('en-GB'),
      remainingUses: uses,
      url: fullUrl,
      masked: `...${token.substring(token.length - 8)}`
    };

    setOnlineLinks([newLink, ...onlineLinks]);
    setGeneratedLink(newLink);
  };

  // Form States
  const [formInput, setFormInput] = useState<{ [key: string]: any }>({});

  const handleAdd = (type: string) => {
    switch (type) {
      case 'grade':
        if (!formInput.gradeName || !formInput.gradeCode) return;
        setGrades([...grades, { id: Date.now(), name: formInput.gradeName, code: formInput.gradeCode }]);
        break;
      case 'address':
        if (!formInput.address) return;
        setAddresses([...addresses, formInput.address]);
        break;
      case 'district':
        if (!formInput.district) return;
        setDistricts([...districts, formInput.district]);
        break;
      case 'book':
        if (!formInput.book) return;
        setBooks([...books, formInput.book]);
        break;
      case 'madrasa':
        if (!formInput.madrasa) return;
        setMadrasas([...madrasas, formInput.madrasa]);
        break;
      case 'exam':
        if (!formInput.exam) return;
        setExams([...exams, formInput.exam]);
        break;
      case 'hour':
        if (!formInput.hour) return;
        setHours([...hours, formInput.hour]);
        break;
      case 'expulsion':
        if (!formInput.reason) return;
        setExpulsions([...expulsions, { id: Date.now(), reason: formInput.reason, isCompleted: !!formInput.isCompleted }]);
        break;
      case 'grade_setting':
        if (!formInput.gradeName) return;
        setGradeSettings([...gradeSettings, { 
          name: formInput.gradeName, 
          min: formInput.minPercentage || 0, 
          max: formInput.maxPercentage || 0, 
          grace: formInput.graceMarks || 0, 
          isFail: !!formInput.isFail 
        }]);
        break;
      case 'position':
        if (!formInput.position) return;
        setPositions([...positions, { id: positions.length + 1, name: formInput.position }]);
        break;
    }
    setFormInput({});
  };

  const handleDelete = (type: string, id: any) => {
    switch (type) {
      case 'grade': setGrades(grades.filter(g => g.id !== id)); break;
      case 'address': setAddresses(addresses.filter((_, i) => i !== id)); break;
      case 'district': setDistricts(districts.filter((_, i) => i !== id)); break;
      case 'book': setBooks(books.filter((_, i) => i !== id)); break;
      case 'madrasa': setMadrasas(madrasas.filter((_, i) => i !== id)); break;
      case 'exam': setExams(exams.filter((_, i) => i !== id)); break;
      case 'hour': setHours(hours.filter((_, i) => i !== id)); break;
      case 'expulsion': setExpulsions(expulsions.filter(e => e.id !== id)); break;
      case 'grade_setting': setGradeSettings(gradeSettings.filter((_, i) => i !== id)); break;
      case 'position': setPositions(positions.filter(p => p.id !== id)); break;
    }
  };

  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true' || localStorage.getItem('currentUser') === 'jamiaarabiasirajululoomjabori@gmail.com';
  const currentUserRole = localStorage.getItem('currentUserRole') || 'Admin';
  const isAccountManagerAdmin = currentUserRole === 'Admin' || isSuperAdmin;

  const tabs = [
    { id: 'basic', label: 'بنیادی ترتیبات' },
    { id: 'registration', label: 'رجسٹریشن نمبر ترتیبات' },
    { id: 'date', label: 'تاریخ کی ترتیبات' },
    ...(isAccountManagerAdmin ? [{ id: 'account', label: 'اکاؤنٹ مینجمنٹ' }] : []),
    { id: 'online', label: 'آن لائن داخلہ فارم' },
    { id: 'system', label: 'نظام کی ترتیبات' },
    ...(isSuperAdmin ? [{ id: 'superadmin', label: 'سپر ایڈمن کنٹرول (مدارس مینیجر)' }] : []),
  ];

  const renderSubView = () => {
    switch (currentSubView) {
      case 'grades':
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="نیا درجہ شامل کریں" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">درجہ کا نام:</label>
                <input 
                  type="text" 
                  value={formInput.gradeName || ''}
                  onChange={(e) => setFormInput({...formInput, gradeName: e.target.value})}
                  placeholder="مثلاً حفظ، اعدادیہ، اولیٰ" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">درجہ کا کوڈ:</label>
                <input 
                  type="text" 
                  value={formInput.gradeCode || ''}
                  onChange={(e) => setFormInput({...formInput, gradeCode: e.target.value})}
                  placeholder="مثلاً TAHFIZ" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <button 
                onClick={() => handleAdd('grade')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold hover:bg-blue-700 transition-colors"
              >
                محفوظ کریں
              </button>
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase text-right">موجودہ درجات</h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-right">
                    <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-4">درجہ کا نام</th>
                        <th className="py-2 px-4">درجہ کا کوڈ</th>
                        <th className="py-2 px-4">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {grades.map((grade) => (
                        <tr key={grade.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-urdu">{grade.name}</td>
                          <td className="py-3 px-4 font-mono">{grade.code}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => handleDelete('grade', grade.id)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu hover:bg-red-600 transition-colors">ڈیلیٹ</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="تمام ایڈریس" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="flex border-b border-slate-100 mb-6">
                <button 
                  onClick={() => setAddressTab('address')}
                  className={`flex-1 py-2 text-sm font-urdu font-bold transition-all ${addressTab === 'address' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'} rounded-t-lg`}
                >
                  ایڈریس
                </button>
                <button 
                  onClick={() => setAddressTab('district')}
                  className={`flex-1 py-2 text-sm font-urdu font-bold transition-all ${addressTab === 'district' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'} rounded-t-lg`}
                >
                  اضلاع
                </button>
              </div>

              {addressTab === 'address' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-sm font-urdu text-slate-700">ایڈریس:</label>
                  <input 
                    type="text" 
                    value={formInput.address || ''}
                    onChange={(e) => setFormInput({...formInput, address: e.target.value})}
                    placeholder="ایڈریس لکھیں" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                  <button 
                    onClick={() => handleAdd('address')}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold"
                  >
                    ایڈریس محفوظ کریں
                  </button>
                  <div className="pt-6 h-80 overflow-y-auto">
                    <table className="w-full text-right">
                      <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                        <tr>
                          <th className="py-2 px-4 text-center w-12 italic font-mono">No</th>
                          <th className="py-2 px-4 text-right">ایڈریس</th>
                          <th className="py-2 px-4">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {addresses.map((addr, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-4 font-urdu text-slate-600">{addr}</td>
                            <td className="py-3 px-4">
                              <button onClick={() => handleDelete('address', idx)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu">ڈیلیٹ</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-sm font-urdu text-slate-700">ضلع کا نام:</label>
                  <input 
                    type="text" 
                    value={formInput.district || ''}
                    onChange={(e) => setFormInput({...formInput, district: e.target.value})}
                    placeholder="ضلع کا نام لکھیں" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                  <button 
                    onClick={() => handleAdd('district')}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold"
                  >
                    ضلع محفوظ کریں
                  </button>
                  <div className="pt-6 h-80 overflow-y-auto">
                    <table className="w-full text-right">
                      <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                        <tr>
                          <th className="py-2 px-4 text-center w-12 italic font-mono">No</th>
                          <th className="py-2 px-4 text-right">ضلع</th>
                          <th className="py-2 px-4">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {districts.map((dist, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-4 font-urdu text-slate-600">{dist}</td>
                            <td className="py-3 px-4">
                              <button onClick={() => handleDelete('district', idx)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu">ڈیلیٹ</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'books':
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="نئی کتاب شامل کریں" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">کتاب کا نام:</label>
                <input 
                  type="text" 
                  value={formInput.book || ''}
                  onChange={(e) => setFormInput({...formInput, book: e.target.value})}
                  placeholder="مثلاً تفسیر جلالین" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAdd('book')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold hover:bg-blue-700 transition-all">محفوظ کریں</button>
                <button onClick={() => setFormInput({...formInput, book: ''})} className="flex-1 bg-slate-500 text-white py-3 rounded-xl font-urdu font-bold hover:bg-slate-600">منسوخ کریں</button>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">موجودہ کتابیں</h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-right">
                    <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-4 text-right">کتاب کا نام</th>
                        <th className="py-2 px-4 text-left">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {books.map((book, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-3 px-4 font-urdu">{book}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-start">
                              <button onClick={() => handleDelete('book', idx)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu">ڈیلیٹ</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'madrasas':
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="سابقہ مدرسہ شامل کریں" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">سابقہ مدرسے کا نام:</label>
                <input 
                  type="text" 
                  value={formInput.madrasa || ''}
                  onChange={(e) => setFormInput({...formInput, madrasa: e.target.value})}
                  placeholder="مثلاً جامعہ اشرفیہ، لاہور، دارالعلوم کراچی" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAdd('madrasa')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold hover:bg-blue-700">محفوظ کریں</button>
                <button onClick={() => setFormInput({...formInput, madrasa: ''})} className="flex-1 bg-slate-500 text-white py-3 rounded-xl font-urdu font-bold hover:bg-slate-600">منسوخ کریں</button>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">موجودہ سابقہ مدارس کے نام</h4>
                {madrasas.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-urdu border-2 border-dashed border-slate-50 rounded-xl">
                    کوئی سابقہ مدارس کے نام رجسٹرڈ نہیں ہیں۔
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-right">
                      <tbody className="text-sm">
                        {madrasas.map((m, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-4 font-urdu text-slate-600">{m}</td>
                            <td className="py-3 px-4 text-left">
                              <button onClick={() => handleDelete('madrasa', idx)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu">ڈیلیٹ</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'exams':
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="امتحان کا نام شامل کریں" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">امتحان کا نام:</label>
                <input 
                  type="text" 
                  value={formInput.exam || ''}
                  onChange={(e) => setFormInput({...formInput, exam: e.target.value})}
                  placeholder="مثلاً ماہانہ امتحان، سمسٹر امتحان" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAdd('exam')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold">محفوظ کریں</button>
                <button onClick={() => setFormInput({...formInput, exam: ''})} className="flex-1 bg-slate-500 text-white py-3 rounded-xl font-urdu font-bold">منسوخ کریں</button>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">موجودہ امتحان کے نام</h4>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-right">
                    <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-4 text-right">امتحان کا نام</th>
                        <th className="py-2 px-4 text-left">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {exams.map((exam, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-3 px-4 font-urdu text-slate-600">{exam}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-start">
                              <button onClick={() => handleDelete('exam', idx)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu">ڈیلیٹ</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'hours':
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="نیا گھنٹہ شامل کریں" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">گھنٹے کا نام:</label>
                <input 
                  type="text" 
                  value={formInput.hour || ''}
                  onChange={(e) => setFormInput({...formInput, hour: e.target.value})}
                  placeholder="مثلاً صبح کی حفاظت" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAdd('hour')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold">محفوظ کریں</button>
                <button onClick={() => setFormInput({...formInput, hour: ''})} className="flex-1 bg-slate-500 text-white py-3 rounded-xl font-urdu font-bold">منسوخ کریں</button>
              </div>
              
              <div className="pt-6 border-t border-slate-100 text-right">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">موجودہ گھنٹے</h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-right">
                    <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-4 text-right">گھنٹے کا نام</th>
                        <th className="py-2 px-4 text-left">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {hours.map((hour, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-3 px-4 font-urdu">{hour}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-start">
                              <button onClick={() => handleDelete('hour', idx)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-urdu">ڈیلیٹ</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'grading':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader 
              title="گریڈ اور پوزیشن ترتیبات" 
              extraActions={
                <div className="flex gap-2">
                  <button 
                    onClick={() => onSubViewChange?.('exam_management')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold font-urdu hover:bg-blue-700"
                  >
                    واپس امتحان مینجمنٹ
                  </button>
                </div>
              }
              onBack={() => setCurrentSubView(null)} 
            />
            <div className="p-8 space-y-8 text-right font-urdu" dir="rtl">
              <div className="flex gap-8 border-b border-slate-100 mb-4 text-sm font-bold">
                <button 
                  onClick={() => setGradingTab('grades')}
                  className={`pb-2 border-b-2 transition-all ${gradingTab === 'grades' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  گریڈ ترتیبات
                </button>
                <button 
                  onClick={() => setGradingTab('positions')}
                  className={`pb-2 border-b-2 transition-all ${gradingTab === 'positions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  پوزیشن ترتیبات
                </button>
              </div>

              {gradingTab === 'grades' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <h4 className="bg-emerald-600 text-white px-4 py-1 text-xs inline-block rounded">نیا گریڈ شامل کریں</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 whitespace-nowrap text-right block">گریڈ کا نام *</label>
                        <input 
                          type="text" 
                          value={formInput.gradeName || ''}
                          onChange={(e) => setFormInput({...formInput, gradeName: e.target.value})}
                          placeholder="مثلاً ممتاز، جید جدا" 
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-xs outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 whitespace-nowrap text-right block">کم از کم فیصد *</label>
                        <input 
                          type="number" 
                          value={formInput.minPercentage || 0}
                          onChange={(e) => setFormInput({...formInput, minPercentage: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-xs outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 whitespace-nowrap text-right block">زیادہ سے زیادہ فیصد *</label>
                        <input 
                          type="number" 
                          value={formInput.maxPercentage || 0}
                          onChange={(e) => setFormInput({...formInput, maxPercentage: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-xs outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 whitespace-nowrap text-right block">رعایتی نمبرات</label>
                        <input 
                          type="number" 
                          value={formInput.graceMarks || 0}
                          onChange={(e) => setFormInput({...formInput, graceMarks: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-xs outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 whitespace-nowrap text-right block">فیل کا تعین</label>
                        <div className="flex items-center gap-2 mt-2">
                          <input 
                            type="checkbox" 
                            id="isFail" 
                            checked={formInput.isFail || false}
                            onChange={(e) => setFormInput({...formInput, isFail: e.target.checked})}
                          />
                          <label htmlFor="isFail" className="text-[10px] text-slate-500">اس فیصد سے کم پر راسب</label>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleAdd('grade_setting')} className="bg-blue-600 text-white px-8 py-2 rounded font-bold text-xs hover:bg-blue-700 transition-all">شامل کریں</button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="bg-blue-600 text-white px-4 py-1 text-xs inline-block rounded">موجودہ گریڈ ترتیبات</h4>
                    {gradeSettings.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-slate-50 rounded-xl text-center text-xs text-slate-400">
                        کوئی گریڈ ترتیب موجود نہیں ہے۔ اوپر دیے گئے فارم سے نئی ترتیب شامل کریں۔
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-400">
                            <tr>
                              <th className="p-3">گریڈ</th>
                              <th className="p-3">فیصد</th>
                              <th className="p-3">رعایتی</th>
                              <th className="p-3">حیثیت</th>
                              <th className="p-3">عمل</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gradeSettings.map((gs, idx) => (
                              <tr key={idx} className="border-b border-slate-50">
                                <td className="p-3 font-bold">{gs.name}</td>
                                <td className="p-3 font-mono">{gs.min}% - {gs.max}%</td>
                                <td className="p-3">{gs.grace}</td>
                                <td className="p-3">{gs.isFail ? <span className="text-red-500">راسب</span> : <span className="text-emerald-500">ناجح</span>}</td>
                                <td className="p-3">
                                  <button onClick={() => handleDelete('grade_setting', idx)} className="text-red-500 hover:text-red-700">ڈیلیٹ</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <div className="bg-cyan-500 text-white px-4 py-2 text-xs font-bold">پوزیشن کی کم از کم فیصد سیٹ کریں</div>
                    <div className="p-6">
                      <div className="bg-white border border-blue-100 p-4 rounded-lg flex items-start gap-4 mb-4">
                        <div className="flex-1 text-[11px] leading-relaxed text-slate-600">
                          <span className="font-bold text-slate-900 block mb-1 underline">وضاحت:</span>
                          طلبہ کی فیصد اس سیٹ کردہ فیصد تک پہنچنی چاہیے ہو تو اس سے آگے پوزیشن دی جائے گی۔ مثال کے طور پر اگر آپ 70% سیٹ کریں تو صرف وہی طلبہ پوزیشن پائیں گے جن کے فیصد 70% یا اس سے زیادہ ہو گی۔ جو طلبہ 70% سے کم فیصد حاصل کریں گے، انہیں کوئی پوزیشن نہیں دی جائے گی۔
                        </div>
                        <div className="space-y-2 w-32">
                          <label className="text-[10px] text-slate-400 block">کم از کم فیصد</label>
                          <input 
                            type="number" 
                            value={minPositionPercentage}
                            onChange={(e) => setMinPositionPercentage(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none" 
                          />
                        </div>
                        <button className="bg-cyan-500 text-white w-12 h-12 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg shadow-cyan-200 shrink-0 hover:scale-105 active:scale-95 transition-all">سیٹ کریں</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold">نئی پوزیشن شامل کریں</div>
                    <div className="p-6 flex items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] text-slate-400 block">پوزیشن کا نام *</label>
                        <input 
                          type="text" 
                          value={formInput.position || ''}
                          onChange={(e) => setFormInput({...formInput, position: e.target.value})}
                          placeholder="مثلاً: اول، دوم، سوم، فرسٹ، سیکنڈ، تھرڈ" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                        />
                      </div>
                      <button onClick={() => handleAdd('position')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">نئی پوزیشن شامل کریں</button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-blue-600 text-white px-4 py-2 text-xs font-bold">موجودہ پوزیشن ترتیبات</div>
                    <div className="p-6 space-y-4">
                      <p className="text-[10px] text-slate-400">ہر پوزیشن کا نام اپنی مرضی سے تبدیل کر سکتے ہیں ۔ مثال : اول، دوم، سوم یا فرسٹ ، سیکنڈ ، تھرڈ وغیرہ ۔</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {positions.map((pos) => (
                          <div key={pos.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative group">
                            <span className="absolute top-2 right-4 bg-slate-400 text-white px-2 py-0.5 rounded text-[8px] font-bold">پوزیشن {pos.id}</span>
                            <button 
                              onClick={() => handleDelete('position', pos.id)}
                              className="absolute top-2 left-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                            <div className="pt-4 space-y-1">
                              <label className="text-[10px] text-slate-500">پوزیشن کا نام</label>
                              <input 
                                type="text" 
                                value={pos.name} 
                                onChange={(e) => {
                                  setPositions(positions.map(p => p.id === pos.id ? {...p, name: e.target.value} : p));
                                }}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded text-sm outline-none font-bold focus:border-blue-300 transition-all" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'expulsion':
        return (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <SubViewHeader title="اخراج کی وجہ شامل کریں" onBack={() => setCurrentSubView(null)} />
            <div className="p-8 space-y-6 text-right" dir="rtl">
              <div className="space-y-4">
                <label className="text-sm font-urdu text-slate-700">اخراج کی وجہ:</label>
                <input 
                  type="text" 
                  value={formInput.reason || ''}
                  onChange={(e) => setFormInput({...formInput, reason: e.target.value})}
                  placeholder="مثلاً اخلاص عمل، والڈ کا خود، رخصت، وغیرہ" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <input 
                  type="checkbox" 
                  className="mt-1 ring-2 ring-white" 
                  checked={formInput.isCompleted || false}
                  onChange={(e) => setFormInput({...formInput, isCompleted: e.target.checked})}
                />
                <div className="space-y-1">
                  <p className="text-xs font-urdu text-slate-700 font-bold">کلاس / ارسال مکمل ہوا ہے؟</p>
                  <p className="text-[10px] font-urdu text-slate-400">اگر چیک باکس چیک کریں گے تو اس سے منتخب ہو گا کہ طالب علم نے اپنا سال / کلاس مکمل کر لیا ہے۔</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAdd('expulsion')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-urdu font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/10">محفوظ کریں</button>
                <button onClick={() => setFormInput({})} className="flex-1 bg-slate-500 text-white py-3 rounded-xl font-urdu font-bold hover:bg-slate-600">منسوخ کریں</button>
              </div>
              
              <div className="pt-6 border-t border-slate-100 font-urdu">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">موجودہ اخراج کی وجوہات</h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-right">
                    <thead className="text-[10px] text-slate-400 bg-slate-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-4">وجہ</th>
                        <th className="py-2 px-4">حیثیت</th>
                        <th className="py-2 px-4 text-left">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {expulsions.map((exp) => (
                        <tr key={exp.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-3 px-4">{exp.reason}</td>
                          <td className="py-3 px-4">{exp.isCompleted ? 'مکمل' : 'نامکمل'}</td>
                          <td className="py-3 px-4 text-left">
                            <button onClick={() => handleDelete('expulsion', exp.id)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px]">ڈیلیٹ</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {expulsions.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-50 rounded-xl">
                      کوئی اخراج کی وجوہات رجسٹرڈ نہیں ہیں۔
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-slate-200 shadow-sm z-10">
        <button 
          onClick={onBack}
          className="bg-red-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 font-urdu"
        >
          <X className="w-4 h-4" />
          <span>بند کریں</span>
        </button>

        <div className="flex items-center gap-4" dir="rtl">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-urdu text-slate-900">ترتیبات (Settings)</h1>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white px-8 py-2 border-b border-slate-200 flex justify-end gap-2 relative z-10" dir="rtl">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentSubView(null);
            }}
            className={`px-6 py-3 rounded-xl text-sm font-urdu font-bold transition-all border-b-4 ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-1 w-full bg-green-600" />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'basic' && (
            <>
              {currentSubView ? (
                renderSubView()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500" dir="rtl">
                  <SettingButton label="تمام ایڈریس" onClick={() => setCurrentSubView('addresses')} />
                  <SettingButton label="پڑھائی جانے والی کتابیں" icon={Book} onClick={() => setCurrentSubView('books')} />
                  <SettingButton label="پڑھائے جانے والے درجات" icon={GraduationCap} onClick={() => setCurrentSubView('grades')} />
                  
                  <SettingButton label="سابقہ مدارس کے نام" icon={MapPin} onClick={() => setCurrentSubView('madrasas')} />
                  <SettingButton label="امتحان کے نام" icon={FileText} onClick={() => setCurrentSubView('exams')} />
                  <SettingButton label="حاضری کے اوقات" icon={Clock} onClick={() => setCurrentSubView('hours')} />
                  
                  <SettingButton label="تصویر و پوریشن کا معیار" icon={FileText} onClick={() => setCurrentSubView('grading')} />
                  <SettingButton label="رجسٹریشن نمبر ترتیبات" icon={Plus} active={true} onClick={() => setActiveTab('registration')} />
                  <SettingButton label="اخراج کی وجوہات" icon={Plus} onClick={() => setCurrentSubView('expulsion')} />
                </div>
              )}
            </>
          )}

          {activeTab === 'registration' && (
            <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
              <div className="bg-blue-600 p-4 text-center">
                <h3 className="text-white font-urdu font-bold">رجسٹریشن نمبر فارمیٹ ترتیبات</h3>
              </div>
              <div className="p-10 space-y-8" dir="rtl">
                <div className="space-y-4">
                  <label className="text-sm font-urdu text-slate-700 block text-right">رجسٹریشن نمبر فارمیٹ :</label>
                  <input 
                    type="text" 
                    defaultValue="[class]-[year]/[serial]" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <p className="text-[10px] font-urdu text-slate-400 leading-relaxed">
                    دستی ٹیگ استعمال کریں: <span className="text-red-500 font-mono">[class]</span> کلاس کا کوڈ، <span className="text-red-500 font-mono">[year]</span> سال، <span className="text-red-500 font-mono">[serial]</span> سیریل نمبر۔ علیحدگی کنندہ خود شامل کریں جیسے - یا / ۔ مثال: <span className="text-slate-900 font-mono">[class]-[year]/[serial]</span> مِیں سے کم از کم ایک ٹیگ استعمال کریں۔
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-urdu text-slate-700 block text-right">سال کی قسم:</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-urdu text-slate-600 outline-none">
                    <option>عیسوی سن</option>
                    <option>ہجری سن</option>
                  </select>
                </div>

                <div className="space-y-4 pt-4">
                  <span className="text-xs font-urdu text-slate-400 block text-right">پیش نظارہ:</span>
                  <div className="px-6 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-bold text-lg text-slate-700 font-mono">
                    CLS-2024/001
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">محفوظ کریں</button>
                  <button className="px-8 bg-slate-500 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-slate-600">واپس</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'date' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" dir="rtl">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl">
                <h3 className="text-lg font-urdu text-slate-700 mb-6">طالب علم کی حاضری کے لیے کیلنڈر کی قسم</h3>
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-urdu text-slate-400">کیلنڈر کی قسم</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option>عیسوی</option>
                  </select>
                  <button className="self-center bg-emerald-600 text-white px-8 py-2 rounded-full font-urdu text-sm hover:bg-emerald-700 transition-all mt-4">محفوظ کریں</button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl">
                <h3 className="text-lg font-urdu text-slate-700 mb-6">اسٹاف کی حاضری کے لیے کیلنڈر کی قسم</h3>
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-urdu text-slate-400">کیلنڈر کی قسم</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option>عیسوی</option>
                  </select>
                  <button className="self-center bg-emerald-600 text-white px-8 py-2 rounded-full font-urdu text-sm hover:bg-emerald-700 transition-all mt-4">محفوظ کریں</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <AccountManagement />
            </div>
          )}

          {activeTab === 'online' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500" dir="rtl">
              <div className="flex gap-4 border-b border-slate-100 pb-2">
                <button 
                  onClick={() => setOnlineTab('links')}
                  className={`px-8 py-3 rounded-2xl font-urdu font-bold transition-all ${onlineTab === 'links' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  آن لائن لنکس
                </button>
                <button 
                  onClick={() => setOnlineTab('requests')}
                  className={`px-8 py-3 rounded-2xl font-urdu font-bold transition-all flex items-center gap-2 ${onlineTab === 'requests' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <span>موصولہ درخواستیں</span>
                  {onlineApplications.filter(a => a.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {onlineApplications.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>

              {onlineTab === 'links' ? (
                <>
                  <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold font-urdu text-slate-800">آن لائن اندراج لنک جنریٹ کریں</h3>
                      <p className="text-xs font-urdu text-slate-400">اس لنک سے طلبہ آن لائن فارم بھر سکتے ہیں، جو پینڈنگ میں جمع ہو جائیں گے۔</p>
                      <p className="text-[10px] font-urdu text-slate-300">استعمال کی تعداد (ڈیفالٹ: 1)</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={generateAdmissionLink}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                      >
                        لنک جنریٹ کریں
                      </button>
                      <input 
                        type="number" 
                        value={formInput.linkUses || 1}
                        onChange={(e) => setFormInput({...formInput, linkUses: Number(e.target.value)})}
                        className="w-32 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    {generatedLink && (
                      <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] space-y-4 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">جنریٹڈ لنک اور QR:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-urdu font-bold text-slate-700">لنک:</span>
                              <a href={generatedLink.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 underline break-all font-mono">
                                {generatedLink.url}
                              </a>
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-xl shadow-sm">
                            <QrCode className="w-24 h-24 text-slate-800" />
                            <span className="text-[10px] font-urdu text-slate-400 block text-center mt-1">QR کوڈ</span>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => setGeneratedLink(null)}
                            className="bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-urdu hover:bg-slate-900 transition-all"
                          >
                            نیا جنریٹ کریں
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-xl">
                    <div className="p-6 bg-slate-50 border-b border-slate-100">
                      <h3 className="text-lg font-bold font-urdu text-slate-700">گزشتہ بنائے گئے لنک</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right" dir="rtl">
                        <thead className="bg-[#1e293b] text-white">
                          <tr>
                            <th className="px-6 py-4 text-xs font-urdu">لنک (ماسکڈ)</th>
                            <th className="px-6 py-4 text-xs font-urdu">بنایا گیا</th>
                            <th className="px-6 py-4 text-xs font-urdu">ختم ہونے کی تاریخ</th>
                            <th className="px-6 py-4 text-xs font-urdu">باقی استعمال</th>
                            <th className="px-6 py-4 text-xs font-urdu">عمل</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {onlineLinks.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-mono text-slate-500">{item.masked}</td>
                              <td className="px-6 py-4 text-slate-600">{item.createdAt}</td>
                              <td className="px-6 py-4 text-slate-600">{item.expiryDate}</td>
                              <td className="px-6 py-4 text-center font-bold">{item.remainingUses}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {item.remainingUses === 0 ? (
                                    <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-urdu">غیر فعال ڈیلیٹ</span>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => setGeneratedLink(item)}
                                        className="bg-cyan-400 text-white px-4 py-1 rounded-full text-[10px] font-urdu flex items-center gap-1"
                                      >
                                        <QrCode className="w-3 h-3" /> دوبارہ استعمال (لنک/QR)
                                      </button>
                                      <button 
                                        onClick={() => setOnlineLinks(onlineLinks.filter(l => l.id !== item.id))}
                                        className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {onlineLinks.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-400 font-urdu">کوئی لنک دستیاب نہیں ہے</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-xl animate-in fade-in duration-300">
                  <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-lg font-bold font-urdu text-slate-700">آن لائن موصول ہونے والی درخواستیں</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead className="bg-[#1e293b] text-white font-urdu">
                        <tr>
                          <th className="px-6 py-4 text-xs">طالب علم کا نام</th>
                          <th className="px-6 py-4 text-xs">والد کا نام</th>
                          <th className="px-6 py-4 text-xs">تاریخ</th>
                          <th className="px-6 py-4 text-xs">حیثیت</th>
                          <th className="px-6 py-4 text-xs">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {onlineApplications.map((app) => (
                          <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold">{app.data.basicInfo.name}</td>
                            <td className="px-6 py-4">{app.data.basicInfo.fatherName}</td>
                            <td className="px-6 py-4 text-slate-500">{app.submittedAt}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-urdu ${
                                app.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                app.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {app.status === 'pending' ? 'پینڈنگ' : app.status === 'accepted' ? 'قبول' : 'مسترد'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="text-blue-500 hover:underline">دیکھیں</button>
                                {app.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setOnlineApplications(onlineApplications.map(a => a.id === app.id ? {...a, status: 'accepted'} : a));
                                      }}
                                      className="text-emerald-500 hover:underline"
                                    >قبول</button>
                                    <button 
                                      onClick={() => {
                                        setOnlineApplications(onlineApplications.map(a => a.id === app.id ? {...a, status: 'rejected'} : a));
                                      }}
                                      className="text-red-500 hover:underline"
                                    >مسترد</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {onlineApplications.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-urdu">کوئی درخواست موصول نہیں ہوئی</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500" dir="rtl">
              {/* System Settings Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <SettingsIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-urdu text-slate-800">نظام کی ترتیبات (System Settings)</h2>
                    <p className="text-[10px] text-slate-400 font-urdu">سافٹ ویئر کی کارکردگی اور ڈیزائن کو کنٹرول کریں</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    alert('ترتیبات محفوظ ہو گئیں!');
                  }}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-urdu font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95"
                >
                   <FileText className="w-4 h-4" />
                   <span>محفوظ کریں (Save All)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-3">
                  {[
                    { id: 'basic_monogram', label: 'بنیادی و مونوگرام', icon: SettingsIcon },
                    { id: 'security', label: 'سیکیورٹی و پاسورڈ', icon: ShieldCheck },
                    { id: 'education', label: 'تعلیمی ترتیبات', icon: Book },
                    { id: 'exam_std', label: 'امتحانی معیار', icon: GraduationCap },
                    { id: 'backup_restore', label: 'ڈیٹا بیک اپ و ریسٹور', icon: RefreshCcw },
                    { id: 'updates', label: 'سسٹم اپڈیٹس', icon: RefreshCcw },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSystemActiveTab(item.id)}
                      className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between transition-all group ${
                        systemActiveTab === item.id 
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 -translate-x-2' 
                          : 'bg-white text-slate-500 hover:bg-slate-50 shadow-sm border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 opacity-70" />
                        <span className="font-urdu font-bold text-sm">{item.label}</span>
                      </div>
                      <X className={`w-3 h-3 rotate-45 transition-transform ${systemActiveTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 min-h-[500px]">
                    {systemActiveTab === 'basic_monogram' && (
                      <div className="space-y-10 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="h-0.5 w-12 bg-blue-600" />
                          <h3 className="text-xl font-bold font-urdu text-slate-800">بنیادی معلومات و مونوگرام</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          {/* Monogram Section */}
                          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 group relative">
                             <div className="text-[10px] text-slate-400 absolute top-4 left-4 font-urdu">منظرہ / مونوگرام</div>
                             <div className="w-40 h-40 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300">
                                {systemSettings.monogram ? (
                                  <img src={systemSettings.monogram} alt="Monogram" className="w-full h-full object-contain" />
                                ) : (
                                  <div className="text-slate-200">
                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                )}
                             </div>
                             <button 
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onload = (re) => {
                                      setSystemSettings({ ...systemSettings, monogram: re.target?.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  };
                                  input.click();
                                }}
                                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-urdu font-bold text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
                             >
                                <Plus className="w-4 h-4" />
                                <span>مونوگرام اپلوڈ کریں</span>
                             </button>
                          </div>

                          {/* Info Section */}
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 font-urdu block pr-2">جامعہ کا نام (اردو)</label>
                              <input 
                                type="text" 
                                value={systemSettings.jamiaName}
                                onChange={(e) => setSystemSettings({...systemSettings, jamiaName: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-urdu text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 font-urdu block pr-2">رجسٹریشن نمبر پری فکس</label>
                              <input 
                                type="text" 
                                value={systemSettings.registrationPrefix}
                                onChange={(e) => setSystemSettings({...systemSettings, registrationPrefix: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 font-urdu block pr-2">رابطہ نمبر</label>
                              <input 
                                type="text" 
                                value={systemSettings.contactNumber}
                                onChange={(e) => setSystemSettings({...systemSettings, contactNumber: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {systemActiveTab === 'security' && (
                      <div className="space-y-10 animate-in fade-in duration-300 max-w-lg mx-auto">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="h-0.5 w-12 bg-red-600" />
                          <h3 className="text-xl font-bold font-urdu text-slate-800">سیکیورٹی و پاسورڈ تبدیل کریں</h3>
                        </div>

                        <div className="space-y-6 pt-4">
                          <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 font-urdu block pr-2">موجودہ پاسورڈ</label>
                              <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 font-urdu block pr-2">نیا پاسورڈ</label>
                              <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 font-urdu block pr-2">پاسورڈ کی تصدیق</label>
                              <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                          </div>
                          
                          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-urdu font-bold shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
                             <ShieldCheck className="w-5 h-5" />
                             <span>پاسورڈ اپڈیٹ کریں</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {systemActiveTab === 'education' && (
                      <div className="space-y-10 animate-in fade-in duration-300">
                         <div className="flex items-center gap-4 mb-2">
                          <div className="h-0.5 w-12 bg-emerald-600" />
                          <h3 className="text-xl font-bold font-urdu text-slate-800">تعلیمی سال و کلاسیں</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                           <div className="flex-1 space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-urdu block pr-2">موجودہ تعلیمی سال</label>
                                <input 
                                  type="text" 
                                  value={systemSettings.academicYear}
                                  onChange={(e) => setSystemSettings({...systemSettings, academicYear: e.target.value})}
                                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg text-center outline-none" 
                                />
                              </div>
                           </div>

                           <div className="flex-[2] bg-slate-50 border border-slate-200 rounded-[32px] p-8">
                             <h4 className="text-[10px] font-bold text-slate-400 font-urdu mb-4 uppercase">کلاس لسٹ (دستیاب درجے)</h4>
                             <div className="flex flex-wrap gap-3">
                                {['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'سادسہ', 'سابعہ', 'ثامنہ'].map((c) => (
                                  <div key={c} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm text-sm font-urdu text-slate-700 hover:border-blue-400 transition-colors cursor-pointer">
                                     {c}
                                  </div>
                                ))}
                                <button className="bg-blue-100 text-blue-600 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-200">
                                   <Plus className="w-4 h-4" />
                                   <span>نیا شامل کریں</span>
                                </button>
                             </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {systemActiveTab === 'exam_std' && (
                      <div className="space-y-10 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="h-0.5 w-12 bg-orange-600" />
                          <h3 className="text-xl font-bold font-urdu text-slate-800">امتحانی معیار و حاضری</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-sm font-bold font-urdu text-slate-700 pr-2">امتحان پاس کرنے کے نمبر (%)</label>
                              <div className="relative group">
                                <input 
                                  type="number" 
                                  value={systemSettings.passingMarks}
                                  onChange={(e) => setSystemSettings({...systemSettings, passingMarks: Number(e.target.value)})}
                                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-2xl text-center text-blue-600 outline-none group-focus-within:border-blue-400 group-focus-within:bg-white transition-all shadow-inner" 
                                />
                                <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 font-bold">%</div>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-sm font-bold font-urdu text-slate-700 pr-2">کم از کم حاضری (%)</label>
                              <div className="relative group">
                                <input 
                                  type="number" 
                                  value={systemSettings.minAttendance}
                                  onChange={(e) => setSystemSettings({...systemSettings, minAttendance: Number(e.target.value)})}
                                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-2xl text-center text-emerald-600 outline-none group-focus-within:border-emerald-400 group-focus-within:bg-white transition-all shadow-inner" 
                                />
                                <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 font-bold">%</div>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {systemActiveTab === 'backup_restore' && (
                      <div className="space-y-10 animate-in fade-in duration-300">
                         <div className="flex items-center gap-4 mb-2">
                          <div className="h-0.5 w-12 bg-blue-600" />
                          <h3 className="text-xl font-bold font-urdu text-slate-800">ڈیٹا بیک اپ و ریسٹور (Backup & Restore)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {/* Master Backup Button */}
                           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-4">
                              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                                 <Download className="w-8 h-8" />
                              </div>
                              <h4 className="text-lg font-bold font-urdu text-slate-800">ماسٹر بیک اپ ایکسپورٹ</h4>
                              <p className="text-xs font-urdu text-slate-400">اس بٹن پر کلک کرنے سے آپ کا تمام ڈیٹا (ڈیٹا بیس اور تصاویر) ایک .zip فائل میں محفوظ ہو جائے گا۔</p>
                              <button 
                                onClick={async () => {
                                  try {
                                    window.open(`${API_BASE_URL}/api/backup`, '_blank');
                                  } catch (err) {
                                    alert('بیک اپ بنانے میں خرابی پیش آگئی۔');
                                  }
                                }}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                              >
                                Export / Backup Data
                              </button>
                           </div>

                           {/* Master Restore Button */}
                           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-4">
                              <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                                 <Upload className="w-8 h-8" />
                              </div>
                              <h4 className="text-lg font-bold font-urdu text-slate-800">بیک اپ ریسٹور / امپورٹ</h4>
                              <p className="text-xs font-urdu text-slate-400">اپنا پہلے سے موجود بیک اپ (.zip فائل) یہاں اپلوڈ کریں تاکہ سافٹ ویئر کا تمام پرانا ریکارڈ بحال ہو جائے۔</p>
                              <label className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer text-center">
                                Import / Restore Data
                                <input 
                                  type="file" 
                                  accept=".zip" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const formData = new FormData();
                                      formData.append('backup', e.target.files[0]);
                                      try {
                                        const resp = await customFetch(`${API_BASE_URL}/api/restore`, {
                                          method: 'POST',
                                          body: formData
                                        });
                                        const res = await resp.json();
                                        if (res.success) {
                                          alert('بیک اپ کامیابی سے ریسٹور ہو گیا۔ براہ کرم سافٹ ویئر ری اسٹارٹ کریں۔');
                                        } else {
                                          alert('ریسٹور میں خرابی: ' + res.error);
                                        }
                                      } catch (err) {
                                        alert('ریسٹور میں خرابی پیش آگئی۔');
                                      }
                                    }
                                  }} 
                                />
                              </label>
                           </div>

                           {/* Direct DB Export */}
                           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-4">
                              <div className="bg-orange-600 p-4 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                                 <FileText className="w-8 h-8" />
                              </div>
                              <h4 className="text-lg font-bold font-urdu text-slate-800">صرف ڈیٹا بیس ایکسپورٹ</h4>
                              <p className="text-xs font-urdu text-slate-400">صرف "madrassa.db" فائل کو ڈاؤن لوڈ کرنے کے لیے یہ بٹن استعمال کریں۔ (تصاویر شامل نہیں ہوں گی)</p>
                              <button 
                                onClick={() => window.open(`${API_BASE_URL}/api/export-db`, '_blank')}
                                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                              >
                                Export madrassa.db
                              </button>
                           </div>

                           {/* Direct DB Import */}
                           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-4">
                              <div className="bg-rose-600 p-4 rounded-2xl text-white shadow-lg shadow-rose-500/20">
                                 <RefreshCcw className="w-8 h-8" />
                              </div>
                              <h4 className="text-lg font-bold font-urdu text-slate-800">صرف ڈیٹا بیس امپورٹ</h4>
                              <p className="text-xs font-urdu text-slate-400">اگر آپ کے پاس پہلے سے "madrassa.db" فائل ہے تو اسے یہاں سے اپلوڈ کر کے پرانا ڈیٹا ری اسٹور کریں۔</p>
                              <label className="w-full bg-rose-600 text-white py-4 rounded-2xl font-urdu font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer text-center">
                                Import madrassa.db
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const formData = new FormData();
                                      formData.append('db_file', e.target.files[0]);
                                      try {
                                        const resp = await customFetch(`${API_BASE_URL}/api/import-db`, {
                                          method: 'POST',
                                          body: formData
                                        });
                                        const res = await resp.json();
                                        if (res.success) alert('ڈیٹا بیس کامیابی سے تبدیل کر دیا گیا۔');
                                        else alert('امپورٹ میں خرابی: ' + res.error);
                                      } catch (err) {
                                        alert('سرور سے رابطہ نہیں ہو سکا۔');
                                      }
                                    }
                                  }}
                                />
                              </label>
                           </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
                           <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                           <div className="text-xs font-urdu text-amber-800 leading-relaxed">
                              <strong>توجہ فرمائیں:</strong> بیک اپ ریسٹور کرنے سے آپ کا موجودہ ڈیٹا مکمل طور پر ختم ہو جائے گا اور بیک اپ فائل والا ڈیٹا اس کی جگہ لے لے گا۔ اس لیے ریسٹور کرنے سے پہلے تسلی کر لیں کہ آپ درست فائل استعمال کر رہے ہیں۔
                           </div>
                        </div>
                      </div>
                    )}

                    {systemActiveTab === 'updates' && (
                      <div className="space-y-10 animate-in fade-in duration-300">
                         <div className="flex items-center gap-4 mb-2">
                          <div className="h-0.5 w-12 bg-blue-600" />
                          <h3 className="text-xl font-bold font-urdu text-slate-800">سسٹم انفارمیشن</h3>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-[40px] p-12 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                           <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full translate-y-1/2 -translate-x-1/2" />
                           
                           <div className="space-y-8 relative z-10">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                 <span className="text-[11px] text-slate-400 font-urdu">(Stable) 1.0.0</span>
                                 <span className="text-sm font-bold font-urdu text-slate-700">:سافٹ ویئر ورژن</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                 <span className="text-[11px] font-bold text-slate-600">Abdulrehman Habib</span>
                                 <span className="text-sm font-bold font-urdu text-slate-700">:ڈویلپر</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                 <span className="text-[11px] font-bold text-emerald-600">Connected (LocalStorage)</span>
                                 <span className="text-sm font-bold font-urdu text-slate-700">:ڈیٹا بیس حالت</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                 <span className="text-[11px] font-bold text-slate-600 font-mono">2026-04-06</span>
                                 <span className="text-sm font-bold font-urdu text-slate-700">:آخری اپڈیٹ</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'superadmin' && isSuperAdmin && (
            <SuperAdminPanel />
          )}
        </div>
      </div>
    </div>
  );
}
