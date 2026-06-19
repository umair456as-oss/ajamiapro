import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Landmark, Search, Award, FileText, Printer, X, Download, AlertCircle, BookOpen, CheckCircle, School, HelpCircle, Users } from 'lucide-react';

interface PublicResultPortalProps {
  onClose: () => void;
}

export default function PublicResultPortal({ onClose }: PublicResultPortalProps) {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [madrasas, setMadrasas] = useState<any[]>([]);
  const [selectedMadrassaId, setSelectedMadrassaId] = useState('');
  const [useAllMadrasas, setUseAllMadrasas] = useState(true);
  
  // Custom states matching the screenshot's layout
  const [activeTab, setActiveTab] = useState<'individual' | 'madrassa_maktab' | 'review' | 'madrassa_hifz'>('individual');
  const [gender, setGender] = useState<'بنین' | 'بنات'>('بنین');
  const [examType, setExamType] = useState<'سالانہ' | 'ضمنی'>('سالانہ');
  const [selectedYear, setSelectedYear] = useState('1447 ھ');
  
  // All years hijri & solar
  const years = [
    '1448 ھ',
    '1447 ھ',
    '1446 ھ',
    '1445 ھ',
    '1444 ھ',
    '1443 ھ',
    '1442 ھ',
    '2027 ء',
    '2026 ء',
    '2025 ء',
    '2024 ء',
    '2023 ء',
    '2022 ء'
  ];

  // All degrees from Ula up to Takhassus and Hifz/Tajweed
  const [selectedClass, setSelectedClass] = useState('درجہ عالمیہ سال دوم');
  const classesList = [
    'حفظ القرآن الکریم',
    'تجوید و قرائت',
    'درجہ اولیٰ (Ibteidaya)',
    'درجہ ثانیہ (Sania)',
    'درجہ ثالثہ (Salisa)',
    'درجہ رابعہ (Rabia)',
    'درجہ خامسہ (Khamisa)',
    'درجہ سادسہ (Sadisa)',
    'درجہ سابعہ (Sabia)',
    'درجہ عالمیہ سال اول (Almia Year 1)',
    'درجہ عالمیہ سال دوم (Almia Year 2)',
    'تخصص فی الفقہ (Takhassus)',
    'تخصص فی التفسیر',
    'تخصص فی الحدیث'
  ];

  const [regInput, setRegInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any | null>(null);

  // Madrassa-wide Result Sheet States
  const [madrassaResults, setMadrassaResults] = useState<any[]>([]);
  const [madrassaResultsSearch, setMadrassaResultsSearch] = useState(false);

  // Review Status States
  const [reviewRollNo, setReviewRollNo] = useState('');
  const [reviewResultMsg, setReviewResultMsg] = useState<any | null>(null);

  // Dynamic system settings for the target madrassa
  const [targetSettings, setTargetSettings] = useState<any>({
    jamiaName: 'جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ',
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

    if (!regInput.trim()) {
      setErrorMsg('براہ کرم طالب علم کا رول نمبر یا رجسٹریشن نمبر درج کریں۔');
      return;
    }

    setSearchLoading(true);
    try {
      // Determine search targets (either selected school or all schools in database)
      let targets: string[] = [];
      if (!useAllMadrasas && selectedMadrassaId) {
        targets = [selectedMadrassaId];
      } else if (madrasas.length > 0) {
        targets = madrasas.map(m => m.id);
      } else {
        targets = ['madrassa-default', 'madrassa-demo'];
      }

      const fetchPromises = targets.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, 'madrassas', id));
          return snap.exists() ? { id, ...snap.data() } : null;
        } catch (e) {
          return null;
        }
      });

      const fetchedDocs: any[] = await Promise.all(fetchPromises);
      const tempResults: any[] = [];

      const queryStr = regInput.trim().toLowerCase();
      // Extract numeric year from selecting: '1447 ھ' -> '1447'
      const normalizedYear = selectedYear.replace(/[^\d]/g, '');

      fetchedDocs.forEach((fDoc) => {
        if (!fDoc) return;
        const madrassaData = fDoc.data || {};
        const students = madrassaData.students || [];

        // Filter students using gender, selected class, and identification
        const matches = students.filter((s: any) => {
          const sReg = String(s.regNo || s.id || '').toLowerCase().trim();
          const sRoll = String(s.rollNo || '').toLowerCase().trim();
          const sClass = String(s.grade || s.class || '').toLowerCase().trim();
          const sGender = String(s.gender || '').toLowerCase().trim();

          // 1. Roll / Reg number matches
          const matchesId = sReg.endsWith(queryStr) || sReg === queryStr || sRoll === queryStr;
          if (!matchesId) return false;

          // 2. Class Filter (Direct substring check)
          let matchesClass = true;
          if (activeTab === 'madrassa_hifz') {
            matchesClass = sClass.includes('حفظ');
          } else if (selectedClass) {
            // strip 'درجہ' etc for relaxed check
            const classQuery = selectedClass.replace(/درجہ/g, '').trim().split(' ')[0]; 
            matchesClass = sClass.includes(classQuery) || sClass.includes(selectedClass) || selectedClass.includes(sClass);
          }

          // 3. Gender Filter
          let matchesGender = true;
          if (gender === 'بنین') {
            matchesGender = sGender.includes('مرد') || sGender.includes('بنین') || sGender.includes('boy') || sGender.includes('male') || !sGender;
          } else {
            matchesGender = sGender.includes('عورت') || sGender.includes('بنات') || sGender.includes('girl') || sGender.includes('female');
          }

          return matchesClass && matchesGender;
        });

        matches.forEach((student: any) => {
          tempResults.push({
            student,
            madrassaData,
            madrassaId: fDoc.id,
            madrassaName: fDoc.data?.system_settings?.jamiaName || 'جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ'
          });
        });
      });

      if (tempResults.length === 0) {
        setErrorMsg('آپ کے درج کردہ معیار (سال، جنس، درجہ، اور رول نمبر) کے مطابق کوئی نتیجہ نہیں ملا۔ برائے مہربانی درست معلومات درج کریں۔');
        setSearchLoading(false);
        return;
      }

      setMatchedStudents(tempResults.map(r => r.student));
      
      // If found, select the first match automatically
      const firstMatch = tempResults[0];
      const systemSet = firstMatch.madrassaData.system_settings || {};
      setTargetSettings({
        jamiaName: systemSet.jamiaName || 'جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ',
        monogram: systemSet.monogram || ''
      });

      selectStudent(firstMatch.student, firstMatch.madrassaData);
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMsg('سرو توازن یا نیٹ ورک تعطل کی وجہ سے تلاش مکمل نہیں ہو سکی۔ دوبارہ کوشش کریں۔');
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
        // filter by selected examType and Year if searching
        const matchesExamType = String(exam.examType).trim().includes(examType);
        
        const exists = examResultsList.some(item => 
          String(item.examType).trim() === String(exam.examType).trim() && 
          String(item.className).trim() === String(exam.className).trim()
        );
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
      setInfoMsg('طالب علم کا پروفائل مل گیا ہے، مگر اس منتخب درجہ/کلاس کے امتحانی نتائج ابھی تک آن لائن مطابقت پذیر (Sync) نہیں کیے گئے۔');
    }
  };

  // Perform whole school result page search
  const handleMadrassaWideSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setMadrassaResults([]);
    setMadrassaResultsSearch(true);

    if (!selectedMadrassaId) {
      setErrorMsg('براہ کرم کسی ایک جامعہ/مدرسہ کا انتخاب کریں۔');
      setMadrassaResultsSearch(false);
      return;
    }

    try {
      const docRef = doc(db, 'madrassas', selectedMadrassaId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setErrorMsg('منتخب کردہ ملحقہ مدرسہ کا تعلیمی ریکارڈ ڈیٹا بیس پر آن لائن نہیں ملا۔');
        setMadrassaResultsSearch(false);
        return;
      }

      const madrassaData = docSnap.data()?.data || {};
      const allExams = madrassaData.all_exam_results || [];
      const classQuery = selectedClass.replace(/درجہ/g, '').trim().split(' ')[0];

      // Find all exams matching the requested class/grade
      const matchingExamsList: any[] = [];
      allExams.forEach((exam: any) => {
        const examClass = String(exam.className || '').trim();
        if (examClass.includes(classQuery) || selectedClass.includes(examClass)) {
          const records = exam.records || [];
          records.forEach((rec: any) => {
            matchingExamsList.push({
              ...rec,
              examType: exam.examType,
              className: exam.className,
            });
          });
        }
      });

      if (matchingExamsList.length === 0) {
        // Fallback to searching in individual student exam results
        const students = madrassaData.students || [];
        students.forEach((s: any) => {
          const sClass = String(s.grade || s.class || '').trim();
          if ((sClass.includes(classQuery) || selectedClass.includes(sClass)) && Array.isArray(s.examResults)) {
            s.examResults.forEach((res: any) => {
              matchingExamsList.push({
                rollNo: s.rollNo,
                regNo: s.regNo || s.id,
                name: s.name,
                fatherName: s.fatherName,
                obtained: res.obtained,
                percentage: res.percentage,
                quality: res.quality,
                examType: res.examType,
                className: sClass
              });
            });
          }
        });
      }

      if (matchingExamsList.length === 0) {
        setInfoMsg('منتخب کردہ درجہ اور سال کے لیے فی الحال کوئی باقاعدہ نتیجہ جاری نہیں ہوا۔');
      } else {
        setMadrassaResults(matchingExamsList);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('ڈیٹا لوڈ کرنے میں عارضی ناکامی کا سامنا ہے۔');
    } finally {
      setMadrassaResultsSearch(false);
    }
  };

  // Perform simulated review checking status
  const handleReviewStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setReviewResultMsg(null);

    if (!reviewRollNo.trim()) {
      setErrorMsg('صحیح رول نمبر یا درخواست نمبر درج کریں۔');
      return;
    }

    setSearchLoading(true);
    setTimeout(() => {
      setSearchLoading(false);
      setReviewResultMsg({
        rollNo: reviewRollNo,
        status: 'مکمل (تبدیلی کی گئی ہے)',
        date: '2026-06-18',
        detail: 'آپ کا تصحیح شدہ پرچہ دوبارہ چیک کر لیا گیا ہے۔ کشف الدرجات کو نئی تصحیح کے مطابق تبدیل کر دیا گیا ہے۔ حتمی نتائج نیچے دوبارہ رول نمبر تلاش کر کے چیک کریں۔',
        alertType: 'success'
      });
    }, 1000);
  };

  // Keep selectedTab synchronization clean
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setErrorMsg('');
    setInfoMsg('');
    setMatchedStudents([]);
    setSelectedStudent(null);
    setAvailableExams([]);
    setMadrassaResults([]);
    setReviewResultMsg(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-2 md:p-4 overflow-y-auto no-print">
      <div className="bg-[#f8fafc] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-[#800000] text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl">
              <Award className="w-6 h-6 text-white animate-pulse" />
            </span>
            <div className="text-right">
              <h2 className="text-xl font-bold font-urdu">امتحانی نتیجہ اور کشف الدرجات</h2>
              <p className="text-[10px] text-white/80 font-medium">جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ — تعلیمی تعمیل پورٹل</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors focus:ring-2 focus:ring-white/30"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Outer Navigation Tabs matching Screenshot Style */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 md:p-3 overflow-x-auto select-none" dir="rtl">
          <div className="container flex gap-2 md:gap-3 justify-center min-w-[550px]">
            <button
              onClick={() => handleTabChange('individual')}
              className={`px-4 py-2.5 rounded-xl text-xs font-urdu font-bold border transition-all duration-200 ${
                activeTab === 'individual' 
                ? 'bg-[#800000] text-white border-[#800000] shadow-md' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-350'
              }`}
            >
              انفرادی مکتب نتائج
            </button>
            <button
              onClick={() => handleTabChange('madrassa_maktab')}
              className={`px-4 py-2.5 rounded-xl text-xs font-urdu font-bold border transition-all duration-200 ${
                activeTab === 'madrassa_maktab' 
                ? 'bg-[#800000] text-white border-[#800000] shadow-md' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-350'
              }`}
            >
              مدارس مکتب نتائج
            </button>
            <button
              onClick={() => handleTabChange('review')}
              className={`px-4 py-2.5 rounded-xl text-xs font-urdu font-bold border transition-all duration-200 ${
                activeTab === 'review' 
                ? 'bg-[#800000] text-white border-[#800000] shadow-md' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-350'
              }`}
            >
              نظر ثانی نتائج
            </button>
            <button
              onClick={() => handleTabChange('madrassa_hifz')}
              className={`px-4 py-2.5 rounded-xl text-xs font-urdu font-bold border transition-all duration-200 ${
                activeTab === 'madrassa_hifz' 
                ? 'bg-[#800000] text-white border-[#800000] shadow-md' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-350'
              }`}
            >
              مدارس حفظ نتائج
            </button>
          </div>
        </div>

        {/* Main Interface Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 font-urdu space-y-6" dir="rtl">
          
          {/* Main Form Box Mimicking Screenshot Form */}
          <div className="bg-white rounded-3xl border border-slate-200/85 overflow-hidden shadow-xl max-w-2xl mx-auto">
            
            {/* Soft Blue Header inside Card precisely like Screenshot */}
            <div className="bg-[#DDF3FC] text-[#2c78b4] py-4 px-6 flex items-center justify-center gap-2 border-b border-blue-100/50">
              <Users className="w-5 h-5 text-[#2c78b4]" />
              <h3 className="text-lg md:text-xl font-bold font-urdu tracking-wide">
                {activeTab === 'individual' && 'انفرادی مکتب نتائج'}
                {activeTab === 'madrassa_maktab' && 'مدرسہ نتائج شیٹ سینٹر'}
                {activeTab === 'review' && 'درخواست برائے نظر ثانی پیپرز'}
                {activeTab === 'madrassa_hifz' && 'مدارس حفظ القرآن نتائج'}
              </h3>
            </div>

            {/* Form Body Container */}
            <div className="p-6 md:p-8 space-y-5">
              
              {/* Optional Local/All Madrassa Lookup filter */}
              {(activeTab === 'individual' || activeTab === 'madrassa_hifz') && (
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center border border-slate-100">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-600">
                      <input 
                        type="checkbox" 
                        checked={useAllMadrasas} 
                        onChange={(e) => setUseAllMadrasas(e.target.checked)} 
                        className="rounded border-slate-300 text-[#800000] focus:ring-[#800000]"
                      />
                      <span>تمام ملحقہ مدارس میں تلاش کریں (صوتی تلاش)</span>
                    </label>
                  </div>
                  
                  {!useAllMadrasas && (
                    <select
                      value={selectedMadrassaId}
                      onChange={(e) => setSelectedMadrassaId(e.target.value)}
                      className="flex-1 w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold font-urdu outline-none focus:ring-2 focus:ring-[#800000]/20 text-slate-700"
                    >
                      {madrasas.map((m) => (
                        <option key={m.id} value={m.id}>{m.madrassaName}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* SEARCH FOR INDIVIDUAL STUDENTS OR HIFZ STUDENTS */}
              {(activeTab === 'individual' || activeTab === 'madrassa_hifz') && (
                <form onSubmit={handleSearch} className="space-y-4">
                  
                  {/* Gender and Exam Toggles precisely mimicking the Screenshot */}
                  <div className="flex flex-wrap items-center justify-center gap-8 py-4 border-b border-dashed border-slate-100">
                    
                    {/* Banin/Banat Selection */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setGender('بنات')}
                          className="flex items-center gap-2 font-bold text-slate-700 hover:text-[#2196f3] transition-colors"
                        >
                          <span className="text-sm font-semibold">بنات</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${gender === 'بنات' ? 'border-[#2196f3] bg-[#ddf3fc]' : 'border-slate-300'}`}>
                            {gender === 'بنات' && <div className="w-3 h-3 bg-[#2196f3] rounded-full" />}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setGender('بنین')}
                          className="flex items-center gap-2 font-bold text-slate-700 hover:text-[#2196f3] transition-colors"
                        >
                          <span className="text-sm font-semibold">بنین</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${gender === 'بنین' ? 'border-[#2196f3] bg-[#ddf3fc]' : 'border-slate-300'}`}>
                            {gender === 'بنین' && <div className="w-3 h-3 bg-[#2196f3] rounded-full" />}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Annual / Supplementary Selection */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setExamType('ضمنی')}
                          className="flex items-center gap-2 font-bold text-slate-700 hover:text-[#2196f3] transition-colors"
                        >
                          <span className="text-sm font-semibold">ضمنی</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${examType === 'ضمنی' ? 'border-[#2196f3] bg-[#ddf3fc]' : 'border-slate-300'}`}>
                            {examType === 'ضمنی' && <div className="w-3 h-3 bg-[#2196f3] rounded-full" />}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExamType('سالانہ')}
                          className="flex items-center gap-2 font-bold text-slate-700 hover:text-[#2196f3] transition-colors"
                        >
                          <span className="text-sm font-semibold">سالانہ</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${examType === 'سالانہ' ? 'border-[#2196f3] bg-[#ddf3fc]' : 'border-slate-300'}`}>
                            {examType === 'سالانہ' && <div className="w-3 h-3 bg-[#2196f3] rounded-full" />}
                          </div>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Form fields in clean grid column with labels on the right, input on the left */}
                  <div className="grid grid-cols-1 gap-5 text-right pt-2">
                    
                    {/* Years Choice */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">سال کا انتخاب</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#2196f3] focus:bg-white transition-all text-right font-sans"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* Class Selection (Only on standard individual results tab) */}
                    {activeTab === 'individual' && (
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">متعلقہ درجہ کا انتخاب</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#2196f3] focus:bg-white transition-all text-right font-urdu"
                        >
                          {classesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Student identifier input */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">طالب علم کا رول نمبر</label>
                      <input
                        type="text"
                        required
                        value={regInput}
                        onChange={(e) => setRegInput(e.target.value)}
                        placeholder="رول نمبر یا رجسٹریشن نمبر کے آخری 6 ہندسے درج کریں..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-[#2196f3] focus:bg-white transition-all text-right"
                      />
                    </div>

                  </div>

                  {/* Submission search button centered */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="w-full py-3.5 bg-[#4fc3f7] hover:bg-[#29b6f6] text-slate-900 font-bold font-urdu rounded-2xl transition-all shadow-md shadow-blue-105 hover:shadow-lg flex items-center justify-center gap-2 font-black text-base"
                    >
                      {searchLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          <span>تلاش جاری ہے ...</span>
                        </>
                      ) : (
                        <span>تلاش کریں۔</span>
                      )}
                    </button>
                  </div>

                </form>
              )}

              {/* TABS 2: MADRASSA DEPARTMENTS / WHOLE SCHOOL REPORT CARD */}
              {activeTab === 'madrassa_maktab' && (
                <form onSubmit={handleMadrassaWideSearch} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 text-right pt-2">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">مدرسہ منتخب کریں</label>
                      <select
                        value={selectedMadrassaId}
                        onChange={(e) => setSelectedMadrassaId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#2196f3] focus:bg-white transition-all text-right font-urdu"
                      >
                        {madrasas.map((m) => (
                          <option key={m.id} value={m.id}>{m.madrassaName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">سال منتخب کریں</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white transition-all text-right font-sans"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">کلاس / درجہ</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white transition-all text-right font-urdu"
                      >
                        {classesList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={madrassaResultsSearch}
                      className="w-full py-3.5 bg-[#4fc3f7] hover:bg-[#29b6f6] text-slate-900 font-bold font-urdu rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 font-black text-base"
                    >
                      {madrassaResultsSearch ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>رزلٹ شیٹ تلاش ہو رہی ہے...</span>
                        </>
                      ) : (
                        <span>سرکاری رزلٹ شیٹ تلاش کریں۔</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TABS 3: PAPER REVIEW APPLICATION STATUS */}
              {activeTab === 'review' && (
                <form onSubmit={handleReviewStatusCheck} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm">ری چیکنگ / نظر ثانی اپیل ہود:</span>
                      <p className="mt-1 leading-relaxed">اگر آپ نے سالانہ امتحانات کے کشف الدرجات میں مارکس پر اب اعتراض جمع کروایا تھا تو اپنا رول نمبر درج کر کے ری چیکنگ پیشرفت کا حتمی درجہ معلوم کریں</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 text-right">
                    <label className="text-md font-bold text-slate-700 block md:w-36 shrink-0">رول نمبر درج کریں</label>
                    <input
                      type="text"
                      required
                      value={reviewRollNo}
                      onChange={(e) => setReviewRollNo(e.target.value)}
                      placeholder="اپنا رول نمبر یا ٹرانسکریپٹ کوڈ درج کریں..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-350 rounded-xl text-sm font-bold text-right outline-none focus:border-[#2196f3]"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="w-full py-3.5 bg-[#4fc3f7] hover:bg-[#29b6f6] text-slate-900 font-bold font-urdu rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-base font-black"
                    >
                      <span>درخواست کی صورتحال معلوم کریں۔</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* Dynamic search results or details printed below */}
          <AnimatePresence mode="wait">
            
            {/* Feedback Error / Info Messages */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-200 text-xs font-bold leading-relaxed max-w-2xl mx-auto"
              >
                {errorMsg}
              </motion.div>
            )}

            {infoMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 text-blue-800 p-5 rounded-2xl border border-blue-200 text-xs font-bold leading-relaxed max-w-2xl mx-auto"
              >
                {infoMsg}
              </motion.div>
            )}

            {/* Simulated Rechecking view */}
            {reviewResultMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-right max-w-2xl mx-auto space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-800 border-b border-emerald-150 pb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-md">درخواستِ نظر ثانی کا تصدیق نامہ!</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                  <div>
                    <span className="text-slate-400 block pb-1">اپیل اسٹیٹس:</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg inline-block">{reviewResultMsg.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block pb-1">آخری تبدیل شدہ تاریخ:</span>
                    <span className="font-sans text-slate-800 block">{reviewResultMsg.date}</span>
                  </div>
                </div>
                <div className="text-slate-700 text-xs font-medium leading-relaxed bg-white/60 p-4 rounded-xl border border-emerald-100">
                  {reviewResultMsg.detail}
                </div>
              </motion.div>
            )}

            {/* Complete list of results on Tab 2 Madrassa Wide Report */}
            {madrassaResults.length > 0 && activeTab === 'madrassa_maktab' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg max-w-4xl mx-auto space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#800000]" />
                    <span>مجموعی رزلٹ شیٹ اور کارکردگی کیپشن:</span>
                  </h4>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-4 py-2 rounded-xl transition-all border font-bold"
                  >
                    <Printer className="w-4 h-4" />
                    <span>رزلٹ شیٹ پرنٹ کریں</span>
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse border border-slate-250 text-right">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-300">
                        <th className="p-3 border-r border-slate-200">رول نمبر</th>
                        <th className="p-3 border-r border-slate-200">نام طالب علم</th>
                        <th className="p-3 border-r border-slate-200">ولدیت</th>
                        <th className="p-3 border-r border-slate-200 text-center">حاصل کردہ نمبر</th>
                        <th className="p-3 border-r border-slate-200 text-center">تقدیر (گریڈ)</th>
                        <th className="p-3 text-center">امتحان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {madrassaResults.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 font-medium">
                          <td className="p-3 border-r border-slate-100 font-mono font-bold text-[#800000]">{rec.rollNo}</td>
                          <td className="p-3 border-r border-slate-100 font-bold">{rec.name || rec.studentName}</td>
                          <td className="p-3 border-r border-slate-100 text-slate-600">{rec.fatherName}</td>
                          <td className="p-3 border-r border-slate-100 text-center font-mono font-bold text-emerald-700">{rec.obtained}</td>
                          <td className="p-3 border-r border-slate-100 text-center font-bold">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px]">{rec.quality || 'ممتاز'}</span>
                          </td>
                          <td className="p-3 text-center text-slate-500 font-semibold">{rec.examType || 'سالانہ'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Individual Student Profile UI details displayed below */}
            {selectedStudent && (activeTab === 'individual' || activeTab === 'madrassa_hifz') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-150 p-6 rounded-3xl flex flex-col gap-5 max-w-2xl mx-auto shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-[#800000] flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>طالب علم کا کارڈ پرنٹ کریں</span>
                  </h3>
                  <span className="text-xs bg-slate-200 px-3 py-1 rounded-full font-mono font-bold text-slate-700">
                    رجسٹریشن نمبر: {selectedStudent.regNo || selectedStudent.id}
                  </span>
                </div>

                {/* Profile Grid */}
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
                    <span className="text-slate-400 block font-bold">ضلع / لوکالٹی</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedStudent.currentDistrict || selectedStudent.district || '----'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">شناختی نمبر / فارم بی</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block font-mono">{selectedStudent.cnic || '----'}</span>
                  </div>
                </div>

                {/* Found examinations */}
                {availableExams.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                      <span>دستیاب باقاعدہ تفصیلی امتحانی رزلٹس:</span>
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
                            className="w-full bg-white p-4 rounded-xl border border-slate-200 hover:border-[#2196f3] hover:bg-sky-50/20 transition-all flex justify-between items-center focus:outline-none"
                          >
                            <div className="flex items-center gap-3">
                              <span className="p-2 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-xs select-none">
                                {exam.quality || 'ممتاز'}
                              </span>
                              <div className="text-right">
                                <span className="font-bold text-slate-700 text-xs block">{exam.examType}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">حاصل کردہ نمبر: {exam.obtained} / {totalMarks} ({exam.percentage}%)</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-white bg-[#800000] px-4 py-2 rounded-xl hover:bg-red-800 transition-colors">
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

          </AnimatePresence>

        </div>

        {/* Outer footer block */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold tracking-wide">
          &copy; 1447 ھ / 2026ء - {targetSettings.jamiaName} | مرکزی نیٹ ورک امتحانات
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
                      <div className="flex-1 text-center font-urdu">
                        <h1 style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu', fontSize: '20px', lineHeight: '1.2' }} className="font-black text-black">
                          {targetSettings.jamiaName}
                        </h1>
                        <div className="text-xs font-bold font-sans mt-1 border-b-2 border-black inline-block px-4 pb-0.5 uppercase tracking-wide">
                          کشف الدرجات (Result Card)
                        </div>
                      </div>
                      <div className="w-16"></div> {/* Symmetry space */}
                    </div>

                    {/* Student details block */}
                    <div className="flex flex-col gap-1.5 text-[11px] font-bold mb-4 leading-relaxed font-urdu border border-black/15 p-3 rounded-lg bg-slate-50/50">
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
                          <th className="border-2 border-black py- w-16 text-center">کل نمبر</th>
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
                        <tr className="bg-black/5 border-t-2 border-black text-black">
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

                    <div className="text-center text-[7.5px] text-slate-400 mt-6 pt-1 border-t border-black/5">
                      یہ کشف الدرجات تصدیق شدہ پبلک ای۔پورٹل کے ذریعے آٹو۔جنریٹ ہے، دستخط کے بغیر بھی تمام تعلیمی اغراض کے لیے قطعی طور پر معتبر ہے۔
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
