import React, { useState } from 'react';
import { 
  FileText, Printer, ClipboardList, ShieldCheck, 
  Trophy, CreditCard, Users, FileMinus, IdCard,
  ChevronLeft, LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';
import AdmissionFormBlank from './AdmissionFormBlank';
import IDCardMaker from './IDCardMaker';
import AttendanceSheetGenerator from './AttendanceSheetGenerator';
import ConsolidatedResult from './ConsolidatedResult';

interface ReportCardProps {
  icon: any;
  title: string;
  color: string;
  onClick?: () => void;
  key?: React.Key;
}

function ReportCard({ icon: Icon, title, color, onClick }: ReportCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${color} p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center gap-4 text-white hover:brightness-110 transition-all aspect-square min-w-[140px]`}
    >
      <div className="bg-white/20 p-3 rounded-xl">
        <Icon className="w-8 h-8" />
      </div>
      <span className="font-urdu font-bold text-sm leading-tight">{title}</span>
    </motion.button>
  );
}

interface ReportsViewProps {
  onBack: () => void;
}

export default function ReportsView({ onBack }: ReportsViewProps) {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reports = [
    { id: 'marksheet', title: 'کشف الدرجات', icon: FileText, color: 'bg-sky-500' },
    { id: 'result', title: 'اجتماعی نتیجہ', icon: Printer, color: 'bg-blue-500' },
    { id: 'student_att', title: 'طلبہ حاضری رپورٹ', icon: ClipboardList, color: 'bg-indigo-500' },
    { id: 'staff_att', title: 'اساتذہ حاضری رپورٹ', icon: ShieldCheck, color: 'bg-slate-700' },
    { id: 'positions', title: 'پوزیشن ہولڈرز', icon: Trophy, color: 'bg-orange-500' },
    { id: 'fee_card', title: 'فیس کارڈ', icon: CreditCard, color: 'bg-teal-500' },
    { id: 'student_list', title: 'فہرست طلبہ', icon: Users, color: 'bg-blue-600' },
    { id: 'daily_attendance_sheet', title: 'یومیہ حاضری شیٹ', icon: FileText, color: 'bg-emerald-600' },
    { id: 'blank_admission', title: 'خالی داخلہ فارم', icon: FileMinus, color: 'bg-green-600' },
    { id: 'id_card', title: 'آئی ڈی کارڈ', icon: IdCard, color: 'bg-purple-600' },
  ];

  if (activeReport === 'blank_admission') {
    return <AdmissionFormBlank onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'id_card') {
    return <IDCardMaker onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'daily_attendance_sheet') {
    return <AttendanceSheetGenerator onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'result') {
    return <ConsolidatedResult onBack={() => setActiveReport(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-urdu" dir="rtl">
      {/* Header */}
      <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-slate-800 transition-all font-urdu shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 ml-1" />
            واپس
          </button>
        </div>

        <div className="flex flex-col text-right">
          <div className="flex items-center gap-3 justify-end text-slate-800 text-xl font-bold">
            رپورٹس سنٹر
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 text-[10px]">جامعہ کی تمام اہم رپورٹس اور ریکارڈز یہاں دستیاب ہیں</p>
        </div>
      </header>

      {/* Grid Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {reports.map((report) => (
              <ReportCard 
                key={report.id}
                icon={report.icon}
                title={report.title}
                color={report.color}
                onClick={() => setActiveReport(report.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-white/5 px-8 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex flex-col items-start font-urdu">
          <span>تمام حقوق محفوظ ہیں۔ ڈیزائن و ڈویلپمنٹ: عبدالرحمن حبیب</span>
        </div>
        <div className="text-right uppercase tracking-widest">
          Report Management System v2.0
        </div>
      </footer>
    </div>
  );
}
