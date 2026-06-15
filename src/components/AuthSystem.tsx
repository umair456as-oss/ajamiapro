import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Mail, ArrowRight, HelpCircle, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, customFetch } from '../config';
import { googleSignIn } from '../lib/auth';


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

  const [systemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : {
      jamiaName: 'جامعہ عربیہ سراج العلوم',
      monogram: ''
    };
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLogin) {
      // 1. Handle Account Request internally
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push({
        id: Date.now(),
        username: name,
        email: email,
        password: password,
        madrassaName: madrassaName,
        whatsapp: whatsapp,
        status: 'pending',
        role: 'Admin'
      });
      localStorage.setItem('users', JSON.stringify(users));
      alert('آپ کی درخواست ایڈمن کو بھیج دی گئی ہے۔ منظوری کے بعد ہی آپ لاگ ان کر سکیں گے۔');
      setIsLoading(false);
      setIsLogin(true);
      return;
    }

    try {
      // 1. First check against the requested Main Admin (Local Check for immediate access)
      if (email === 'jamiaarabiasirajululoomjabori@gmail.com' && password === 'jamiaarabiasirajululoomjabori') {
        localStorage.setItem('currentUser', email);
        localStorage.setItem('currentUserRole', 'Admin');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isSuperAdmin', 'true');
        localStorage.removeItem('madrassaId');
        localStorage.removeItem('madrassaJamiaName');
        localStorage.removeItem('madrassaModules');
        onLogin();
        navigate('/dashboard');
        return;
      }

      // 1.5 Check local users dataset for instant offline-friendly matched accounts
      const localUsersStr = localStorage.getItem('users');
      if (localUsersStr) {
        try {
          const localUsers = JSON.parse(localUsersStr);
          const foundLocal = localUsers.find((u: any) => 
            (u.username === email || u.username?.toLowerCase() === email?.toLowerCase() || u.email === email) && 
            u.password === password
          );
          if (foundLocal) {
            localStorage.setItem('currentUser', foundLocal.username);
            localStorage.setItem('currentUserRole', foundLocal.role || 'Teacher');
            localStorage.setItem('isLoggedIn', 'true');
            onLogin();
            navigate('/dashboard');
            return;
          }
        } catch (localErr) {
          console.warn('Local authentication lookup error:', localErr);
        }
      }

      // 2. Check against Server API for central and multi-tenant authentication
      const response = await customFetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('currentUser', result.user.username);
        localStorage.setItem('currentUserRole', result.user.role || 'Admin');
        localStorage.setItem('userStatus', result.user.status || 'pending');
        localStorage.setItem('paymentStatus', result.user.paymentStatus || 'unpaid');
        localStorage.setItem('isLoggedIn', 'true');
        
        if (result.user.isSuperAdmin) {
          localStorage.setItem('isSuperAdmin', 'true');
          localStorage.removeItem('madrassaId');
          localStorage.removeItem('madrassaJamiaName');
          localStorage.removeItem('madrassaModules');
        } else if (result.user.madrassaId) {
          localStorage.setItem('madrassaId', result.user.madrassaId);
          localStorage.setItem('madrassaJamiaName', result.user.jamiaName);
          localStorage.setItem('madrassaExpiry', result.user.expiryDate);
          localStorage.setItem('madrassaModules', JSON.stringify(result.user.allowedModules || []));
          localStorage.removeItem('isSuperAdmin');
          
          // Re-write system settings jamiaName locally so current views display it
          try {
            const savedSettings = localStorage.getItem('system_settings');
            const parsed = savedSettings ? JSON.parse(savedSettings) : {};
            parsed.jamiaName = result.user.jamiaName;
            localStorage.setItem('system_settings', JSON.stringify(parsed));
          } catch(e) {}
        } else {
          localStorage.removeItem('madrassaId');
          localStorage.removeItem('isSuperAdmin');
          localStorage.removeItem('madrassaJamiaName');
          localStorage.removeItem('madrassaModules');
        }

        onLogin();
        navigate('/dashboard');
      } else {
        setError(result.error || 'یوزر نیم یا پاسورڈ غلط ہے۔');
      }
    } catch (err) {
      setError('سرور سے رابطہ کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7F6]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] h-auto md:h-[650px] bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-white flex flex-col md:flex-row relative z-10"
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
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-[#64748B] text-sm font-urdu" dir="rtl">
              {isLogin ? 'لاگ ان ہو کر نظام کی مکمل سہولیات تک رسائی حاصل کریں' : 'نئے اکاؤنٹ کے لیے اپنی تفصیلات درج کریں'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-[#0F172A] text-right font-urdu" dir="rtl">نام</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field text-right"
                      placeholder="اپنا نام درج کریں"
                      dir="rtl"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4" />
                  </div>
                  <label className="block text-sm font-medium text-[#0F172A] text-right font-urdu mt-4" dir="rtl">مدرسہ کا نام</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={madrassaName}
                      onChange={(e) => setMadrassaName(e.target.value)}
                      className="input-field text-right"
                      placeholder="مدرسہ/جامعہ کا نام"
                      dir="rtl"
                    />
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4" />
                  </div>
                  <label className="block text-sm font-medium text-[#0F172A] text-right font-urdu mt-4" dir="rtl">واٹس ایپ نمبر</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="input-field text-right"
                      placeholder="واٹس ایپ نمبر"
                      dir="rtl"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                <a href="#" className="text-xs font-semibold text-[#2563EB] hover:underline">Forgot password?</a>
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

            {isLogin && (
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <input type="checkbox" className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]" />
                <span>Remember me</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-urdu text-right" dir="rtl">
                {error}
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
                isLogin ? 'Sign In' : 'Request Account'
              )}
            </button>

            {/* Removed Admin Login Button as requested */}
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <span className="relative px-4 bg-white text-[10px] font-bold text-[#64748B] tracking-widest uppercase">
                Or continue with
              </span>
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={async () => {
                   setIsLoading(true);
                   try {
                     const result = await googleSignIn();
                     if (result) {
                        localStorage.setItem('currentUser', result.user.email || 'Google User');
                        localStorage.setItem('isLoggedIn', 'true');
                        onLogin();
                        navigate('/dashboard');
                     }
                   } catch (err) {
                     setError('Google Sign-In failed');
                   } finally {
                     setIsLoading(false);
                   }
                }}
                className="social-btn"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                <span>Google</span>
              </button>

              <button className="social-btn">
                <img src="https://github.com/favicon.ico" className="w-4 h-4" alt="GitHub" />
                <span>GitHub</span>
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-[#64748B]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-bold text-[#2563EB] hover:underline"
              >
                {isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}