import React from 'react';
import { Construction, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ModulePlaceholderProps {
  title: string;
  onBack: () => void;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-8 font-urdu">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl border border-white/10 p-12 rounded-[40px] text-center max-w-lg w-full"
      >
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Construction className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          یہ ماڈیول فی الحال زیرِ تعمیر ہے۔ ہم جلد ہی اسے مکمل فنکشنلٹی کے ساتھ ایکٹیو کر دیں گے۔
        </p>
        
        <button 
          onClick={onBack}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
        >
          <span>واپس ڈیش بورڈ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

export default ModulePlaceholder;
