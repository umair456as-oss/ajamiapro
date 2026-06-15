import React, { useState, useEffect } from 'react';
import { Printer, ArrowRight, Download, Search, Calendar, Users } from 'lucide-react';

interface DailyAttendanceSheetProps {
  onBack: () => void;
}

export default function DailyAttendanceSheet({ onBack }: DailyAttendanceSheetProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedTime, setSelectedTime] = useState('صبح');
  
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [jamiaName, setJamiaName] = useState('جامعہ عربیہ سراج العلوم');

  useEffect(() => {
    // Load classes
    const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
    setClasses(savedGrades);
    
    // Load students
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(savedStudents);

    // Load staff
    const savedStaff = JSON.parse(localStorage.getItem('staff') || '[]');
    setStaff(savedStaff);

    // Load books
    const savedBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    setBooks(savedBooks);

    // Load settings
    const settings = JSON.parse(localStorage.getItem('system_settings') || '{}');
    if (settings.jamiaName) setJamiaName(settings.jamiaName);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(s => s.grade === selectedClass);
      setFilteredStudents(filtered);

      const classBooks = books.filter(b => b.grade === selectedClass);
      setFilteredBooks(classBooks);
    } else {
      setFilteredStudents([]);
      setFilteredBooks([]);
    }
  }, [selectedClass, students, books]);

  const monthsUrdu = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ];

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const currentDays = daysInMonth(selectedMonth, selectedYear);
  const daysArray = Array.from({ length: currentDays }, (_, i) => i + 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-urdu">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          .no-print { display: none !important; }
          body { background: white; padding: 0; margin: 0; }
          .print-container { 
            display: block !important; 
            width: 100%;
            background: white;
          }
          .attendance-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .attendance-table th, .attendance-table td {
            border: 1px solid black !important;
            padding: 2px;
            text-align: center;
          }
          .attendance-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
          .header-print {
            text-align: center;
            margin-bottom: 10px;
          }
          .header-print h1 { font-size: 20px; margin: 0; }
          .header-print p { font-size: 12px; margin: 5px 0; }
        }
      `}} />

      {/* Control Panel */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-900 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>واپس جائیں</span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-2" />
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">درجہ منتخب کریں</option>
              {classes.map(c => <option key={c.id} value={c.name}>{c.name} {c.section ? `(${c.section})` : ''}</option>)}
            </select>

            <select 
              value={selectedTeacher} 
              onChange={e => setSelectedTeacher(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">استاد منتخب کریں</option>
              {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            <select 
              value={selectedBook} 
              onChange={e => setSelectedBook(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">کتاب منتخب کریں</option>
              {filteredBooks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              {filteredBooks.length === 0 && selectedClass && <option disabled>کوئی کتاب نہیں ملی</option>}
            </select>

            <select 
              value={selectedTime} 
              onChange={e => setSelectedTime(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="صبح">صبح</option>
              <option value="دوپہر">دوپہر</option>
              <option value="شام">شام</option>
              <option value="مغرب">مغرب</option>
              <option value="عشاء">عشاء</option>
            </select>

            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthsUrdu.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>

            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            disabled={!selectedClass}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${selectedClass ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Printer className="w-4 h-4" />
            <span>پرنٹ کریں</span>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="max-w-[1200px] mx-auto p-8 no-print">
        {!selectedClass ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">یومیہ حاضری شیٹ</h3>
            <p className="text-slate-500">براہ کرم حاضری شیٹ دیکھنے کے لیے درجہ منتخب کریں</p>
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 p-8" dir="rtl">
            {/* Header Preview */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{jamiaName}</h1>
              <h2 className="text-xl font-bold text-slate-800 mb-3 underline decoration-double">یومیہ حاضری رجسٹر برائے طلبہ</h2>
              
              <div className="grid grid-cols-4 gap-4 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2"><span>درجہ:</span> <span className="text-blue-700">{selectedClass || '_______'}</span></div>
                <div className="flex items-center gap-2"><span>استاد:</span> <span className="text-blue-700">{selectedTeacher || '_______'}</span></div>
                <div className="flex items-center gap-2"><span>کتاب:</span> <span className="text-blue-700">{selectedBook || '_______'}</span></div>
                <div className="flex items-center gap-2"><span>وقت/گھنٹہ:</span> <span className="text-blue-700">{selectedTime || '_______'}</span></div>
              </div>
              
              <div className="flex justify-center gap-12 mt-3 text-sm font-bold text-slate-600">
                <span>ماہ: {monthsUrdu[selectedMonth-1]}</span>
                <span>تعلیمی سال: {selectedYear}ء</span>
              </div>
            </div>

            {/* Table Preview */}
            <div className="overflow-x-auto border border-slate-900">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-900 p-1 w-10 text-right pr-2">نمبر شمار</th>
                    <th className="border border-slate-900 p-1 w-12">رول نمبر</th>
                    <th className="border border-slate-900 p-1 min-w-[120px]">نام طالب علم</th>
                    <th className="border border-slate-900 p-1 min-w-[120px]">ولدیت</th>
                    {daysArray.map(d => (
                      <th key={d} className="border border-slate-900 p-1 w-6">{d}</th>
                    ))}
                    <th className="border border-slate-900 p-1 w-10 bg-green-50">حاضر</th>
                    <th className="border border-slate-900 p-1 w-10 bg-red-50">غیر</th>
                    <th className="border border-slate-900 p-1 w-10 bg-amber-50">رخصت</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-900 p-1 text-right pr-2 font-sans">{idx + 1}</td>
                      <td className="border border-slate-900 p-1 text-center font-mono">{student.rollNo || '---'}</td>
                      <td className="border border-slate-900 p-1 pr-2 text-right font-bold">{student.name}</td>
                      <td className="border border-slate-900 p-1 pr-2 text-right">{student.fatherName}</td>
                      {daysArray.map(d => (
                        <td key={d} className="border border-slate-900 p-1"></td>
                      ))}
                      <td className="border border-slate-900 p-1 bg-green-50/30"></td>
                      <td className="border border-slate-900 p-1 bg-red-50/30"></td>
                      <td className="border border-slate-900 p-1 bg-amber-50/30"></td>
                    </tr>
                  ))}
                  {/* Empty rows if few students */}
                  {filteredStudents.length < 20 && Array.from({ length: 20 - filteredStudents.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="border border-slate-900 p-1 h-8"></td>
                      <td className="border border-slate-900 p-1 h-8"></td>
                      <td className="border border-slate-900 p-1 h-8"></td>
                      <td className="border border-slate-900 p-1 h-8"></td>
                      {daysArray.map(d => (
                        <td key={d} className="border border-slate-900 p-1"></td>
                      ))}
                      <td className="border border-slate-900 p-1"></td>
                      <td className="border border-slate-900 p-1"></td>
                      <td className="border border-slate-900 p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-between px-4">
              <div className="text-center w-64 border-t border-slate-900 pt-2 font-bold">دستخط معلم</div>
              <div className="text-center w-64 border-t border-slate-900 pt-2 font-bold">دستخط ناظم تعلیمی</div>
              <div className="text-center w-64 border-t border-slate-900 pt-2 font-bold">مہر ادارہ</div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden print-container" dir="rtl">
        <div className="header-print">
          <h1 style={{fontSize: '24px', marginBottom: '5px'}}>{jamiaName}</h1>
          <h2 style={{fontSize: '18px', marginBottom: '10px', textDecoration: 'underline'}}>یومیہ حاضری رجسٹر</h2>
          
          <table style={{width: '100%', marginBottom: '10px', fontSize: '12px', border: 'none'}}>
            <tr style={{border: 'none'}}>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}}><strong>درجہ:</strong> {selectedClass}</td>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}}><strong>استاد:</strong> {selectedTeacher}</td>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}}><strong>کتاب:</strong> {selectedBook}</td>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}}><strong>وقت:</strong> {selectedTime}</td>
            </tr>
            <tr style={{border: 'none'}}>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}}><strong>ماہ:</strong> {monthsUrdu[selectedMonth-1]}</td>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}}><strong>سال:</strong> {selectedYear}ء</td>
              <td style={{border: 'none', textAlign: 'right', padding: '2px'}} colSpan={2}><strong>کل طلبہ:</strong> {filteredStudents.length}</td>
            </tr>
          </table>
        </div>

        <table className="attendance-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'right', paddingRight: '5px' }}>نمبر</th>
              <th>رول نمبر</th>
              <th>نام طالب علم</th>
              <th>ولدیت</th>
              {daysArray.map(d => <th key={d} style={{ width: '18px' }}>{d}</th>)}
              <th style={{ width: '25px' }}>حاضر</th>
              <th style={{ width: '25px' }}>غیر</th>
              <th style={{ width: '25px' }}>رخصت</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id}>
                <td style={{ textAlign: 'right', paddingRight: '5px' }}>{idx + 1}</td>
                <td style={{ textAlign: 'center' }}>{student.rollNo || '---'}</td>
                <td style={{ textAlign: 'right', paddingRight: '5px', fontWeight: 'bold' }}>{student.name}</td>
                <td style={{ textAlign: 'right', paddingRight: '5px' }}>{student.fatherName}</td>
                {daysArray.map(d => <td key={d}></td>)}
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
            {/* Pad with empty rows to fill page if needed */}
            {filteredStudents.length < 25 && Array.from({ length: 25 - filteredStudents.length }).map((_, i) => (
              <tr key={`print-empty-${i}`}>
                <td style={{ height: '22px' }}></td>
                <td></td>
                <td></td>
                <td></td>
                {daysArray.map(d => <td key={d}></td>)}
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '200px', borderTop: '1px solid black', textAlign: 'center', paddingTop: '5px', fontWeight: 'bold' }}>دستخط معلم</div>
          <div style={{ width: '200px', borderTop: '1px solid black', textAlign: 'center', paddingTop: '5px', fontWeight: 'bold' }}>دستخط ناظم تعلیمی</div>
          <div style={{ width: '200px', borderTop: '1px solid black', textAlign: 'center', paddingTop: '5px', fontWeight: 'bold' }}>مہر ادارہ</div>
        </div>
      </div>
    </div>
  );
}
