import React, { useState } from 'react';
import { ChevronRight, Plus, Pencil, Trash2, FileText, Settings, Download, Upload, Printer, X } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';
import { addToRecycleBin } from './RecycleBin';

interface ExamManagementProps {
  onBack: () => void;
}

const ExamManagement: React.FC<ExamManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'types' | 'reports' | 'settings'>('results');
  const [settingsTab, setSettingsTab] = useState<'grade' | 'position'>('grade');
  const [classes, setClasses] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [examHeaders, setExamHeaders] = useState<any[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  const allBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
  const gradeBooks = selectedClass ? allBooks.filter((b: any) => b.grade === selectedClass).map((b: any) => b.name) : [];
  const subjects = gradeBooks.length > 0 ? gradeBooks : ['کوئی مضمون درج نہیں'];
  const [resultRows, setResultRows] = useState<any[]>([]);
  const [gradeSettings, setGradeSettings] = useState<any[]>([]);
  const [newGrade, setNewGrade] = useState({ name: '', min: '', max: '', grace: '', isFail: false });
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportSearch, setReportSearch] = useState('');
  const [selectedReportClass, setSelectedReportClass] = useState('');
  const [selectedReportExamType, setSelectedReportExamType] = useState('');
  const [systemSettings, setSystemSettings] = useState<any>({});

  React.useEffect(() => {
    // Load system settings
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);

    // Load grades from Settings/GradeManagement
    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      if (Array.isArray(savedGradesList) && savedGradesList.length > 0) {
        setClasses(Array.from(new Set(savedGradesList.map((g: any) => g?.name).filter(Boolean))));
      } else {
        const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
        if (Array.isArray(savedGrades) && savedGrades.length > 0) {
          setClasses(savedGrades.map((g: any) => g?.name).filter(Boolean));
        } else {
          setClasses(['اولیٰ', 'ثانیہ']);
        }
      }
    } catch (e) {
      setClasses(['اولیٰ', 'ثانیہ']);
    }

    // Load exam types from Settings
    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    setExamTypes(savedExams.length > 0 ? savedExams : ['سالانہ', 'ششماہی', 'سہ ماہی']);

    // Load custom exam headers (from ExamManagement)
    const savedHeaders = JSON.parse(localStorage.getItem('examRecords') || '[]');
    if (savedHeaders.length > 0) {
      setExamHeaders(savedHeaders);
    } else {
      setExamHeaders([
        { id: 1, title: 'جائزہ', date: '13-11-2025' },
        { id: 2, title: 'سالانہ امتحان', date: '13-11-2025' }
      ]);
    }
    // Load grade settings
    const savedGradeSettings = JSON.parse(localStorage.getItem('grade_settings') || '[]');
    setGradeSettings(savedGradeSettings);
  }, []);

  const handleAddGradeSetting = () => {
    if (!newGrade.name || !newGrade.min || !newGrade.max) return;
    const updated = [...gradeSettings, { ...newGrade, id: Date.now() }];
    setGradeSettings(updated);
    localStorage.setItem('grade_settings', JSON.stringify(updated));
    setNewGrade({ name: '', min: '', max: '', grace: '', isFail: false });
    syncToServer();
  };

  const handleDeleteGradeSetting = (id: number) => {
    const gradeSetting = gradeSettings.find(g => g.id === id);
    if (gradeSetting) addToRecycleBin('exams', gradeSetting, 'name');
    const updated = gradeSettings.filter(g => g.id !== id);
    setGradeSettings(updated);
    localStorage.setItem('grade_settings', JSON.stringify(updated));
    syncToServer();
  };

  const handleCreateSheet = () => {
    if (!selectedClass || !selectedExamType) {
      alert('براہ کرم کلاس اور امتحان کی قسم منتخب کریں۔');
      return;
    }

    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    const filteredStudents = savedStudents.filter((s: any) => s.grade === selectedClass);
    
    if (filteredStudents.length === 0) {
      alert('اس درجہ میں کوئی طالب علم درج نہیں ہے۔ براہ کرم پہلے طلبہ کا اندراج کریں۔');
      return;
    }

    const initialRows = filteredStudents.map((s: any, idx: number) => {
      const row: any = {
        id: idx + 1,
        studentName: s.name,
        fatherName: s.fatherName,
        rollNo: s.rollNo || s.id || (idx + 1).toString(),
        marks: {},
        obtained: 0,
        percentage: 0,
        quality: ''
      };
      subjects.forEach(sub => row.marks[sub] = 0);
      return row;
    });

    setResultRows(initialRows);
    setShowSheet(true);
  };

  const updateMarks = (rowId: number, subject: string, val: number) => {
    const updated = resultRows.map(row => {
      if (row.id === rowId) {
        const newMarks = { ...row.marks, [subject]: val };
        const obtained = Object.values(newMarks).reduce((a: any, b: any) => a + b, 0) as number;
        const totalPossible = subjects.length * 100;
        const percentage = (obtained / totalPossible) * 100;
        
        return { 
          ...row, 
          marks: newMarks, 
          obtained, 
          percentage: parseFloat(percentage.toFixed(2))
        };
      }
      return row;
    });
    setResultRows(updated);
  };

  const setQuality = (rowId: number, quality: string) => {
    setResultRows(resultRows.map(row => row.id === rowId ? { ...row, quality } : row));
  };

  const handleDeleteHeader = (id: number) => {
    const header = examHeaders.find(h => h.id === id);
    if (header) addToRecycleBin('exams', header, 'title');
    const updated = examHeaders.filter(h => h.id !== id);
    setExamHeaders(updated);
    localStorage.setItem('examRecords', JSON.stringify(updated));
    syncToServer();
  };

  const [newHeader, setNewHeader] = useState('');
  const handleAddHeader = () => {
    if (!newHeader) return;
    const updated = [...examHeaders, { id: Date.now(), title: newHeader, date: new Date().toLocaleDateString('en-GB') }];
    setExamHeaders(updated);
    localStorage.setItem('examRecords', JSON.stringify(updated));
    setNewHeader('');
    syncToServer();
  };

  const handleSaveResults = () => {
    if (resultRows.length === 0) return;
    const existing = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    const newRecord = {
      id: Date.now(),
      examType: selectedExamType,
      className: selectedClass,
      date: new Date().toLocaleDateString('en-GB'),
      records: resultRows
    };
    const updated = [...existing, newRecord];
    localStorage.setItem('all_exam_results', JSON.stringify(updated));

    // Save individual results to each student's record
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = allStudents.map((student: any) => {
      const matchingResult = resultRows.find((r: any) => String(r.rollNo) === String(student.rollNo));
      if (matchingResult) {
        const studentResults = student.examResults || [];
        // Remove old result for this exam type if it exists to avoid duplicates
        const filteredResults = studentResults.filter((res: any) => res.examType !== selectedExamType);
        return {
          ...student,
          examResults: [
            ...filteredResults, 
            { 
              ...matchingResult, 
              examType: selectedExamType, 
              date: newRecord.date,
              className: selectedClass 
            }
          ]
        };
      }
      return student;
    });
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    localStorage.setItem('students_list', JSON.stringify(updatedStudents));

    syncToServer();

    // Auto-sync to Public_Portal/results.json via backend API
    fetch('http://localhost:5000/api/exam-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
      .then(r => r.json())
      .then(() => console.log('[Exam Results] Synced to public portal results.json'))
      .catch(e => console.warn('[Exam Results] Could not sync to portal:', e.message));

    alert('نتائج کامیابی سے محفوظ کر لیے گئے ہیں!\n(ویب سائٹ پورٹل کے ساتھ بھی sync ہو گئے ہیں)');
    setShowSheet(false);
  };

  const ResultReport = ({ student, onClose }: { student: any, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Close & Print Buttons */}
        <div className="fixed top-6 right-6 flex gap-4 no-print z-[110]">
           <button onClick={() => window.print()} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 font-bold font-urdu">
              <Printer size={20} />
              پرنٹ کریں
           </button>
           <button onClick={onClose} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2 font-bold font-urdu">
              <X size={20} />
              بند کریں
           </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-black shadow-2xl relative flex flex-col print:shadow-none"
          style={{ width: '148mm', minHeight: '210mm' }}
        >
           {/* Double Line Border */}
           <div className="absolute inset-[8mm] border-[3px] border-black pointer-events-none z-0"></div>
           <div className="absolute inset-[9.5mm] border border-black pointer-events-none z-0"></div>

           <div className="relative z-10 w-full h-full p-[14mm] flex flex-col" dir="rtl">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                 <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center p-1 bg-white">
                   {systemSettings.monogram ? (
                     <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain grayscale" />
                   ) : (
                     <div className="text-[8px] font-bold text-center">مونوگرام</div>
                   )}
                 </div>
                 <div className="flex-1 text-center">
                    <h1 style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu', fontSize: '26px', lineHeight: '1.2' }} className="font-black text-black">
                       {systemSettings.jamiaName || 'جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ'}
                    </h1>
                    <div className="text-sm font-bold font-arabic mt-1 border-b border-black inline-block px-4 pb-1">
                       کشف الدرجات (Result Card)
                    </div>
                 </div>
                 <div className="w-16"></div> {/* Spacer for symmetry */}
              </div>

              {/* Student Info */}
              <div className="flex flex-col gap-2 text-xs font-bold mb-6 font-urdu leading-loose">
                 <div className="flex justify-between">
                    <div className="flex gap-2 flex-1">
                       <span className="shrink-0">نام طالب علم:</span>
                       <span className="flex-1 border-b border-black border-dashed text-center font-normal">{student.studentName}</span>
                    </div>
                    <div className="flex gap-2 w-32 mr-4">
                       <span className="shrink-0">رول نمبر:</span>
                       <span className="flex-1 border-b border-black border-dashed text-center font-mono font-normal">{student.rollNo}</span>
                    </div>
                 </div>
                 <div className="flex justify-between">
                    <div className="flex gap-2 flex-1">
                       <span className="shrink-0">ولدیت:</span>
                       <span className="flex-1 border-b border-black border-dashed text-center font-normal">{student.fatherName}</span>
                    </div>
                    <div className="flex gap-2 w-32 mr-4">
                       <span className="shrink-0">رجسٹریشن:</span>
                       <span className="flex-1 border-b border-black border-dashed text-center font-mono font-normal">{student.registrationNo || '----'}</span>
                    </div>
                 </div>
                 <div className="flex justify-between">
                    <div className="flex gap-2 flex-1">
                       <span className="shrink-0">درجہ (کلاس):</span>
                       <span className="flex-1 border-b border-black border-dashed text-center font-normal">{student.className}</span>
                    </div>
                    <div className="flex gap-2 w-32 mr-4">
                       <span className="shrink-0">امتحان:</span>
                       <span className="flex-1 border-b border-black border-dashed text-center font-normal">{student.examType}</span>
                    </div>
                 </div>
              </div>

              {/* Marks Table */}
              <table className="w-full text-center border-collapse border-2 border-black mb-auto text-xs font-bold font-urdu">
                 <thead>
                    <tr className="bg-black/5">
                       <th className="border-2 border-black py-1.5 px-2">مضمون (Subjects)</th>
                       <th className="border-2 border-black py-1.5 w-20">کل نمبر</th>
                       <th className="border-2 border-black py-1.5 w-24">حاصل کردہ</th>
                    </tr>
                 </thead>
                 <tbody>
                    {Object.keys(student.marks || {}).map((sub) => (
                       <tr key={sub}>
                          <td className="border border-black py-1.5 px-2 text-right">{sub}</td>
                          <td className="border border-black py-1.5 font-mono">100</td>
                          <td className="border border-black py-1.5 font-mono">{student.marks?.[sub] || 0}</td>
                       </tr>
                    ))}
                 </tbody>
                 <tfoot>
                    <tr className="bg-black/5">
                       <td className="border-2 border-black py-2 px-2 text-left font-black">میزان (Total)</td>
                       <td className="border-2 border-black py-2 font-mono font-black">{Object.keys(student.marks || {}).length * 100}</td>
                       <td className="border-2 border-black py-2 font-mono font-black text-sm">{student.obtained}</td>
                    </tr>
                 </tfoot>
              </table>

              {/* Footer / Signatures */}
              <div className="flex justify-between items-end mt-10 font-bold text-xs font-urdu">
                 <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                       <span>التقدیر (Grade):</span>
                       <span className="border-b-2 border-black border-double px-4 text-center pb-1">{student.quality || 'ممتاز'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                       <span>فیصد (Percentage):</span>
                       <span className="border-b-2 border-black border-double px-4 text-center font-mono pb-1">{student.percentage}%</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-center">
                    <div className="w-40 border-b border-black"></div>
                    <span className="pt-2 text-[11px]">دستخط ناظم امتحانات</span>
                  </div>
              </div>
           </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-urdu" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">امتحانات کا انتظام</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const records = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
              exportToExcel(records, 'exam_results');
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Download className="w-4 h-4" />
            ایکسل ایکسپورٹ
          </button>
          
          <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            ایکسل اپلوڈ
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const data = await importFromExcel(e.target.files[0]);
                    const existing = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
                    const merged = [...existing, ...data];
                    localStorage.setItem('all_exam_results', JSON.stringify(merged));
                    alert('ڈیٹا کامیابی سے اپلوڈ ہو گیا۔');
                  } catch (err) {
                    alert('ایکسل فائل پڑھنے میں خرابی۔');
                  }
                }
              }} 
            />
          </label>

          <button 
            onClick={onBack}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            واپس ڈیش بورڈ
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-8 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'results' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            نتائج درج کریں
            {activeTab === 'results' && (
              <motion.div layoutId="examTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-8 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'types' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            امتحان کی قسم
            {activeTab === 'types' && (
              <motion.div layoutId="examTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-8 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            انفرادی رپورٹس
            {activeTab === 'reports' && (
              <motion.div layoutId="examTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-8 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            گریڈ و پوزیشن ترتیبات
            {activeTab === 'settings' && (
              <motion.div layoutId="examTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'results' ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
            >
              <div className="bg-amber-400 text-slate-900 px-4 py-2 text-xs font-bold text-left">
                نتائج شیٹ بنائیں
              </div>
              
              {!showSheet ? (
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">کلاس کا نام</label>
                      <select 
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      >
                        <option value="">-- کلاس منتخب کریں --</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">امتحان کی قسم</label>
                      <select 
                        value={selectedExamType}
                        onChange={(e) => setSelectedExamType(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      >
                        <option value="">-- امتحان کی قسم منتخب کریں --</option>
                        {examTypes.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={handleCreateSheet}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                    >
                      نتائج شیٹ بنائیں
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="bg-emerald-600 text-white px-4 py-3 rounded-t-xl flex justify-between items-center text-xs font-bold">
                    <span>نتائج داخل کریں - {selectedExamType}</span>
                    <div className="flex gap-4">
                      <button className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">سیکشن شامل کریں</button>
                      <button className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">خالی شیٹ</button>
                      <button className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">مزید طلبہ شامل کریں</button>
                      <button className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">ترتیب کھولیں</button>
                      <label className="flex items-center gap-1">
                         <span>حفظ یا کتب</span>
                         <input type="checkbox" className="w-3 h-3" />
                      </label>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-emerald-100">
                    <table className="w-full text-[10px] text-right" dir="rtl">
                      <thead className="bg-[#1e293b] text-white">
                        <tr>
                          <th className="px-2 py-3 border-l border-white/10 text-center">نمبر شمار</th>
                          <th className="px-4 py-3 border-l border-white/10">طالب علم</th>
                          <th className="px-4 py-3 border-l border-white/10">ولدیت</th>
                          {subjects.map(sub => (
                            <th key={sub} className="px-1 py-1 border-l border-white/10 text-center">
                              <div className="flex flex-col items-center">
                                <span>{sub}</span>
                                <div className="bg-white text-slate-800 px-2 mt-1 rounded">100</div>
                              </div>
                            </th>
                          ))}
                          <th className="px-2 py-3 border-l border-white/10 text-center">حاصل کردہ نمبر</th>
                          <th className="px-2 py-3 border-l border-white/10 text-center">فیصد</th>
                          <th className="px-4 py-3 border-l border-white/10 text-center">کیفیت</th>
                          <th className="px-2 py-3 text-center">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resultRows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-2 py-2 text-center text-slate-500 border-l border-slate-100">
                              <input type="text" className="w-10 bg-slate-50 border-none text-center outline-none" defaultValue={row.rollNo} />
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-700 border-l border-slate-100">{row.studentName}</td>
                            <td className="px-4 py-2 text-slate-500 border-l border-slate-100">{row.fatherName}</td>
                            {subjects.map(sub => (
                              <td key={sub} className="px-1 py-2 border-l border-slate-100">
                                <input 
                                  type="number" 
                                  value={row.marks[sub] || ''}
                                  onChange={(e) => updateMarks(row.id, sub, parseInt(e.target.value) || 0)}
                                  className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center font-bold border-l border-slate-100">{row.obtained}</td>
                            <td className="px-2 py-2 text-center text-slate-600 border-l border-slate-100">{row.percentage}%</td>
                            <td className="px-4 py-2 border-l border-slate-100 min-w-[200px]">
                               <div className="flex flex-wrap gap-1 justify-center">
                                  {['ممتاز', 'جید جدا', 'جید', 'مقبول', 'راسب'].map(q => (
                                    <button 
                                      key={q}
                                      onClick={() => setQuality(row.id, q)}
                                      className={`px-2 py-1 rounded text-[8px] transition-all font-bold ${
                                        row.quality === q 
                                          ? 'bg-emerald-600 text-white shadow-sm' 
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      {q}
                                    </button>
                                  ))}
                               </div>
                            </td>
                            <td className="px-2 py-2 text-center">
                               <button className="text-red-400 hover:text-red-500 transition-colors">
                                 <Trash2 size={12} />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center gap-4 pt-4 pb-8">
                     <button onClick={handleSaveResults} className="bg-emerald-600 text-white px-12 py-3 rounded-full font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">نتائج محفوظ کریں</button>
                     <button onClick={() => setShowSheet(false)} className="bg-slate-700 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">واپس</button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'reports' ? (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl shadow-lg border border-slate-100 p-8"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 font-urdu flex items-center gap-3 justify-end" dir="rtl">
                <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
                <span>انفرادی امتحانی رپورٹس (کشف الدرجات)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" dir="rtl">
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 font-urdu text-right">درجہ (کلاس) منتخب کریں</label>
                    <select 
                      value={selectedReportClass} 
                      onChange={(e) => setSelectedReportClass(e.target.value)}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all text-right font-urdu"
                    >
                      <option value="">تمام درجات (کلاسز)</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 font-urdu text-right">امتحان کی قسم منتخب کریں</label>
                    <select 
                      value={selectedReportExamType} 
                      onChange={(e) => setSelectedReportExamType(e.target.value)}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all text-right font-urdu"
                    >
                      <option value="">تمام امتحانات</option>
                      {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 font-urdu text-right">طالب علم تلاش کریں (نام یا رول نمبر)</label>
                    <input 
                      type="text" 
                      placeholder="نام یا رول نمبر سے تلاش کریں..." 
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all text-right font-urdu"
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                    />
                 </div>
              </div>

              {!selectedReportClass || !selectedReportExamType ? (
                 <div className="bg-amber-50 text-amber-800 p-8 rounded-xl border border-amber-200 text-center font-urdu shadow-sm max-w-xl mx-auto" dir="rtl">
                    <div className="text-3xl mb-2">📁</div>
                    <h4 className="font-bold text-base mb-1">درجہ (کلاس) اور امتحان منتخب کریں</h4>
                    <p className="text-xs text-amber-600">انفرادی رپورٹس دیکھنے کے لیے براہ کرم اوپر سے درجہ (کلاس) اور امتحان کی قسم منتخب کریں۔</p>
                 </div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border" dir="rtl">
                       <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                             <th className="py-3 px-4 text-center border-l w-12 font-urdu">#</th>
                             <th className="py-3 px-4 text-center border-l w-20 font-urdu">رول نمبر</th>
                             <th className="py-3 px-6 border-l font-urdu">طالب علم</th>
                             <th className="py-3 px-6 border-l font-urdu">والد کا نام</th>
                             <th className="py-3 px-6 text-center border-l font-urdu">حاصل کردہ نمبر</th>
                             <th className="py-3 px-6 text-center border-l font-urdu">فیصد</th>
                             <th className="py-3 px-6 text-center border-l font-urdu">تقدیر (گریڈ)</th>
                             <th className="py-3 px-6 text-center font-urdu">رپورٹ کارروائی</th>
                          </tr>
                       </thead>
                       <tbody>
                          {(() => {
                             const studentsList = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
                             const classStudents = studentsList.filter((s: any) => s.grade === selectedReportClass);
                             
                             const results = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
                             const matchingExam = results.find((exam: any) => exam.className === selectedReportClass && exam.examType === selectedReportExamType);
                             
                             const filtered = classStudents.filter((student: any) => {
                                if (reportSearch) {
                                   const searchLower = reportSearch.toLowerCase();
                                   return (student.name && student.name.toLowerCase().includes(searchLower)) ||
                                          (student.rollNo && String(student.rollNo).toLowerCase().includes(searchLower)) ||
                                          (student.fatherName && student.fatherName.toLowerCase().includes(searchLower));
                                }
                                return true;
                             });

                             if (filtered.length === 0) {
                                return (
                                   <tr>
                                      <td colSpan={8} className="py-12 text-center text-slate-400 italic font-urdu">اس درجہ میں منتخب فلٹر کے مطابق کوئی طالب علم موجود نہیں ہے۔</td>
                                   </tr>
                                );
                             }

                             return filtered.map((student: any, idx: number) => {
                                // Find result from student record or global array
                                const studentResult = (student.examResults || []).find((r: any) => r.examType === selectedReportExamType);
                                const globalRecord = matchingExam ? (matchingExam.records || []).find((r: any) => String(r.rollNo) === String(student.rollNo)) : null;
                                
                                const result = studentResult || globalRecord;
                                const totalBooks = result ? Object.keys(result.marks || {}).length : 0;
                                const totalMarks = totalBooks * 100;
                                
                                return (
                                   <tr key={student.id} className="border-b transition-colors hover:bg-slate-50">
                                      <td className="py-4 px-4 text-center text-slate-400 font-mono border-l">{idx + 1}</td>
                                      <td className="py-4 px-4 text-center text-slate-700 font-mono font-bold border-l">{student.rollNo || '---'}</td>
                                      <td className="py-4 px-6 text-slate-800 font-bold font-urdu border-l">{student.name}</td>
                                      <td className="py-4 px-6 text-slate-500 font-urdu border-l">{student.fatherName}</td>
                                      <td className="py-4 px-6 text-center text-slate-700 font-mono font-bold border-l">{result ? `${result.obtained} / ${totalMarks}` : '---'}</td>
                                      <td className="py-4 px-6 text-center text-slate-600 font-mono border-l">{result ? `${result.percentage}%` : '---'}</td>
                                      <td className="py-4 px-6 text-center border-l">
                                         {result ? (
                                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold font-urdu">
                                               {result.quality || 'ممتاز'}
                                            </span>
                                         ) : (
                                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold font-urdu">
                                               غیر درج شدہ
                                            </span>
                                         )}
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                         {result ? (
                                            <button 
                                               onClick={() => setSelectedReport({
                                                  ...result,
                                                  studentName: student.name,
                                                  fatherName: student.fatherName,
                                                  rollNo: student.rollNo,
                                                  registrationNo: student.registrationNo,
                                                  className: selectedReportClass,
                                                  examType: selectedReportExamType
                                               })}
                                               className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 mx-auto font-urdu active:scale-95 shadow-md shadow-emerald-100"
                                            >
                                               <FileText size={14} />
                                               رپورٹ دیکھیں
                                            </button>
                                         ) : (
                                            <button 
                                               disabled
                                               className="bg-slate-100 text-slate-400 px-5 py-1.5 rounded-lg text-xs font-bold mx-auto font-urdu cursor-not-allowed border"
                                            >
                                               نتائج نہیں ہیں
                                            </button>
                                         )}
                                      </td>
                                   </tr>
                                );
                             });
                          })()}
                       </tbody>
                    </table>
                 </div>
              )}

              {/* Render the Report Modal */}
              {selectedReport && <ResultReport student={selectedReport} onClose={() => setSelectedReport(null)} />}
            </motion.div>
          ) : activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">گریڈ اور پوزیشن ترتیبات</h3>
                <div className="flex gap-2 text-[10px]">
                   <button onClick={() => setSettingsTab('grade')} className={`px-4 py-1 rounded-full font-bold transition-all ${settingsTab === 'grade' ? 'bg-blue-600 text-white' : 'text-blue-600 border border-blue-600'}`}>گریڈ ترتیبات</button>
                   <button onClick={() => setSettingsTab('position')} className={`px-4 py-1 rounded-full font-bold transition-all ${settingsTab === 'position' ? 'bg-blue-600 text-white' : 'text-blue-600 border border-blue-600'}`}>پوزیشن ترتیبات</button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center">
                   نیا گریڈ شامل کریں
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500">گریڈ کا نام*</label>
                     <input 
                       type="text" 
                       value={newGrade.name}
                       onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
                       placeholder="مثلاً: ممتاز، جید جدا" 
                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs" 
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500">کم از کم فیصد*</label>
                     <input 
                       type="number" 
                       value={newGrade.min}
                       onChange={(e) => setNewGrade({...newGrade, min: e.target.value})}
                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs" 
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500">زیادہ سے زیادہ فیصد*</label>
                     <input 
                       type="number" 
                       value={newGrade.max}
                       onChange={(e) => setNewGrade({...newGrade, max: e.target.value})}
                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs" 
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500">رعایتی نمبرات</label>
                     <input 
                       type="number" 
                       value={newGrade.grace}
                       onChange={(e) => setNewGrade({...newGrade, grace: e.target.value})}
                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs" 
                     />
                   </div>
                   <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newGrade.isFail}
                          onChange={(e) => setNewGrade({...newGrade, isFail: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-300" 
                        />
                        فیل کا تعین
                      </label>
                      <button 
                        onClick={handleAddGradeSetting}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-emerald-700 transition-all flex-1"
                      >
                        شامل کریں
                      </button>
                   </div>
                </div>

                <div className="bg-blue-600 text-white px-4 py-2 text-xs font-bold text-center">
                   موجودہ گریڈ ترتیبات
                </div>
                <div className="p-4 overflow-x-auto">
                   {gradeSettings.length > 0 ? (
                     <table className="w-full text-xs text-center border-collapse">
                        <thead className="bg-slate-50 text-slate-600">
                           <tr>
                              <th className="py-2 border">گریڈ</th>
                              <th className="py-2 border">رینج</th>
                              <th className="py-2 border">رعایتی نمبر</th>
                              <th className="py-2 border">کیفیت</th>
                              <th className="py-2 border">عمل</th>
                           </tr>
                        </thead>
                        <tbody>
                           {gradeSettings.map(g => (
                             <tr key={g.id} className="hover:bg-slate-50">
                               <td className="py-2 border font-bold">{g.name}</td>
                               <td className="py-2 border">{g.min}% سے {g.max}%</td>
                               <td className="py-2 border">{g.grace || 0}</td>
                               <td className="py-2 border">
                                 {g.isFail ? <span className="text-red-500 font-bold">راسب (فیل)</span> : <span className="text-emerald-500 font-bold">پاس</span>}
                               </td>
                               <td className="py-2 border">
                                  <button onClick={() => handleDeleteGradeSetting(g.id)} className="text-red-500 hover:text-red-700">حذف</button>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   ) : (
                     <div className="bg-cyan-50 text-slate-600 p-4 text-center rounded-lg border border-cyan-100 text-xs">
                        کوئی گریڈ ترتیب موجود نہیں ہے۔ اوپر دیے گئے فارم سے نئی ترتیب شامل کریں۔
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="types"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-2 text-xs font-bold text-center">
                  امتحان کا ہیڈر
                </div>
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
                  <p className="text-[10px] text-red-500 mb-2">نوٹ: اس جگہ صرف ایک ہی مرتبہ امتحان کی قسم لکھیں جیسے، سہ ماہی، ششماہی، جائز، وغیرہ۔ اور بار بار اسے تبدیل کرنے سے گریز کریں۔</p>
                  <div className="flex gap-2 w-full max-w-md">
                    <input 
                      type="text" 
                      value={newHeader}
                      onChange={(e) => setNewHeader(e.target.value)}
                      placeholder="امتحان کا نام" 
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs" 
                    />
                    <button 
                      onClick={handleAddHeader}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
                    >
                      <Plus size={14} />
                      شامل کریں
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="py-3 px-4 text-center border-l border-slate-200 w-12">#</th>
                        <th className="py-3 px-6 text-center border-l border-slate-200">امتحان ہیڈر</th>
                        <th className="py-3 px-6 text-center border-l border-slate-200">تاریخ ایجاد</th>
                        <th className="py-3 px-6 text-center">عمل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examHeaders.map((exam, idx) => (
                        <tr key={exam.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-4 px-6 text-center font-bold text-slate-700">{exam.title}</td>
                          <td className="py-4 px-6 text-center text-slate-500 font-mono">{exam.date}</td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleDeleteHeader(exam.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-red-600 transition-colors">
                                <Trash2 size={12} />
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExamManagement;
