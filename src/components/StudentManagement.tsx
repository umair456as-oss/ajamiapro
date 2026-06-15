import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import PrintAdmissionForm from './PrintAdmissionForm';
import { 
  Users, X, Save, Camera, Upload, Fingerprint, 
  Smartphone, QrCode, CheckCircle2, AlertCircle, Printer,
  RefreshCw, Check, Download
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { API_BASE_URL, customFetch } from '../config';
import VoiceInput from './VoiceInput';

interface StudentManagementProps {
  onBack: () => void;
  editingStudent?: any;
}

const InputGroup = ({ 
  label, 
  placeholder, 
  dir = "rtl", 
  type = "text", 
  value, 
  onChange,
  suggestions = []
}: { 
  label: string, 
  placeholder?: string, 
  dir?: "rtl" | "ltr", 
  type?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
  suggestions?: string[]
}) => {
  const listId = `suggestions-${label.replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex items-center justify-between" dir="rtl">
        <label className="text-sm font-urdu text-slate-700">{label}</label>
        {type !== 'date' && onChange && (
          <VoiceInput onTranscript={(text) => {
            const event = { target: { value: text } } as any;
            onChange(event);
          }} />
        )}
      </div>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-right min-h-[120px]"
          placeholder={placeholder}
          dir={dir}
        />
      ) : (
        <>
          <input 
            type={type}
            value={value}
            onChange={onChange}
            list={suggestions.length > 0 ? listId : undefined}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-right"
            placeholder={placeholder}
            dir={dir}
          />
          {suggestions.length > 0 && (
            <datalist id={listId}>
              {suggestions.map((s, i) => <option key={i} value={s} />)}
            </datalist>
          )}
        </>
      )}
    </div>
  );
};

export default function StudentManagement({ onBack, editingStudent }: StudentManagementProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastSavedStudent, setLastSavedStudent] = useState<any>(null);

  const [systemSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      return saved ? JSON.parse(saved) : {
        jamiaName: 'جامعہ عربیہ سراج العلوم',
        monogram: ''
      };
    } catch (e) {
      return { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
    }
  });
  const [formData, setFormData] = useState({
    name: '', fatherName: '', gender: 'مرد', cnic: '', dob: '', age: '',
    admissionDate: '', regNo: '', rollNo: '', currentAddress: '',
    currentDistrict: '', permanentAddress: '', permanentDistrict: '',
    phone: '', education: '', courses: '',
    motherName: '', guardianPhone: '', guardianEmail: '',
    madrasaDetails: '',
    grade: '', section: '',
    username: '', password: '',
    caste: 'پاکستان', village: '', tehsil: 'مانسہرہ', postOffice: '',
    guardianName: '',
    photo: '', fatherCnic: '',
    isResidential: false, isAid: false, isWafaqi: false, isGraduate: false
  });

  React.useEffect(() => {
    if (editingStudent) {
      setFormData(prev => ({...prev, ...editingStudent}));
    }
  }, [editingStudent]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  React.useEffect(() => {
    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
      
      let userGrades = [];
      if (Array.isArray(savedGradesList) && savedGradesList.length > 0) {
        userGrades = savedGradesList.map((g: any) => g.name);
      } else if (Array.isArray(savedGrades) && savedGrades.length > 0) {
        userGrades = savedGrades.map((g: any) => g.name);
      }
      
      setAvailableGrades(userGrades.length > 0 ? userGrades : ['اولیٰ', 'ثانیہ', 'ثالثہ']);
      
      const savedDistricts = JSON.parse(localStorage.getItem('districts') || '[]');
      setAvailableDistricts(Array.isArray(savedDistricts) && savedDistricts.length > 0 ? savedDistricts : ['مانسہرہ', 'ایبٹ آباد', 'بٹگرام', 'تورغر', 'کوہستان', 'سوات', 'پشاور', 'اسلام آباد', 'کراچی', 'لاہور', 'ملتان']);
      
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      if (Array.isArray(students)) {
        const castes = Array.from(new Set(students.map((s: any) => s.caste).filter(Boolean))) as string[];
        const tehsils = Array.from(new Set(students.map((s: any) => s.tehsil).filter(Boolean))) as string[];
        const villages = Array.from(new Set(students.map((s: any) => s.village).filter(Boolean))) as string[];
        
        setSuggestions({
          castes: castes.length > 0 ? castes : ['پاکستان', 'گوجر', 'سواتی', 'پٹھان', 'اعوان', 'سید', 'قریشی'],
          tehsils: tehsils.length > 0 ? tehsils : ['مانسہرہ', 'بالاکوٹ', 'اوگی', 'بافہ پکھل'],
          villages: villages.length > 0 ? villages : ['جبوری', 'نواز آباد', 'سچاں', 'بیلا', 'جٹکہ', 'کھوئی'],
        });
      }
    } catch (e) {
      console.error("Error loading initial data in StudentManagement:", e);
      // Fallback to defaults
      setAvailableGrades(['اولیٰ', 'ثانیہ', 'ثالثہ']);
      setAvailableDistricts(['مانسہرہ', 'ایبٹ آباد', 'بٹگرام', 'تورغر', 'کوہستان', 'سوات', 'پشاور', 'اسلام آباد', 'کراچی', 'لاہور', 'ملتان']);
    }
  }, []);

  const [suggestions, setSuggestions] = useState<any>({ castes: [], tehsils: [], villages: [] });

  const tabs = [
    { id: 'basic', label: 'بنیادی معلومات' },
    { id: 'guardian', label: 'سرپرست معلومات' },
    { id: 'madrasa', label: 'سابقہ مدارس' },
    { id: 'grade', label: 'موجودہ درجہ' },
    { id: 'lesson', label: 'سبق ٹریک' },
    { id: 'biometric', label: 'تصویر' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      handleInputChange('photo', imageSrc);
      setIsCameraOpen(false);
    }
  }, [webcamRef]);

  const handleSave = async () => {
    // Show saving status
    console.log('Initiating Secure Save for:', formData.name);
    
    try {
      const response = await customFetch(`${API_BASE_URL}/api/add-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Server Save Successful:', result);
        
        // Update local state with the actual DB ID if it's a new student
        const studentWithId = { ...formData, id: result.id || formData.id };
        
        // Update localStorage to keep it in sync until the next pull
        const existing = JSON.parse(localStorage.getItem('students') || '[]');
        let updated;
        if (formData.id && !String(formData.id).startsWith('temp-')) {
          updated = existing.map((s: any) => s.id === formData.id ? studentWithId : s);
        } else {
          updated = [...existing, studentWithId];
        }
        localStorage.setItem('students', JSON.stringify(updated));

        setLastSavedStudent(studentWithId);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Trigger a global sync pull to be 100% sure
        window.dispatchEvent(new Event('storage_updated'));
      } else {
        alert(result.error || 'ڈیٹا محفوظ کرنے میں کوئی خرابی پیش آگئی۔');
      }
    } catch (err) {
      console.error('Network Error during save:', err);
      alert('سرور سے رابطہ نہیں ہو سکا۔ براہ کرم چیک کریں کہ سرور چل رہا ہے۔');
    }
  };

  const handleSaveAndPrint = () => {
    handleSave();
    setIsPrinting(true);
  };

  if (isPrinting && lastSavedStudent) {
    return <PrintAdmissionForm student={lastSavedStudent} onBack={() => setIsPrinting(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-urdu"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>ریکارڈ کامیابی سے محفوظ کر لیا گیا ہے!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setIsCameraOpen(false)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold font-urdu text-slate-800">تصویر لیں (Take Photo)</h3>
              </div>

              <div className="p-8 flex flex-col items-center gap-8">
                <div className="w-full aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner relative">
                  {/* @ts-ignore */}
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-[1.8rem] pointer-events-none" />
                </div>

                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setIsCameraOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    منسوخ کریں
                  </button>
                  <button 
                    onClick={capturePhoto}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <Check className="w-6 h-6" />
                    <span>تصویر محفوظ کریں</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-8 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 font-urdu"
          >
            <X className="w-5 h-5" />
            <span>واپس جائیں</span>
          </button>
          
          <button 
            onClick={() => {
              const existing = JSON.parse(localStorage.getItem('students') || '[]');
              if (existing.length === 0) {
                alert('ایکسپورٹ کے لیے کوئی ریکارڈ موجود نہیں ہے۔');
                return;
              }
              try {
                const exportData = existing.map((s: any) => ({
                  'نام': s.name || '',
                  'ولدیت': s.fatherName || '',
                  'جنس': s.gender || '',
                  'شناختی کارڈ': s.cnic || '',
                  'تاریخ پیدائش': s.dob || '',
                  'تاریخ داخلہ': s.admissionDate || '',
                  'رجسٹریشن': s.regNo || '',
                  'رول نمبر': s.rollNo || '',
                  'موجودہ پتہ': s.currentAddress || '',
                  'ضلع': s.currentDistrict || '',
                  'مستقل پتہ': s.permanentAddress || '',
                  'مستقل ضلع': s.permanentDistrict || '',
                  'فون': s.phone || '',
                  'درجہ': s.grade || '',
                  'سیکشن': s.section || '',
                  'سابقہ مدرسہ': s.madrasaDetails || '',
                }));
                exportToExcel(exportData, 'students_record');
              } catch (err) {
                console.error('Export error:', err);
                alert('ایکسل ایکسپورٹ میں خرابی پیش آگئی۔');
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-5 h-5" />
            ایکسل ایکسپورٹ
          </button>
          
          <label className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer">
            <Upload className="w-5 h-5" />
            ایکسل اپلوڈ
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const rawData = await importFromExcel(e.target.files[0]);
                    const mappedData = rawData.map((item: any) => ({
                      id: Date.now() + Math.random(),
                      name: item['نام'] || item['Name'] || item['Student Name'] || item['name'] || '',
                      fatherName: item['ولدیت'] || item['Father Name'] || item['fatherName'] || '',
                      cnic: item['شناختی کارڈ'] || item['CNIC'] || item['cnic'] || '',
                      phone: item['فون'] || item['Phone'] || item['Mobile'] || item['phone'] || '',
                      grade: item['درجہ'] || item['Class'] || item['Grade'] || item['grade'] || '',
                      section: item['سیکشن'] || item['Section'] || item['section'] || '',
                      regNo: item['رجسٹریشن'] || item['Reg No'] || item['regNo'] || '',
                      rollNo: item['رول نمبر'] || item['Roll No'] || item['rollNo'] || '',
                      currentDistrict: item['ضلع'] || item['District'] || item['currentDistrict'] || '',
                      currentAddress: item['پتہ'] || item['Address'] || item['currentAddress'] || '',
                      dob: item['تاریخ پیدائش'] || item['DOB'] || item['dob'] || '',
                      admissionDate: item['تاریخ داخلہ'] || item['Admission Date'] || item['admissionDate'] || '',
                     }));

                    const existing = JSON.parse(localStorage.getItem('students') || '[]');
                    const merged = [...existing, ...mappedData];
                    localStorage.setItem('students', JSON.stringify(merged));
                    alert(`${mappedData.length} طلبہ کا ڈیٹا کامیابی سے اپلوڈ ہو گیا۔`);
                  } catch (err) {
                    alert('ایکسل فائل پڑھنے میں خرابی۔');
                  }
                }
              }} 
            />
          </label>
        </div>

        <div className="flex items-center gap-6" dir="rtl">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 overflow-hidden border border-slate-100">
            {systemSettings.monogram ? (
              <img src={systemSettings.monogram} alt="Monogram" className="w-full h-full object-contain" />
            ) : (
              <Users className="w-8 h-8" />
            )}
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-3xl font-bold text-slate-900 font-urdu leading-tight">Student Management (طلبہ کا انتظام)</h1>
            <p className="text-slate-500 text-sm font-urdu mt-1">{systemSettings.jamiaName} - طلبہ کے ریکارڈ کا جامع نظام</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          {/* Form Container */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {/* Form Header / Tabs */}
            <div className="bg-[#1e293b] p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.5" />
                </svg>
              </div>
              
              <h2 className="text-white text-3xl font-bold font-urdu mb-8 relative z-10">نیا طالب علم شامل کریں</h2>
              
              <div className="flex flex-wrap justify-center gap-3 relative z-10" dir="rtl">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-urdu transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Body */}
            <div className="p-12 space-y-10">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div 
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <InputGroup label="نام طالب علم *" placeholder="طالب علم کا نام" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    <InputGroup label="ولدیت (والد کا نام)" placeholder="والد کا نام" value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)} />
                    <InputGroup label="تاریخ پیدائش" type="date" value={formData.dob} onChange={(e) => handleInputChange('dob', e.target.value)} />
                    <InputGroup label="قوم" placeholder="قوم / ذات" value={formData.caste} onChange={(e) => handleInputChange('caste', e.target.value)} suggestions={suggestions.castes} />
                    
                    <div className="md:col-span-2">
                      <InputGroup 
                        label="قومی شناختی کارڈ نمبر (CNIC)" 
                        placeholder="00000-0000000-0" 
                        value={formData.cnic} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const numbers = val.replace(/\D/g, '');
                          let formatted = numbers;
                          if (numbers.length > 5 && numbers.length <= 12) {
                            formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
                          } else if (numbers.length > 12) {
                            formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
                          }
                          handleInputChange('cnic', formatted);
                        }} 
                      />
                    </div>

                    <InputGroup label="گاؤں" placeholder="گاؤں کا نام" value={formData.village} onChange={(e) => handleInputChange('village', e.target.value)} suggestions={suggestions.villages} />
                    <InputGroup label="ڈاکخانہ" placeholder="ڈاکخانہ" value={formData.postOffice} onChange={(e) => handleInputChange('postOffice', e.target.value)} />
                    <InputGroup label="تحصیل" placeholder="تحصیل" value={formData.tehsil} onChange={(e) => handleInputChange('tehsil', e.target.value)} suggestions={suggestions.tehsils} />
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-urdu text-slate-700 text-right" dir="rtl">ضلع</label>
                      <select
                        value={formData.currentDistrict}
                        onChange={(e) => handleInputChange('currentDistrict', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all text-right appearance-none"
                        dir="rtl"
                      >
                        <option value="">-- ضلع منتخب کریں --</option>
                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <InputGroup label="فون نمبر *" placeholder="0300-0000000" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />

                    <div className="md:col-span-2">
                      <InputGroup label="موجودہ پتہ" type="textarea" placeholder="مکمل موجودہ پتہ درج کریں..." value={formData.currentAddress} onChange={(e) => handleInputChange('currentAddress', e.target.value)} />
                    </div>

                    <div className="md:col-span-2">
                      <InputGroup label="مستقل پتہ" type="textarea" placeholder="مکمل مستقل پتہ درج کریں..." value={formData.permanentAddress} onChange={(e) => handleInputChange('permanentAddress', e.target.value)} />
                    </div>

                    <div className="md:col-span-2">
                      <InputGroup label="سابقہ تعلیم کی تفصیل" placeholder="جیسے: میٹرک، حفظ وغیرہ" value={formData.education} onChange={(e) => handleInputChange('education', e.target.value)} />
                    </div>

                    <div className="md:col-span-2">
                      <InputGroup label="جس ادارے سے تعلیم حاصل کی اس کا نام" placeholder="سابقہ ادارے کا نام" value={formData.madrasaDetails} onChange={(e) => handleInputChange('madrasaDetails', e.target.value)} />
                    </div>

                    <InputGroup label="تاریخ داخلہ" type="date" value={formData.admissionDate} onChange={(e) => handleInputChange('admissionDate', e.target.value)} />

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-urdu text-slate-700 text-right" dir="rtl">رہائشی حیثیت</label>
                      <div className="flex gap-4 w-full" dir="rtl">
                        <button 
                          type="button"
                          onClick={() => handleInputChange('isResidential', true)}
                          className={`flex-1 py-3 rounded-xl font-bold font-urdu transition-all ${formData.isResidential ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          رہائشی
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleInputChange('isResidential', false)}
                          className={`flex-1 py-3 rounded-xl font-bold font-urdu transition-all ${!formData.isResidential ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          غیر رہائشی
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-urdu text-slate-700 text-right" dir="rtl">وفاقی / غیر وفاقی</label>
                      <div className="flex gap-4 w-full" dir="rtl">
                        <button 
                          type="button"
                          onClick={() => handleInputChange('isWafaqi', true)}
                          className={`flex-1 py-3 rounded-xl font-bold font-urdu transition-all ${formData.isWafaqi ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          وفاقی
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleInputChange('isWafaqi', false)}
                          className={`flex-1 py-3 rounded-xl font-bold font-urdu transition-all ${!formData.isWafaqi ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          غیر وفاقی
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'guardian' && (
                  <motion.div 
                    key="guardian"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <InputGroup label="سرپرست کا نام" placeholder="نام" value={formData.guardianName} onChange={(e) => handleInputChange('guardianName', e.target.value)} />
                    <InputGroup label="والدہ کا نام" placeholder="نام" value={formData.motherName} onChange={(e) => handleInputChange('motherName', e.target.value)} />
                    <InputGroup label="والد کا شناختی کارڈ" placeholder="00000-0000000-0" value={formData.fatherCnic} onChange={(e) => {
                      const val = e.target.value;
                      const numbers = val.replace(/\D/g, '');
                      let formatted = numbers;
                      if (numbers.length > 5 && numbers.length <= 12) {
                        formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
                      } else if (numbers.length > 12) {
                        formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
                      }
                      handleInputChange('fatherCnic', formatted);
                    }} />
                    <InputGroup label="سرپرست کا فون" placeholder="فون نمبر" value={formData.guardianPhone} onChange={(e) => handleInputChange('guardianPhone', e.target.value)} />
                    <div className="md:col-span-2">
                      <InputGroup label="سرپرست کی ای میل" placeholder="ای میل" value={formData.guardianEmail} onChange={(e) => handleInputChange('guardianEmail', e.target.value)} />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'madrasa' && (
                  <motion.div 
                    key="madrasa"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                      <p className="text-slate-400 font-urdu">سابقہ مدارس کی تفصیلات یہاں درج کریں۔</p>
                    </div>
                    <InputGroup label="تفصیلات" type="textarea" placeholder="سابقہ مدارس کی تفصیلات..." value={formData.madrasaDetails} onChange={(e) => handleInputChange('madrasaDetails', e.target.value)} />
                  </motion.div>
                )}

                {activeTab === 'grade' && (
                  <motion.div 
                    key="grade"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-urdu text-slate-700 text-right" dir="rtl">کلاس / درجہ</label>
                      <select 
                        value={formData.grade}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all text-right appearance-none" dir="rtl"
                      >
                        <option value="">-- کلاس منتخب کریں --</option>
                        {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <InputGroup label="سیکشن" placeholder="جیسے: الف" value={formData.section} onChange={(e) => handleInputChange('section', e.target.value)} />
                    
                    {/* Dedicated Roll Number System */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-urdu text-slate-700 text-right" dir="rtl">رول نمبر سسٹم</label>
                      <div className="flex gap-3" dir="rtl">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
                          onClick={(e) => {
                            e.preventDefault();
                            // Logic to auto-fill next roll number if empty
                            if (!formData.rollNo) {
                              const students = JSON.parse(localStorage.getItem('students') || '[]');
                              const maxRoll = students.reduce((max: number, s: any) => {
                                const roll = parseInt(s.rollNo);
                                return !isNaN(roll) ? Math.max(max, roll) : max;
                              }, 0);
                              handleInputChange('rollNo', String(maxRoll + 1));
                            }
                          }}
                        >
                          آٹو رول نمبر
                        </button>
                        <input 
                          type="text"
                          placeholder="رول نمبر یہاں لکھیں"
                          value={formData.rollNo}
                          onChange={(e) => handleInputChange('rollNo', e.target.value)}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all text-right focus:border-blue-500 focus:bg-white"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <InputGroup 
                      label="رجسٹریشن نمبر" 
                      placeholder="رجسٹریشن نمبر" 
                      value={formData.regNo} 
                      onChange={(e) => handleInputChange('regNo', e.target.value)} 
                    />
                  </motion.div>

                )}

                {activeTab === 'lesson' && (
                  <motion.div 
                    key="lesson"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center"
                  >
                    <p className="text-slate-400 font-urdu">تعلیمی ٹریکنگ اور پیشرفت یہاں دیکھیں۔</p>
                  </motion.div>
                )}

                {activeTab === 'biometric' && (
                  <motion.div 
                    key="biometric"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    {/* Photo Section */}
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center">
                      <h3 className="text-lg font-bold font-urdu text-slate-800 mb-6">طالب علم کی تصویر</h3>
                      <div className="w-48 h-48 bg-white rounded-3xl border-2 border-slate-200 flex items-center justify-center mb-6 shadow-inner overflow-hidden relative group">
                        {formData.photo ? (
                          <>
                            <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => handleInputChange('photo', '')}
                                className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <Camera className="w-16 h-16 text-slate-300" />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        <button 
                          onClick={() => setIsCameraOpen(true)}
                          className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-urdu flex items-center gap-2 hover:bg-emerald-600 transition-all"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Live Camera</span>
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-urdu flex items-center gap-2 hover:bg-blue-700 transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Checkboxes (Only for Basic Tab) */}
              {activeTab === 'basic' && (
                <div className="flex flex-wrap justify-end gap-6 pt-6 border-t border-slate-100" dir="rtl">
                  {[
                    { id: 'isResidential', label: 'رہائشی / غیر رہائشی' },
                    { id: 'isWafaqi', label: 'وفاقی / غیر وفاقی' }
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={(formData as any)[item.id]}
                        onChange={(e) => handleInputChange(item.id, e.target.checked)}
                      />
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${(formData as any)[item.id] ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-blue-500'}`}>
                        {(formData as any)[item.id] && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-sm font-urdu text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-10 border-t border-slate-100">
                <button 
                  onClick={onBack}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-urdu font-bold hover:bg-slate-200 transition-all text-xs"
                >
                  منسوخ کریں
                </button>
                <button 
                  onClick={handleSaveAndPrint}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-urdu font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-xs"
                >
                  <Printer className="w-5 h-5" />
                  <span>محفوظ اور پرنٹ</span>
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[#059669] text-white py-4 rounded-2xl font-urdu font-bold flex items-center justify-center gap-3 hover:bg-[#047857] transition-all shadow-xl shadow-emerald-500/20 text-xs"
                >
                  <Save className="w-5 h-5" />
                  <span>صرف محفوظ کریں</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
