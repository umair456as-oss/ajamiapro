import React, { useState } from 'react';
import { 
  Camera, ArrowRight, Search, Globe, Shield, RefreshCcw, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  Plus, Minus, Video, User, Lock, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraViewProps {
  onBack: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onBack }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!ipAddress) return;
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] text-white overflow-hidden font-urdu">
      {/* Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-red-500/20 transition-all font-bold"
        >
          <ArrowRight className="w-5 h-5" />
          <span>واپس جائیں</span>
        </button>

        <div className="flex items-center gap-6 text-right" dir="rtl">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
            <Video className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold leading-tight">کیمرہ ویو اینڈ کنٹرول (IP CAMERA VIEW)</h1>
            <p className="text-slate-500 text-sm mt-1">سیکیورٹی مانیٹرنگ سسٹم فعال ہے</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
        {/* Right Sidebar - Controls & Config */}
        <div className="w-full lg:w-96 border-l border-white/5 bg-[#0f172a] overflow-y-auto custom-scrollbar p-6 space-y-8" dir="rtl">
          {/* Connection Settings */}
          <div className="space-y-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" /> کیمرہ کنفیگریشن
            </h3>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="کیمرہ IP داخل کریں (e.g. 192.168.1.10)"
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="صارف کا نام"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pr-9 pl-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="پاس ورڈ"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pr-9 pl-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button 
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={isConnecting}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg ${
                  isConnected 
                  ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                  : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                }`}
              >
                {isConnecting ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{isConnected ? 'کیمرہ بند کریں' : 'کیمرہ سے جڑیں'}</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* PTZ Controls */}
          <div className="space-y-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4" /> PTZ کنٹرولز
            </h3>

            <div className="flex flex-col items-center gap-4">
              {/* Directional Pad */}
              <div className="relative w-40 h-40 bg-slate-900 rounded-full border border-white/5 p-4 shadow-inner">
                <button className="absolute top-2 left-1/2 -translate-x-1/2 p-2 hover:bg-slate-800 rounded-full transition-colors"><ChevronUp className="w-6 h-6 text-blue-500" /></button>
                <button className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 hover:bg-slate-800 rounded-full transition-colors"><ChevronDown className="w-6 h-6 text-blue-500" /></button>
                <button className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft className="w-6 h-6 text-blue-500" /></button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-blue-500" /></button>
                
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex gap-4 w-full">
                <button className="flex-1 bg-slate-800 border border-white/5 py-4 rounded-xl flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] text-slate-400">ZOOM IN</span>
                </button>
                <button className="flex-1 bg-slate-800 border border-white/5 py-4 rounded-xl flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors">
                  <Minus className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] text-slate-400">ZOOM OUT</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-px bg-white/5" />
          
          <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
             <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">کیمرہ پری سیٹس (PRESETS)</span>
             <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <button key={i} className="bg-slate-800 text-[10px] py-2 rounded hover:bg-blue-600 transition-colors">{i}</button>
                ))}
             </div>
          </div>
        </div>

        {/* Main Feed Area */}
        <div className="flex-1 bg-black p-8 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                  <Camera className="w-16 h-16 text-slate-700" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-urdu">کوئی کیمرہ منتخب نہیں ہے</h2>
                  <p className="text-slate-500 max-w-sm font-urdu">براہ کرم آئی پی ایڈریس داخل کرکے "کیمرہ سے جڑیں" پر کلک کریں</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col"
              >
                <div className="absolute top-12 left-12 flex items-center gap-3 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  <span className="text-xs font-bold tracking-widest text-slate-200 uppercase">Live: {ipAddress}</span>
                </div>

                <div className="flex-1 rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 group relative">
                   {/* Simulated Stream */}
                   <img 
                    src={`https://picsum.photos/seed/${ipAddress}/1920/1080?grayscale`} 
                    alt="Camera Feed" 
                    className="w-full h-full object-cover opacity-60 mix-blend-screen"
                    referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                         <RefreshCcw className="w-12 h-12 text-blue-500 animate-spin opacity-40" />
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Connecting to Stream...</span>
                      </div>
                   </div>
                   
                   {/* Overlay HUD */}
                   <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col">
                         <span className="text-4xl font-mono text-white/20">CAM_01_FEED</span>
                         <span className="text-xs text-white/10 font-mono italic">BITRATE: 4.2 MBPS</span>
                      </div>
                      <div className="flex gap-4 pointer-events-auto">
                        <button className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">REC</button>
                        <button className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">SNAP</button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CameraView;
