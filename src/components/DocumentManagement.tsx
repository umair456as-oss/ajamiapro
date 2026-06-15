import React, { useState } from 'react';
import { 
  FileText, ArrowRight, ClipboardList, 
  Download, Printer, Search, Grid,
  Users, Calendar, BookOpen, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DailyAttendanceSheet from './DailyAttendanceSheet';
import StudentDocumentCapture from './StudentDocumentCapture';

interface DocumentManagementProps {
  onBack: () => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'attendance_sheet' | 'document_capture'>('main');

  const menuItems = [
    { 
      id: 'attendance_sheet', 
      urdu: 'یومیہ حاضری شیٹ', 
      english: 'Daily Attendance Sheet', 
      icon: ClipboardList, 
      color: 'bg-blue-600',
      onClick: () => setActiveTab('attendance_sheet')
    },
    { 
      id: 'document_capture', 
      urdu: 'طلبہ دستاویزات کیپچر', 
      english: 'Student Document Capture', 
      icon: Camera, 
      color: 'bg-indigo-600',
      onClick: () => setActiveTab('document_capture')
    },
  ];

  if (activeTab === 'attendance_sheet') {
    return <DailyAttendanceSheet onBack={() => setActiveTab('main')} />;
  }

  if (activeTab === 'document_capture') {
    return <StudentDocumentCapture onBack={() => setActiveTab('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-urdu text-white" dir="rtl">
      {/* Header */}
      <header className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="bg-white/10 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
          >
            <ArrowRight className="w-4 h-4" />
            <span>واپس ڈیش بورڈ</span>
          </button>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold">دستاویز کی وصولی</h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-sans">Document Center & Receipts</p>
        </div>

        <div className="w-40"></div> {/* Spacer */}
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.onClick}
              className={`${item.color} p-8 rounded-[32px] cursor-pointer shadow-xl shadow-blue-500/10 flex flex-col items-center justify-center text-center group relative overflow-hidden`}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
              
              <div className="bg-white/20 p-4 rounded-2xl mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <item.icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{item.urdu}</h3>
              <p className="text-white/70 text-xs font-sans uppercase tracking-wider">{item.english}</p>
              
              <div className="mt-6 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-0 group-hover:w-full h-full bg-white transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
          
          {/* Placeholder for future buttons */}
          <div className="border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-slate-500 p-8">
            <div className="bg-white/5 p-4 rounded-2xl mb-4">
              <FileText className="w-8 h-8 opacity-20" />
            </div>
            <span className="text-sm opacity-50">مزید دستاویزات جلد دستیاب ہوں گی</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentManagement;
