import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Landmark, Search, Award, FileText, Printer, X, Download, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';

interface PublicResultPortalProps {
  onClose: () => void;
}

export default function PublicResultPortal({ onClose }: PublicResultPortalProps) {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [madrasas, setMadrasas] = useState<any[]>([]);
  const [selectedMadrassaId, setSelectedMadrassaId] = useState('');
  const [manualPrefix, setManualPrefix] = useState('');
  const [useManual, setUseManual] = useState(false);
  
  const [regInput, setRegInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any | null>(null);

  // Dynamic system settings for the target madrassa
  const [targetSettings, setTargetSettings] = useState<any>({
    jamiaName: 'جامعہ عربیہ سراج العلوم',
    monogram: ''
  });

  // Fetch licensed madrasas on mount
  useEffect(() => {
    async function fetchMadrasas() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'licensed_madrasas'));
        const list: any[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setMadrasas(list);
        if (list.length > 0) {
          setSelectedMadrassaId(list[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch madrasas list from Firebase:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMadrasas();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setMatchedStudents([]);
    setSelectedStudent(null);
    setAvailableExams([]);
    setActiveReport(null);

    const targetMadrassaId = useManual ? manualPrefix.trim() : selectedMadrassaId;
    if (!targetMadrassaId) {
      setErrorMsg('براہ کرم مدرسہ منتخب کریں یا درج کریں۔');
      return;
    }

    if (!regInput.trim()) {
      setErrorMsg('براہ کرم رجسٹریشن یا رول نمبر درج کریں۔');
      return;
    }

    setSearchLoading(true);
    try {
      const docRef = doc(db, 'madrassas', targetMadrassaId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setErrorMsg('منتخب مدرسہ کا کوئی تعلیمی ریکارڈ آن لائن سینٹرل ڈیٹا بیس پر مطابقت پذیر (Sync) نہیں ملا۔ براہ کرم ناظم مدرسہ سے رابطہ کریں۔');
        setSearchLoading(false);
        return;
      }

      const syncObj = docSnap.data();
      const madrassaData = syncObj?.data || {};

      // Load setting monogram and Name
      const systemSet = madrassaData.system_settings || {};
      setTargetSettings({
        jamiaName: systemSet.jamiaName || 'جامعہ عربیہ سراج العلوم',
        monogram: systemSet.monogram || ''
      });

      const students = madrassaData.students || [];
      const queryStr = regInput.trim().toLowerCase();

      // Find students whose registration / id ends with entered value or roll no matches
      const matches = students.filter((s: any) => {
        const sReg = String(s.regNo || s.id || '').toLowerCase().trim();
        const sRoll = String(s.rollNo || '').toLowerCase().trim();
        return sReg.endsWith(queryStr) || sReg === queryStr || sRoll === queryStr;
      });

      if (matches.length === 0) {
        setErrorMsg('درج کردہ معلومات کے مطابق مدرسہ میں کوئی طالب علم نہیں ملا۔ برائے مہربانی درست رجسٹریشن نمبر یا آخری 6 ہندسے درج کریں۔');
        setSearchLoading(false);
        return;
      }

      setMatchedStudents(matches);
      if (matches.length === 1) {
        selectStudent(matches[0], madrassaData);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMsg('آن لائن نتائج تلاش کرنے میں کچھ عارضی خرابی پیش آئی ہے۔ برائے مہربانی انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔');
    } finally {
      setSearchLoading(false);
    }
  };

  const selectStudent = (student: any, madrassaData: any) => {
    setSelectedStudent(student);
    const examResultsList: any[] = [];

    // Extract results from student record
    if (Array.isArray(student.examResults)) {
      student.examResults.forEach((val: any) => {
        examResultsList.push({
          ...val,
          className: student.grade || student.class || val.className,
          studentName: student.name,
          fatherName: student.fatherName,
          rollNo: student.rollNo,
          registrationNo: student.regNo || student.id,
        });
      });
    }

    // Extract from global all_exam_results
    const allExamResults = madrassaData.all_exam_results || [];
    allExamResults.forEach((exam: any) => {
      const studentRecord = (exam.records || []).find((rec: any) => 
        String(rec.rollNo) === String(student.rollNo) || 
        String(rec.regNo) === String(student.regNo)
      );
      if (studentRecord) {
        const exists = examResultsList.some(item => String(item.examType).trim() === String(exam.examType).trim() && String(item.className).trim() === String(exam.className).trim());
        if (!exists) {
          examResultsList.push({
            ...studentRecord,
            examType: exam.examType,
            className: exam.className || student.grade || student.class,
            studentName: student.name,
            fatherName: student.fatherName,
            rollNo: student.rollNo,
            registrationNo: student.regNo || student.id,
          });
        }
      }
    });

    setAvailableExams(examResultsList);
    if (examResultsList.length === 0) {
      setInfoMsg('طالب علم مل گیا ہے مگر اس تفویض کردہ درجہ/کلاس کے کوئی بھی امتحانی نتائج ابھی تک آن لائن جاری نہیں کیے گئے۔');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#800000] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </span>
            <div className="text-right">
              <h2 className="text-lg font-bold font-urdu">سرکاری پبلک رزلٹ پورٹل</h2>
              <p className="text-[10px] text-white/70">تمام ملحقہ مدارس کا پبلک امتحانی مرکزِ نتائج</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-urdu space-y-6" dir="rtl">
          
          {/* Quick instructions */}
          <div className="bg-amber-50 text-amber-900 px-4 py-3 rounded-2xl border border-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">براہ کرم صحیح معلومات درج کریں:</p>
              <p className="text-amber-700 mt-1">مدرسہ منتخب کر کے طالب علم کا رجسٹریشن نمبر یا رول نمبر درج کر کے سیکنڈز میں اپنا کشف الدرجات حاصل کریں اور پرنٹ ڈاؤن لوڈ کریں۔</p>
            </div>
          </div>

          {/* Setup / Lookup Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Madrassa Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">مدرسہ/جامعہ منتخب کریں</label>
                
                {useManual ? (
                  <input
                    type="text"
                    required
                    value={manualPrefix}
                    onChange={(e) => setManualPrefix(e.target.value)}
                    placeholder="مدرسہ کی آئی ڈی درج کریں (مثلاً: madrassa-...)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#800000] focus:bg-white transition-all text-right font-sans"
                  />
                ) : (
                  <select
                    value={selectedMadrassaId}
                    onChange={(e) => setSelectedMadrassaId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#800000] focus:bg-white transition-all text-right font-urdu"
                  >
                    {loading ? (
                      <option>مدارس لوڈ ہو رہے ہیں...</option>
                    ) : madrasas.length === 0 ? (
                      <option>کوئی مدرسہ دستیاب نہیں</option>
                    ) : (
                      madrasas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.madrassaName}
                        </option>
                      ))
                    )}
                  </select>
                )}
                
                {/* Manual toggle */}
                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => setUseManual(!useManual)}
                    className="text-[10px] text-blue-600 hover:underline font-bold mt-1"
                  >
                    {useManual ? 'فہرست سے تلاش کریں' : 'براہ راست رجسٹریشن نمبر پری فکس درج کریں'}
                  </button>
                </div>
              </div>

              {/* Student identification */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رجسٹریشن یا رول نمبر درج کریں</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regInput}
                    onChange={(e) => setRegInput(e.target.value)}
                    placeholder="رجسٹریشن نمبر یا رول نمبر کے آخری 6 ہندسے"
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#800000] focus:bg-white transition-all text-center font-mono font-bold placeholder:text-slate-400 placeholder:font-normal"
                    dir="ltr"
                  />
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={searchLoading}
              className="w-full py-3 bg-[#800000] text-white hover:bg-[#600000] rounded-xl font-bold transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
            >
              {searchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>نتائج تلاش کیے جا رہے ہیں...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>آن لائن امتحانی نتیجہ تلاش کریں</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-xs font-bold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl border border-blue-200 text-xs font-bold leading-relaxed">
              {infoMsg}
            </div>
          )}

          {/* Multiple students match */}
          {matchedStudents.length > 1 && !selectedStudent && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">ایک سے زائد طلبہ کے ریکارڈز ملے۔ براہ کرم درست طالب علم منتخب کریں:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedStudents.map((stud) => (
                  <button
                    key={stud.id}
                    onClick={() => selectStudent(stud, {})}
                    className="p-4 rounded-xl border border-slate-200 text-right hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none flex flex-col justify-between h-24"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{stud.name}</span>
                      <span className="text-xs text-slate-500 block">ولدیت: {stud.fatherName}</span>
                    </div>
                    <div className="flex justify-between items-center w-full mt-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono font-bold">رول نمبر: {stud.rollNo}</span>
                      <span className="text-[10px] text-[#800000] font-sans font-bold">منتخب کریں</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Profile Block */}
          {selectedStudent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 border border-slate-150 p-6 rounded-2xl flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-[#800000] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>طالب علم کی معلومات</span>
                </h3>
                <span className="text-xs bg-slate-200 px-3 py-1 rounded-full font-mono font-bold">
                  رجسٹریشن #: {selectedStudent.regNo || selectedStudent.id}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block font-bold">طالب علم کا نام</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">والد کا نام</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">درجہ / کلاس</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.grade || selectedStudent.class || '----'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold font-mono">رول نمبر</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.rollNo || '----'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">ضلع</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.currentDistrict || selectedStudent.district || '----'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">شناختی کارڈ / سرٹیفکیٹ</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.cnic || '----'}</span>
                </div>
              </div>

              {/* Found examinations */}
              {availableExams.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                    <span>دستیاب سالانہ / ششماہی امتحانی نتائج:</span>
                    <BookOpen className="w-4 h-4 text-[#800000]" />
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {availableExams.map((exam, i) => {
                      const totalBooks = Object.keys(exam.marks || {}).length;
                      const totalMarks = totalBooks * 100;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveReport(exam)}
                          className="w-full bg-white p-4 rounded-xl border border-slate-200 hover:border-[#800000] hover:bg-slate-50 transition-all flex justify-between items-center focus:outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-xs">
                              {exam.quality || 'ممتاز'}
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-slate-700 text-xs block">{exam.examType}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">حاصل کردہ نمبر: {exam.obtained} / {totalMarks} ({exam.percentage}%)</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-white bg-[#800000] px-3 py-1.5 rounded-lg">
                            کشف الدرجات دیکھیں
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
          &copy; 2026 {targetSettings.jamiaName} | Professional ERP Portal
        </div>
      </div>

      {/* Render the Kashf ul Darajat Transcript Card Modal above this */}
      <AnimatePresence>
        {activeReport && (
          <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-2 md:p-6 overflow-y-auto font-urdu">
            
            {/* Control HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center no-print z-[210]">
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <Printer size={16} />
                  <span>تبصرہ کشف الدرجات پرنٹ کریں</span>
                </button>
              </div>
              <button 
                onClick={() => setActiveReport(null)}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors font-bold shadow-lg shadow-red-500/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* A4 sized pristine layout optimized for screen display and immediate physical print */}
            <div className="bg-slate-350 p-2 md:p-8 w-full flex items-center justify-center min-h-screen">
              
              {/* Outer printable card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-black shadow-2xl relative flex flex-col p-8 print:p-6 print:shadow-none"
                style={{ width: '148mm', minHeight: '210mm' }}
              >
                {/* Double Line Border */}
                <div className="absolute inset-3 border-[3px] border-black pointer-events-none z-0"></div>
                <div className="absolute inset-[15px] border border-black pointer-events-none z-0"></div>

                <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between" dir="rtl">
                  
                  {/* Header */}
                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center p-1 bg-white">
                        {targetSettings.monogram ? (
                          <img src={targetSettings.monogram} alt="Logo" className="w-full h-full object-contain grayscale" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="text-[7px] font-bold text-center">مونوگرام</div>
                        )}
                      </div>
                      <div className="flex-1 text-center">
                        <h1 style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu', fontSize: '22px', lineHeight: '1.2' }} className="font-black text-black">
                          {targetSettings.jamiaName}
                        </h1>
                        <div className="text-xs font-bold font-arabic mt-1 border-b-2 border-black inline-block px-4 pb-0.5 uppercase tracking-wide">
                          کشف الدرجات (Result Card)
                        </div>
                      </div>
                      <div className="w-16"></div> {/* Symmetry space */}
                    </div>

                    {/* Student details block */}
                    <div className="flex flex-col gap-1.5 text-[11px] font-bold mb-4 leading-relaxed font-urdu border border-black/10 p-3 rounded-lg bg-slate-50/50">
                      <div className="flex justify-between">
                        <div className="flex gap-2 flex-1">
                          <span className="text-slate-500 shrink-0">نام طالب علم:</span>
                          <span className="flex-1 border-b border-black border-dashed font-normal">{activeReport.studentName}</span>
                        </div>
                        <div className="flex gap-2 w-28 mr-4">
                          <span className="text-slate-500 shrink-0">رول نمبر:</span>
                          <span className="flex-1 border-b border-black border-dashed text-center font-mono font-normal">{activeReport.rollNo}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2 flex-1">
                          <span className="text-slate-500 shrink-0">ولدیت:</span>
                          <span className="flex-1 border-b border-black border-dashed font-normal">{activeReport.fatherName}</span>
                        </div>
                        <div className="flex gap-2 w-28 mr-4">
                          <span className="text-slate-500 shrink-0">رجسٹریشن:</span>
                          <span className="flex-1 border-b border-black border-dashed text-center font-mono font-normal">{activeReport.registrationNo || '----'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2 flex-1">
                          <span className="text-slate-500 shrink-0">درجہ (کلاس):</span>
                          <span className="flex-1 border-b border-black border-dashed font-normal">{activeReport.className}</span>
                        </div>
                        <div className="flex gap-2 w-28 mr-4">
                          <span className="text-slate-500 shrink-0">امتحان:</span>
                          <span className="flex-1 border-b border-black border-dashed font-normal">{activeReport.examType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Marksheet table */}
                    <table className="w-full text-center border-collapse border-2 border-black text-[11px] font-bold font-urdu">
                      <thead>
                        <tr className="bg-black/5 border-b-2 border-black">
                          <th className="border-2 border-black py-1 px-2 text-right">مضمون (Subjects)</th>
                          <th className="border-2 border-black py-1 w-16 text-center">کل نمبر</th>
                          <th className="border-2 border-black py-1 w-20 text-center">حاصل کردہ نمبر</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(activeReport.marks || {}).map((subject) => (
                          <tr key={subject} className="border-b border-black/40">
                            <td className="border border-black py-1 px-2 text-right">{subject}</td>
                            <td className="border border-black py-1 font-mono text-center">100</td>
                            <td className="border border-black py-1 font-mono text-center">{activeReport.marks?.[subject] || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-black/5 border-t-2 border-black">
                          <td className="border border-black py-1.5 px-2 text-right font-black">میزان (Total)</td>
                          <td className="border border-black py-1.5 font-mono font-black text-center">{Object.keys(activeReport.marks || {}).length * 100}</td>
                          <td className="border border-black py-1.5 font-mono font-black text-center text-sm">{activeReport.obtained}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Certify footer */}
                  <div className="mt-6">
                    <div className="flex justify-between items-end text-[11px] font-bold font-urdu">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-2 items-center">
                          <span className="text-slate-500">التقدیر (Grade):</span>
                          <span className="border-b-2 border-black border-double px-4 text-center pb-0.5">{activeReport.quality || 'ممتاز'}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-slate-500">فیصد (Percentage):</span>
                          <span className="border-b-2 border-black border-double px-4 text-center font-mono pb-0.5">{activeReport.percentage}%</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-28 border-b border-black"></div>
                        <span className="pt-1.5 text-[10px]">دستخط ناظم امتحانات</span>
                      </div>
                    </div>

                    <div className="text-center text-[7px] text-slate-400 mt-6 pt-1 border-t border-black/5">
                      یہ کشف الدرجات پبلک رزلٹ پورٹل کے ذریعے تصدیق شدہ ہے۔ دستخط کے بغیر بھی قابلِ قبول ہے۔
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
