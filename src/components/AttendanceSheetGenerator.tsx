import React, { useState, useEffect } from 'react';
import { Printer, ChevronRight, ChevronDown } from 'lucide-react';

interface AttendanceSheetProps {
  onBack: () => void;
}

export default function AttendanceSheetGenerator({ onBack }: AttendanceSheetProps) {
  const [teachers, setTeachers] = useState<string[]>(Array(10).fill(''));
  const [books, setBooks] = useState<string[]>(Array(10).fill(''));
  const [students, setStudents] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('دورہ حدیث');
  const [grades, setGrades] = useState<string[]>(["دورہ حدیث", "موقوف علیہ", "سادسہ", "خامسہ", "رابعہ", "ثالثہ", "ثانیہ", "اولیٰ"]);
  
  // Data for selection
  const [availableStaff, setAvailableStaff] = useState<string[]>([]);
  const [academicBooks, setAcademicBooks] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<{ type: 'teacher' | 'book', index: number } | null>(null);

  const defaultPeriods = [
    { start: '7:30', end: '8:15' },
    { start: '8:15', end: '9:00' },
    { start: '9:00', end: '9:45' },
    { start: '9:45', end: '10:30' },
    { start: '10:30', end: '11:15' },
    { start: '11:15', end: '12:00' },
    { start: '12:00', end: '12:45' },
    { start: '12:45', end: '1:30' },
    { start: '1:30', end: '2:15' },
    { start: '2:15', end: '3:00' },
  ];
  const [periods, setPeriods] = useState(defaultPeriods);

  useEffect(() => {
    try {
      // 1. Load Grades
      const savedGrades = localStorage.getItem('grades_list');
      if (savedGrades) {
        const parsed = JSON.parse(savedGrades);
        if (Array.isArray(parsed)) {
          setGrades(parsed.map(g => typeof g === 'string' ? g : (g.name || String(g))));
        }
      }

      // 2. Load Staff (Ustad) from "Staff Management"
      const savedStaff = localStorage.getItem('staff');
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed)) {
          // You can filter by role here if your staff has a 'role' or 'jobTitle'
          setAvailableStaff(parsed.map((s: any) => s.name));
        }
      }

      // 3. Load Academic Books from "Grade Management"
      const savedBooks = localStorage.getItem('books_list');
      if (savedBooks) {
        const parsed = JSON.parse(savedBooks);
        if (Array.isArray(parsed)) {
          setAcademicBooks(parsed);
        }
      }
    } catch (e) { console.error('Data loading error:', e); }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('students');
      if (saved) {
        const all = JSON.parse(saved);
        if (Array.isArray(all)) {
          const filtered = selectedGrade === 'All' 
            ? all.slice(0, 30) 
            : all.filter((s: any) => s && s.grade === selectedGrade);
          setStudents(filtered);
        }
      }
    } catch (e) { console.error('Students loading error:', e); }
  }, [selectedGrade]);

  const handlePrint = () => { window.print(); };

  const selectItem = (value: string) => {
    if (!activeDropdown) return;
    if (activeDropdown.type === 'teacher') {
      const n = [...teachers];
      n[activeDropdown.index] = value;
      setTeachers(n);
    } else {
      const n = [...books];
      n[activeDropdown.index] = value;
      setBooks(n);
    }
    setActiveDropdown(null);
  };

  // Filter books based on the selected grade
  const filteredAvailableBooks = academicBooks
    .filter(b => b.grade === selectedGrade)
    .map(b => b.name);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      {/* Header */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 print:hidden shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">حاضری شیٹ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 mr-1 uppercase">درجہ منتخب کریں</span>
            <select 
              value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm outline-none font-bold min-w-[140px]"
            >
              <option value="All">تمام طلبہ</option>
              {grades.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all self-end">
            <Printer className="w-4 h-4" /> <span>پرنٹ</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0" onClick={() => setActiveDropdown(null)}>
        <div className="max-w-[210mm] mx-auto bg-white p-4 md:p-[5mm] shadow-xl print:shadow-none print:p-0 relative" onClick={e => e.stopPropagation()}>
          
          {/* Settings Panel (Hidden in print) */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
               <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                 <Users className="w-3 h-3" /> اساتذہ اور کتب منتخب کریں
               </h3>
               <span className="text-[10px] text-blue-600 font-bold">منتخب کردہ درجہ: {selectedGrade}</span>
            </div>
            
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {teachers.map((t, i) => (
                <div key={i} className="relative">
                  <button 
                    onClick={() => setActiveDropdown({ type: 'teacher', index: i })}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-right truncate flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    {t || `استاد ${i+1}`}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {activeDropdown?.type === 'teacher' && activeDropdown.index === i && (
                    <div className="absolute top-full right-0 w-48 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
                      <div className="p-2 bg-slate-50 text-[8px] font-bold text-slate-400 border-b">عملہ کی فہرست (Staff)</div>
                      {availableStaff.map((name, idx) => (
                        <div key={idx} onClick={() => selectItem(name)} className="px-3 py-2 text-[10px] hover:bg-blue-50 cursor-pointer border-b border-slate-50 font-urdu">{name}</div>
                      ))}
                      {availableStaff.length === 0 && <div className="p-3 text-[9px] text-slate-400 italic">کوئی استاد نہیں ملا۔</div>}
                      <div className="p-2">
                        <input autoFocus placeholder="دستی نام لکھیں..." className="w-full px-2 py-1 text-[10px] border rounded outline-none" onKeyDown={e => e.key === 'Enter' && selectItem((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {books.map((b, i) => (
                <div key={i} className="relative">
                  <button 
                    onClick={() => setActiveDropdown({ type: 'book', index: i })}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-right truncate flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    {b || `کتاب ${i+1}`}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {activeDropdown?.type === 'book' && activeDropdown.index === i && (
                    <div className="absolute top-full right-0 w-48 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
                      <div className="p-2 bg-slate-50 text-[8px] font-bold text-slate-400 border-b">درجہ "{selectedGrade}" کی کتب</div>
                      {filteredAvailableBooks.map((title, idx) => (
                        <div key={idx} onClick={() => selectItem(title)} className="px-3 py-2 text-[10px] hover:bg-blue-50 cursor-pointer border-b border-slate-50 font-urdu">{title}</div>
                      ))}
                      {filteredAvailableBooks.length === 0 && <div className="p-3 text-[9px] text-slate-400 italic">اس درجہ کی کوئی کتاب نہیں ملی۔</div>}
                      <div className="p-2">
                        <input autoFocus placeholder="دستی کتاب لکھیں..." className="w-full px-2 py-1 text-[10px] border rounded outline-none" onKeyDown={e => e.key === 'Enter' && selectItem((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mt-4 border-t border-slate-200 pt-4">
              {periods.map((p, i) => (
                <div key={i} className="flex flex-col gap-1 border border-slate-200 rounded p-1 bg-white">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-slate-400 w-6">آمد:</span>
                    <input className="text-[10px] w-full outline-none font-bold" value={p.end} onChange={(e) => {
                      const np = [...periods]; np[i].end = e.target.value; setPeriods(np);
                    }} />
                  </div>
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-slate-400 w-6">رفت:</span>
                    <input className="text-[10px] w-full outline-none font-bold" value={p.start} onChange={(e) => {
                      const np = [...periods]; np[i].start = e.target.value; setPeriods(np);
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THE SHEET (EXACT REPLICA) */}
          <div className="border-[1.5px] border-black">
             <div className="flex border-b-[1.5px] border-black h-16">
                <div className="w-32 border-l-[1.5px] border-black flex items-center justify-center font-bold text-xl">{selectedGrade}</div>
                <div className="flex-1 flex items-center justify-center">
                  <h2 className="text-xl md:text-2xl font-bold font-urdu">یومیہ حاضری شیٹ برائے اساتذہ کرام جامعہ عربیہ سراج العلوم مانسہرہ</h2>
                </div>
             </div>

             <table className="w-full border-collapse">
               <thead>
                 <tr className="h-20">
                   <th className="border-[1.5px] border-black w-8 text-[10px] font-bold" rowSpan={4}>نمبر شمار</th>
                   <th className="border-[1.5px] border-black w-28 text-sm font-bold bg-slate-50">تفصیل / نام</th>
                   {teachers.map((t, i) => (
                     <th key={i} className="border-[1.5px] border-black text-[10px] p-1 font-bold leading-tight" colSpan={2}>
                        {t || ""}
                     </th>
                   ))}
                 </tr>
                 <tr className="h-10">
                   <th className="border-[1.5px] border-black text-sm font-bold bg-slate-50">نام کتب</th>
                   {books.map((b, i) => (
                     <th key={i} className="border-[1.5px] border-black text-[9px] p-1 font-bold bg-slate-50 leading-tight" colSpan={2}>
                        {b || ""}
                     </th>
                   ))}
                 </tr>
                 <tr className="h-6">
                   <th className="border-[1.5px] border-black text-[10px] font-bold">آمد / رفت</th>
                   {periods.map((_, i) => (
                     <React.Fragment key={i}>
                       <th className="border-[1.5px] border-black text-[8px] w-6">رفت</th>
                       <th className="border-[1.5px] border-black text-[8px] w-6">آمد</th>
                     </React.Fragment>
                   ))}
                 </tr>
                 <tr className="h-6 bg-slate-50">
                   <th className="border-[1.5px] border-black text-[10px] font-bold">طلباء کرام</th>
                   {periods.map((p, i) => (
                     <React.Fragment key={i}>
                       <th className="border-[1.5px] border-black text-[8px]">{p.end}</th>
                       <th className="border-[1.5px] border-black text-[8px]">{p.start}</th>
                     </React.Fragment>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {Array.from({ length: 30 }).map((_, idx) => {
                   const student = students && students[idx];
                   return (
                     <tr key={idx} className="h-8">
                       <td className="border-[1.5px] border-black text-center text-xs font-bold">{idx + 1}</td>
                       <td className="border-[1.5px] border-black pr-2 text-right text-xs font-bold truncate max-w-[100px]">
                         {student?.name || ""}
                       </td>
                       {Array.from({ length: 20 }).map((_, i) => (
                         <td key={i} className="border-[1.5px] border-black"></td>
                       ))}
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>

          <div className="hidden print:flex justify-between items-center mt-6 text-[10px] font-bold px-4">
             <span>تاریخ: ________________</span>
             <div className="flex gap-16">
                <span>دستخط معلم</span>
                <span>دستخط ناظمِ تعلیمات</span>
                <span>دستخط صدر المدرسین</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
