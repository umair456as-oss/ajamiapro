
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Mail, ArrowRight, HelpCircle, Landmark, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicResultPortal from './PublicResultPortal';


interface AuthProps {
  onLogin: () => void;
}

export default function AuthSystem({ onLogin }: AuthProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [madrassaName, setMadrassaName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : {
      jamiaName: 'جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ',
      monogram: ''
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          setSystemSettings(JSON.parse(saved));
        }
      } catch (err) {}
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResultPortal, setShowResultPortal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Check master email 1 (Jamia Administrator)
      if (normalizedEmail === 'jamiaarabiasirajululoomjabori@gmail.com' && password === 'jamiaarabiasirajululoomjabori') {
        localStorage.setItem('currentUser', normalizedEmail);
        localStorage.setItem('currentUserRole', 'Admin');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isSuperAdmin', 'true');
        localStorage.setItem('userStatus', 'accepted');
        localStorage.setItem('paymentStatus', 'paid');
        localStorage.removeItem('madrassaId');
        localStorage.removeItem('madrassaJamiaName');
        localStorage.removeItem('madrassaModules');
        onLogin();
        navigate('/dashboard');
        return;
      }

      // Check master email 2 (Developer / Primary Admin)
      if (normalizedEmail === 'abdulrehmanhabib.com@gmail.com' && (password === 'abdulrehmanadmin' || password === 'abdulrehmanhabib' || password === 'jamiaarabiasirajululoomjabori')) {
        localStorage.setItem('currentUser', normalizedEmail);
        localStorage.setItem('currentUserRole', 'Admin');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isSuperAdmin', 'true');
        localStorage.setItem('userStatus', 'accepted');
        localStorage.setItem('paymentStatus', 'paid');
        localStorage.removeItem('madrassaId');
        localStorage.removeItem('madrassaJamiaName');
        localStorage.removeItem('madrassaModules');
        onLogin();
        navigate('/dashboard');
        return;
      }

      // Resolve username to actual email if user inputted a short username
      let registeredUsers: any[] = [];
      const localUsersStr = localStorage.getItem('users');
      if (localUsersStr) {
        try {
          registeredUsers = JSON.parse(localUsersStr);
        } catch (e) {}
      }

      // Check locally added staff/teachers created inside "Account Management"
      if (registeredUsers.length > 0) {
        const foundLocal = registeredUsers.find((u: any) => 
          (u.username?.toLowerCase() === normalizedEmail || u.email?.toLowerCase() === normalizedEmail) && 
          u.password === password
        );
        if (foundLocal) {
          localStorage.setItem('currentUser', foundLocal.email || foundLocal.username);
          localStorage.setItem('currentUserRole', foundLocal.role || 'Teacher');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('paymentStatus', 'paid');
          localStorage.setItem('userStatus', 'accepted');
          
          if (foundLocal.role === 'Admin') {
            localStorage.setItem('isSuperAdmin', 'true');
          } else {
            localStorage.removeItem('isSuperAdmin');
          }
          
          onLogin();
          navigate('/dashboard');
          setIsLoading(false);
          return;
        }
      }

      setError('یوزر کوڈ یا پاس ورڈ درست نہیں ہے۔ براہ کرم صحیح معلومات درج کریں۔');
    } catch (err) {
      setError('لاگ ان میں فنی خرابی پیش آگئی ہے۔ دوبارہ کوشش کریں۔');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#F4F7F6] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] min-h-auto md:min-h-[650px] my-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-white flex flex-col md:flex-row relative z-10 shadow-slate-200/50"
      >
        {/* Branding Side (Left) */}
        <div className="md:flex-1 sidebar-gradient p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
               <circle cx="0" cy="0" r="50" fill="white" fillOpacity="0.1" />
               <circle cx="100" cy="100" r="30" fill="white" fillOpacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl overflow-hidden border border-white/20">
                {systemSettings.monogram ? (
                  <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Landmark className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="flex flex-col">
                 <span className="text-xl font-bold tracking-tight">{systemSettings.jamiaName}</span>
                 <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Management Portal</span>
              </div>
            </div>
            
            <div className="space-y-8">
              <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Digital <br />
                <span className="text-white/70">Madrassa.</span>
              </h1>
              <div className="space-y-4 font-urdu" dir="rtl">
                <p className="text-white/80 text-xl leading-relaxed">
                  {systemSettings.jamiaName} کے لیے جدید، منظم اور باوقار تعلیمی نظم و نسق کا نظام
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-white/40 space-y-1 uppercase tracking-widest font-bold">
            <div>&copy; 2026 {systemSettings.jamiaName}</div>
            <div className="text-white/60">Professional ERP Solution V3</div>
          </div>
        </div>

        {/* Form Side (Right) */}
        <div className="md:flex-[1.2] p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-right" dir="rtl">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2 font-urdu">
              سائن ان کریں
            </h2>
            <p className="text-[#64748B] text-sm font-urdu leading-relaxed">
              تعلیمی نظام کے انتظام کے لیے اپنے لاگ ان کوڈ یا ای میل اور پاس ورڈ کا استعمال کریں۔
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#0F172A] text-right font-urdu" dir="rtl">یوزرنیم یا ای میل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-right"
                  placeholder="یوزر کوڈ یا ای میل درج کریں"
                  dir="rtl"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Protected Portal</span>
                <label className="block text-sm font-medium text-[#0F172A] text-right font-urdu" dir="rtl">پاس ورڈ</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-right"
                  placeholder="••••••••"
                  dir="rtl"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B] justify-end">
              <span>مجھے یاد رکھیں</span>
              <input type="checkbox" defaultChecked className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-xs font-urdu text-right space-y-2" dir="rtl">
                <div>{error}</div>
                {error.includes('نئی ٹیب') && (
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full mt-2 bg-[#800000] hover:bg-[#a00000] text-white py-2 px-3 rounded-lg font-bold text-center transition-all"
                  >
                    نئی ٹیب میں ایپ کھولیں (Open in New Tab)
                  </button>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`btn-primary mt-2 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>برائے مہربانی انتظار کریں...</span>
                </>
              ) : (
                'لاگ ان کریں'
              )}
            </button>

            <button 
              type="button" 
              onClick={() => setShowResultPortal(true)}
              className="w-full mt-3 bg-[#800000] hover:bg-[#600000] text-white py-3 px-4 rounded-xl font-bold font-urdu text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
            >
              <Award className="w-4 h-4 text-white" />
              <span>امتحانی نتیجہ اور کشف الدرجات (بغیر لاگ ان)</span>
            </button>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center justify-center font-urdu" dir="rtl">
                <span className="text-xs text-slate-500 mb-2">مدارس رجسٹریشن یا سوالات کے لیے رابطہ کریں:</span>
                <a 
                  href="https://wa.me/923435488319" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all hover:brightness-105 active:scale-95 mt-1"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span>رابطہ برائے رجسٹریشن (واٹس ایپ)</span>
                </a>
              </div>
          </form>
        </div>
      </motion.div>
      <AnimatePresence>
        {showResultPortal && (
          <PublicResultPortal onClose={() => setShowResultPortal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}