import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, Search, Download, Eye, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { exportToExcel } from '../excelUtils';
import VoiceInput from './VoiceInput';

interface PaperReportsProps {
  onBack: () => void;
}

export default function PaperReports({ onBack }: PaperReportsProps) {
  const [darjas, setDarjas] = useState<string[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedDarja, setSelectedDarja] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load darjas and books
    const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
    const uniqueDarjas = Array.from(new Set(savedGrades.map((g: any) => g.name)));
    setDarjas(uniqueDarjas as string[]);

    const savedBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    setBooks(savedBooks);

    // Load reports initially
    loadReports('', '');
  }, []);

  const loadReports = (darja: string, book: string) => {
    const allResults = JSON.parse(localStorage.getItem('results') || '[]');
    let filtered = allResults.filter((r: any) => r.status === 'checked');
    
    if (darja) filtered = filtered.filter((r: any) => r.darja === darja);
    if (book) filtered = filtered.filter((r: any) => r.book === book);
    
    setReports(filtered);
  };

  useEffect(() => {
    loadReports(selectedDarja, selectedBook);
  }, [selectedDarja, selectedBook]);

  const filteredReports = reports.filter(r => 
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comments.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">پیپر رپورٹس (Paper Reports)</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToExcel(filteredReports, 'Paper_Reports')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all font-bold flex items-center gap-2 shadow-sm text-sm"
          >
            <Download className="w-4 h-4" />
            ایکسل ایکسپورٹ
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                <VoiceInput onTranscript={(text) => setSearchQuery(text)} />
              </div>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="طالب علم کا نام یا تبصرہ تلاش کریں..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-16 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={selectedDarja} 
                onChange={(e) => { setSelectedDarja(e.target.value); setSelectedBook(''); }}
                className="w-full md:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="">تمام درجات</option>
                {darjas.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                value={selectedBook} 
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full md:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                disabled={!selectedDarja}
              >
                <option value="">تمام کتب</option>
                {books.filter(b => b.grade === selectedDarja).map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="py-4 px-6 font-bold border-l border-white/10 w-16 text-center">#</th>
                    <th className="py-4 px-6 font-bold border-l border-white/10">طالب علم کا نام</th>
                    <th className="py-4 px-6 font-bold border-l border-white/10">درجہ</th>
                    <th className="py-4 px-6 font-bold border-l border-white/10">کتاب</th>
                    <th className="py-4 px-6 font-bold border-l border-white/10 text-center w-32">حاصل کردہ نمبرات</th>
                    <th className="py-4 px-6 font-bold border-l border-white/10 w-1/3">استاد کا تبصرہ</th>
                    <th className="py-4 px-6 font-bold text-center">عمل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report, idx) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{report.studentName}</td>
                        <td className="py-4 px-6 text-slate-600">{report.darja}</td>
                        <td className="py-4 px-6 text-slate-600">{report.book}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            report.marks >= 25 ? 'bg-emerald-100 text-emerald-700' :
                            report.marks >= 15 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {report.marks} / 33
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-sm whitespace-pre-wrap">{report.comments || 'کوئی تبصرہ نہیں'}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => {
                                const baseUrl = API_BASE_URL;
                                window.open(`${baseUrl}${report.paperPath}`, '_blank');
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="پیپر دیکھیں"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('کیا آپ واقعی اس رپورٹ کو ڈیلیٹ کرنا چاہتے ہیں؟')) {
                                  const allResults = JSON.parse(localStorage.getItem('results') || '[]');
                                  const updated = allResults.filter((r: any) => r.id !== report.id);
                                  localStorage.setItem('results', JSON.stringify(updated));
                                  window.dispatchEvent(new Event('storage_updated'));
                                  import('../syncService').then(m => m.syncToServer());
                                  loadReports(selectedDarja, selectedBook);
                                }
                              }}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="ڈیلیٹ کریں"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FileText className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-bold">کوئی رپورٹ موجود نہیں ہے</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
