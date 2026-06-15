import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, X, Trash2, Pencil, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManualAttendanceProps {
  onBack: () => void;
}

const ManualAttendance: React.FC<ManualAttendanceProps> = ({ onBack }) => {
  const [attendanceType, setAttendanceType] = useState<'student' | 'teacher'>('student');
  
  // Student State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasSearched, setHasSearched] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [studentAttendanceData, setStudentAttendanceData] = useState<Record<string, string>>({});
  
  // Teacher State
  const [teacherName, setTeacherName] = useState('');
  const [teacherClass, setTeacherClass] = useState('');
  const [teacherHour, setTeacherHour] = useState('');
  const [teacherStatus, setTeacherStatus] = useState('P');
  const [teacherDate, setTeacherDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherRecords, setTeacherRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem('teacherAttendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSaved, setIsSaved] = useState(false);

  // Shared Sources
  const [classes, setClasses] = useState<string[]>([]);
  const [hours, setHours] = useState<string[]>([]);
  const [teachersList, setTeachersList] = useState<string[]>(['صابر اللہ', 'شفیق الرحمن', 'ذیشان خان', 'ابوبکر']);

  React.useEffect(() => {
    // Load student data
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(savedStudents);

    // Load settings
    const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    const gradeNames = savedGrades.map((g: any) => g.name);
    setClasses(gradeNames.length > 0 ? gradeNames : ['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'سادسہ', 'سابعہ', 'دورہ حدیث']);

    const savedHours = JSON.parse(localStorage.getItem('hours') || '[]');
    setHours(savedHours.length > 0 ? savedHours : ['صبح', 'دوپہر', 'شام', 'مغرب', 'عشاء']);
    
    // Potential: Load teachers from staff module if added later
    const savedStaff = JSON.parse(localStorage.getItem('staff') || '[]');
    if (savedStaff.length > 0) {
      setTeachersList(savedStaff.map((s: any) => s.name));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('teacherAttendance', JSON.stringify(teacherRecords));
  }, [teacherRecords]);

  // Student Handlers
  const handleStudentSearch = () => {
    if (!selectedClass || !selectedHour) return;
    const filtered = students.filter(s => s.grade === selectedClass);
    setFilteredStudents(filtered);
    const initialData: Record<string, string> = {};
    filtered.forEach(s => { initialData[s.id] = 'P'; });
    setStudentAttendanceData(initialData);
    setHasSearched(true);
    setIsSaved(false);
  };

  const handleStudentAttendChange = (studentId: string, status: string) => {
    setStudentAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newData = { ...studentAttendanceData };
    filteredStudents.forEach(s => { newData[s.id] = 'P'; });
    setStudentAttendanceData(newData);
  };

  const handleSaveStudentAttendance = () => {
    const record = {
      id: Date.now(),
      type: 'student',
      class: selectedClass,
      hour: selectedHour,
      date: selectedDate,
      data: studentAttendanceData
    };
    const existing = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    localStorage.setItem('attendanceRecords', JSON.stringify([...existing, record]));
    triggerSuccess();
  };

  // Teacher Handlers
  const handleSaveTeacherAttendance = () => {
    if (!teacherName || !teacherStatus) return;
    const record = {
      id: Date.now(),
      name: teacherName,
      class: teacherClass,
      hour: teacherHour,
      date: teacherDate,
      status: teacherStatus,
      arrival: teacherStatus === 'P' ? new Date().toLocaleTimeString() : 'غائب',
      departure: teacherStatus === 'P' ? 'منتظر' : 'غائب'
    };
    setTeacherRecords([record, ...teacherRecords]);
    setTeacherName('');
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const deleteTeacherRecord = (id: number) => {
    setTeacherRecords(teacherRecords.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-urdu" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          {attendanceType === 'student' ? 'طلبہ کی حاضری' : 'اساتذہ کی حاضری'}
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setAttendanceType('student')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${attendanceType === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
            >شاگرد</button>
            <button 
              onClick={() => setAttendanceType('teacher')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${attendanceType === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
            >استاد</button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          {isSaved && (
            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold">حاضری محفوظ کر لی گئی ہے!</span>
          )}
          <button 
            onClick={onBack}
            className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-600 shadow-md"
          >
            <X className="w-4 h-4" />
            <span>بند کریں</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <AnimatePresence mode="wait">
          {attendanceType === 'student' ? (
            <motion.div 
              key="students-view"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-blue-600 px-6 py-3 text-white font-bold text-sm">حاضری درج کریں (طلبہ)</div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end border-b border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">کلاس منتخب کریں</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                      <option value="">-- منتخب کریں --</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">گھنٹہ منتخب کریں</label>
                    <select value={selectedHour} onChange={e => setSelectedHour(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                      <option value="">-- منتخب کریں --</option>
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">تاریخ</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-mono" />
                  </div>
                  <button onClick={handleStudentSearch} className="bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/10">
                    <Search className="w-4 h-4" /> تلاش کریں
                  </button>
                </div>

                <div className="p-8">
                  {!hasSearched ? (
                    <div className="bg-blue-50 text-blue-600 p-8 rounded-2xl text-center border border-blue-100">
                      براہ کرم اوپر دی گئی فیلڈز سے کلاس اور گھنٹہ منتخب کریں
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-xl flex items-center justify-between">
                         <div className="flex gap-4 text-xs font-bold text-cyan-700">
                            <span>کلاس: {selectedClass}</span>
                            <span>گھنٹہ: {selectedHour}</span>
                            <span>تاریخ: {selectedDate}</span>
                         </div>
                         <button className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold">مزید طلبہ شامل کریں</button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold">
                              <th className="px-4 py-4 w-12 text-center">#</th>
                              <th className="px-6 py-4">نام</th>
                              <th className="px-6 py-4">رجسٹریشن نمبر</th>
                              <th className="px-6 py-4 text-center">حاضری</th>
                              <th className="px-4 py-4 text-center">عمل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((s, idx) => (
                              <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-4 text-center text-slate-400 text-xs">{idx + 1}</td>
                                <td className="px-6 py-4 font-bold text-slate-700">{s.name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{s.regNo || '---'}</td>
                                <td className="px-6 py-4">
                                  <div className="flex justify-center gap-4">
                                    <AttendToggle status="P" label="حاضر" active={studentAttendanceData[s.id] === 'P'} onClick={() => handleStudentAttendChange(s.id, 'P')} color="text-green-600" />
                                    <AttendToggle status="A" label="غیر حاضر" active={studentAttendanceData[s.id] === 'A'} onClick={() => handleStudentAttendChange(s.id, 'A')} color="text-red-600" />
                                    <AttendToggle status="L" label="رخصت" active={studentAttendanceData[s.id] === 'L'} onClick={() => handleStudentAttendChange(s.id, 'L')} color="text-amber-600" />
                                    <AttendToggle status="S" label="بیماری" active={studentAttendanceData[s.id] === 'S'} onClick={() => handleStudentAttendChange(s.id, 'S')} color="text-blue-600" />
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <button onClick={markAllPresent} className="bg-slate-600 text-white px-6 py-2 rounded-xl text-xs font-bold">سب کو حاضر کریں</button>
                        <div className="flex gap-4">
                          <button onClick={onBack} className="bg-slate-100 text-slate-500 px-6 py-2 rounded-xl text-xs font-bold border border-slate-200">واپس جائیں</button>
                          <button onClick={handleSaveStudentAttendance} className="bg-blue-600 text-white px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20">حاضری محفوظ کریں</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="teachers-view"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-blue-600 px-6 py-3 text-white font-bold text-sm">حاضری درج کریں اساتذہ (ایک استاد ملٹی گھنٹوں کی حاضری لگا سکتا ہے)</div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">استاد منتخب کریں</label>
                      <select value={teacherName} onChange={e => setTeacherName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs">
                        <option value="">-- منتخب کریں --</option>
                        {teachersList.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">کلاس منتخب کریں</label>
                      <select value={teacherClass} onChange={e => setTeacherClass(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs">
                        <option value="">-- منتخب کریں --</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">گھنٹہ منتخب کریں</label>
                      <select value={teacherHour} onChange={e => setTeacherHour(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs">
                        <option value="">-- منتخب کریں --</option>
                        {hours.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">حاضری</label>
                      <select value={teacherStatus} onChange={e => setTeacherStatus(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs">
                        <option value="P">حاضر</option>
                        <option value="A">غیر حاضر</option>
                        <option value="L">رخصت</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">تاریخ</label>
                      <input type="date" value={teacherDate} onChange={e => setTeacherDate(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-mono" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setTeacherName(''); setTeacherClass(''); }} className="bg-slate-500 text-white px-8 py-2 rounded-lg text-xs font-bold">صاف کریں</button>
                    <button onClick={handleSaveTeacherAttendance} className="bg-blue-600 text-white px-8 py-2 rounded-lg text-xs font-bold shadow-md">حاضری محفوظ کریں</button>
                  </div>
                </div>

                <div className="border-t border-slate-100">
                   <div className="bg-slate-50 px-8 py-3 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-600">حاضری کا ریکارڈ</h4>
                      <div className="flex gap-2">
                        <button className="text-[10px] bg-sky-100 text-sky-700 px-3 py-1 rounded font-bold border border-sky-200">ایکسپورٹ کریں (Excel)</button>
                        <button className="text-[10px] bg-teal-100 text-teal-700 px-3 py-1 rounded font-bold border border-teal-200">فلٹر رپورٹ دیکھیں</button>
                      </div>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="px-4 py-3 border-r border-white/10 text-center">استاد کا نام</th>
                            <th className="px-4 py-3 border-r border-white/10 text-center">کلاس</th>
                            <th className="px-4 py-3 border-r border-white/10 text-center">گھنٹہ</th>
                            <th className="px-4 py-3 border-r border-white/10 text-center">تاریخ</th>
                            <th className="px-4 py-3 border-r border-white/10 text-center">آنے کا وقت</th>
                            <th className="px-4 py-3 border-r border-white/10 text-center">جانے کا وقت</th>
                            <th className="px-4 py-3 border-r border-white/10 text-center">حیثیت</th>
                            <th className="px-4 py-3 text-center">عمل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teacherRecords.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-700 text-center border-r border-slate-100">{r.name}</td>
                              <td className="px-4 py-3 text-slate-500 text-center border-r border-slate-100">{r.class || '---'}</td>
                              <td className="px-4 py-3 text-slate-500 text-center border-r border-slate-100">{r.hour || '---'}</td>
                              <td className="px-4 py-3 font-mono text-slate-400 text-center border-r border-slate-100">{r.date}</td>
                              <td className="px-4 py-3 font-mono text-slate-400 text-center border-r border-slate-100">{r.arrival}</td>
                              <td className="px-4 py-3 font-mono text-slate-400 text-center border-r border-slate-100">{r.departure}</td>
                              <td className="px-4 py-3 text-center border-r border-slate-100">
                                <span className={`px-3 py-0.5 rounded font-bold ${r.status === 'P' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {r.status === 'P' ? 'حاضر' : r.status === 'A' ? 'غائب' : 'رخصت'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1">
                                   <button onClick={() => deleteTeacherRecord(r.id)} className="bg-rose-500 text-white p-1 rounded hover:bg-rose-600 transition-colors"><Trash2 size={12}/></button>
                                   <button className="bg-amber-500 text-white p-1 rounded hover:bg-amber-600 transition-colors"><Pencil size={12}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {teacherRecords.length === 0 && (
                            <tr><td colSpan={8} className="p-10 text-center text-slate-400">کوئی ریکارڈ موجود نہیں ہے۔</td></tr>
                          )}
                        </tbody>
                     </table>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AttendToggle = ({ status, label, active, onClick, color }: any) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div 
      onClick={onClick}
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${active ? `border-current ${color}` : 'border-slate-300'}`}
    >
      {active && <div className={`w-2 h-2 rounded-full bg-current`} />}
    </div>
    <span className={`text-xs font-bold font-urdu group-hover:opacity-80 transition-opacity ${active ? color : 'text-slate-400'}`}>
      {label}
    </span>
  </label>
);

export default ManualAttendance;
