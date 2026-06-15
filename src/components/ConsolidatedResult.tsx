import React, { useState, useEffect } from 'react';
import { ChevronRight, Printer, Download, Search } from 'lucide-react';
import { syncToServer } from '../syncService';

interface ConsolidatedResultProps {
  onBack: () => void;
}

const ConsolidatedResult: React.FC<ConsolidatedResultProps> = ({ onBack }) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load system settings (e.g. monogram)
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);

    // Load classes
    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      if (Array.isArray(savedGradesList) && savedGradesList.length > 0) {
        setClasses(Array.from(new Set(savedGradesList.map((g: any) => g?.name).filter(Boolean))));
      } else {
        const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
        if (Array.isArray(savedGrades) && savedGrades.length > 0) {
          setClasses(savedGrades.map((g: any) => g?.name).filter(Boolean));
        } else {
          setClasses(['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'عالمیہ']);
        }
      }
    } catch (e) {
      setClasses(['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'عالمیہ']);
    }

    // Load exam types
    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    setExamTypes(savedExams.length > 0 ? savedExams : ['سالانہ', 'ششماہی', 'سہ ماہی']);
  }, []);

  useEffect(() => {
    if (!selectedClass || !selectedExamType) {
      setStudents([]);
      setLedgerRecords([]);
      setSubjects([]);
      return;
    }

    // 1. Get subjects (books) for this class
    const allBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    const classBooks = allBooks.filter((b: any) => b.grade === selectedClass).map((b: any) => b.name);
    
    // Default standard Islamic subjects if none are registered for the class
    const finalSubjects = classBooks.length > 0 ? classBooks : ['القرآن الكريم', 'الحديث النبوي', 'الفقه', 'اللغة العربية', 'العقيدة'];
    setSubjects(finalSubjects);

    // 2. Load all students belonging to selected class
    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    const classStudents = savedStudents.filter((s: any) => s.grade === selectedClass);
    setStudents(classStudents);

    // 3. Load results and merge them
    const allResults = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    const matchingExam = allResults.find((exam: any) => exam.className === selectedClass && exam.examType === selectedExamType);
    
    let examRecordsArray: any[] = [];
    if (matchingExam) {
      try {
        if (typeof matchingExam.records === 'string') {
          examRecordsArray = JSON.parse(matchingExam.records);
        } else if (Array.isArray(matchingExam.records)) {
          examRecordsArray = matchingExam.records;
        }
      } catch(e) { console.error(e); }
    }

    const records = classStudents.map((student: any) => {
      // Look up student individual examResults or global results array
      let studentResultsArray: any[] = [];
      try {
        if (typeof student.examResults === 'string') {
          studentResultsArray = JSON.parse(student.examResults);
        } else if (Array.isArray(student.examResults)) {
          studentResultsArray = student.examResults;
        }
      } catch(e) { console.error(e); }

      const studentResult = studentResultsArray.find((r: any) => r.examType === selectedExamType);
      const globalRecord = examRecordsArray.find((r: any) => String(r.rollNo) === String(student.rollNo));
      const result = studentResult || globalRecord;

      const marks: any = {};
      finalSubjects.forEach((sub: string) => {
        marks[sub] = result?.marks?.[sub] !== undefined ? result.marks[sub] : '---';
      });

      let totalObtained = 0;
      let hasMarks = false;
      let isFail = false;

      finalSubjects.forEach((sub: string) => {
        const m = marks[sub];
        if (typeof m === 'number') {
          totalObtained += m;
          hasMarks = true;
          if (m < 33) isFail = true; // Compartment / Fail limit at 33%
        }
      });

      const maxPossible = finalSubjects.length * 100;
      const percentage = hasMarks ? parseFloat(((totalObtained / maxPossible) * 100).toFixed(2)) : 0;
      
      let status = '---';
      if (hasMarks) {
        if (percentage < 33) {
          status = 'راسب'; // Fail
        } else if (isFail) {
          status = 'معيد'; // Compartment / Repeat
        } else {
          status = 'ناجح'; // Pass
        }
      }

      return {
        rollNo: student.rollNo || '---',
        name: student.name,
        fatherName: student.fatherName,
        marks,
        totalObtained: hasMarks ? totalObtained : '---',
        percentage: hasMarks ? `${percentage}%` : '---',
        status
      };
    });

    setLedgerRecords(records);
  }, [selectedClass, selectedExamType]);

  const filteredRecords = ledgerRecords.filter((rec: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return rec.name.toLowerCase().includes(query) || 
           rec.rollNo.toString().toLowerCase().includes(query);
  });

  const totalMaxMarks = subjects.length * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-urdu p-6" dir="rtl">
      {/* Back & Control Header */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-urdu">اجتماعی نتیجہ (Grand Tabulation Sheet)</h2>
              <p className="text-xs text-slate-500">تمام درجات کی اجتماعی رزلٹ لیجر شیٹ دیکھنے اور پرنٹ کرنے کا خودکار نظام</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {selectedClass && selectedExamType && ledgerRecords.length > 0 && (
              <button 
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 text-sm font-urdu w-full md:w-auto justify-center"
              >
                <Printer className="w-4 h-4" />
                لیجر پرنٹ کریں (Landscape A4)
              </button>
            )}
          </div>
        </div>

        {/* Roster & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 text-right">درجہ (کلاس) منتخب کریں</label>
            <div className="flex flex-wrap gap-2">
              {classes.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedClass === c 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 text-right">امتحان کی قسم منتخب کریں</label>
            <select 
              value={selectedExamType} 
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all text-slate-800 font-urdu w-full shadow-sm"
            >
              <option value="">-- امتحان کی قسم --</option>
              {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 text-right">طالب علم تلاش کریں (نام / رول نمبر)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="تلاش کریں..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800 font-urdu shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Screen Preview Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-x-auto no-print">
        {!selectedClass || !selectedExamType ? (
          <div className="text-center py-16 text-slate-500 font-urdu max-w-md mx-auto">
            <div className="text-5xl mb-4">📊</div>
            <h4 className="font-bold text-base text-slate-800 mb-2">درجہ اور امتحان کی قسم منتخب کریں</h4>
            <p className="text-xs text-slate-500">اجتماعی رزلٹ لیجر دیکھنے اور پرنٹ کرنے کے لیے اوپر دیے گئے درجات اور امتحان کے بٹن پر کلک کریں۔</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-urdu">
            <p>منتخب فلٹر کے مطابق کوئی ریکارڈ دستیاب نہیں ہے۔</p>
          </div>
        ) : (
          <div className="min-w-[1000px] bg-white text-black p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Screen Preview Mode</span>
              <div className="border-b border-dashed border-slate-300 my-2" />
            </div>

            {/* Simulated Landscape A4 Ledger View */}
            <div className="w-full border-[3px] border-black p-6 relative bg-white text-black" dir="rtl">
              {/* Islamic Seal & Top Header */}
              <div className="flex justify-between items-start mb-6">
                {/* Monochrome Circular Islamic Seal */}
                <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center p-1 bg-white relative">
                  {systemSettings.monogram ? (
                    <img src={systemSettings.monogram} alt="Seal" className="w-full h-full object-contain grayscale" />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="black" strokeWidth="2" />
                      <circle cx="50" cy="50" r="41" fill="none" stroke="black" strokeWidth="1" strokeDasharray="3,3" />
                      <path d="M50 15 L58 35 L78 35 L62 48 L68 68 L50 56 L32 68 L38 48 L22 35 L42 35 Z" fill="none" stroke="black" strokeWidth="1.5" />
                      <text x="50" y="80" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="sans-serif">JAMIA SEAL</text>
                    </svg>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <h1 style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu', fontSize: '28px', lineHeight: '1.2' }} className="font-bold text-black">
                    جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ
                  </h1>
                  <h2 className="text-base font-bold font-urdu mt-1 text-slate-800">
                    جدول نتائج امتحانات (Examination Result Ledger Sheet)
                  </h2>
                  <div className="text-xs font-bold mt-2 text-slate-600">
                    درجہ: <span className="underline ml-4">{selectedClass}</span>
                    امتحان: <span className="underline">{selectedExamType}</span>
                  </div>
                </div>

                <div className="w-20"></div> {/* Spacing balance */}
              </div>

              {/* Table Ledger Sheet Grid */}
              <table className="w-full text-center border-collapse border-2 border-black text-[11px] font-bold font-urdu">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-black">
                    <th className="border-2 border-black py-2 px-1 w-10 text-center font-bold">مسلسل</th>
                    <th className="border-2 border-black py-2 px-1 w-20 text-center font-bold">رقم الامتحان</th>
                    <th className="border-2 border-black py-2 px-3 text-right font-bold min-w-[150px]">اسم الطالب</th>
                    {subjects.map((sub: string) => (
                      <th key={sub} className="border-2 border-black py-2 px-1 text-center font-bold text-[10px] min-w-[70px]">
                        {sub}
                      </th>
                    ))}
                    <th className="border-2 border-black py-2 px-1 w-24 text-center font-bold">المجموع</th>
                    <th className="border-2 border-black py-2 px-1 w-24 text-center font-bold">النتيجة</th>
                    <th className="border-2 border-black py-2 px-1 w-20 text-center font-bold">المعدل</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-black hover:bg-slate-50 transition-colors">
                      <td className="border-2 border-black py-2 text-center font-mono font-normal">{idx + 1}</td>
                      <td className="border-2 border-black py-2 text-center font-mono font-bold">{row.rollNo}</td>
                      <td className="border-2 border-black py-2 px-3 text-right font-bold">{row.name}</td>
                      {subjects.map((sub: string) => (
                        <td key={sub} className="border-2 border-black py-2 text-center font-mono font-normal">
                          {row.marks[sub]}
                        </td>
                      ))}
                      <td className="border-2 border-black py-2 text-center font-mono font-bold bg-slate-50">{row.totalObtained} / {totalMaxMarks}</td>
                      <td className="border-2 border-black py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          row.status === 'ناجح' ? 'text-emerald-700' :
                          row.status === 'معيد' ? 'text-orange-700' :
                          row.status === 'راسب' ? 'text-red-700' : 'text-slate-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="border-2 border-black py-2 text-center font-mono font-bold bg-slate-50">{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Signatures */}
              <div className="flex justify-between items-end mt-12 px-6 font-bold text-xs font-urdu text-black">
                <div className="flex flex-col items-center">
                  <div className="w-40 border-b border-black"></div>
                  <span className="pt-2">مدير المركز (Center Director)</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-40 border-b border-black"></div>
                  <span className="pt-2">ناظم امتحانات</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printing Styles Only Applied During Print */}
      <style>{`
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          /* Print Ledger Layout (Landscape A4) */
          @page {
            size: A4 landscape;
            margin: 6mm 10mm;
          }
          .print-ledger {
            display: block !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Double/Thin line lithographic border */
          .print-border-container {
            border: 3px solid black !important;
            padding: 8mm !important;
            position: relative !important;
            min-height: 195mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-border-container::after {
            content: '';
            position: absolute;
            top: 1.5mm;
            left: 1.5mm;
            right: 1.5mm;
            bottom: 1.5mm;
            border: 1px solid black !important;
            pointer-events: none;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid black !important;
          }
        }
      `}</style>

      {/* Hidden Print Container */}
      {selectedClass && selectedExamType && filteredRecords.length > 0 && (
        <div className="hidden print:block print-ledger text-black" dir="rtl">
          <div className="print-border-container">
            <div>
              {/* Islamic Seal & Top Header */}
              <div className="flex justify-between items-start mb-6">
                {/* Monochrome Circular Islamic Seal */}
                <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center p-1 bg-white relative">
                  {systemSettings.monogram ? (
                    <img src={systemSettings.monogram} alt="Seal" className="w-full h-full object-contain grayscale" />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="black" strokeWidth="2" />
                      <circle cx="50" cy="50" r="41" fill="none" stroke="black" strokeWidth="1" strokeDasharray="3,3" />
                      <path d="M50 15 L58 35 L78 35 L62 48 L68 68 L50 56 L32 68 L38 48 L22 35 L42 35 Z" fill="none" stroke="black" strokeWidth="1.5" />
                      <text x="50" y="80" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="sans-serif">JAMIA SEAL</text>
                    </svg>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <h1 style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu', fontSize: '30px', lineHeight: '1.2' }} className="font-bold text-black">
                    جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ
                  </h1>
                  <h2 className="text-lg font-bold font-urdu mt-1 text-black">
                    جدول نتائج امتحانات (Examination Result Ledger Sheet)
                  </h2>
                  <div className="text-sm font-bold mt-2 text-black">
                    درجہ: <span className="underline ml-6">{selectedClass}</span>
                    امتحان: <span className="underline">{selectedExamType}</span>
                  </div>
                </div>

                <div className="w-20"></div> {/* Spacing balance */}
              </div>

              {/* Table Ledger Sheet Grid */}
              <table className="w-full text-center border-collapse border-2 border-black text-[12px] font-bold font-urdu mt-6">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-black">
                    <th className="border-2 border-black py-2 px-1 w-10 text-center font-bold">مسلسل</th>
                    <th className="border-2 border-black py-2 px-1 w-20 text-center font-bold">رقم الامتحان</th>
                    <th className="border-2 border-black py-2 px-3 text-right font-bold min-w-[150px]">اسم الطالب</th>
                    {subjects.map((sub: string) => (
                      <th key={sub} className="border-2 border-black py-2 px-1 text-center font-bold text-[11px] min-w-[70px]">
                        {sub}
                      </th>
                    ))}
                    <th className="border-2 border-black py-2 px-1 w-24 text-center font-bold">المجموع</th>
                    <th className="border-2 border-black py-2 px-1 w-24 text-center font-bold">النتيجة</th>
                    <th className="border-2 border-black py-2 px-1 w-20 text-center font-bold">المعدل</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-2 border-black py-2.5 text-center font-mono font-normal">{idx + 1}</td>
                      <td className="border-2 border-black py-2.5 text-center font-mono font-bold">{row.rollNo}</td>
                      <td className="border-2 border-black py-2.5 px-3 text-right font-bold">{row.name}</td>
                      {subjects.map((sub: string) => (
                        <td key={sub} className="border-2 border-black py-2.5 text-center font-mono font-normal">
                          {row.marks[sub]}
                        </td>
                      ))}
                      <td className="border-2 border-black py-2.5 text-center font-mono font-bold bg-slate-50">{row.totalObtained} / {totalMaxMarks}</td>
                      <td className="border-2 border-black py-2.5 text-center">
                        <span className="font-bold">{row.status}</span>
                      </td>
                      <td className="border-2 border-black py-2.5 text-center font-mono font-bold bg-slate-50">{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Signatures */}
            <div className="flex justify-between items-end mt-16 px-6 font-bold text-sm font-urdu text-black">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b-2 border-black"></div>
                <span className="pt-2">مدير المركز (Center Director)</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-48 border-b-2 border-black"></div>
                <span className="pt-2">ناظم امتحانات</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedResult;
