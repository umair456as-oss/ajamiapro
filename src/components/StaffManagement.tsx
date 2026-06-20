import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, UserPlus, Users, Search, Filter, 
  Trash2, Pencil, CheckCircle2, Phone, CreditCard, 
  MapPin, Calendar, GraduationCap, Mail, Briefcase, Plus,
  Download, Upload, Printer, Camera, X
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE_URL, customFetch } from '../config';
import * as XLSX from 'xlsx';
import Webcam from 'react-webcam';
import { addToRecycleBin } from './RecycleBin';

interface StaffManagementProps {
  onBack: () => void;
}

interface StaffMember {
  id: string; // This will now hold the employeeId entered by the user
  employeeId: string;
  name: string;
  fatherName: string;
  maritalStatus: string;
  cnic: string;
  dob: string;
  phone: string;
  currentAddress: string;
  currentDistrict: string;
  permanentAddress: string;
  permanentDistrict: string;
  religiousEdu: string;
  worldlyEdu: string;
  additionalEdu: string;
  startDate: string;
  endDate?: string;
  photo?: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ onBack }) => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Data Persistence
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('staff');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing staff data:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('staff', JSON.stringify(staff));
  }, [staff]);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    employeeId: '',
    name: '',
    fatherName: '',
    maritalStatus: '',
    cnic: '',
    dob: '',
    phone: '',
    currentAddress: '',
    currentDistrict: '',
    permanentAddress: '',
    permanentDistrict: '',
    religiousEdu: '',
    worldlyEdu: '',
    additionalEdu: '',
    startDate: '',
    endDate: '',
    photo: ''
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFormData(prev => ({ ...prev, photo: imageSrc }));
      setIsCameraOpen(false);
    }
  }, [webcamRef]);

  const handleAddStaff = () => {
    if (!formData.name || !formData.phone || !formData.employeeId) {
      alert('نام، فون نمبر اور استاد کی آئی ڈی (ID) لازمی ہیں۔');
      return;
    }
    
    // Check if employeeId already exists
    if (staff.some(s => s.employeeId === formData.employeeId || s.id === formData.employeeId)) {
      alert('یہ آئی ڈی پہلے ہی کسی اور استاد کو دی جا چکی ہے۔ براہ کرم دوسری آئی ڈی استعمال کریں۔');
      return;
    }
    
    const newStaff: StaffMember = {
      ...formData as StaffMember,
      id: formData.employeeId // Use user-provided ID as the main ID
    };

    // Use functional update to prevent stale state
    setStaff(prevStaff => [...prevStaff, newStaff]);
    setFormData({
      employeeId: '', name: '', fatherName: '', maritalStatus: '', cnic: '', dob: '', phone: '',
      currentAddress: '', currentDistrict: '', permanentAddress: '', permanentDistrict: '',
      religiousEdu: '', worldlyEdu: '', additionalEdu: '', startDate: '', endDate: '', photo: ''
    });
    triggerSuccess();
    setView('list');
  };

  const handleDeleteStaff = (id: string) => {
    const staffToDelete = staff.find(s => s.id === id);
    if (staffToDelete) {
      // Send to Recycle Bin first
      addToRecycleBin('staff', staffToDelete, 'name');
    }
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.phone.includes(searchTerm) || 
                          s.cnic.includes(searchTerm);
    const matchesDistrict = districtFilter === '' || s.currentDistrict === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const districts = Array.from(new Set(staff.map(s => s.currentDistrict))).filter(d => d);

  const [systemSettings, setSystemSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      return saved ? JSON.parse(saved) : { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
    } catch (e) {
      return { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          setSystemSettings(JSON.parse(saved));
        }
      } catch (err) {}
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>معلومات محفوظ کر لی گئی ہیں!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#1e293b] text-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <button 
               onClick={onBack}
               className="bg-red-500/20 text-red-100 px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-red-500/30 transition-all font-bold"
             >
               <ArrowRight className="w-5 h-5" />
               <span>ڈیش بورڈ</span>
             </button>

             <button 
               onClick={() => window.print()}
               className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 text-sm print:hidden"
             >
               <Printer className="w-4 h-4" />
               فہرست پرنٹ کریں
             </button>

             <button 
               onClick={() => exportToExcel(staff, 'staff_record')}
               className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm print:hidden"
             >
               <Download className="w-4 h-4" />
               ایکسل ایکسپورٹ
             </button>
             
             <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer text-sm">
                <Upload className="w-4 h-4" />
                ایکسل اپلوڈ
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const ab = reader.result as ArrayBuffer;
                          const workbook = XLSX.read(ab, { type: 'array' });
                          const sheetName = workbook.SheetNames[0];
                          const sheetRaw = workbook.Sheets[sheetName];
                          const parsedRows: any[] = XLSX.utils.sheet_to_json(sheetRaw);
                          
                          const existingStr = localStorage.getItem('staff') || '[]';
                          const existing = JSON.parse(existingStr);
                          const updated = [...existing];
                          
                          parsedRows.forEach((row: any, idxTemp: number) => {
                            const randomSalt = Math.floor(Math.random() * 1000000);
                            const staffId = row.id || `${Date.now()}-${idxTemp}-${randomSalt}`;
                            
                            const staffMember = {
                              id: staffId,
                              employeeId: row.employeeId || row['آئی ڈی'] || row.id || staffId,
                              name: row.name || row['نام'] || '',
                              fatherName: row.fatherName || row['ولدیت'] || '',
                              designation: row.designation || row['عہدہ'] || '',
                              phone: row.phone || row['رابطہ نمبر'] || row.phone || row['فون'] || '',
                              basicSalary: Number(row.basicSalary || row['بنیادی تنخواہ'] || 0),
                              joiningDate: row.joiningDate || row.startDate || new Date().toLocaleDateString(),
                              maritalStatus: row.maritalStatus || '',
                              cnic: row.cnic || '',
                              dob: row.dob || '',
                              currentAddress: row.currentAddress || '',
                              currentDistrict: row.currentDistrict || '',
                              permanentAddress: row.permanentAddress || '',
                              permanentDistrict: row.permanentDistrict || '',
                              religiousEdu: row.religiousEdu || '',
                              worldlyEdu: row.worldlyEdu || '',
                              additionalEdu: row.additionalEdu || '',
                              startDate: row.startDate || row.joiningDate || new Date().toLocaleDateString()
                            };
                            
                            const matchIdx = updated.findIndex(s => s.name === staffMember.name && s.fatherName === staffMember.fatherName);
                            if (matchIdx >= 0) {
                              updated[matchIdx] = { ...updated[matchIdx], ...staffMember };
                            } else {
                              updated.push(staffMember);
                            }
                          });
                          
                          localStorage.setItem('staff', JSON.stringify(updated));
                          window.dispatchEvent(new Event('storage_updated'));
                          const { syncToServer } = await import('../syncService');
                          await syncToServer();
                          alert('فائل کامیابی سے اپلوڈ اور مرج کر دی گئی ہے۔');
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                          alert('اپلوڈ میں خرابی: امپورٹ فارمیٹ درست ہونا ضروری ہے۔');
                        }
                      };
                      reader.readAsArrayBuffer(file);
                    }
                  }} 
                />
              </label>

             <div className="flex flex-col">
               <span className="text-amber-400 text-xs font-bold">کل اساتذہ</span>
               <span className="text-2xl font-bold">{staff.length}</span>
             </div>
          </div>
          <h1 className="text-2xl font-bold font-urdu print:hidden">اساتذہ کا انتظام (Staff Management)</h1>
        </div>

        <div className="flex gap-2 print:hidden">
           <button 
             onClick={() => setView('list')}
             className={`px-6 py-2 rounded-t-lg font-bold text-sm transition-all ${view === 'list' ? 'bg-white text-slate-800' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
           >تمام اساتذہ</button>
           <button 
             onClick={() => setView('add')}
             className={`px-6 py-2 rounded-t-lg font-bold text-sm transition-all ${view === 'add' ? 'bg-white text-slate-800' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
           >نیا اندراج / ترمیم</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-[#7c2d12] p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-md">
                 <div className="flex-1 min-w-[300px] space-y-1">
                    <label className="text-[10px] text-orange-200 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Search className="w-3 h-3" /> تفصیلی تلاش
                    </label>
                    <div className="relative">
                      <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="نام، ولدیت، شناختی کارڈ، فون نمبر..." 
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2.5 pr-10 pl-4 text-white text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all" 
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    </div>
                 </div>

                 <div className="w-48 space-y-1">
                    <label className="text-[10px] text-orange-200 font-bold uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> ضلع
                    </label>
                    <select 
                      value={districtFilter}
                      onChange={e => setDistrictFilter(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2.5 px-3 text-white text-sm outline-none focus:bg-white/20"
                    >
                       <option value="" className="text-slate-800">-- تمام اضلاع --</option>
                       {districts.map(d => <option key={d} value={d} className="text-slate-800">{d}</option>)}
                    </select>
                 </div>

                 <button className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">تلاش</button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-[#7c2d12] text-white text-xs">
                        <th className="px-4 py-3 border-l border-white/10 text-center print:border-black print:text-black print:bg-slate-100">#</th>
                        <th className="px-4 py-3 border-l border-white/10 text-center print:border-black print:text-black print:bg-slate-100">تصویر</th>
                        <th className="px-6 py-3 border-l border-white/10 print:border-black print:text-black print:bg-slate-100">نام</th>
                        <th className="px-6 py-3 border-l border-white/10 print:border-black print:text-black print:bg-slate-100">ولدیت</th>
                        <th className="px-6 py-3 border-l border-white/10 text-center print:border-black print:text-black print:bg-slate-100">شناختی کارڈ</th>
                        <th className="px-6 py-3 border-l border-white/10 text-center print:border-black print:text-black print:bg-slate-100">فون</th>
                        <th className="px-6 py-3 border-l border-white/10 text-center print:border-black print:text-black print:bg-slate-100">موجودہ ضلع</th>
                        <th className="px-4 py-3 text-center print:hidden">عمل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-4 py-4 text-center text-slate-400 font-mono text-xs print:border-black print:text-black">{idx + 1}</td>
                          <td className="px-4 py-2 text-center print:border-black">
                            {s.photo ? (
                              <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 mx-auto print:rounded-none print:w-12 print:h-12" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 mx-auto print:rounded-none print:w-12 print:h-12 print:border print:border-black">No Pic</div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 print:border-black print:text-black">{s.name}</td>
                          <td className="px-6 py-4 text-slate-600 print:border-black print:text-black">{s.fatherName}</td>
                          <td className="px-6 py-4 text-center font-mono text-xs text-slate-500 print:border-black print:text-black">{s.cnic || '---'}</td>
                          <td className="px-6 py-4 text-center font-mono text-xs text-slate-500 print:border-black print:text-black">{s.phone}</td>
                          <td className="px-6 py-4 text-center text-slate-600 print:border-black print:text-black">{s.currentDistrict}</td>
                          <td className="px-4 py-4 print:hidden">
                            <div className="flex justify-center gap-2">
                               <button onClick={() => handleDeleteStaff(s.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 shadow-sm"><Trash2 size={14} /></button>
                               <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 shadow-sm"><Pencil size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStaff.length === 0 && (
                        <tr><td colSpan={7} className="p-16 text-center text-slate-400 font-urdu">کوئی ریکارڈ موجود نہیں ہے۔</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="add"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                   <h2 className="text-xl font-bold font-urdu">نیا استاد شامل کریں</h2>
                   <div className="flex gap-4">
                      <Tab active={true} label="بنیادی معلومات" />
                      <Tab active={false} label="سابقہ ملازمتیں" />
                      <Tab active={false} label="منتخب اسباق" />
                   </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Photo Section */}
                  <div className="flex justify-center mb-8">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserPlus className="w-12 h-12 text-slate-300" />
                        )}
                      </div>
                      
                      <div className="absolute -bottom-2 -right-2 flex gap-2">
                        <button 
                          onClick={() => setIsCameraOpen(true)}
                          className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transition-transform hover:scale-110"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-lg transition-transform hover:scale-110"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="استاد کی آئی ڈی (ID)" value={formData.employeeId} onChange={v => setFormData({...formData, employeeId: v})} placeholder="مثلاً 101" />
                    <InputField label="نام" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="مکمل نام" />
                    <InputField label="ولدیت" value={formData.fatherName} onChange={v => setFormData({...formData, fatherName: v})} placeholder="والد کا نام" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">ازواجی حیثیت</label>
                        <select 
                          value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                        >
                          <option value="">-- منتخب کریں --</option>
                          <option value="single">غیر شادی شدہ</option>
                          <option value="married">شادی شدہ</option>
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="شناختی کارڈ" value={formData.cnic} onChange={v => setFormData({...formData, cnic: v})} placeholder="00000-0000000-0" />
                    <InputField label="تاریخ پیدائش" type="date" value={formData.dob} onChange={v => setFormData({...formData, dob: v})} />
                    <InputField label="فون" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="03XXXXXXXXX" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="موجودہ پتہ" value={formData.currentAddress} onChange={v => setFormData({...formData, currentAddress: v})} />
                    <InputField label="موجودہ ضلع" value={formData.currentDistrict} onChange={v => setFormData({...formData, currentDistrict: v})} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="مستقل پتہ" value={formData.permanentAddress} onChange={v => setFormData({...formData, permanentAddress: v})} />
                    <InputField label="مستقل ضلع" value={formData.permanentDistrict} onChange={v => setFormData({...formData, permanentDistrict: v})} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="دینی تعلیم" value={formData.religiousEdu} onChange={v => setFormData({...formData, religiousEdu: v})} />
                    <InputField label="عصری تعلیم" value={formData.worldlyEdu} onChange={v => setFormData({...formData, worldlyEdu: v})} />
                    <InputField label="اضافی قابلیت" value={formData.additionalEdu} onChange={v => setFormData({...formData, additionalEdu: v})} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="آغاز ملازمت" type="date" value={formData.startDate} onChange={v => setFormData({...formData, startDate: v})} />
                    <InputField label="اختتام ملازمت" type="date" value={formData.endDate} onChange={v => setFormData({...formData, endDate: v})} placeholder="(اختیاری)" />
                  </div>

                  <button 
                    onClick={handleAddStaff}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>محفوظ کریں</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
           @page { margin: 10mm; size: A4 landscape; }
           body * { visibility: hidden; }
           .flex-1.overflow-y-auto { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; padding: 0 !important; }
           .flex-1.overflow-y-auto * { visibility: visible; }
           table { border-collapse: collapse; width: 100%; border: 1px solid black !important; }
           th, td { border: 1px solid black !important; padding: 6px !important; text-align: center; color: black !important; }
           th { background-color: #e2e8f0 !important; font-weight: bold; }
           .print\\:hidden { display: none !important; }
        }
      `}} />

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full relative"
            >
              <button 
                onClick={() => setIsCameraOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="bg-slate-900 aspect-video relative">
                {/* @ts-ignore */}
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
                
                {/* Camera Overlay */}
                <div className="absolute inset-0 border-[6px] border-white/10 m-8 rounded-2xl pointer-events-none" />
              </div>
              
              <div className="p-6 bg-white flex flex-col items-center gap-4">
                <h3 className="font-urdu font-bold text-lg text-slate-800">تصویر کھینچیں</h3>
                <p className="text-sm text-slate-500 font-urdu text-center mb-2">
                  براہ کرم یقینی بنائیں کہ چہرہ واضح طور پر نظر آ رہا ہے
                </p>
                <button 
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30 border-4 border-blue-100"
                >
                  <Camera className="w-7 h-7" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500">{label}</label>
    <input 
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
    />
  </div>
);

const Tab = ({ active, label }: { active: boolean, label: string }) => (
  <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:bg-white/10'}`}>
    {label}
  </button>
);

export default StaffManagement;
