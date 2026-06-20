import React, { useEffect, useState } from 'react';
import { 
  Users, X, Search, Filter, Printer, Edit, Trash2, 
  ChevronLeft, ChevronRight, Download, Upload
} from 'lucide-react';
import PrintAdmissionForm from './PrintAdmissionForm';
import StudentManagement from './StudentManagement';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { addToRecycleBin } from './RecycleBin';
import { syncToServer } from '../syncService';
import * as XLSX from 'xlsx';
import VoiceInput from './VoiceInput';

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
  madrasaDetails?: string;
  photo?: string;
}

interface AllStudentsProps {
  onBack: () => void;
}

export default function AllStudents({ onBack }: AllStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [systemSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      return saved ? JSON.parse(saved) : { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
    } catch (e) {
      return { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
    }
  });

  const [darjas, setDarjas] = useState<string[]>([]);
  const [selectedDarja, setSelectedDarja] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchStudents = () => {
      try {
        const saved = localStorage.getItem('students');
        if (saved) {
          setStudents(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error fetching students from localStorage:', err);
      }
    };

    fetchStudents();
    
    window.addEventListener('storage_updated', fetchStudents);
    
    const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
    const uniqueDarjas = Array.from(new Set(savedGrades.map((g: any) => g.name)));
    if (uniqueDarjas.length > 0) {
      setDarjas(uniqueDarjas as string[]);
    }
    
    return () => window.removeEventListener('storage_updated', fetchStudents);
  }, []);

  useEffect(() => {
    const pendingEditId = localStorage.getItem('pendingEditStudentId');
    const pendingPrintId = localStorage.getItem('pendingPrintStudentId');
    const pendingSearchTerm = localStorage.getItem('pendingSearchTerm');
    
    if (pendingSearchTerm) {
      setSearchTerm(pendingSearchTerm);
      localStorage.removeItem('pendingSearchTerm');
    }
    
    if (pendingEditId && students.length > 0) {
      const found = students.find(s => s.id.toString() === pendingEditId);
      if (found) {
        setEditingStudent(found);
        localStorage.removeItem('pendingEditStudentId');
      }
    } else if (pendingPrintId && students.length > 0) {
      const found = students.find(s => s.id.toString() === pendingPrintId);
      if (found) {
        setPrintingStudent(found);
        localStorage.removeItem('pendingPrintStudentId');
      }
    }
  }, [students]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchTerm || 
      s.name.includes(searchTerm) || 
      s.fatherName.includes(searchTerm) || 
      (s.cnic && s.cnic.includes(searchTerm)) || 
      (s.currentDistrict && s.currentDistrict.includes(searchTerm)) || 
      (s.regNo && s.regNo.includes(searchTerm)) ||
      (s.rollNo && s.rollNo.includes(searchTerm));
    
    const matchesDarja = !selectedDarja || s.grade === selectedDarja;
    
    // Check if student's admission date or a dedicated year field matches
    // Robust year extraction
    let studentYear = '';
    if (s.admissionDate) {
      const yearMatch = s.admissionDate.match(/\d{4}/);
      if (yearMatch) {
        studentYear = yearMatch[0];
      } else {
        const dateObj = new Date(s.admissionDate);
        if (!isNaN(dateObj.getTime())) {
          studentYear = dateObj.getFullYear().toString();
        }
      }
    }
    const matchesYear = !selectedYear || studentYear === selectedYear;
    
    return matchesSearch && matchesDarja && matchesYear;
  }).sort((a, b) => (a.grade || '').localeCompare(b.grade || ''));

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: any) => {
    if (!window.confirm('کیا آپ واقعی اس طالب علم کا ریکارڈ حذف کرنا چاہتے ہیں؟')) {
      return;
    }
    const studentToDelete = students.find(s => String(s.id) === String(id));
    if (studentToDelete) {
      addToRecycleBin('students', studentToDelete, 'name');
    }
    const updated = students.filter(s => String(s.id) !== String(id));
    setStudents(updated);
    localStorage.setItem('students', JSON.stringify(updated));
    await syncToServer();
  };

  if (printingStudent) {
    return <PrintAdmissionForm student={printingStudent} onBack={() => setPrintingStudent(null)} />;
  }

  if (editingStudent) {
    return <StudentManagement 
      editingStudent={editingStudent} 
      onBack={() => { 
        setEditingStudent(null); 
        const saved = JSON.parse(localStorage.getItem('students') || '[]'); 
        setStudents(saved); 
      }} 
    />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden print:overflow-visible print:bg-white print:h-auto">
      {/* Print Only Header */}
      <div className="hidden print:flex flex-col items-center justify-center p-4 border-b-2 border-black mb-4 font-urdu text-center w-full">
         <h1 className="text-3xl font-bold mb-2">{systemSettings.jamiaName}</h1>
         <h2 className="text-xl">فہرست داخل طلبہ (تمام ریکارڈ)</h2>
      </div>

      {/* Header */}
      <div className="bg-[#2563EB] text-white p-6 flex items-center justify-between shadow-lg print:hidden">
        <div className="flex items-center gap-4">
           <button 
            onClick={onBack}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Printer className="w-5 h-5" />
            فہرست پرنٹ کریں
          </button>

          <button 
            onClick={() => {
              if (students.length === 0) {
                alert('ایکسپورٹ کے لیے کوئی ریکارڈ موجود نہیں ہے۔');
                return;
              }
              try {
                // Map data to Urdu headers and exclude the 'photo' field to prevent crashes
                const exportData = students.map(s => ({
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
                exportToExcel(exportData, 'all_students_record');
              } catch (err) {
                console.error('Export error:', err);
                alert('ایکسل ایکسپورٹ میں خرابی پیش آگئی۔');
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-5 h-5" />
            ایکسل ایکسپورٹ
          </button>
          
          <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer">
            <Upload className="w-5 h-5" />
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
                      
                      const existingStr = localStorage.getItem('students') || '[]';
                      const existing = JSON.parse(existingStr);
                      const updated = [...existing];
                      
                      parsedRows.forEach((row: any, idxTemp: number) => {
                        const randomSalt = Math.floor(Math.random() * 1000000);
                        const stId = row.id || `${Date.now()}-${idxTemp}-${randomSalt}`;
                        
                        let fileRegNo = row.regNo || row['رجسٹریشن نمبر'] || row['رجسٹریشن'] || row.id || '';
                        const isGenerated = !fileRegNo;
                        if (!fileRegNo) {
                          fileRegNo = `REG-${stId}`;
                        }

                        const student = {
                          id: stId,
                          name: row.name || row['نام'] || '',
                          fatherName: row.fatherName || row['ولدیت'] || '',
                          regNo: String(fileRegNo),
                          rollNo: String(row.rollNo || row['رول نمبر'] || ''),
                          class: row.class || row.grade || row['درجہ'] || row['کلاس'] || '',
                          grade: row.grade || row.class || row['درجہ'] || row['کلاس'] || '',
                          fatherPhone: row.fatherPhone || row['رابطہ نمبر'] || row.phone || row['فون'] || row.mobile || row['موبائل'] || '',
                          phone: row.phone || row['فون'] || row.fatherPhone || row['رابطہ نمبر'] || row.mobile || row['موبائل'] || '',
                          dob: row.dob || row['تاریخ پیدائش'] || '',
                          address: row.address || row.currentAddress || row['موجودہ پتہ'] || row['پتہ'] || '',
                          currentAddress: row.currentAddress || row.address || row['موجودہ پتہ'] || row['پتہ'] || '',
                          currentDistrict: row.currentDistrict || row.district || row['موجودہ ضلع'] || row['ضلع'] || '',
                          permanentAddress: row.permanentAddress || row['مستقل پتہ'] || '',
                          permanentDistrict: row.permanentDistrict || row['مستقل ضلع'] || '',
                          cnic: row.cnic || String(row['شناختی کارڈ'] || row.idCard || row['شناختی کارڈ نمبر'] || ''),
                          gender: row.gender || row['جنس'] || '',
                          section: row.section || row['سیکشن'] || '',
                          madrasaDetails: row.madrasaDetails || row['سابقہ مدرسہ'] || '',
                          admissionDate: row.admissionDate || row['تاریخ داخلہ'] || new Date().toLocaleDateString()
                        };
                        
                        const matchIdx = !isGenerated ? updated.findIndex(s => String(s.regNo) === String(student.regNo)) : -1;
                        if (matchIdx >= 0) {
                          updated[matchIdx] = { ...updated[matchIdx], ...student };
                        } else {
                          updated.push(student);
                        }
                      });
                      
                      localStorage.setItem('students', JSON.stringify(updated));
                      window.dispatchEvent(new Event('storage_updated'));
                      await syncToServer();
                      alert('فائل کامیابی سے اپلوڈ اور مرج کر دی گئی ہے۔');
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                      alert('امپورٹ کرنے میں خرابی پیش آگئی۔ فائل فارمیٹ درست ہونا ضروری ہے۔');
                    }
                  };
                  reader.readAsArrayBuffer(file);
                }
              }} 
            />
          </label>

          <div className="bg-white/20 px-4 py-2 rounded-lg flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-white/70">داخل طلبہ</span>
            <span className="text-xl font-bold font-urdu">{students.length}</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold font-urdu">تمام طلبہ</h1>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between print:hidden" dir="rtl">
        <div className="flex flex-wrap gap-4 flex-1">
          {/* Detailed Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-[300px]">
            <div className="flex items-center justify-between" dir="rtl">
              <label className="text-[10px] font-urdu text-red-600 font-bold flex items-center gap-1">
                <Search className="w-3 h-3" /> تفصیلی تلاش
              </label>
              <VoiceInput onTranscript={(text) => setSearchTerm(text)} />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="نام ، والیت ، رجسٹریشن نمبر ، شناختی کارڈ ، ضلع"
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded text-xs font-urdu text-right outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-0 top-0 h-full px-3 bg-slate-800 text-white flex items-center rounded-l">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Darja Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-urdu text-emerald-600 font-bold flex items-center gap-1">
              <Filter className="w-3 h-3" /> درجہ (Class)
            </label>
            <div className="flex">
               <select 
                value={selectedDarja}
                onChange={(e) => {
                  setSelectedDarja(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-100 border border-slate-200 rounded text-xs font-urdu outline-none focus:ring-1 focus:ring-emerald-500"
               >
                <option value="">-- تمام درجات --</option>
                {darjas.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* District Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-urdu text-blue-600 font-bold flex items-center gap-1">
              <Filter className="w-3 h-3" /> ضلع
            </label>
            <div className="flex">
               <select className="px-4 py-2 bg-slate-100 border border-slate-200 rounded text-xs font-urdu outline-none">
                <option>-- تمام اضلاع --</option>
              </select>
            </div>
          </div>

          {/* Year Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-urdu text-amber-600 font-bold flex items-center gap-1">
              <Filter className="w-3 h-3" /> تعلیمی سال (Year)
            </label>
            <div className="flex">
               <select 
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-100 border border-slate-200 rounded text-xs font-urdu outline-none focus:ring-1 focus:ring-amber-500"
               >
                <option value="">-- تمام سال --</option>
                {Array.from({ length: 2060 - 2020 + 1 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Size */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-urdu text-green-600 font-bold flex items-center gap-1">
              <Download className="w-3 h-3" /> فی صفحہ
            </label>
            <div className="flex">
              <select 
                value={pageSize} 
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-16 px-2 py-2 bg-slate-100 border border-slate-200 rounded text-xs text-center font-bold outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>
              <div className="px-2 py-2 bg-slate-200 text-xs font-urdu border border-l-0 border-slate-200 flex items-center">طلبہ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar print:p-0 print:overflow-visible">
        <div className="min-w-[1000px] bg-white rounded-lg shadow border border-slate-200 print:shadow-none print:border-none print:w-full print:min-w-0">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-[#800000] text-white">
              <tr>
                <th className="px-2 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">شمار</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">تصویر</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">کلاس</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">نام</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">والدیت</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">شناختی کارڈ</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">فون</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">موجودہ ضلع</th>
                <th className="px-4 py-3 text-xs font-urdu border-l border-white/10 print:border-black print:text-black print:bg-slate-100">رجسٹریشن</th>
                <th className="px-4 py-3 text-xs font-urdu print:hidden">عمل</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-20 text-center text-slate-400 font-urdu print:border-black print:text-black">کوئی ریکارڈ موجود نہیں ہے۔</td>
                </tr>
              ) : (
                paginatedStudents.map((student, index) => (
                  <tr key={student.id || index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors print:border-b-black">
                    <td className="px-2 py-2 text-center text-slate-500 font-sans print:border-black print:text-black">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-2 text-center print:border-black">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 mx-auto print:rounded-none print:w-12 print:h-12" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 mx-auto print:rounded-none print:w-12 print:h-12 print:border print:border-black">No Pic</div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-urdu text-slate-600 print:border-black print:text-black">{student.grade}</td>
                    <td className="px-4 py-2 font-urdu font-bold text-slate-900 print:border-black print:text-black">{student.name}</td>
                    <td className="px-4 py-2 font-urdu text-slate-700 print:border-black print:text-black">{student.fatherName}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono tracking-tighter print:border-black print:text-black">{student.cnic}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono print:border-black print:text-black">{student.phone}</td>
                    <td className="px-4 py-2 font-urdu text-slate-600 print:border-black print:text-black">{student.currentDistrict}</td>
                    <td className="px-4 py-2 font-mono text-slate-600 print:border-black print:text-black">{student.regNo || student.rollNo}</td>
                    <td className="px-4 py-2 print:hidden">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setPrintingStudent(student)}
                          className="p-1.5 bg-sky-400 text-white rounded hover:bg-sky-500 transition-colors"><Printer className="w-3.5 h-3.5" /></button>
                        <button 
                          onClick={() => setEditingStudent(student)}
                          className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Pagination Status */}
      <div className="bg-[#1e293b] text-white/50 px-8 py-3 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase print:hidden">
        <div className="flex gap-4">
          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="flex items-center gap-2 hover:text-white disabled:opacity-50"><ChevronLeft className="w-3 h-3" /> Previous</button>
          <span className="text-white">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 hover:text-white disabled:opacity-50">Next <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="font-urdu">
          کل انتخاب: {filteredStudents.length} (مجموعی طلبہ: {students.length})
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
           @page { margin: 10mm; size: A4 portrait; }
           table { border-collapse: collapse; width: 100%; border: 1px solid black !important; }
           th, td { border: 1px solid black !important; padding: 6px !important; text-align: center; }
           th { background-color: #e2e8f0 !important; font-weight: bold; }
        }
      `}} />
    </div>
  );
}
