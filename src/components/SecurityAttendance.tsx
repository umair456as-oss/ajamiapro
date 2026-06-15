import React, { useState, useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, Clock, UserCheck, AlertCircle, 
  Upload, FileSpreadsheet, Printer, Trash2, Calendar, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToExcel } from '../excelUtils';

interface AttendanceLog {
  id: string;
  userId: string;
  name: string;
  role: string;
  timestamp: string; 
  status: 'success' | 'error';
  type: string;
  originalData?: any;
}

interface SecurityAttendanceProps {
  onBack: () => void;
}

export default function SecurityAttendance({ onBack }: SecurityAttendanceProps) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [storedLogs, setStoredLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('zk_attendance_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [printType, setPrintType] = useState<'daily' | 'monthly' | 'yearly' | null>(null);
  
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(''); // Default to empty to show all data

  const fileInputRef = useRef<HTMLInputElement>(null);

  const systemSettings = (() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
  })();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("فائل خالی ہے یا فارمیٹ درست نہیں ہے۔");
          setIsProcessing(false);
          return;
        }

        const formattedLogs: AttendanceLog[] = data.map((row: any, index) => {
          const findVal = (keys: string[]) => {
            const key = Object.keys(row).find(k => keys.some(search => k.toLowerCase().includes(search.toLowerCase())));
            return key ? row[key] : '';
          };

          const userId = findVal(['id', 'ac-no', 'user', 'no.']) || `N/A-${index}`;
          const name = findVal(['name', 'نام', 'user name']) || 'نامعلوم';
          const time = findVal(['time', 'date', 'check-in', 'وقت']) || new Date().toISOString();
          const state = findVal(['state', 'status', 'mode']) || 'Success';

          return {
            id: `L-${Date.now()}-${index}`,
            userId: String(userId),
            name: String(name),
            role: 'Staff/Student',
            timestamp: String(time),
            status: 'success',
            type: String(state),
            originalData: row
          };
        });

        setLogs(formattedLogs);
      } catch (error) {
        console.error("Excel Error:", error);
        alert("فائل پڑھنے میں غلطی پیش آئی۔");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleSaveAll = () => {
    if (logs.length === 0) return;
    const existing = JSON.parse(localStorage.getItem('zk_attendance_data') || '[]');
    const unique = [...logs, ...existing].filter((v, i, a) => 
      a.findIndex(t => t.userId === v.userId && t.timestamp === v.timestamp) === i
    );
    
    setStoredLogs(unique);
    localStorage.setItem('zk_attendance_data', JSON.stringify(unique));
    setLogs([]);
    alert("ڈیٹا محفوظ کر لیا گیا ہے۔");
  };

  const handleDelete = (id: string) => {
    const updated = storedLogs.filter(log => log.id !== id);
    setStoredLogs(updated);
    localStorage.setItem('zk_attendance_data', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if(confirm("کیا آپ تمام ریکارڈ ختم کرنا چاہتے ہیں؟")) {
      setStoredLogs([]);
      localStorage.removeItem('zk_attendance_data');
    }
  };

  const allDisplayData = [...logs, ...storedLogs].filter(log => {
      // If no filters are set, show everything
      if (!filterDate && !filterMonth && !filterYear) return true;

      const logTimestampStr = log.timestamp;
      // Many ZKTeco formats use / instead of -. Normalize for native Date parsing if needed.
      const normalizedLogTime = logTimestampStr.replace(/\//g, '-');
      const d = new Date(normalizedLogTime);
      const isInvalidDate = isNaN(d.getTime());

      // HTML Date Input (filterDate) is YYYY-MM-DD
      let matchesDate = true;
      if (filterDate) {
        if (!isInvalidDate) {
          const logDatePart = d.toISOString().split('T')[0];
          matchesDate = logDatePart === filterDate;
        } else {
          // Absolute fallback: check if raw string contains any parts of the chosen date
          // Converting YYYY-MM-DD to DD-MM-YYYY just in case
          const [y, m, day] = filterDate.split('-');
          matchesDate = logTimestampStr.includes(filterDate) || 
                        logTimestampStr.includes(`${day}/${m}/${y}`) || 
                        logTimestampStr.includes(`${day}-${m}-${y}`);
        }
      }
      
      let matchesMonth = true;
      if (filterMonth) {
        if (!isInvalidDate) {
          matchesMonth = (d.getMonth() + 1).toString().padStart(2, '0') === filterMonth;
        } else {
          matchesMonth = logTimestampStr.includes(`-${filterMonth}-`) || logTimestampStr.includes(`/${filterMonth}/`);
        }
      }

      let matchesYear = true;
      if (filterYear) {
        if (!isInvalidDate) {
          matchesYear = d.getFullYear().toString() === filterYear;
        } else {
          matchesYear = logTimestampStr.includes(filterYear);
        }
      }

      return matchesDate && matchesMonth && matchesYear;
  }).sort((a,b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return isNaN(timeB) ? 1 : (isNaN(timeA) ? -1 : timeB - timeA);
  });

  const handlePrint = () => {
    window.print();
    setPrintType(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col print:p-0 print:max-w-none print:bg-white bg-[#0a0f1c]" dir="rtl">
      
      {/* Print Options */}
      {printType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-4 print:hidden">
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <h3 className="text-xl font-bold text-white font-urdu mb-6 text-right px-2 border-r-4 border-blue-500">رپورٹ کا انتخاب کریں</h3>
            <div className="space-y-3">
              {['daily', 'monthly', 'yearly'].map((type) => (
                <button 
                  key={type}
                  onClick={() => { setPrintType(type as any); setTimeout(handlePrint, 100); }}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl hover:bg-blue-600 transition-all font-urdu font-bold border border-slate-700"
                >
                  {type === 'daily' ? 'روزانہ رپورٹ (Daily)' : type === 'monthly' ? 'ماہانہ رپورٹ (Monthly)' : 'سالانہ رپورٹ (Yearly)'}
                </button>
              ))}
            </div>
            <button onClick={() => setPrintType(null)} className="mt-6 text-slate-400 hover:text-white font-urdu text-sm">واپس جائیں</button>
          </div>
        </div>
      )}

      {/* History Side Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#0f172a] shadow-2xl z-[400] transform transition-transform duration-300 border-r border-slate-800 flex flex-col print:hidden ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-white font-bold font-urdu flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> ڈیٹا ہسٹری</h3>
          <button onClick={() => setShowHistory(false)} className="text-slate-400 p-2 hover:bg-slate-800 rounded-lg"><ArrowRight className="rotate-180" /></button>
        </div>
        <div className="p-6 flex-1 overflow-auto space-y-6">
           <div className="p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20">
             <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Base Stats</span>
             <div className="mt-3 flex justify-between text-white border-b border-white/5 pb-2">
               <span className="font-urdu text-sm">کل حاضری ریکارڈ:</span>
               <span className="font-mono font-bold">{storedLogs.length}</span>
             </div>
             <div className="mt-2 flex justify-between text-slate-400 text-[10px]">
               <span className="font-urdu">آخری اپ ڈیٹ:</span>
               <span>{new Date().toLocaleDateString()}</span>
             </div>
           </div>
           
           <button onClick={clearHistory} className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-urdu font-bold">
             <Trash2 className="w-5 h-5" /> تمام ڈیٹا صاف کریں
           </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-[#1e293b] p-6 rounded-[2rem] shadow-2xl border border-slate-700 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700">
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-urdu text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-500" /> سیکیورٹی حاضری
            </h1>
            <p className="text-[10px] text-slate-400 font-urdu mt-1 uppercase tracking-widest">Biometric Attendance Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(true)} className="px-5 py-3 bg-slate-800 text-slate-300 rounded-2xl font-urdu text-sm hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4" /> ہسٹری
          </button>
          <button onClick={() => setPrintType('daily' as any)} className="px-5 py-3 bg-slate-800 text-blue-400 rounded-2xl font-urdu text-sm hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2 font-bold">
             <Printer className="w-4 h-4" /> پرنٹ
          </button>
          
          <button 
            onClick={() => exportToExcel(logs.length ? logs : storedLogs, 'attendance_records')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-5 h-5" />
            ایکسل ایکسپورٹ
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="bg-orange-500 text-white px-5 py-3 rounded-2xl font-urdu font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50">
            {isProcessing ? <Clock className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>ایکسل اپلوڈ</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
         <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <input type="date" className="flex-1 bg-transparent border-none text-white text-sm font-bold outline-none" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
         </div>
         <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700 flex items-center gap-3 font-urdu">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <select className="flex-1 bg-transparent border-none text-white text-sm font-bold outline-none" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
               <option className="bg-slate-900" value="">تمام ماہ</option>
               {['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'].map((m, i) => (
                 <option key={i} className="bg-slate-900" value={(i+1).toString().padStart(2, '0')}>{m}</option>
               ))}
            </select>
         </div>
         <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700 flex items-center gap-3 font-urdu">
            <Calendar className="w-5 h-5 text-amber-500" />
            <input type="number" className="flex-1 bg-transparent border-none text-white text-sm font-bold outline-none" placeholder="2026" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} />
         </div>
         <button onClick={handleSaveAll} disabled={logs.length === 0} className="bg-emerald-600 text-white rounded-2xl font-urdu font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-30 transition-all h-full py-4">
            <UserCheck className="w-6 h-6" /> Save to DB
         </button>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:flex flex-col items-center border-b-4 border-black pb-6 mb-8 w-full">
         <h1 className="text-5xl font-black text-black">{systemSettings.jamiaName}</h1>
         <h2 className="text-3xl font-bold mt-4 text-black">حاضری رپورٹ (بائیومیٹرک سیکیورٹی)</h2>
         <div className="mt-4 text-lg text-black bg-slate-100 px-6 py-2 rounded-full border-2 border-black">
            رپورٹ: {printType === 'monthly' ? 'ماہانہ' : printType === 'yearly' ? 'سالانہ' : 'روزانہ'} — تاریخ: {new Date().toLocaleDateString('en-GB')}
         </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col print:border-none print:shadow-none">
        <div className="p-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between print:hidden">
          <h2 className="font-urdu font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" /> حاضری لاگ
          </h2>
          <div className="flex gap-3">
             {logs.length > 0 && <span className="text-[10px] bg-blue-600 px-3 py-1 rounded-full animate-pulse font-bold">{logs.length} NEW</span>}
             <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-widest">{allDisplayData.length} Records Shown</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar h-full print:overflow-visible">
          {allDisplayData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-20 print:hidden">
              <Upload className="w-20 h-20 opacity-5" />
              <p className="font-urdu text-xl font-bold">کوئی ریکارڈ موجود نہیں</p>
            </div>
          ) : (
            <table className="w-full text-right" dir="rtl">
              <thead className="bg-slate-50 sticky top-0 shadow-sm z-10 print:static print:bg-slate-200">
                <tr className="print:border-2 print:border-black">
                  <th className="px-6 py-5 text-sm font-urdu font-black text-slate-700 print:border-black">شمار</th>
                  <th className="px-6 py-5 text-sm font-urdu font-black text-slate-700 print:border-black">آئی ڈی No.</th>
                  <th className="px-6 py-5 text-sm font-urdu font-black text-slate-700 print:border-black">طالب علم / معلم کا نام</th>
                  <th className="px-6 py-5 text-sm font-urdu font-black text-slate-700 print:border-black">تاریخ و وقت (Scan Time)</th>
                  <th className="px-6 py-5 text-sm font-urdu font-black text-slate-700 print:border-black text-center">حالت</th>
                  <th className="px-6 py-5 text-sm font-urdu font-black text-slate-700 text-center print:hidden">عمل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allDisplayData.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors print:border-black print:border-b-2">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 print:border-black print:text-black">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-900 font-bold print:border-black print:text-black">{log.userId}</td>
                    <td className="px-6 py-4 font-urdu font-bold text-slate-800 print:border-black print:text-black">{log.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 print:border-black print:text-black" dir="ltr">{log.timestamp}</td>
                    <td className="px-6 py-4 text-center print:border-black">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase print:bg-white print:text-black print:border print:border-black">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2 print:hidden">
                       <button onClick={() => handleDelete(log.id)} className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; }
          .print-hidden { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 2px solid black !important; }
          th, td { border: 1px solid black !important; padding: 12px !important; color: black !important; text-align: center !important; }
          th { background: #f3f4f6 !important; font-size: 15px !important; font-weight: 900 !important; }
          td { font-size: 14px !important; }
        }
      `}} />
    </div>
  );
}
