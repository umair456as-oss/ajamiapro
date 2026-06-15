import React, { useState, useEffect } from 'react';
import { 
  Send, MessageSquare, ShieldCheck, Wifi, WifiOff, 
  History, Clock, Bell, UserCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessagingCenterProps {
  onBack: () => void;
}

interface MessageLog {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  recipientCount: number;
}

const MessagingCenter: React.FC<MessagingCenterProps> = ({ onBack }) => {
  const [recipient, setRecipient] = useState('All Students');
  const [messageType, setMessageType] = useState('Notice');
  const [content, setContent] = useState('');
  const [sendingMethod, setSendingMethod] = useState<'sim' | 'branded'>('sim');
  const [showStatus, setShowStatus] = useState(false);

  const [logs, setLogs] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem('message_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'NOTICE', content: 'تمام طلبہ کو مطلع کیا جاتا ہے کہ کل مدرسہ میں چھٹی ہوگی...', timestamp: '2 گھنٹے پہلے', recipientCount: 154 },
      { id: '2', type: 'NOTICE', content: 'تمام طلبہ کو مطلع کیا جاتا ہے کہ کل مدرسہ میں چھٹی ہوگی...', timestamp: '2 گھنٹے پہلے', recipientCount: 154 },
      { id: '3', type: 'NOTICE', content: 'تمام طلبہ کو مطلع کیا جاتا ہے کہ کل مدرسہ میں چھٹی ہوگی...', timestamp: '2 گھنٹے پہلے', recipientCount: 154 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('message_logs', JSON.stringify(logs));
  }, [logs]);

  const handleSend = () => {
    if (!content.trim()) return;
    
    const newLog: MessageLog = {
      id: Date.now().toString(),
      type: messageType.toUpperCase(),
      content: content,
      timestamp: 'ابھی',
      recipientCount: recipient === 'All Students' ? 350 : 30
    };

    setLogs([newLog, ...logs]);
    setContent('');
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 3000);
  };

  const linkWhatsApp = () => {
    window.open('https://web.whatsapp.com', '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-urdu" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {showStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '50%' }}
            animate={{ opacity: 1, y: 10, x: '50%' }}
            exit={{ opacity: 0, y: -20, x: '50%' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2563EB] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">پیغام کامیابی سے بھیج دیا گیا ہے!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="bg-slate-100 p-3 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-[#10B981] p-2 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">پیغام رسانی کا مرکز (Messaging Center)</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">والدین اور عملہ کو ایس ایم ایس اور واٹس ایپ پیغامات بھیجیں</p>
            </div>
          </div>
          
          <button 
            onClick={linkWhatsApp}
            className="bg-[#25D366] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#128C7E] shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Link WhatsApp (Web)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebars */}
          <div className="lg:col-span-1 space-y-8">
            {/* Service Status Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h3 className="font-bold text-slate-800">سروس اسٹیٹس</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">ایس ایم ایس سروس</span>
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                    <Wifi className="w-3 h-3" />
                    <span>آن لائن</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">واٹس ایپ اے پی آئی</span>
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                    <WifiOff className="w-3 h-3" />
                    <span>منقطع</span>
                  </div>
                </div>

                <div className="pt-6">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 block">پیغام رسانی کا طریقہ</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSendingMethod('sim')}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${sendingMethod === 'sim' ? 'bg-[#2563EB] text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                    >موبائل سم</button>
                    <button 
                      onClick={() => setSendingMethod('branded')}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${sendingMethod === 'branded' ? 'bg-[#2563EB] text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                    >برانڈڈ ایس ایم ایس</button>
                  </div>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-slate-800">حالیہ تاریخ</h3>
                </div>
                <button className="text-[10px] font-bold text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-lg">تمام دیکھیں</button>
              </div>

              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 group hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{log.type}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{log.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Message Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">نیا پیغام لکھیں</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> موصول کنندہ (RECIPIENTS)
                  </label>
                  <select 
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="All Students">تمام طلبہ (All Students)</option>
                    <option value="Teachers">تمام اساتذہ (Teachers)</option>
                    <option value="Specific">مخصوص کلاس</option>
                    <option value="Staff">عملہ</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Bell className="w-3 h-3" /> پیغام کی قسم (TYPE)
                  </label>
                  <select 
                    value={messageType}
                    onChange={e => setMessageType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Notice">عام اطلاع (Notice)</option>
                    <option value="Result">نتیجہ طالب علم</option>
                    <option value="Fee">فیس یاددہانی</option>
                    <option value="Holiday">چھٹی کی اطلاع</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-10">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> پیغام کا متن (MESSAGE CONTENT)
                </label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="अपना پيغام یہاں لکھیں..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-slate-700 text-sm leading-8 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all min-h-[200px] resize-none"
                />
                <div className="flex justify-between px-4">
                  <span className="text-[10px] text-slate-400 font-bold">{content.length} characters | {Math.ceil(content.length / 160)} SMS units</span>
                  <button 
                    onClick={() => setContent('')}
                    className="text-[10px] text-rose-500 font-bold hover:underline"
                  >صاف کریں</button>
                </div>
              </div>

              <button 
                onClick={handleSend}
                disabled={!content.trim()}
                className={`w-full py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${!content.trim() ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#2563EB] text-white hover:bg-blue-700 shadow-blue-500/30'}`}
              >
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                <span>پیغام بھیجیں (Send Message)</span>
              </button>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100 flex items-center gap-4">
               <div className="bg-blue-100 p-2 rounded-xl">
                 <Clock className="w-5 h-5" />
               </div>
               <p className="text-xs font-bold leading-relaxed">
                 نوٹ: خودکار پیغامات بھیجنے کے لیے واٹس ایپ اے پی آئی لنک ہونا ضروری ہے۔ بصورتِ دیگر آپ اوپر "Link WhatsApp" کا بٹن استعمال کر کے دستی طور پر واٹس ایپ ویب سے پیغام بھیج سکتے ہیں۔
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
