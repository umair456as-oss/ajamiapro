import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, ChevronLeft, Camera, Upload, User, 
  ShieldCheck, Search, Users, MapPin, Phone, 
  Droplets, Calendar, Star, QrCode
} from 'lucide-react';

interface IDCardMakerProps {
  onBack: () => void;
}

export default function IDCardMaker({ onBack }: IDCardMakerProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [cardData, setCardData] = useState({
    name: 'عبدالرحمن',
    fatherName: 'محمد حبیب',
    cnic: '12345-6789012-3',
    studentId: 'JASM-2024-001',
    department: 'درجہ اولیٰ',
    dob: '2005-01-01',
    validUntil: '2025-06-30',
    bloodGroup: 'A+',
    photo: '',
    signature: '',
    phone: '0300-1234567',
    address: 'مانسہرہ، خیبر پختونخوا'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Load students from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('students') || localStorage.getItem('students_list');
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setCardData(prev => ({
      ...prev,
      name: student.name || '',
      fatherName: student.fatherName || '',
      cnic: student.cnic || student.regNo || '',
      studentId: student.rollNo || '',
      department: student.grade || student.courses || '',
      dob: student.dob || '',
      validUntil: '2026-06-30',
      bloodGroup: student.bloodGroup || 'B+',
      photo: student.photo || '',
      phone: student.phone || '',
      address: student.currentAddress || ''
    }));
  };

  const filteredStudents = students.filter(s => 
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.rollNo?.toString().includes(searchTerm))
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 flex flex-col items-center gap-8 font-urdu" dir="rtl">
      {/* Header Panel */}
      <div className="w-full max-w-[1200px] no-print flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] shadow-xl shadow-blue-900/5 border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 ml-1" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">آئی ڈی کارڈ سینٹر</h2>
            <p className="text-xs text-slate-400 font-bold">پروفیشنل اسٹوڈنٹ کارڈ جنریٹر</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 md:mt-0 relative z-10 w-full md:w-auto justify-end">
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all active:scale-95 group"
          >
            <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            کارڈ پرنٹ کریں
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column: Student Selector & Tools */}
        <div className="lg:col-span-4 space-y-8 no-print">
          {/* Search & Select */}
          <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-blue-900/5 border border-white">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              طالب علم منتخب کریں
            </h3>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="نام یا رول نمبر سے تلاش کریں..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 text-sm focus:border-blue-500 outline-none transition-all font-bold"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border-2 ${selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-slate-50'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {student.photo ? (
                      <img src={student.photo} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-2 text-slate-300" />
                    )}
                  </div>
                  <div className="text-right flex-1">
                    <div className="text-sm font-black text-slate-800">{student.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold">رول نمبر: {student.rollNo} | {student.grade}</div>
                  </div>
                </button>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-bold text-sm">
                  کوئی طالب علم نہیں ملا
                </div>
              )}
            </div>
          </div>

          {/* Photo Tool */}
          <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-blue-900/5 border border-white">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-orange-500" />
              تصویر ایڈجسٹ کریں
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group"
            >
              <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
              <span className="text-[10px] text-slate-400 font-bold">نئی تصویر اپ لوڈ کریں</span>
              <input 
                ref={fileInputRef}
                type="file" accept="image/*" 
                onChange={handlePhotoUpload}
                className="hidden" 
              />
            </div>
          </div>

          {/* Signature Tool */}
          <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-blue-900/5 border border-white">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-500" />
              دستخط اپ لوڈ کریں (Signature)
            </h3>
            <div 
              onClick={() => signatureInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group"
            >
              {cardData.signature ? (
                <div className="w-full h-full p-2 flex items-center justify-center">
                  <img src={cardData.signature} alt="Signature Preview" className="max-h-full max-w-full object-contain grayscale" />
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-[10px] text-slate-400 font-bold">دستخط کی تصویر اپ لوڈ کریں</span>
                </>
              )}
              <input 
                ref={signatureInputRef}
                type="file" accept="image/*" 
                onChange={handleSignatureUpload}
                className="hidden" 
              />
            </div>
            {cardData.signature && (
              <button 
                onClick={() => setCardData(prev => ({ ...prev, signature: '' }))}
                className="w-full mt-2 text-center text-[10px] text-red-500 hover:text-red-700 font-bold"
              >
                دستخط حذف کریں
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Preview & Live Layout */}
        <div className="lg:col-span-8 flex flex-col items-center gap-12">
          
          {/* Layout Warning */}
          <div className="bg-orange-50 text-orange-700 px-6 py-3 rounded-2xl text-[10px] font-bold border border-orange-100 no-print">
            نوٹ: پرنٹ کے وقت صرف کارڈ ہی نظر آئے گا، باقی تمام چیزیں غائب ہو جائیں گی۔
          </div>

          <div className="id-card-render-container flex flex-col md:flex-row gap-12 print:gap-4 print:p-0">
            
            {/* FRONT SIDE - EXACT REFERENCE REPLICA */}
            <div className="w-[85.6mm] h-[54mm] bg-[#FDFDEE] rounded-[2mm] shadow-[0_15px_35px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col border border-slate-300 print:shadow-none print:border-slate-400 font-urdu">
               
               {/* Background Watermark/Pattern */}
               <div className="absolute inset-0 opacity-[0.1] pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-[10px] border-orange-200 rounded-full rotate-45" />
               </div>

               {/* Top Banner (Yellow Ribbon) */}
               <div className="absolute top-2 right-4 z-20">
                  <div className="relative">
                    <div className="bg-[#FFF9C4] border border-orange-200 px-6 py-1 rounded-sm shadow-sm transform -skew-x-12 flex items-center justify-center">
                      <span className="text-[12px] font-black text-blue-800 transform skew-x-12">شناخت نامہ طالب علم</span>
                    </div>
                    {/* Ribbon Tails */}
                    <div className="absolute -left-2 top-1 w-2 h-6 bg-orange-200 -z-10 -skew-y-45" />
                    <div className="absolute -right-2 top-1 w-2 h-6 bg-orange-200 -z-10 skew-y-45" />
                  </div>
               </div>

               {/* Logo Center */}
               <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 z-10">
                  <img src="https://i.ibb.co/h9yS9Bq/logo.png" alt="Logo" className="w-full h-full object-contain" />
               </div>

               {/* Main Body */}
               <div className="flex-1 flex p-4 gap-4 relative z-10 mt-4">
                  {/* Photo Section (Left) */}
                  <div className="w-24 h-28 bg-white border-2 border-slate-400 p-0.5 rounded-sm overflow-hidden shadow-md">
                     {cardData.photo ? (
                        <img src={cardData.photo} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                           <User className="w-12 h-12 text-slate-200" />
                        </div>
                     )}
                     {/* Stamp Overlay */}
                     <div className="absolute bottom-6 left-2 w-16 h-16 opacity-40 rotate-[-15deg] pointer-events-none">
                        <div className="w-full h-full border-2 border-blue-900 rounded-full flex items-center justify-center text-[5px] font-bold text-blue-900 p-1 text-center">
                           جامعہ عربیہ سراج العلوم <br/> تصدیق شدہ
                        </div>
                     </div>
                  </div>

                  {/* Title Box (Right) */}
                  <div className="flex-1 flex flex-col items-center justify-center pt-8">
                     <div className="bg-gradient-to-b from-red-600 to-red-800 border-2 border-orange-400 rounded-lg px-2 py-1.5 shadow-lg w-full text-center relative">
                        <h2 className="text-[16px] font-black text-white leading-none drop-shadow-md">جامعہ عربیہ سراج العلوم</h2>
                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-[6px] text-red-800 px-1 rounded-full border border-red-800 font-black">رجسٹرڈ</span>
                     </div>
                     
                     <div className="w-full bg-[#008037] text-white text-[7px] font-bold py-0.5 mt-2 rounded-sm shadow-sm border border-green-800">
                        مدینہ کالونی چنار روڈ مانسہرہ خیبر پختونخوا پاکستان
                     </div>

                     {/* Signature Area */}
                     <div className="mt-2 w-32 h-10 border border-blue-400 bg-white/80 rounded-sm relative overflow-hidden flex items-center justify-center p-1">
                        {cardData.signature ? (
                           <img src={cardData.signature} alt="Signature" className="max-h-full max-w-full object-contain" />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center opacity-70">
                              <span className="font-serif text-blue-600 text-[10px] rotate-[-5deg]">Abdul Rehman</span>
                           </div>
                        )}
                        <div className="absolute bottom-0 right-0 px-1 bg-white text-[5px] text-blue-800 border-t border-l border-blue-400">دستخط حامل</div>
                     </div>
                  </div>
               </div>

               {/* Footer Bar (Green) */}
               <div className="h-6 bg-[#A5D6A7] flex items-center justify-center px-4 border-t border-green-600">
                  <span className="text-[7px] font-black text-slate-800">نوٹ: گمشدہ کارڈ ملنے کی صورت میں جامعہ ہذا کے پتہ پر ارسال فرما دیں۔ شکریہ</span>
               </div>
            </div>

            {/* BACK SIDE - EXACT REFERENCE REPLICA */}
            <div className="w-[85.6mm] h-[54mm] bg-[#FDFDEE] rounded-[2mm] shadow-[0_15px_35px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col border border-slate-300 print:shadow-none print:border-slate-400 p-4 font-urdu text-right">
               
               {/* Background Watermark */}
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
                  <div className="text-[40px] font-black text-slate-400 rotate-[-45deg] uppercase">Jamia Arabia</div>
               </div>

               {/* ID Box Row */}
               <div className="flex items-center gap-2 mb-2 justify-end">
                  <div className="flex items-center gap-0.5">
                     {/* 13 Digit Box for CNIC */}
                     {Array.from({length: 13}).map((_, i) => (
                        <div key={i} className="w-4 h-5 border border-slate-800 bg-white flex items-center justify-center text-[10px] font-bold text-blue-800">
                           {cardData.cnic.replace(/-/g, '')[i] || ''}
                           {(i === 4 || i === 11) && <div className="absolute -left-1 text-[8px]">-</div>}
                        </div>
                     ))}
                  </div>
                  <span className="text-[8px] font-black text-green-700 leading-tight">قومی شناختی <br/> کارڈ نمبر</span>
               </div>

               {/* Fields with Dotted Lines */}
               <div className="space-y-1.5 relative z-10">
                  <div className="flex border-b border-dotted border-slate-400 pb-0.5">
                     <span className="text-[9px] font-black text-slate-800 flex-1 text-right text-blue-800">{cardData.name} {cardData.fatherName && `بن ${cardData.fatherName}`}</span>
                     <span className="text-[8px] font-black text-red-700 w-24">نام بمع ولدیت:</span>
                  </div>
                  <div className="flex border-b border-dotted border-slate-400 pb-0.5">
                     <span className="text-[9px] font-black text-slate-800 flex-1 text-right text-blue-800">{cardData.address}</span>
                     <span className="text-[8px] font-black text-red-700 w-24">پتہ:</span>
                  </div>
                  <div className="flex items-center gap-4 border-b border-dotted border-slate-400 pb-0.5">
                     <div className="flex flex-1">
                        <span className="text-[9px] font-black text-slate-800 flex-1 text-right text-blue-800">ندارد</span>
                        <span className="text-[8px] font-black text-green-700 w-20">شناختی علامت:</span>
                     </div>
                     <div className="flex flex-1">
                        <span className="text-[9px] font-black text-slate-800 flex-1 text-right text-blue-800">{cardData.dob}</span>
                        <span className="text-[8px] font-black text-red-700 w-20">تاریخ پیدائش:</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 border-b border-dotted border-slate-400 pb-0.5">
                     <div className="flex flex-1">
                        <span className="text-[9px] font-black text-slate-800 flex-1 text-right text-blue-800">---</span>
                        <span className="text-[8px] font-black text-green-700 w-20">جامعہ کا داخلہ نمبر:</span>
                     </div>
                     <div className="flex flex-1">
                        <span className="text-[9px] font-black text-slate-800 flex-1 text-right text-blue-800">{cardData.department}</span>
                        <span className="text-[8px] font-black text-red-700 w-20">تعلیم / درجہ:</span>
                     </div>
                  </div>
               </div>

               {/* Bottom Info */}
               <div className="mt-2 text-[8px] font-black text-slate-800 text-center">
                  یہ کارڈ از <span className="text-blue-800">یکم اپریل {new Date().getFullYear()}</span> تا <span className="text-blue-800">31 مارچ {new Date().getFullYear()+1}</span> تک کارآمد ہے
               </div>

               {/* Bottom Green Bar */}
               <div className="mt-auto -mx-4 -mb-4 bg-[#008037] text-white p-1.5 flex items-center justify-between px-4">
                  <div className="flex flex-col text-[7px] font-bold">
                     <span>0312-5561894</span>
                     <span>0300-5632886</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] font-black">جامعہ عربیہ سراج العلوم رجسٹرڈ</span>
                     <span className="text-[5px] opacity-70">مدینہ کالونی چنار روڈ مانسہرہ</span>
                  </div>
                  <div className="bg-white text-green-800 text-[6px] font-black px-2 py-0.5 rounded-sm">جاری کردہ</div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Manual Data Editor - Visible but secondary */}
      <div className="w-full max-w-[1200px] no-print bg-white p-8 rounded-[32px] shadow-xl shadow-blue-900/5 border border-white mb-20">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">کارڈ کی تفصیلات میں تبدیلی</h3>
            <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black">دستی تبدیلی (Manual Override)</div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 mr-1 uppercase">نام (Name)</label>
              <input type="text" value={cardData.name} onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 mr-1 uppercase">ولدیت (Father)</label>
              <input type="text" value={cardData.fatherName} onChange={(e) => setCardData(prev => ({ ...prev, fatherName: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 mr-1 uppercase">رول نمبر (Roll No)</label>
              <input type="text" value={cardData.studentId} onChange={(e) => setCardData(prev => ({ ...prev, studentId: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 mr-1 uppercase">درجہ (Grade)</label>
              <input type="text" value={cardData.department} onChange={(e) => setCardData(prev => ({ ...prev, department: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .id-card-render-container, .id-card-render-container * { visibility: visible; }
          .id-card-render-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 10mm !important;
            justify-content: center !important;
            padding: 10mm !important;
          }
          .no-print { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
}
