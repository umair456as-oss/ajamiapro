import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Printer, FileText, BookOpen, Award, 
  PenTool, HelpCircle, CheckCircle2, Settings, Plus, 
  Trash, Eye, RefreshCw, Layers 
} from 'lucide-react';

interface DarulIftaProps {
  onBack: () => void;
}

export default function DarulIfta({ onBack }: DarulIftaProps) {
  const [activeMode, setActiveMode] = useState<'fatwa' | 'exam'>('fatwa');
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // 1. Fatwa Mode States
  const [fatwaData, setFatwaData] = useState({
    institutionName: 'دارالافتاء: جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ',
    fatwaNumber: 'فتویٰ نمبر: ۱۴۴۷/۲۸-الف',
    topic: 'عنوان: انٹرنیٹ پر ڈیجیٹل کرنسی کی خرید و فروخت کا شرعی حکم',
    category: 'معاملات / بیوع / مالی معاملات',
    istifta: `السلام علیکم\n\nکیا فرماتے ہیں علمائے دین و مفتیانِ شرعِ متین اس مسئلے کے بارے میں کہ ڈیجیٹل کرنسی (بٹ کوائن وغیرہ) کی تجارت اور اس کے ذریعے اشیاء کی خرید و فروخت کرنا شرعاً کیسا ہے؟ اور کیا یہ مالِ متقوم کے زمرے میں آتا ہے؟ تفصیلی جواب عنایت فرما کر عند اللہ ماجور ہوں۔\n\nالسائل: محمد اسامہ منیر، سکنہ مانسہرہ`,
    jawab: `الجواب حامداً ومصلياً:\n\nوعلیکم السلام ورحمۃ اللہ وبرکاتہ۔\n\nواضح رہے کہ شریعتِ مطہرہ میں کسی بھی چیز کو ثمن (کرنسی) تسلیم کرنے کے لیے اس کا مادی وجود (Physical Existence) ہونا، یا حکومتِ وقت کی طرف سے اسے قانونی حیثیت حاصل ہونا ضروری ہے، تاکہ وہ 'مالِ متقوم' بن سکے۔\n\nڈیجیٹل کرنسی (Cryptocurrency) کا کوئی مادی وجود نہیں ہے اور نہ ہی پاکستان میں اسے قانونی حیثیت حاصل ہے۔ اس کے علاوہ اس میں شدید قسم کا 'غرر' (جہالت اور غیر یقینی صورتحال) اور 'قمار' (جوا) کے عناصر پائے جاتے ہیں، اور اس کی قیمتوں میں غیر معمولی اتار چڑھاؤ سٹہ بازی کی راہ ہموار کرتا ہے۔\n\nلہذا شرعی اصولوں کی روشنی میں بٹ کوائن یا کسی بھی دوسری ڈیجیٹل کرنسی کی خرید و فروخت اور اس کی تجارت احترازاً ناجائز اور ممنوع ہے۔ مسلمانوں کو اس قسم کے مبہم اور غیر یقینی معاملات سے دور رہنا چاہیے۔\n\nواللہ سبحانہ و تعالی اعلم بالصواب`,
    muftiName: 'مفتی سراج الدین غفر لہ / مفتیِ اعظم دارالافتاء',
    sealPhrase: 'واللہ اعلم بالصواب / ماخذ الفتویٰ'
  });

  // 2. Exam Mode States
  const [examData, setExamData] = useState({
    institutionName: 'جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ',
    examTitle: 'الاختبار السنوي للشھادۃ الثانویۃ الخاصۃ (سالانہ امتحان)',
    subject: 'الفقه الاسلامي و أصوله (القدوري)',
    totalMarks: '۱۰۰',
    timeAllowed: '۳ گھنٹے',
    dateHijri: 'شوال المکرم ۱۴۴۷ھ',
    instructions: 'ملحوظہ: تمام سوالات حل کرنا لازمی ہیں۔ پہلے حصے سے تین اور دوسرے حصے سے دو سوالات کے جواب دیں۔ خوش خطی پر خصوصی توجہ دیں۔',
    questions: [
      {
        id: 1,
        title: 'السؤال الأول: الفقه في اللغة الفهم، وفي الاصطلاح معرفة النفس ما لها وما عليها۔ کتاب الطہارۃ سے وضو کے فرائض تفصیل سے تحریر کریں۔',
        marks: '۲۰',
        orOption: 'وضو کی سنتیں اور مستحبات کو احادیث کی روشنی میں مع عربی عبارت تحریر کیجیے۔',
        subQuestions: [
          '(۱) غسل کے فرائض مع دلائل تحریر کریں۔',
          '(۲) پانی کی اقسام اور ان سے پاکی حاصل کرنے کا شرعی حکم لکھیں۔'
        ]
      },
      {
        id: 2,
        title: 'السؤال الثاني: کتاب البیوع سے بیعِ فاسد اور بیعِ باطل کی تعریف کریں اور ان کا بنیادی فرق واضح کریں۔',
        marks: '۲۰',
        orOption: '',
        subQuestions: [
          '(۱) سود (ربا) کی شرعی تعریف اور اس کی حرمت پر قرآنی دلائل پیش کریں۔',
          '(۲) بیعِ سلم کی تعریف اور شرائط لکھیے۔'
        ]
      },
      {
        id: 3,
        title: 'السؤال الثالث: کتاب النکاح سے مہرِ مثل اور مہرِ مسمیٰ کی لغوی و اصطلاحی وضاحت کریں اور مہر کی کم سے کم مقدار بتائیں۔',
        marks: '۲۰',
        orOption: 'نکاح کے ارکان اور گواہوں کی شرائط فقہ حنفی کی روشنی میں تفصیل سے لکھیں۔',
        subQuestions: []
      }
    ]
  });

  useEffect(() => {
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);
    if (savedSystem.jamiaName) {
      setFatwaData(prev => ({ ...prev, institutionName: `دارالافتاء: ${savedSystem.jamiaName}` }));
      setExamData(prev => ({ ...prev, institutionName: savedSystem.jamiaName }));
    }
  }, []);

  const handleAddQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: Date.now(),
          title: `السؤال ${prev.questions.length + 1}: یہاں اپنا نیا سوال درج کریں...`,
          marks: '۲۰',
          orOption: '',
          subQuestions: []
        }
      ]
    }));
  };

  const handleRemoveQuestion = (id: number) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const handleUpdateQuestion = (id: number, key: string, value: any) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [key]: value } : q)
    }));
  };

  const handleAddSubQuestion = (qId: number) => {
    const targetQ = examData.questions.find(q => q.id === qId);
    if (!targetQ) return;
    const currentSub = targetQ.subQuestions || [];
    const num = currentSub.length + 1;
    const newSub = [...currentSub, `(${num}) ذیلی سوال درج کریں...`];
    handleUpdateQuestion(qId, 'subQuestions', newSub);
  };

  const handleRemoveSubQuestion = (qId: number, index: number) => {
    const targetQ = examData.questions.find(q => q.id === qId);
    if (!targetQ) return;
    const newSub = (targetQ.subQuestions || []).filter((_, idx) => idx !== index);
    handleUpdateQuestion(qId, 'subQuestions', newSub);
  };

  const handleUpdateSubQuestion = (qId: number, index: number, value: string) => {
    const targetQ = examData.questions.find(q => q.id === qId);
    if (!targetQ) return;
    const newSub = [...(targetQ.subQuestions || [])];
    newSub[index] = value;
    handleUpdateQuestion(qId, 'subQuestions', newSub);
  };

  return (
    <div className={`min-h-screen font-urdu flex flex-col h-full overflow-hidden transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`} dir="rtl">
      {/* Top Header */}
      <header className={`h-20 border-b flex items-center justify-between px-8 shrink-0 relative z-20 no-print transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-urdu flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              مدرسہ پبلیکیشنز اینڈ دارالافتاء سسٹم
            </h1>
            <p className={`text-[10px] font-bold font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>ELITE ISLAMIC PUBLISHING PLATFORM</p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className={`p-1 rounded-2xl border flex gap-2 transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-850 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <button 
            onClick={() => setActiveMode('fatwa')}
            className={`px-6 py-2 rounded-xl text-xs font-bold font-urdu transition-all flex items-center gap-2 ${
              activeMode === 'fatwa' 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            دارالافتاء (مفت شرعی فتویٰ)
          </button>
          <button 
            onClick={() => setActiveMode('exam')}
            className={`px-6 py-2 rounded-xl text-xs font-bold font-urdu transition-all flex items-center gap-2 ${
              activeMode === 'exam' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            امتحانی پرچہ جات (کشف الاسئلہ)
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-xl transition-all active:scale-95 border ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-750' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={theme === 'dark' ? "لائٹ موڈ آن کریں" : "ڈارک موڈ آن کریں"}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9.75-9h-2.25m-13.5 0H3m16.5-6.75l-1.58 1.58m-11.62 0l-1.58-1.58m15.3 11.62l-1.58-1.58m-11.62 0l-1.58 1.58M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <button 
            onClick={() => window.print()}
            className={`px-6 py-3 rounded-xl text-xs font-bold font-urdu transition-all flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 text-white ${
              activeMode === 'fatwa' ? 'bg-orange-600 shadow-orange-600/10' : 'bg-blue-600 shadow-blue-600/10'
            }`}
          >
            <Printer className="w-4 h-4" />
            پرنٹ نکالیں (A4 Portrait)
          </button>
        </div>
      </header>

      {/* Main Workspace Layout split in 2 columns */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Controls Panel (Urdu & English) */}
        <section className={`w-[450px] border-l flex flex-col overflow-y-auto p-6 custom-scrollbar select-none no-print transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800 theme-light'
        }`}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
            <Settings className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-200">تبدیلی اور کنٹرولر پینل</h3>
          </div>

          {/* DYNAMIC MODE CONTROLS */}
          {activeMode === 'fatwa' ? (
            <div className="space-y-6">
              {/* FATWA MODE INPUTS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">ادارے کا نام (Header Institution Name)</label>
                <input 
                  type="text" 
                  value={fatwaData.institutionName} 
                  onChange={(e) => setFatwaData(prev => ({ ...prev, institutionName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">فتویٰ نمبر (Fatwa Number)</label>
                  <input 
                    type="text" 
                    value={fatwaData.fatwaNumber} 
                    onChange={(e) => setFatwaData(prev => ({ ...prev, fatwaNumber: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">شرعی کیٹیگری (Islamic Category)</label>
                  <input 
                    type="text" 
                    value={fatwaData.category} 
                    onChange={(e) => setFatwaData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">فتویٰ کا موضوع / عنوان (Core Topic)</label>
                <input 
                  type="text" 
                  value={fatwaData.topic} 
                  onChange={(e) => setFatwaData(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">استفتاء - سائل کا سوال (Seeker Question)</label>
                <textarea 
                  rows={6}
                  value={fatwaData.istifta} 
                  onChange={(e) => setFatwaData(prev => ({ ...prev, istifta: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs leading-relaxed outline-none focus:border-orange-500 custom-scrollbar"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">الجواب - تفصیلی شرعی حکم (Fatwa Answer)</label>
                <textarea 
                  rows={8}
                  value={fatwaData.jawab} 
                  onChange={(e) => setFatwaData(prev => ({ ...prev, jawab: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs leading-relaxed outline-none focus:border-orange-500 custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">دستخط مفتی اعظم (Mufti Grand Signature)</label>
                  <input 
                    type="text" 
                    value={fatwaData.muftiName} 
                    onChange={(e) => setFatwaData(prev => ({ ...prev, muftiName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">حتمی تصدیقی مہر (Seal Phrase)</label>
                  <input 
                    type="text" 
                    value={fatwaData.sealPhrase} 
                    onChange={(e) => setFatwaData(prev => ({ ...prev, sealPhrase: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* EXAM PAPER CONTROLS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">جامعہ کا نام (Institution Name)</label>
                <input 
                  type="text" 
                  value={examData.institutionName} 
                  onChange={(e) => setExamData(prev => ({ ...prev, institutionName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">امتحان کا عنوان (Exam Title)</label>
                <input 
                  type="text" 
                  value={examData.examTitle} 
                  onChange={(e) => setExamData(prev => ({ ...prev, examTitle: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">الورقة / المادة - مضمون (Subject)</label>
                  <input 
                    type="text" 
                    value={examData.subject} 
                    onChange={(e) => setExamData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">مجموع الدرجات - کل نمبر (Total)</label>
                  <input 
                    type="text" 
                    value={examData.totalMarks} 
                    onChange={(e) => setExamData(prev => ({ ...prev, totalMarks: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">الوقت - وقت کی حد (Time Allowed)</label>
                  <input 
                    type="text" 
                    value={examData.timeAllowed} 
                    onChange={(e) => setExamData(prev => ({ ...prev, timeAllowed: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">التاریخ - ہجری سال (Hijri Date)</label>
                  <input 
                    type="text" 
                    value={examData.dateHijri} 
                    onChange={(e) => setExamData(prev => ({ ...prev, dateHijri: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">خصوصی ہدایات / ملحوظہ (Instructions)</label>
                <textarea 
                  rows={3}
                  value={examData.instructions} 
                  onChange={(e) => setExamData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 custom-scrollbar"
                />
              </div>

              {/* DYNAMIC QUESTIONS LIST EDITOR */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-300">سوالات کا انتظام (Question Setup)</h4>
                  <button 
                    onClick={handleAddQuestion}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    نیا سوال شامل کریں
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {examData.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">السؤال رقم {idx + 1}</span>
                        <button 
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-400 mr-1">بنیادی سوال کا متن (Question Text)</label>
                        <input 
                          type="text" 
                          value={q.title}
                          onChange={(e) => handleUpdateQuestion(q.id, 'title', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 font-urdu"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 mr-1">نمبرات (Marks)</label>
                          <input 
                            type="text" 
                            value={q.marks}
                            onChange={(e) => handleUpdateQuestion(q.id, 'marks', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none text-center focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 mr-1">یا (یا متبادل متبادل سوال)</label>
                          <input 
                            type="text" 
                            value={q.orOption}
                            placeholder="یا... (چھوڑ دیں اگر متبادل نہیں ہے)"
                            onChange={(e) => handleUpdateQuestion(q.id, 'orOption', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 font-urdu"
                          />
                        </div>
                      </div>

                      {/* SUB QUESTIONS SYSTEM */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400">ذیلی سوالات (Sub Tasks)</span>
                          <button 
                            onClick={() => handleAddSubQuestion(q.id)}
                            className="text-[8px] bg-slate-800 hover:bg-slate-750 text-blue-400 px-2 py-1 rounded border border-slate-700"
                          >
                            + ذیلی سوال
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(q.subQuestions || []).map((sub, sIdx) => (
                            <div key={sIdx} className="flex gap-2 items-center">
                              <input 
                                type="text"
                                value={sub}
                                onChange={(e) => handleUpdateSubQuestion(q.id, sIdx, e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 font-urdu"
                              />
                              <button 
                                onClick={() => handleRemoveSubQuestion(q.id, sIdx)}
                                className="text-slate-600 hover:text-red-400 shrink-0"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Highly Precise A4 Print Layout Sheet (Simulated Screen View) */}
        <section className={`flex-1 p-8 overflow-y-auto flex justify-center custom-scrollbar transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'
        }`}>
          <div className="min-w-[800px] w-[800px] bg-white text-black p-12 shadow-2xl relative border border-slate-200 min-h-[1130px] flex flex-col justify-between font-urdu print-document-sheet">
            
            {/* Screen Preview Ribbon Warning */}
            <div className="text-center mb-6 no-print border-b border-dashed border-slate-200 pb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">A4 PORTRAIT LITHOGRAPHIC PRINT PREVIEW</span>
            </div>

            {/* CORE LITHOGRAPHIC DOCUMENT CANVAS */}
            <div className="flex-1 flex flex-col relative" dir="rtl">
              
              {/* TOP HEADER BLOCK WITH INSTITUTION & MONOCHROME SEAL */}
              <div className="flex justify-between items-start mb-6">
                
                {/* Monochrome Circular Islamic Seal SVG */}
                <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center p-1 bg-white relative shrink-0">
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

                {/* Authoritative Nasta'liq Calligraphy Title */}
                <div className="flex-1 text-center px-4">
                  <h1 style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu', fontSize: '32px', lineHeight: '1.2' }} className="font-bold text-black">
                    {activeMode === 'fatwa' ? fatwaData.institutionName : examData.institutionName}
                  </h1>
                  
                  {activeMode === 'fatwa' ? (
                    <h2 className="text-base font-bold font-urdu mt-1 border-b border-black pb-1 inline-block px-6">
                      دارُالافتاء و القضاء (شعبہ فقہ و فتاویٰ شرعیہ)
                    </h2>
                  ) : (
                    <h2 className="text-base font-bold font-urdu mt-1 border-b border-black pb-1 inline-block px-6">
                      {examData.examTitle}
                    </h2>
                  )}
                </div>

                <div className="w-20 shrink-0"></div> {/* Spacing balance */}
              </div>

              {/* FATWA MODE VISUAL CANVAS */}
              {activeMode === 'fatwa' && (
                <div className="flex-1 flex flex-col">
                  {/* Centralized Metadata Tracking Box */}
                  <div className="border border-black p-3 mb-6 grid grid-cols-3 text-center text-xs font-bold font-urdu">
                    <div className="border-l border-black last:border-0">{fatwaData.fatwaNumber}</div>
                    <div className="border-l border-black last:border-0">{fatwaData.topic}</div>
                    <div>دستے: {fatwaData.category}</div>
                  </div>

                  {/* Bismillah Banner */}
                  <div className="text-center text-xl font-bold font-arabic mb-4 py-2 border-b border-dashed border-slate-350">
                    بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </div>

                  {/* ISTIFTA SECTION (Seeker Question) */}
                  <div className="mb-6 space-y-2">
                    <div className="inline-block bg-black text-white px-4 py-1.5 text-xs font-bold font-urdu">
                      الاستفتاء (سوال)
                    </div>
                    <div className="border border-black p-5 text-sm font-bold text-slate-800 leading-[2.1] text-justify whitespace-pre-wrap font-urdu">
                      {fatwaData.istifta}
                    </div>
                  </div>

                  {/* Transition line: الجواب حامداً ومصلياً */}
                  <div className="text-center my-6 relative flex justify-center items-center">
                    <div className="absolute left-0 right-0 border-t-2 border-double border-black"></div>
                    <span className="relative z-10 bg-white px-8 text-sm font-bold font-urdu text-black">
                      الجواب حامداً ومصلياً
                    </span>
                  </div>

                  {/* JAWAB SECTION (Answer Ruling) */}
                  <div className="flex-1 space-y-2">
                    <div className="inline-block bg-black text-white px-4 py-1.5 text-xs font-bold font-urdu">
                      الجواب الشرعي (حکمِ مفتی)
                    </div>
                    <div className="border border-black p-6 text-sm font-bold leading-[2.1] text-justify whitespace-pre-wrap font-urdu">
                      {fatwaData.jawab}
                    </div>
                  </div>

                  {/* Footer Seal Phrase & Signatures */}
                  <div className="flex justify-between items-end mt-12 px-4 text-xs font-bold font-urdu text-black">
                    <div className="flex flex-col items-center">
                      <div className="w-40 border-b border-black"></div>
                      <span className="pt-2">{fatwaData.muftiName}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-36 h-20 border border-slate-300 rounded-full flex items-center justify-center border-dashed text-[10px] text-slate-400">
                        مہرِ دارالافتاء
                      </div>
                      <span className="pt-2">{fatwaData.sealPhrase}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* EXAM PAPER MODE VISUAL CANVAS */}
              {activeMode === 'exam' && (
                <div className="flex-1 flex flex-col">
                  {/* Traditional Info Bar (Two parallel thin black lines) */}
                  <div className="border-t-2 border-b-2 border-black py-2.5 my-3 grid grid-cols-4 text-center text-xs font-bold font-urdu leading-none">
                    <div>الورقة / المادة: <span className="underline">{examData.subject}</span></div>
                    <div>مجموع الدرجات: <span className="underline">{examData.totalMarks}</span></div>
                    <div>الوقت المسموح: <span className="underline">{examData.timeAllowed}</span></div>
                    <div>التاريخ / ہجری سال: <span className="underline">{examData.dateHijri}</span></div>
                  </div>

                  {/* Instructions/Note */}
                  <p className="text-xs font-bold text-right leading-relaxed mb-6 font-urdu border border-black p-3 bg-slate-50">
                    <strong>ملحوظہ: </strong> {examData.instructions}
                  </p>

                  {/* Main Questions Grid */}
                  <div className="space-y-6 flex-1 text-sm font-bold font-urdu">
                    {examData.questions.map((q, idx) => (
                      <div key={q.id} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 relative">
                        {/* Question title and marks aligned to left */}
                        <div className="flex justify-between items-start leading-[1.8] text-right font-bold text-[13px]">
                          <span className="flex-1 pl-6">
                            السؤال {['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'][idx] || `${idx + 1}`}: {q.title}
                          </span>
                          <span className="font-mono text-xs shrink-0 font-normal">[{q.marks}]</span>
                        </div>

                        {/* Alternative option if present */}
                        {q.orOption && (
                          <div className="space-y-2">
                            <div className="text-center relative flex justify-center items-center py-1">
                              <div className="absolute left-1/4 right-1/4 border-t border-dashed border-black"></div>
                              <span className="relative z-10 bg-white px-4 text-xs font-urdu font-black text-slate-700">... یا ...</span>
                            </div>
                            <p className="text-[13px] pr-6 text-slate-800 leading-[1.8]">{q.orOption}</p>
                          </div>
                        )}

                        {/* Sub questions listing with marks float aligned to left */}
                        {q.subQuestions && q.subQuestions.length > 0 && (
                          <div className="pr-6 space-y-1.5 mt-2">
                            {q.subQuestions.map((sub, sIdx) => (
                              <div key={sIdx} className="flex justify-between text-xs font-bold leading-relaxed">
                                <span>{sub}</span>
                                <span className="font-mono font-normal">[{Math.round(parseInt(q.marks) / q.subQuestions.length)}]</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bottom Signatures for Center Director & Nazim */}
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
              )}

            </div>
          </div>
        </section>

      </main>

      {/* PRINT-ONLY CLASSIC STYLES AND LAYOUT OVERRIDES AND SCREEN THEME OVERRIDES */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* SCREEN VIEW LIGHT THEME OVERRIDES */
        .theme-light {
          background-color: #FFFFFF !important;
          color: #1E293B !important;
          border-color: #E2E8F0 !important;
        }
        .theme-light div {
          border-color: #E2E8F0 !important;
        }
        .theme-light input, 
        .theme-light textarea {
          background-color: #F8FAFC !important;
          border-color: #CBD5E1 !important;
          color: #1E293B !important;
        }
        .theme-light input:focus, 
        .theme-light textarea:focus {
          border-color: #3B82F6 !important;
        }
        .theme-light label {
          color: #64748B !important;
        }
        .theme-light h3 {
          color: #334155 !important;
        }
        .theme-light button {
          border-color: #E2E8F0 !important;
        }

        @media print {
          /* Enforce pure vertical portrait rendering */
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          
          /* Set root styles and hide other DOM nodes */
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          
          /* Hide all other DOM nodes by default, without using !important so printable override works */
          body * {
            visibility: hidden;
          }
          
          /* Only make the print document sheet and its nested elements visible */
          .print-document-sheet, .print-document-sheet * {
            visibility: visible !important;
          }
          
          /* Position the print sheet perfectly at the very top left of the A4 paper */
          .print-document-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Traditional Borders & Ink Style */
          .border-t-2 { border-top-width: 2px !important; border-top-color: black !important; }
          .border-b-2 { border-bottom-width: 2px !important; border-bottom-color: black !important; }
          .border-black { border-color: black !important; }
          .border-dashed { border-style: dashed !important; border-color: black !important; }
          .border-double { border-style: double !important; border-color: black !important; }
          
          /* Alignment corrections */
          .text-justify { text-align: justify !important; }
        }
      `}} />
    </div>
  );
}
