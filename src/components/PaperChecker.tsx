import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface PaperCheckerProps {
  onBack: () => void;
}

export default function PaperChecker({ onBack }: PaperCheckerProps) {
  const [darjas, setDarjas] = useState<string[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedDarja, setSelectedDarja] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [papers, setPapers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [marks, setMarks] = useState<number | null>(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    // Load darjas and books
    const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
    const uniqueDarjas = Array.from(new Set(savedGrades.map((g: any) => g.name)));
    setDarjas(uniqueDarjas as string[]);

    const savedBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    setBooks(savedBooks);
  }, []);

  useEffect(() => {
    if (selectedDarja && selectedBook) {
      // Load pending papers
      const allResults = JSON.parse(localStorage.getItem('results') || '[]');
      const pendingPapers = allResults.filter((r: any) => 
        r.darja === selectedDarja && 
        r.book === selectedBook && 
        r.status === 'pending'
      );
      setPapers(pendingPapers);
      setCurrentIndex(0);
      setMarks(null);
      setComments('');
    } else {
      setPapers([]);
    }
  }, [selectedDarja, selectedBook]);

  const currentPaper = papers[currentIndex];

  const handleSubmit = () => {
    if (marks === null) {
      alert('براہ کرم نمبر منتخب کریں');
      return;
    }

    const allResults = JSON.parse(localStorage.getItem('results') || '[]');
    const updatedResults = allResults.map((r: any) => {
      if (r.id === currentPaper.id) {
        return {
          ...r,
          marks,
          comments,
          status: 'checked'
        };
      }
      return r;
    });

    localStorage.setItem('results', JSON.stringify(updatedResults));
    window.dispatchEvent(new Event('storage_updated'));
    import('../syncService').then(m => m.syncToServer());

    // Move to next paper or remove current from list
    const remainingPapers = papers.filter(p => p.id !== currentPaper.id);
    setPapers(remainingPapers);
    if (currentIndex >= remainingPapers.length) {
      setCurrentIndex(Math.max(0, remainingPapers.length - 1));
    }
    setMarks(null);
    setComments('');
  };

  // Determine API Base URL
  const getApiUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
    return API_BASE_URL;
  };

  const serverUrl = getApiUrl();

  const getPaperSrc = (path: string) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    return `${serverUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">پیپر چیکر (Paper Checker)</h1>
        </div>
      </header>

      <div className="p-6 bg-white border-b border-slate-200 shadow-sm z-10 relative">
        <div className="max-w-4xl mx-auto flex gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-600 mb-2">درجہ منتخب کریں</label>
            <select 
              value={selectedDarja} 
              onChange={(e) => { setSelectedDarja(e.target.value); setSelectedBook(''); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            >
              <option value="">-- منتخب کریں --</option>
              {darjas.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-600 mb-2">کتاب منتخب کریں</label>
            <select 
              value={selectedBook} 
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              disabled={!selectedDarja}
            >
              <option value="">-- منتخب کریں --</option>
              {books.filter(b => b.grade === selectedDarja).map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-hidden p-6 flex justify-center">
        {papers.length > 0 && currentPaper ? (
          <div className="w-full max-w-6xl flex gap-6 h-full">
            {/* Paper View */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-800 text-white p-3 text-center text-sm font-bold flex justify-between items-center">
                <span>پیپر {currentIndex + 1} از {papers.length}</span>
                <span className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-xs">خفیہ (Anonymous)</span>
              </div>
              <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
                {currentPaper.paperPath && currentPaper.paperPath.endsWith('.pdf') ? (
                  <iframe 
                    src={getPaperSrc(currentPaper.paperPath)} 
                    className="w-full h-full rounded-lg border border-slate-300"
                    title="Paper PDF"
                  />
                ) : (
                  <img 
                    src={getPaperSrc(currentPaper.paperPath)} 
                    alt="Paper" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x1000.png?text=Image+Not+Found';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Checking Controls */}
            <div className="w-96 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">نمبرات اور تبصرہ</h3>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3">نمبر دیں (1 سے 33)</label>
                  <div className="grid grid-cols-5 gap-2" dir="ltr">
                    {Array.from({ length: 33 }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        onClick={() => setMarks(num)}
                        className={`py-2 rounded-lg font-bold transition-all ${marks === num ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">تبصرہ (Feedback)</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="یہاں تبصرہ لکھیں..."
                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none font-urdu"
                  />
                </div>
              </div>

              <div className="pt-6 mt-auto border-t border-slate-100">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  محفوظ کریں اور آگے بڑھیں
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 h-64 mt-12">
            <CheckCircle className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
            <p className="text-lg font-bold text-slate-600">کوئی پیپر چیک کرنے کے لیے باقی نہیں ہے</p>
            <p className="text-sm">درجہ اور کتاب تبدیل کر کے دیکھیں</p>
          </div>
        )}
      </main>
    </div>
  );
}
