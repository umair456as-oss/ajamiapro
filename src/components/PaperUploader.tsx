import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, Book, User, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface PaperUploaderProps {
  onBack: () => void;
}

export default function PaperUploader({ onBack }: PaperUploaderProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedDarja, setSelectedDarja] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [darjas, setDarjas] = useState<string[]>([]);

  useEffect(() => {
    // Load students - prefer 'students' as it's the standard sync key
    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    setStudents(savedStudents);
    
    // Load darjas from grades
    const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
    const uniqueDarjas = Array.from(new Set(savedGrades.map((g: any) => g.name))).filter(Boolean);
    
    if (uniqueDarjas.length > 0) {
      setDarjas(uniqueDarjas as string[]);
    } else {
      // Fallback to students' grades
      const gradesFromStudents = Array.from(new Set(savedStudents.map((s: any) => s.grade).filter(Boolean)));
      setDarjas(gradesFromStudents as string[]);
    }

    // Load books
    const savedBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    setBooks(savedBooks);
  }, []);

  // Determine API Base URL
  const getApiUrl = () => {
    const hostname = window.location.hostname;
    // If running on localhost or 127.0.0.1, use that, otherwise use the provided IP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
    return API_BASE_URL;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookName: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    setUploadStatus(prev => ({ ...prev, [bookName]: 'uploading' }));

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        try {
          // Upload to server
          const response = await fetch(`${getApiUrl()}/api/upload-paper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: `${selectedStudent.id}_${bookName.replace(/\s+/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`,
              fileData: base64Data
            })
          });

          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();
          
          if (data.success) {
            // Save to local Results pending sync
            const existingResults = JSON.parse(localStorage.getItem('results') || '[]');
            
            // Check if already uploaded for this student and book, if so update
            const existingIdx = existingResults.findIndex((r: any) => 
              r.studentId === selectedStudent.id && r.book === bookName
            );
            
            const newRecord = {
              id: existingIdx >= 0 ? existingResults[existingIdx].id : Date.now(),
              studentId: selectedStudent.id,
              studentName: selectedStudent.name,
              darja: selectedStudent.grade || selectedDarja,
              book: bookName,
              paperPath: data.path,
              marks: null,
              comments: '',
              status: 'pending' // pending checking
            };

            if (existingIdx >= 0) {
              existingResults[existingIdx] = newRecord;
            } else {
              existingResults.push(newRecord);
            }
            
            localStorage.setItem('results', JSON.stringify(existingResults));
            
            // Trigger sync
            window.dispatchEvent(new Event('storage_updated'));
            import('../syncService').then(m => m.syncToServer());
            
            setUploadStatus(prev => ({ ...prev, [bookName]: 'success' }));
          } else {
            throw new Error(data.error || 'Server error');
          }
        } catch (fetchError: any) {
          console.error('Fetch Error:', fetchError);
          alert('سرور سے رابطہ نہیں ہو سکا۔ براہ کرم چیک کریں کہ سرور چل رہا ہے۔');
          setUploadStatus(prev => ({ ...prev, [bookName]: 'error' }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploadStatus(prev => ({ ...prev, [bookName]: 'error' }));
    }
  };

  const filteredStudents = students.filter(s => s.grade === selectedDarja);
  const studentBooks = books.filter(b => b.grade === selectedDarja);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">پیپر اپلوڈر (Paper Uploader)</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Darja Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">درجہ کا انتخاب کریں</h2>
            <div className="space-y-2">
              {darjas.map(darja => (
                <button
                  key={darja}
                  onClick={() => {
                    setSelectedDarja(darja);
                    setSelectedStudent(null);
                    setUploadStatus({});
                  }}
                  className={`w-full text-right px-4 py-3 rounded-lg font-bold transition-all ${selectedDarja === darja ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  {darja}
                </button>
              ))}
              {darjas.length === 0 && <p className="text-slate-500 text-sm">کوئی درجہ دستیاب نہیں ہے۔</p>}
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">طلبہ کی فہرست</h2>
            {selectedDarja ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setUploadStatus({});
                    }}
                    className={`w-full text-right px-4 py-3 rounded-lg font-bold flex items-center justify-between transition-all ${selectedStudent?.id === student.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{student.name}</span>
                    </div>
                    <span className="text-xs opacity-80">{student.rollNo}</span>
                  </button>
                ))}
                {filteredStudents.length === 0 && <p className="text-slate-500 text-sm">اس درجہ میں کوئی طالب علم نہیں ہے۔</p>}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                پہلے درجہ منتخب کریں
              </div>
            )}
          </div>

          {/* Book List & Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">کتب اور اپلوڈ</h2>
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                  <p className="text-sm font-bold text-emerald-800">طالب علم: {selectedStudent.name}</p>
                </div>
                
                {studentBooks.length > 0 ? studentBooks.map(book => (
                  <div key={book.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <Book className="w-4 h-4 text-blue-500" />
                      <span>{book.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {uploadStatus[book.name] === 'success' ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                          <CheckCircle className="w-4 h-4" /> اپلوڈ ہو گیا
                        </div>
                      ) : uploadStatus[book.name] === 'uploading' ? (
                        <div className="text-blue-600 text-sm font-bold animate-pulse">اپلوڈ ہو رہا ہے...</div>
                      ) : (
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-2 transition-all shadow-md">
                          <Upload className="w-4 h-4" />
                          پیپر اپلوڈ کریں
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, book.name)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 text-sm">اس درجہ کی کوئی کتاب درج نہیں ہے۔</p>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                پہلے طالب علم منتخب کریں
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
