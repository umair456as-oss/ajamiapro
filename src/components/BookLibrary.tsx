import React, { useState, useEffect } from 'react';
import { 
  Library, Plus, Search, BookOpen, Trash2, Edit3,
  ArrowRight, Info, MapPin, Grid, Layers, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';
import { addToRecycleBin } from './RecycleBin';

interface Book {
  id: string;
  bookNumber?: string;
  title: string;
  author: string;
  wall: number; // 1, 2, 3
  row: number;  // 1-6
  box: number;  // Box number in the row
  subBox?: number; // 1, 2, 3 (Optional)
}

interface BookLibraryProps {
  onBack: () => void;
}

export default function BookLibrary({ onBack }: BookLibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWall, setSelectedWall] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [newBook, setNewBook] = useState<Partial<Book>>({
    bookNumber: '',
    title: '',
    author: '',
    wall: 1,
    row: 1,
    box: 1,
    subBox: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('library_books');
    if (saved) setBooks(JSON.parse(saved));
  }, []);

  const saveToStore = (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    localStorage.setItem('library_books', JSON.stringify(updatedBooks));
    syncToServer();
    window.dispatchEvent(new Event('storage_updated'));
  };

  const handleAddOrUpdate = () => {
    if (!newBook.title) return;
    
    if (editingId) {
      const updated = books.map(b => b.id === editingId ? { ...b, ...newBook } as Book : b);
      saveToStore(updated);
      setEditingId(null);
    } else {
      const book: Book = {
        id: Date.now().toString(),
        bookNumber: newBook.bookNumber || '',
        title: newBook.title || '',
        author: newBook.author || '',
        wall: Number(newBook.wall),
        row: Number(newBook.row),
        box: Number(newBook.box),
        subBox: newBook.subBox ? Number(newBook.subBox) : undefined
      };
      saveToStore([...books, book]);
    }
    
    setNewBook({ bookNumber: '', title: '', author: '', wall: 1, row: 1, box: 1, subBox: 0 });
    setShowAddForm(false);
  };

  const startEdit = (book: Book) => {
    setNewBook(book);
    setEditingId(book.id);
    setShowAddForm(true);
  };

  const deleteBook = (id: string) => {
    if (window.confirm('کیا آپ واقعی یہ کتاب حذف کرنا چاہتے ہیں؟')) {
      const bookToDelete = books.find(b => b.id === id);
      if (bookToDelete) {
        addToRecycleBin('books', bookToDelete, 'title');
      }
      saveToStore(books.filter(b => b.id !== id));
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bookNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      {/* Header */}
      <div className="bg-[#1e293b] text-white p-4 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-lg gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={onBack}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold font-urdu">لائبریری مینجمنٹ</h1>
            <p className="text-[10px] md:text-xs text-slate-400">کتب خانہ کا مکمل ریکارڈ اور لوکیشن</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="کتاب، نمبر یا مصنف..."
              className="w-full md:w-64 pr-10 pl-4 py-2 bg-white/10 rounded-xl outline-none focus:bg-white/20 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingId(null); setNewBook({bookNumber: '', title: '', author: '', wall: 1, row: 1, box: 1, subBox: 0}); setShowAddForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-500/20 text-sm"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">نئی کتاب</span>
            <span className="md:hidden">ایڈ</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar: Wall Selector (Mobile: Top Bar) */}
        <div className="flex md:flex-col w-full md:w-20 bg-white border-b md:border-b-0 md:border-l border-slate-200 p-4 md:py-8 gap-4 md:gap-6 shadow-sm overflow-x-auto">
          {[1, 2, 3].map(w => (
            <button
              key={w}
              onClick={() => setSelectedWall(w)}
              className={`flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
                selectedWall === w ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span className="text-[8px] md:text-[10px] font-bold">دیوار</span>
              <span className="text-base md:text-lg font-bold">{w}</span>
            </button>
          ))}
        </div>

        {/* Main Content: Shelf View */}
        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                <Grid className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                <span>دیوار نمبر {selectedWall} کا منظر</span>
              </h2>
              <div className="flex items-center gap-4 text-[10px] md:text-xs text-slate-500 overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-600 rounded" />
                  <span>کتاب موجود ہے</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-3 h-3 bg-slate-200 rounded" />
                  <span>خالی خانہ</span>
                </div>
              </div>
            </div>

            {/* Shelf Grid: 6 Rows */}
            <div className="flex flex-col gap-4 bg-slate-200 p-3 md:p-4 rounded-3xl border-4 md:border-8 border-slate-300 shadow-inner">
              {[1, 2, 3, 4, 5, 6].map(row => (
                <div key={row} className="bg-white/50 rounded-xl p-3 md:p-4 flex gap-4 overflow-x-auto custom-scrollbar-h border-b-2 md:border-b-4 border-slate-300/50">
                  <div className="flex-shrink-0 w-8 md:w-10 h-full flex items-center justify-center bg-slate-800 text-white rounded-lg font-bold text-[10px]">
                    رو {row}
                  </div>
                  {/* Boxes in Row (Mock 8 boxes for visualization) */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(box => {
                    const booksInBox = books.filter(b => b.wall === selectedWall && b.row === row && b.box === box);
                    return (
                      <div key={box} className="flex-shrink-0 w-28 md:w-32 h-24 md:h-28 bg-slate-100 rounded-lg border-2 border-slate-200 flex flex-col p-2 relative group hover:border-blue-400 transition-all">
                        <span className="text-[7px] md:text-[8px] font-bold text-slate-400 absolute top-1 right-2">باکس {box}</span>
                        <div className="mt-2 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar-mini">
                          {booksInBox.map(b => (
                            <div 
                              key={b.id} 
                              onClick={() => startEdit(b)}
                              className="w-full min-h-[16px] bg-blue-600 hover:bg-blue-700 cursor-pointer rounded text-[8px] text-white px-1 truncate flex items-center justify-between group/book"
                            >
                              <span>{b.title}</span>
                              <Edit3 size={8} className="opacity-0 group-hover/book:opacity-100" />
                            </div>
                          ))}
                        </div>
                        {booksInBox.length === 0 && (
                          <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button 
                              onClick={() => { setNewBook({...newBook, wall: selectedWall, row, box}); setShowAddForm(true); }}
                              className="p-1 bg-white rounded-full shadow text-blue-600"
                            >
                              <Plus size={12}/>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  <span>{editingId ? 'کتاب کی معلومات تبدیل کریں' : 'نئی کتاب کا اندراج'}</span>
                </h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">کتاب کا نمبر</label>
                      <input 
                        type="text" value={newBook.bookNumber} onChange={e => setNewBook({...newBook, bookNumber: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">کتاب کا نام *</label>
                      <input 
                        type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">مصنف</label>
                    <input 
                      type="text" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 md:gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">دیوار</label>
                      <select 
                        value={newBook.wall} onChange={e => setNewBook({...newBook, wall: Number(e.target.value)})}
                        className="w-full px-1 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">رو (Row)</label>
                      <select 
                        value={newBook.row} onChange={e => setNewBook({...newBook, row: Number(e.target.value)})}
                        className="w-full px-1 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        {[1,2,3,4,5,6].map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">باکس</label>
                      <input 
                        type="number" value={newBook.box} onChange={e => setNewBook({...newBook, box: Number(e.target.value)})}
                        className="w-full px-1 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">خانہ (Sub)</label>
                      <select 
                        value={newBook.subBox} onChange={e => setNewBook({...newBook, subBox: Number(e.target.value)})}
                        className="w-full px-1 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleAddOrUpdate}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all text-sm"
                  >
                    {editingId ? 'تبدیلی محفوظ کریں' : 'کتاب محفوظ کریں'}
                  </button>
                  {editingId && (
                    <button 
                      onClick={() => deleteBook(editingId)}
                      className="bg-red-50 text-red-500 px-4 rounded-2xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-mini::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
      `}} />
    </div>
  );
}
