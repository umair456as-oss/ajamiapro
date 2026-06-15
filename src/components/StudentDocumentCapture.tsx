import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, ArrowRight, User, FileText, CheckCircle2, Trash2, Search, Sparkles, 
  UploadCloud, Image as ImageIcon, RefreshCw, Eye, Download, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';

interface StudentDocument {
  id: string;
  title: string;
  type: string;
  photoUrl: string;
  createdAt: string;
}

interface Student {
  id: number;
  name: string;
  fatherName: string;
  gender: string;
  cnic: string;
  dob: string;
  admissionDate: string;
  regNo: string;
  rollNo: string;
  currentAddress: string;
  currentDistrict: string;
  permanentAddress: string;
  permanentDistrict: string;
  phone: string;
  grade: string;
  section: string;
  photo?: string;
  documentFiles?: StudentDocument[];
}

interface StudentDocumentCaptureProps {
  onBack: () => void;
}

const DOCUMENT_TYPES = [
  { id: 'cnic_bform', label: 'شناختی کارڈ / ب فارم (CNIC / B-Form)' },
  { id: 'previous_sanad', label: 'سابقہ تعلیمی سند / سرٹیفکیٹ' },
  { id: 'admission_form', label: 'دستخط شدہ داخلہ فارم (Signed Admission Form)' },
  { id: 'transcript', label: 'سابقہ ففٹ / رزلٹ کارڈ' },
  { id: 'application', label: 'مخصوص درخواست (Application / Request)' },
  { id: 'other', label: 'دیگر دستاویزات (Other Document)' }
];

