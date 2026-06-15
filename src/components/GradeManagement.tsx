import React, { useState, useEffect } from 'react';
import { 
  Grid, Plus, List, Search, Trash2, Edit2, Info, ArrowRight, Save, RotateCcw,
  Download, Upload, BookOpen, Book, BarChart2, Users
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';
import { addToRecycleBin } from './RecycleBin';

interface Grade {
  id: number;
  name: string;
  year: string;
  section: string;
  totalStudents: number;
  teacher: string;
  books?: string;
}

const GradeManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'add_book' | 'all_books' | 'syllabus' | 'assignments'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('تمام سال');
  
  const [books, setBooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('books_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [newBook, setNewBook] = useState({ name: '', grade: '', totalSyllabus: '', coveredSyllabus: '', teacher: '' });

  const [staff, setStaff] = useState<any[]>(() => {
    const saved = localStorage.getItem('staff');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookAssignments, setBookAssignments] = useState<any[]>(() => {
    const saved = localStorage.getItem('book_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('book_assignments', JSON.stringify(bookAssignments));
  }, [bookAssignments]);

  useEffect(() => {
    localStorage.setItem('books_list', JSON.stringify(books));
  }, [books]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.name || !newBook.grade) return;
    const updatedBooks = [...books, { id: Date.now(), ...newBook }];
    setBooks(updatedBooks);
    localStorage.setItem('books_list', JSON.stringify(updatedBooks));
    setNewBook({ name: '', grade: '', totalSyllabus: '', coveredSyllabus: '', teacher: '' });
    setActiveTab('all_books');
    await syncToServer();
  };
  
  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('grades_list');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'اولیٰ', year: 'اول', section: '', totalStudents: 1, teacher: 'عبدالوحید' },
      { id: 2, name: 'اولیٰ', year: 'اول', section: 'الف', totalStudents: 0, teacher: '--- کوئی مسئول منتخب نہیں ---' },
      { id: 3, name: 'اولیٰ', year: 'اول', section: 'اے', totalStudents: 0, teacher: 'شفیق الرحمن' },
      { id: 4, name: 'اولیٰ', year: '2026', section: '', totalStudents: 0, teacher: '--- کوئی مسئول منتخب نہیں ---' }
    ];
  });

  const [newGrade, setNewGrade] = useState({
    name: '',
    year: '',
    section: '',
    teacher: '',
    books: ''
  });

  useEffect(() => {
    localStorage.setItem('grades_list', JSON.stringify(grades));
    
    // Update totalStudents from the students list
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedGrades = grades.map(g => {
      const count = students.filter((s: any) => s.grade === g.name && s.section === g.section).length;
      if (g.totalStudents !== count) {
        return { ...g, totalStudents: count };
      }
      return g;
    });
    
    // Only update state if something changed to avoid infinite loop
    const hasChanges = updatedGrades.some((g, i) => g.totalStudents !== grades[i].totalStudents);
    if (hasChanges) {
      setGrades(updatedGrades);
    }
  }, [grades]);

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.name || !newGrade.year) return;

    const grade: Grade = {
      id: Date.now(),
      name: newGrade.name,
      year: newGrade.year,
      section: newGrade.section,
      totalStudents: 0,
      teacher: newGrade.teacher || '--- کوئی مسئول منتخب نہیں ---',
      books: newGrade.books
    };

    const updatedGrades = [grade, ...grades];
    setGrades(updatedGrades);
    localStorage.setItem('grades_list', JSON.stringify(updatedGrades));
    setNewGrade({ name: '', year: '', section: '', teacher: '', books: '' });
    setActiveTab('list');
    await syncToServer();
  };

  const handleDelete = async (id: number) => {
    if (confirm('کیا آپ اس درجہ کو ختم کرنا چاہتے ہیں؟')) {
      const gradeToDelete = grades.find(g => g.id === id);
      if (gradeToDelete) {
        addToRecycleBin('grades', gradeToDelete, 'name');
      }
      const updatedGrades = grades.filter(g => g.id !== id);
      setGrades(updatedGrades);
      localStorage.setItem('grades_list', JSON.stringify(updatedGrades));
      await syncToServer();
    }
  };

  const filteredGrades = grades.filter(g => {
    const matchesSearch = g.name.includes(searchQuery) || g.year.includes(searchQuery) || g.section.includes(searchQuery);
    const matchesYear = yearFilter === 'تمام سال' || g.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  const uniqueYears = ['تمام سال', ...Array.from(new Set(grades.map(g => g.year)))];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Grid className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">درجات کا انتظام</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => exportToExcel(grades, 'grades_record')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Download className="w-4 h-4" />
            ایکسل ایکسپورٹ
          </button>
          
          <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            ایکسل اپلوڈ
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const data = await importFromExcel(e.target.files[0]);
                    const merged = [...grades, ...data];
                    setGrades(merged);
                    localStorage.setItem('grades_list', JSON.stringify(merged));
                    alert('ڈیٹا کامیابی سے اپلوڈ ہو گیا۔');
                  } catch (err) {
                    alert('ایکسل فائل پڑھنے میں خرابی۔');
                  }
                }
              }} 
            />
          </label>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'assignments' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4 inline-block ml-2" />
            کتابوں کی تقسیم
          </button>
          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'syllabus' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BarChart2 className="w-4 h-4 inline-block ml-2" />
            نصاب
          </button>
          <button 
            onClick={() => setActiveTab('all_books')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all_books' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-4 h-4 inline-block ml-2" />
            تمام کتب
          </button>
          <button 
            onClick={() => setActiveTab('add_book')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'add_book' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Book className="w-4 h-4 inline-block ml-2" />
            نئی کتاب
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <List className="w-4 h-4 inline-block ml-2" />
            تمام درجات
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'add' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Plus className="w-4 h-4 inline-block ml-2" />
            نیا درجہ
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="درجہ، سال یا سیکشن تلاش کریں..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm"
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <select 
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-bold"
                    >
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-[#832c2c] text-white">
                          <th className="px-4 py-4 text-xs font-bold border-l border-white/10 text-center">#</th>
                          <th className="px-6 py-4 text-xs font-bold border-l border-white/10">درجہ کا نام</th>
                          <th className="px-6 py-4 text-xs font-bold border-l border-white/10 text-center">سال</th>
                          <th className="px-6 py-4 text-xs font-bold border-l border-white/10 text-center">سیکشن</th>
                          <th className="px-6 py-4 text-xs font-bold border-l border-white/10 text-center">کل طلبہ کی تعداد</th>
                          <th className="px-6 py-4 text-xs font-bold border-l border-white/10">مسئول استاد</th>
                          <th className="px-6 py-4 text-xs font-bold border-l border-white/10">مقررہ کتابیں</th>
                          <th className="px-6 py-4 text-xs font-bold text-center">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredGrades.map((grade, index) => (
                          <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-4 py-4 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-700">{grade.name}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{grade.year}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs text-slate-500">{grade.section || '---'}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold">
                                {grade.totalStudents}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-600">{grade.teacher}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-600 max-w-[120px] truncate inline-block" title={grade.books}>{grade.books || 'کوئی نہیں'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1.5 bg-cyan-100 text-cyan-600 rounded-md hover:bg-cyan-600 hover:text-white transition-all">
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(grade.id)}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredGrades.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-20 text-center">
                              <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Search className="w-10 h-10 opacity-20" />
                                <span className="text-sm">کوئی درجہ نہیں ملا</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'add' ? (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="bg-[#832c2c] p-8 text-white relative">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16" />
                    <h2 className="text-2xl font-bold font-urdu relative z-10 flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Plus className="w-6 h-6" />
                      </div>
                      نیا درجہ شامل کریں
                    </h2>
                  </div>

                  <form onSubmit={handleAddGrade} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">درجہ کا نام</label>
                        <select 
                          required
                          value={newGrade.name}
                          onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        >
                          <option value="">-- منتخب کریں --</option>
                          <option value="اولیٰ">اولیٰ</option>
                          <option value="ثانیہ">ثانیہ</option>
                          <option value="ثالثہ">ثالثہ</option>
                          <option value="رابعہ">رابعہ</option>
                          <option value="خامسہ">خامسہ</option>
                          <option value="سادسہ">سادسہ</option>
                          <option value="سابعہ">سابعہ</option>
                          <option value="دورہ حدیث">دورہ حدیث</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">سال</label>
                        <input 
                          required
                          type="text"
                          placeholder="مثال: اول، 2026"
                          value={newGrade.year}
                          onChange={(e) => setNewGrade({...newGrade, year: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">سیکشن</label>
                        <input 
                          type="text"
                          placeholder="مثال: الف، اے، ا لف"
                          value={newGrade.section}
                          onChange={(e) => setNewGrade({...newGrade, section: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">مسئول اساتذہ</label>
                        <input 
                          type="text"
                          placeholder="استاد کا نام لکھیں..."
                          value={newGrade.teacher}
                          onChange={(e) => setNewGrade({...newGrade, teacher: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        />
                        <p className="text-[9px] text-slate-400 mr-1 mt-1">ایک سے زیادہ اساتذہ منتخب کیے جا سکتے ہیں۔</p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">مقررہ کتابیں (کوما لگا کر الگ کریں)</label>
                        <textarea 
                          placeholder="مثال: تجوید، نحو، صرف..."
                          value={newGrade.books || ''}
                          onChange={(e) => setNewGrade({...newGrade, books: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        محفوظ کریں
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        واپس
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'add_book' ? (
              <motion.div
                key="add_book"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="bg-[#832c2c] p-8 text-white relative">
                    <h2 className="text-2xl font-bold font-urdu relative z-10 flex items-center gap-3">
                      <Book className="w-6 h-6" />
                      کتاب شامل کریں
                    </h2>
                  </div>
                  <form onSubmit={handleAddBook} className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1 mb-2">درجہ کا انتخاب کریں</label>
                        <select 
                          required
                          value={newBook.grade}
                          onChange={(e) => setNewBook({...newBook, grade: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        >
                          <option value="">-- درجہ منتخب کریں --</option>
                          {grades.map(g => <option key={g.id} value={g.name}>{g.name} ({g.year})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1 mb-2">کتاب کا نام</label>
                        <input 
                          required
                          type="text"
                          placeholder="مثال: قدوری، ہدایہ..."
                          value={newBook.name}
                          onChange={(e) => setNewBook({...newBook, name: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1 mb-2">استاد (متبادل - براہ راست تقسیم میں بھی کیا جا سکتا ہے)</label>
                        <select 
                          value={newBook.teacher}
                          onChange={(e) => setNewBook({...newBook, teacher: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        >
                          <option value="">-- استاد منتخب کریں --</option>
                          {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                      <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        محفوظ کریں
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'assignments' ? (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users className="text-purple-600" />
                  کتابوں کی تقسیم (کونسی کتاب کس استاد کے پاس ہے)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-4 px-6 border-l border-white/10">درجہ</th>
                        <th className="py-4 px-6 border-l border-white/10">کتاب</th>
                        <th className="py-4 px-6">ذمہ دار استاد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grades.map(g => {
                        const gradeBooks = books.filter(b => b.grade === g.name);
                        return gradeBooks.map(b => (
                          <tr key={`${g.id}-${b.id}`} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-700">{g.name} ({g.year})</td>
                            <td className="py-4 px-6 text-slate-600">{b.name}</td>
                            <td className="py-4 px-6">
                              <select 
                                value={b.teacher || ''}
                                onChange={(e) => {
                                  const updatedBooks = books.map(bk => bk.id === b.id ? {...bk, teacher: e.target.value} : bk);
                                  setBooks(updatedBooks);
                                }}
                                className="w-full max-w-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs"
                              >
                                <option value="">-- استاد منتخب کریں --</option>
                                {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                              </select>
                            </td>
                          </tr>
                        ));
                      })}
                      {books.length === 0 && (
                        <tr><td colSpan={3} className="py-20 text-center text-slate-400">کوئی کتاب موجود نہیں ہے۔</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : activeTab === 'all_books' ? (
              <motion.div
                key="all_books"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6">درجہ وار کتب کی تفصیل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grades.map(g => {
                    const gradeBooks = books.filter(b => b.grade === g.name);
                    if (gradeBooks.length === 0) return null;
                    return (
                      <div key={g.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 className="font-bold text-lg text-purple-700 border-b border-slate-200 pb-2 mb-3">{g.name} ({g.year})</h4>
                        <ul className="space-y-2">
                          {gradeBooks.map((b, i) => (
                            <li key={b.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                              <span className="font-bold text-slate-700 text-sm">{i+1}. {b.name}</span>
                              <button onClick={() => { if(confirm('حذف کریں؟')) setBooks(books.filter(bk => bk.id !== b.id)) }} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  {books.length === 0 && <div className="col-span-full text-center text-slate-400 py-10">کوئی کتاب شامل نہیں کی گئی۔</div>}
                </div>
              </motion.div>
            ) : activeTab === 'syllabus' ? (
              <motion.div
                key="syllabus"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6">نصاب کی تفصیل (Syllabus)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="py-3 px-4 border-l">کتاب کا نام</th>
                        <th className="py-3 px-4 border-l text-center">درجہ</th>
                        <th className="py-3 px-4 border-l text-center">مجموعی نصاب (صفحات/اسباق)</th>
                        <th className="py-3 px-4 border-l text-center">پڑھا ہوا نصاب</th>
                        <th className="py-3 px-4 text-center">عمل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map(b => (
                        <tr key={b.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{b.name}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">{b.grade}</td>
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="text" 
                              value={b.totalSyllabus || ''} 
                              onChange={(e) => setBooks(books.map(bk => bk.id === b.id ? {...bk, totalSyllabus: e.target.value} : bk))}
                              className="w-24 text-center border border-slate-200 rounded px-2 py-1 outline-none focus:border-purple-500" 
                              placeholder="کل نصاب" 
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="text" 
                              value={b.coveredSyllabus || ''} 
                              onChange={(e) => setBooks(books.map(bk => bk.id === b.id ? {...bk, coveredSyllabus: e.target.value} : bk))}
                              className="w-24 text-center border border-slate-200 rounded px-2 py-1 outline-none focus:border-purple-500" 
                              placeholder="پڑھا گیا" 
                            />
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-slate-400">خود بخود محفوظ ہوتا ہے</td>
                        </tr>
                      ))}
                      {books.length === 0 && (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400">کوئی کتاب نہیں ہے</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default GradeManagement;
