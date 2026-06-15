import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Search, Printer, Wallet, CheckCircle2, 
  Download, FileText, User, Calculator, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE_URL, customFetch } from '../config';

interface PayrollProps {
  onBack: () => void;
}

interface StaffMember {
  id: number;
  name: string;
  designation: string;
  salary: number;
}

interface SalaryRecord {
  id?: number;
  staffId: number;
  staffName: string;
  designation: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollManagement: React.FC<PayrollProps> = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear] = useState(new Date().getFullYear().toString());
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [salaryInputs, setSalaryInputs] = useState<Record<number, { allowances: number, deductions: number }>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [printRecord, setPrintRecord] = useState<SalaryRecord | null>(null);

  const [systemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await customFetch(`${API_BASE_URL}/api/data`);
      const data = await response.json();
      if (data.staff) {
        setStaff(data.staff);
        // Initialize inputs
        const initialInputs: Record<number, { allowances: number, deductions: number }> = {};
        data.staff.forEach((s: StaffMember) => {
          initialInputs[s.id] = { allowances: 0, deductions: 0 };
        });
        setSalaryInputs(initialInputs);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const handleInputChange = (staffId: number, field: 'allowances' | 'deductions', value: string) => {
    const numValue = parseFloat(value) || 0;
    setSalaryInputs(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], [field]: numValue }
    }));
  };

  const calculateNet = (basic: number, allowances: number, deductions: number) => {
    return (basic + allowances) - deductions;
  };

  const handleGenerateSlip = async (s: StaffMember) => {
    const inputs = salaryInputs[s.id] || { allowances: 0, deductions: 0 };
    const netSalary = calculateNet(s.salary, inputs.allowances, inputs.deductions);
    
    const record: SalaryRecord = {
      staffId: s.id,
      staffName: s.name,
      designation: s.designation || 'Teacher',
      month: `${selectedMonth} ${selectedYear}`,
      basicSalary: s.salary,
      allowances: inputs.allowances,
      deductions: inputs.deductions,
      netSalary: netSalary
    };

    try {
      const response = await customFetch(`${API_BASE_URL}/api/save-salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      
      if (response.ok) {
        setPrintRecord(record);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        setTimeout(() => window.print(), 500);
      }
    } catch (err) {
      alert('ریکارڈ محفوظ کرنے میں خرابی۔');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.designation && s.designation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#F4F7F6] font-urdu" dir="rtl">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>تنخواہ کا ریکارڈ محفوظ کر لیا گیا ہے!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-6 shadow-sm print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-800">تنخواہ کا انتظام (Payroll)</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Salary Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-blue-600 font-bold outline-none text-sm"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-blue-300">|</span>
                <span className="text-blue-600 font-bold text-sm">{selectedYear}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="p-8 pb-0 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Total Staff</p>
                 <h3 className="text-2xl font-bold text-slate-800">{staff.length}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users className="w-6 h-6" /></div>
           </div>
           
           <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="استاد کا نام تلاش کریں..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pr-12 pl-4 text-sm outline-none focus:border-blue-500 transition-all"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              </div>
           </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">نام / عہدہ</th>
                <th className="px-6 py-4 text-center">بنیادی تنخواہ</th>
                <th className="px-6 py-4 text-center">الاؤنس (Allowances)</th>
                <th className="px-6 py-4 text-center">کٹوتیاں (Deductions)</th>
                <th className="px-6 py-4 text-center">کل تنخواہ (Net)</th>
                <th className="px-6 py-4 text-center">عمل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((s) => {
                const inputs = salaryInputs[s.id] || { allowances: 0, deductions: 0 };
                const net = calculateNet(s.salary, inputs.allowances, inputs.deductions);
                
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{s.designation || 'Teacher'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">Rs. {s.salary?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={inputs.allowances || ''}
                        onChange={(e) => handleInputChange(s.id, 'allowances', e.target.value)}
                        className="w-24 bg-emerald-50 border border-emerald-100 rounded-lg py-1.5 px-2 text-center text-emerald-700 text-xs outline-none focus:border-emerald-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={inputs.deductions || ''}
                        onChange={(e) => handleInputChange(s.id, 'deductions', e.target.value)}
                        className="w-24 bg-red-50 border border-red-100 rounded-lg py-1.5 px-2 text-center text-red-700 text-xs outline-none focus:border-red-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20">
                         Rs. {net.toLocaleString()}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleGenerateSlip(s)}
                          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center gap-2"
                        >
                          <Printer className="w-3 h-3" />
                          <span>سلپ جنریٹ کریں</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Salary Slip (Hidden in UI, Visible in Print) */}
      <div id="salary-slip" className="hidden print:block bg-white p-8 w-full max-w-[21cm] mx-auto text-black">
         {printRecord && (
           <div className="border-2 border-black p-6">
              {/* Slip Header */}
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                 <div className="flex items-center gap-4">
                    {systemSettings.monogram && <img src={systemSettings.monogram} className="w-16 h-16 object-contain" />}
                    <div className="flex flex-col">
                       <h1 className="text-2xl font-bold font-urdu">{systemSettings.jamiaName}</h1>
                       <p className="text-xs font-bold">Salary Payment Voucher | {printRecord.month}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-bold">تاریخ: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm font-bold">سلپ نمبر: {Math.floor(Math.random() * 10000)}</p>
                 </div>
              </div>

              {/* Staff Info */}
              <div className="grid grid-cols-2 gap-8 mb-8" dir="rtl">
                 <div className="space-y-2">
                    <p className="text-sm font-urdu"><strong>نام ملازم:</strong> {printRecord.staffName}</p>
                    <p className="text-sm font-urdu"><strong>عہدہ:</strong> {printRecord.designation}</p>
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-urdu"><strong>مہینہ:</strong> {printRecord.month}</p>
                 </div>
              </div>

              {/* Salary Break-up Table */}
              <table className="w-full border-collapse border border-black mb-8 text-right" dir="rtl">
                 <thead>
                    <tr className="bg-slate-100">
                       <th className="border border-black p-2 font-urdu">تفصیل (Description)</th>
                       <th className="border border-black p-2 text-center font-urdu">رقم (Amount)</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td className="border border-black p-2 font-urdu">بنیادی تنخواہ (Basic Salary)</td>
                       <td className="border border-black p-2 text-center">Rs. {printRecord.basicSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                       <td className="border border-black p-2 font-urdu text-emerald-600">الاؤنس (Allowances) (+)</td>
                       <td className="border border-black p-2 text-center text-emerald-600">Rs. {printRecord.allowances.toLocaleString()}</td>
                    </tr>
                    <tr>
                       <td className="border border-black p-2 font-urdu text-red-600">کٹوتیاں (Deductions) (-)</td>
                       <td className="border border-black p-2 text-center text-red-600">Rs. {printRecord.deductions.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-200 font-bold">
                       <td className="border border-black p-2 font-urdu text-lg">کل وصولی (Net Salary)</td>
                       <td className="border border-black p-2 text-center text-lg">Rs. {printRecord.netSalary.toLocaleString()}</td>
                    </tr>
                 </tbody>
              </table>

              {/* Footer Signatures */}
              <div className="flex justify-between items-end mt-16 pt-8">
                 <div className="text-center">
                    <div className="w-48 border-t border-black mb-1"></div>
                    <p className="text-xs font-bold font-urdu">دستخط ملازم (Receiver Sign)</p>
                 </div>
                 <div className="text-center">
                    <div className="w-48 border-t border-black mb-1"></div>
                    <p className="text-xs font-bold font-urdu">دستخط ناظم (Admin Signature)</p>
                 </div>
              </div>

              <p className="text-[10px] text-center mt-12 text-slate-400 border-t border-dotted border-slate-300 pt-4">
                یہ کمپیوٹر سے تیار کردہ سلپ ہے، اس پر کسی دستخط کے بغیر بھی قانونی حیثیت حاصل ہے۔
              </p>
           </div>
         )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
           body * { visibility: hidden; }
           #salary-slip, #salary-slip * { visibility: visible; }
           #salary-slip { position: absolute; left: 0; top: 0; width: 100%; }
           .custom-scrollbar { overflow: visible !important; }
        }
      `}} />
    </div>
  );
};

const Users = ({ className }: { className?: string }) => <User className={className} />;

export default PayrollManagement;