export default function StudentDocumentCapture({ onBack }: StudentDocumentCaptureProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [docType, setDocType] = useState('cnic_bform');
  const [customTitle, setCustomTitle] = useState('');
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isSaving, setIsSaving] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<StudentDocument | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load students from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('students');
      if (saved) {
        setStudents(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading students', e);
    }
  }, []);

  // Filtered student list
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.fatherName.toLowerCase().includes(term) ||
      (s.regNo && s.regNo.toLowerCase().includes(term)) ||
      (s.cnic && s.cnic.includes(term))
    );
  });

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setCapturedPhoto(null);
    setIsCameraActive(false);
    setCustomTitle('');
    setViewingDoc(null);
  };

  // Capture from webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedPhoto(imageSrc);
      setIsCameraActive(false);
    }
  }, [webcamRef]);

  // Handle uploaded file fallback (highly useful in sandbox environment)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Camera Facing Mode
  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Save document to student profile
  const handleSaveDocument = async () => {
    if (!selectedStudent || !capturedPhoto) return;

    setIsSaving(true);
    const selectedTypeLabel = DOCUMENT_TYPES.find(d => d.id === docType)?.label || 'دستاویز';
    const finalTitle = customTitle.trim() || selectedTypeLabel;

    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: finalTitle,
      type: docType,
      photoUrl: capturedPhoto,
      createdAt: new Date().toLocaleDateString('ur-PK') + ' ' + new Date().toLocaleTimeString('ur-PK')
    };

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        const studentDocs = s.documentFiles || [];
        return {
          ...s,
          documentFiles: [...studentDocs, newDoc]
        };
      }
      return s;
    });

    try {
      // Save locally
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      setStudents(updatedStudents);
      
      // Update active selection to reflect newly added document
      const newlyUpdatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
      if (newlyUpdatedStudent) {
        setSelectedStudent(newlyUpdatedStudent);
      }

      // Sync to cloud db
      await syncToServer();
      
      // Reset inputs
      setCapturedPhoto(null);
      setCustomTitle('');
      setIsCameraActive(false);
      alert('دستاویز کامیابی کے ساتھ طالب علم کے پروفائل میں محفوظ ہو گئی ہے!');
    } catch (err) {
      console.error('Error saving student document', err);
      alert('دستاویز محفوظ کرنے میں خرابی پیش آئی۔');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (docId: string) => {
    if (!selectedStudent) return;
    if (!confirm('کیا آپ واقعی یہ دستاویز حذف کرنا چاہتے ہیں؟')) return;

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        const studentDocs = s.documentFiles || [];
        return {
          ...s,
          documentFiles: studentDocs.filter(d => d.id !== docId)
        };
      }
      return s;
    });

    try {
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      setStudents(updatedStudents);

      const newlyUpdatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
      if (newlyUpdatedStudent) {
        setSelectedStudent(newlyUpdatedStudent);
      }

      if (viewingDoc?.id === docId) {
        setViewingDoc(null);
      }

      await syncToServer();
      alert('دستاویز کامیابی سے حذف کردی گئی۔');
    } catch (err) {
      console.error('Error deleting document', err);
      alert('دستاویز حذف کرنے میں خرابی پیش آئی۔');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-urdu p-4 md:p-8 flex flex-col justify-between overflow-y-auto" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="bg-white/10 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 text-sm font-bold active:scale-95 duration-100"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            <span>واپس جائیں</span>
          </button>
        </div>

        <div className="text-right flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              طلبہ دستاویزات کیپچرنگ و اپلوڈ
            </h1>
            <p className="text-slate-400 text-xs mt-1">طالب علم کی تعلیمی اسناد، داخلہ فارم اور شناختی دستاویزات کا کیمرہ کیپچر</p>
          </div>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Left Column (Span 4) - Student Selector Table/Search */}
        <div className="lg:col-span-4 bg-[#0c1222] border border-white/5 rounded-3xl p-6 flex flex-col h-[650px] overflow-hidden">
          <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            طالب علم کا انتخاب کریں
          </h2>

          {/* Search Box */}
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="طالب علم کا نام، رجسٹریشن نمبر، شناختی کارڈ سرچ کریں..."
              className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-right text-slate-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3.5 top-3.5 text-slate-500 w-4.5 h-4.5" />
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredStudents.length === 0 ? (
              <div className="text-center text-slate-500 py-10 text-xs">کوئی طالب علم نہیں ملا</div>
            ) : (
              filteredStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className={`w-full p-3 rounded-2xl border text-right flex items-center gap-3 transition-all duration-200 ${
                    selectedStudent?.id === s.id 
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/5' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[10px] text-slate-400">
                      پروفائل
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-sm text-slate-100 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">ولدیت: {s.fatherName}</p>
                    <div className="flex items-center gap-2 mt-1 text-[9px]">
                      <span className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">{s.grade}</span>
                      {s.regNo && <span className="font-mono text-blue-400">Reg: {s.regNo}</span>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column (Span 8) - Camera Capture Panel */}
        <div className="lg:col-span-8 bg-[#0c1222] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          {!selectedStudent ? (
            <div className="flex flex-col items-center justify-center text-center py-24 flex-1 text-slate-500">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <FileText className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-300">دستاویز کیپچر کرنے کا پینل</h3>
              <p className="max-w-md text-xs text-slate-500 mt-2 leading-relaxed">
                براہ کرم بائیں بازو میں موجود لسٹ سے کسی طالب علم کو منتخب کریں۔ منتخب طالب علم کے پروفائل میں براہ راست اسناد کو سکین یا کیپچر کرکے محفوظ کیا جائے گا۔
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Selected Student Info Card */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-slate-400 font-bold">Pic</div>
                  )}
                  <div className="text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-[#3B82F6]">{selectedStudent.name}</h3>
                      <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full font-bold">{selectedStudent.grade}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">ولد طالب علم: {selectedStudent.fatherName} | فون: {selectedStudent.phone || 'نہیں ہے'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">شناختی کارڈ نمبر: {selectedStudent.cnic || 'دستیاب نہیں'} | رجسٹریشن: {selectedStudent.regNo || 'دستیاب نہیں'}</p>
                  </div>
                </div>

                <div className="bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">کل دستاويزات</span>
                  <span className="text-xl font-extrabold text-white mt-0.5">{selectedStudent.documentFiles?.length || 0}</span>
                </div>
              </div>

              {/* Camera & Operations Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-start">
                
                {/* Left Mini Column (Capture / Upload forms) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 border-b border-white/5 pb-2">دستاویز کی معلومات</h4>
                    
                    {/* Document Type Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">دستاویز کی قسم (Category)</label>
                      <select 
                        value={docType} 
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0f172a] border border-white/10 rounded-xl text-xs text-right outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      >
                        {DOCUMENT_TYPES.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Title Card */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold">دستی نام (کوئی اضافی تفصیل - اختیاری)</label>
                      <input 
                        type="text" 
                        placeholder="مثال کے طور پر: پہلی پوزیشن سرٹیفکیٹ"
                        className="w-full px-3 py-2.5 bg-[#0f172a] border border-white/10 rounded-xl text-xs text-right outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-200"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </div>

                    {/* Select / Actions */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => {
                          setCapturedPhoto(null);
                          setIsCameraActive(true);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
                      >
                        <Camera className="w-4 h-4 ml-1" />
                        کیمرہ آن کریں
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          فائل اپلوڈ کریں
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          accept="image/*,application/pdf" 
                          className="hidden" 
                          onChange={handleFileUpload} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Saved documents List for student */}
                  <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 mb-2">محفوظ شدہ دستاویزات</h4>
                    
                    {!selectedStudent.documentFiles || selectedStudent.documentFiles.length === 0 ? (
                      <p className="text-center text-[11px] text-slate-500 py-4">کوئی محفوظ شدہ دستاویز نہیں ہے۔</p>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {selectedStudent.documentFiles.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:bg-white/[0.05] transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setViewingDoc(doc)}
                                className="p-1 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                                title="دیکھیں"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                                title="حذف کریں"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-200 truncate">{doc.title}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5">{doc.createdAt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Mini Column (Camera Preview / Photo display) */}
                <div className="md:col-span-7 h-full flex flex-col justify-center">
                  <div className="bg-[#070b14] border border-white/5 rounded-2xl overflow-hidden shadow-inner h-[320px] relative flex flex-col items-center justify-center">
                    
                    {/* Active Camera View */}
                    {isCameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-black">
                        {/* @ts-ignore */}
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{ facingMode }}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        
                        {/* Camera Guides */}
                        <div className="absolute inset-4 border border-dashed border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                          <p className="text-[10px] bg-black/60 px-3 py-1 rounded-full text-slate-300 font-sans tracking-wide">FRAME DOCUMENT HERE</p>
                        </div>

                        {/* Top bar controls */}
                        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                          <button 
                            onClick={toggleFacingMode}
                            className="bg-black/60 p-2 text-white rounded-full hover:bg-black/80 font-sans text-xs flex items-center gap-1.5 border border-white/10"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                            <span>کیمرہ تبدیل کریں</span>
                          </button>

                          <button 
                            onClick={() => setIsCameraActive(false)}
                            className="bg-red-600 p-2 text-white rounded-full hover:bg-red-700 font-bold text-xs"
                          >
                            منسوخ
                          </button>
                        </div>

                        {/* Bottom bar capture button */}
                        <div className="absolute bottom-6 flex justify-center w-full">
                          <button 
                            onClick={capture}
                            className="w-16 h-16 bg-white border-4 border-slate-500 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-1"
                          >
                            <div className="w-full h-full bg-red-600 rounded-full"></div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Snapshot Preview */}
                    {capturedPhoto && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col">
                        <img 
                          src={capturedPhoto} 
                          alt="Captured Document" 
                          className="w-full flex-1 object-contain bg-black px-4 pt-4" 
                        />
                        <div className="p-4 bg-slate-900 border-t border-white/5 flex items-center justify-between gap-4">
                          <button 
                            onClick={() => setCapturedPhoto(null)} 
                            className="text-xs bg-white/10 text-slate-400 hover:text-white px-4 py-2 rounded-xl border border-white/5"
                          >
                            دوبارہ لے لیں (Retake)
                          </button>
                          
                          <button 
                            onClick={handleSaveDocument}
                            disabled={isSaving}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2"
                          >
                            {isSaving ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            طالب علم کے پروفائل میں محفوظ کریں
                          </button>
                        </div>
                      </div>
                    )}

                    {/* No camera/photo State */}
                    {!isCameraActive && !capturedPhoto && (
                      <div className="flex flex-col items-center text-slate-500 p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-indigo-400 opacity-60" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-300 font-bold">دستاویز کا لائیو کیمرہ کیپچر یا فائل اپلوڈ</p>
                          <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">بائیں جانب موجود کیمرہ آن کریں یا فائل اپلوڈ کریں اور طالب علم کے پروفائل میں محفوظ کریں۔</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Document View Lightbox/Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          >
            <div className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/10 flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 bg-slate-800 border-b border-white/5 flex items-center justify-between" dir="rtl">
                <div className="text-right">
                  <h3 className="text-lg font-bold text-white">{viewingDoc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">تخلیق شدہ: {viewingDoc.createdAt}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <a 
                    href={viewingDoc.photoUrl} 
                    download={`doc-${viewingDoc.type}-${selectedStudent?.name}.jpg`}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    ڈاؤنلوڈ کریں
                  </a>
                  
                  <button 
                    onClick={() => setViewingDoc(null)}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl border border-white/10"
                  >
                    بند کریں
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="bg-black flex-1 min-h-[350px] p-4 flex items-center justify-center overflow-auto">
                <img 
                  src={viewingDoc.photoUrl} 
                  alt={viewingDoc.title} 
                  className="max-h-[70vh] object-contain rounded-xl border border-white/5" 
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helpful Instructions Panel */}
      <div className="mt-6 p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl flex items-start gap-3" dir="rtl">
        <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-right">
          <h4 className="text-xs font-bold text-indigo-300">انتظامیہ کے لیے اہم ہدایات:</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
            مذکورہ فیچر کیمرہ API کے ذریعے کمپیوٹر یا لیپ ٹاپ کے ساتھ اٹیچ شدہ ويب کیم يا موبائل فون کے بیک کیمرہ کو براہ راست استعمال کرتا ہے۔ سند کو کیمرہ کے سامنے سیدھا رکھیں، جب فریم واضح ہو تو کیپچر دبا کر متعلقہ طالب علم کی تصویر، فارم یا پاسپورٹ وغیرہ محفوظ کی جاسکتی ہے۔ یہ لائیو ڈیٹا کلاؤڈ سنک ہو جاتا ہے۔
          </p>
        </div>
      </div>

    </div>
  );
}
