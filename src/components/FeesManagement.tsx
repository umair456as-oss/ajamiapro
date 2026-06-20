import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Search, Printer, CreditCard, CheckCircle2, 
  Wallet, User, Calendar, Receipt, Plus, Minus, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';

interface FeesManagementProps {
  onBack: () => void;
}

interface Student {
  id: number;
  name: string;
  regNo: string;
  rollNo: string;
  grade: string;
  section: string;
}

interface FeeTransaction {
  id?: number;
  studentId: number;
  studentName: string;
  regNo: string;
  month: string;
  admissionFee: number;
  monthlyFee: number;
  booksFee: number;
  otherCharges: number;
  arrears: number;
  discount: number;
  totalPaid: number;
  paymentDate?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FeesManagement: React.FC<FeesManagementProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dailyTotal, setDailyTotal] = useState({ dailyTotal: 0, count: 0 });
  const [printData, setPrintData] = useState<FeeTransaction | null>(null);

  const [feeForm, setFeeForm] = useState({
    admissionFee: 0,
    monthlyFee: 0,
    booksFee: 0,
    otherCharges: 0,
    arrears: 0,
    discount: 0
  });

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
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

  useEffect(() => {
    const fetchStudents = () => {
      try {
        const saved = localStorage.getItem('students');
        if (saved) {
          setAllStudents(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error fetching students for fees:', err);
      }
    };

    fetchStudents();
    window.addEventListener('storage_updated', fetchStudents);
    return () => window.removeEventListener('storage_updated', fetchStudents);
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setStudents([]);
      return;
    }
    const results = allStudents.filter((s: Student) => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.regNo?.includes(searchTerm) || 
      s.rollNo?.includes(searchTerm)
    );
    setStudents(results);
  };

  const selectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setStudents([]);
    setSearchTerm('');
    
    // Fetch Arrears from history from local storage
    try {
      const savedFees = JSON.parse(localStorage.getItem('saved_fees') || '[]');
      const history = savedFees.filter((f: any) => f.studentId === student.id || f.regNo === student.regNo);
      // Logic: if they have history, maybe calculate pending? 
      // For now, let's just let the user enter arrears manually or fetch last unpaid.
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotal = () => {
    const { admissionFee, monthlyFee, booksFee, otherCharges, arrears, discount } = feeForm;
    return (admissionFee + monthlyFee + booksFee + otherCharges + arrears) - discount;
  };

  const handleSaveAndPrint = async () => {
    if (!selectedStudent) return;
    const total = calculateTotal();
    
    const transaction: FeeTransaction = {
      id: Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      regNo: selectedStudent.regNo,
      month: selectedMonth,
      ...feeForm,
      totalPaid: total,
      paymentDate: new Date().toISOString()
    };

    const existingFees = JSON.parse(localStorage.getItem('saved_fees') || '[]');
    const updatedFees = [...existingFees, transaction];
    
    // Save to Firestore and LocalStorage
    const success = await updateCentralKey('saved_fees', updatedFees);
    
    if (success) {
      setPrintData(transaction);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setTimeout(() => window.print(), 500);
    } else {
      alert('فیس محفوظ کرنے میں خرابی۔');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7F6] font-urdu" dir="rtl">
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
            <span>فیس کامیابی سے محفوظ کر لی گئی ہے!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-6 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all">
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-800">فیس مینجمنٹ (Fee System)</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Student Finance Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Daily Collection</p>
                <h3 className="text-xl font-bold text-emerald-600">Rs. {dailyTotal.dailyTotal?.toLocaleString() || 0}</h3>
             </div>
             <div className="h-10 w-px bg-slate-100" />
             <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <select 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-blue-600 font-bold outline-none text-sm"
                >
                   {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar print:hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Search & Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Search className="w-4 h-4 text-blue-600" /> طالب علم کی تلاش
               </h3>
               <div className="relative mb-4">
                  <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    placeholder="نام یا رجسٹریشن نمبر..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
               </div>
               <button onClick={handleSearch} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">تلاش کریں</button>

               {students.length > 0 && (
                 <div className="mt-4 border-t border-slate-50 pt-4 space-y-2 max-h-60 overflow-y-auto">
                    {students.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => selectStudent(s)}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all flex items-center gap-3"
                      >
                         <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><User className="w-4 h-4" /></div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{s.name}</span>
                            <span className="text-[10px] text-slate-400">رول نمبر: {s.rollNo} | درجہ: {s.grade}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {selectedStudent && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-blue-600 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-10"><CreditCard className="w-32 h-32" /></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20 shadow-lg font-bold text-xl">
                        {selectedStudent.name[0]}
                      </div>
                      <div className="flex flex-col">
                         <h4 className="text-lg font-bold">{selectedStudent.name}</h4>
                         <span className="text-xs text-white/70">رجسٹریشن: {selectedStudent.regNo}</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-xs font-urdu">
                      <div className="bg-white/10 p-3 rounded-xl">
                         <p className="text-white/50 mb-1">درجہ (Class)</p>
                         <p className="font-bold">{selectedStudent.grade}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl">
                         <p className="text-white/50 mb-1">سیکشن (Section)</p>
                         <p className="font-bold">{selectedStudent.section}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Fee Entry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                 <div className="w-2 h-8 bg-blue-600 rounded-full" />
                 فیس وصولی فارم (Fee Entry)
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FeeInput label="ماہانہ فیس (Monthly Fee)" icon={Calendar} value={feeForm.monthlyFee} onChange={v => setFeeForm({...feeForm, monthlyFee: v})} />
                  <FeeInput label="داخلہ فیس (Admission Fee)" icon={Plus} value={feeForm.admissionFee} onChange={v => setFeeForm({...feeForm, admissionFee: v})} />
                  <FeeInput label="کتب فیس (Books Fee)" icon={Receipt} value={feeForm.booksFee} onChange={v => setFeeForm({...feeForm, booksFee: v})} />
                  <FeeInput label="متفرق چارجز (Other Charges)" icon={Plus} value={feeForm.otherCharges} onChange={v => setFeeForm({...feeForm, otherCharges: v})} />
                  <FeeInput label="پچھلی بقایا جات (Arrears)" icon={History} value={feeForm.arrears} onChange={v => setFeeForm({...feeForm, arrears: v})} color="text-red-500" />
                  <FeeInput label="رعایت (Discount)" icon={Minus} value={feeForm.discount} onChange={v => setFeeForm({...feeForm, discount: v})} color="text-emerald-600" />
               </div>

               <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Payable Amount</span>
                     <h2 className="text-4xl font-bold text-slate-800">Rs. {calculateTotal().toLocaleString()}</h2>
                  </div>
                  <button 
                    onClick={handleSaveAndPrint}
                    disabled={!selectedStudent}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none active:scale-95"
                  >
                    <Printer className="w-6 h-6" />
                    <span>محفوظ کریں اور پرنٹ نکالیں</span>
                  </button>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Professional Receipt Print View */}
      <div id="fee-receipt" className="hidden print:block bg-white w-full max-w-[21cm] mx-auto p-4 text-black font-urdu">
         {printData && selectedStudent && (
           <div className="space-y-12">
             {/* Copy 1: Student Copy */}
             <ReceiptLayout type="طالب علم کاپی (Student Copy)" data={printData} student={selectedStudent} settings={systemSettings} />
             
             {/* Dotted Line for cutting */}
             <div className="border-t-2 border-dashed border-slate-300 my-8" />

             {/* Copy 2: Madrasa Copy */}
             <ReceiptLayout type="دفتر کاپی (Office Copy)" data={printData} student={selectedStudent} settings={systemSettings} />
           </div>
         )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
           body * { visibility: hidden; }
           #fee-receipt, #fee-receipt * { visibility: visible; }
           #fee-receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

const FeeInput = ({ label, icon: Icon, value, onChange, color = "text-slate-700" }: any) => (
  <div className="space-y-3">
    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
       <Icon className="w-4 h-4 text-blue-600" /> {label}
    </label>
    <div className="relative">
       <input 
         type="number"
         value={value || ''}
         onChange={e => onChange(Number(e.target.value))}
         className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-lg font-bold outline-none focus:border-blue-500 transition-all ${color}`}
         placeholder="0"
       />
       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">Rs.</span>
    </div>
  </div>
);

const ReceiptLayout = ({ type, data, student, settings }: any) => (
  <div className="border-2 border-black p-6 relative">
     <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-white px-4 font-bold text-xs border-x-2 border-black">{type}</div>
     
     <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
           {settings.monogram && <img src={settings.monogram} className="w-16 h-16 object-contain" />}
           <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{settings.jamiaName}</h1>
              <p className="text-[10px] font-bold">فیس وصولی رسید (Fee Collection Receipt)</p>
           </div>
        </div>
        <div className="text-right space-y-1">
           <p className="text-xs"><strong>تاریخ:</strong> {new Date().toLocaleDateString()}</p>
           <p className="text-xs"><strong>رسید نمبر:</strong> {Math.floor(Math.random() * 100000)}</p>
        </div>
     </div>

     <div className="grid grid-cols-2 gap-4 mb-6 border-y-2 border-black py-4">
        <div className="space-y-1">
           <p className="text-sm"><strong>نام طالب علم:</strong> {student.name}</p>
           <p className="text-sm"><strong>رجسٹریشن نمبر:</strong> {student.regNo}</p>
        </div>
        <div className="space-y-1 text-left">
           <p className="text-sm"><strong>درجہ:</strong> {student.grade}</p>
           <p className="text-sm"><strong>ماہ:</strong> {data.month}</p>
        </div>
     </div>

     <table className="w-full border-collapse border border-black mb-6 text-right">
        <thead>
           <tr className="bg-slate-100">
              <th className="border border-black p-2 text-sm">تفصیل (Details)</th>
              <th className="border border-black p-2 text-center text-sm">رقم (Amount)</th>
           </tr>
        </thead>
        <tbody className="text-sm">
           {data.admissionFee > 0 && <tr><td className="border border-black p-2">داخلہ فیس (Admission Fee)</td><td className="border border-black p-2 text-center">Rs. {data.admissionFee}</td></tr>}
           {data.monthlyFee > 0 && <tr><td className="border border-black p-2">ماہانہ فیس (Monthly Fee)</td><td className="border border-black p-2 text-center">Rs. {data.monthlyFee}</td></tr>}
           {data.booksFee > 0 && <tr><td className="border border-black p-2">کتب فیس (Books Fee)</td><td className="border border-black p-2 text-center">Rs. {data.booksFee}</td></tr>}
           {data.otherCharges > 0 && <tr><td className="border border-black p-2">متفرق چارجز (Other)</td><td className="border border-black p-2 text-center">Rs. {data.otherCharges}</td></tr>}
           {data.arrears > 0 && <tr><td className="border border-black p-2">بقایا جات (Arrears)</td><td className="border border-black p-2 text-center">Rs. {data.arrears}</td></tr>}
           {data.discount > 0 && <tr className="text-emerald-600"><td className="border border-black p-2">رعایت (Discount)</td><td className="border border-black p-2 text-center">(-) Rs. {data.discount}</td></tr>}
           <tr className="font-bold text-lg bg-slate-50">
              <td className="border border-black p-2">کل وصولی (Total Paid)</td>
              <td className="border border-black p-2 text-center">Rs. {data.totalPaid.toLocaleString()}</td>
           </tr>
        </tbody>
     </table>

     <div className="flex justify-between items-end mt-12">
        <div className="text-center">
           <div className="w-32 border-t border-black mb-1"></div>
           <p className="text-[10px] font-bold">دستخط کیشئر</p>
        </div>
        <p className="text-[8px] text-slate-400 italic">This is a computer generated receipt</p>
        <div className="text-center">
           <div className="w-32 border-t border-black mb-1"></div>
           <p className="text-[10px] font-bold">دستخط ناظم اعلیٰ</p>
        </div>
     </div>
  </div>
);

export default FeesManagement;
