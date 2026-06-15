import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, MessageSquare, Volume2, X, Sparkles, Bot, Send, Loader2 } from 'lucide-react';
import { syncToServer } from '../syncService';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(window.speechSynthesis);
  const commandTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ur-PK';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = (finalTranscript || interimTranscript).toLowerCase();
        setTranscript(text);

        // Wake word: Alpha / الفا
        if (text.includes('الفا') || text.includes('alpha')) {
          if (!isOpen) {
            setIsOpen(true);
            speak('جی، الفا حاضر ہے۔ فرمایئے؟');
          } else if (event.results[event.results.length - 1].isFinal) {
            speak('جی، میں سن رہا ہوں۔ بتائیے؟');
          }
        }

        if (finalTranscript) {
          processCommand(finalTranscript.toLowerCase());
        } else if (interimTranscript) {
          if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
          commandTimeoutRef.current = setTimeout(() => {
            if (interimTranscript.trim().length > 5) {
              processCommand(interimTranscript.toLowerCase());
            }
          }, 2500);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      try { recognitionRef.current.start(); } catch(e) {}

      // Pre-load voices for some browsers
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = () => {
          synthesisRef.current.getVoices();
        };
      }
    }
  }, []);

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    
    // Cancel any current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = synthesisRef.current.getVoices();
    
    // Try to find an Urdu or Hindi voice (Hindi often works well for Urdu)
    const urduVoice = voices.find((v: any) => v.lang.includes('ur') || v.lang.includes('hi'));
    
    if (urduVoice) {
      utterance.voice = urduVoice;
      utterance.lang = urduVoice.lang;
    } else {
      // Fallback to first available or default
      utterance.lang = 'ur-PK';
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    synthesisRef.current.speak(utterance);
    setResponse(text);
  };

  const processCommand = (cmd: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTranscript('');
    if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);

    const text = cmd.replace('الفا', '').replace('alpha', '').trim();
    if (!text || text.length < 2) {
      setIsProcessing(false);
      return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const staff = JSON.parse(localStorage.getItem('staff') || '[]');
    const fin_transactions = JSON.parse(localStorage.getItem('fin_transactions') || '[]');

    // --- SYNONYM GROUPS (SMART ENGINE) ---
    const words = text.split(' ');
    
    const isCount = /کتنے|تعداد|کتنا|ٹوٹل|گنتی|کتنی/.test(text);
    const isStudent = /طالب علم|طلبہ|بچے|شاگرد|سٹوڈنٹ|داخلہ/.test(text);
    const isStaff = /ٹیچر|استاد|عملہ|سٹاف|ملازم|استادوں/.test(text);
    const isFinance = /روپے|روپیہ|پیسے|آمدنی|خرچ|فنانس|چندہ|جمع|دیے|دیا|اکاؤنٹ|ہزار|لاکھ/.test(text);
    const isEdit = /نام بدل|تبدیل|ایڈٹ|صحیح|درست|لکھ دو|رکھ دو|چینج/.test(text);
    const isNav = /کھولو|دکھاؤ|جاؤ|اوپن|لسٹ|صفحہ|ریکارڈ/.test(text);
    const isGreeting = /سلام|ہیلو|کیسے ہو|کون ہو/.test(text);

    // --- ACTION LOGIC ---

    // 1. STATS (How many...)
    if (isCount) {
      if (isStudent) {
        speak(`جامعہ میں اس وقت کل ${students.length} طلبہ موجود ہیں۔`);
        return setIsProcessing(false);
      } else if (isStaff) {
        speak(`سسٹم میں کل ${staff.length} اساتذہ اور عملہ رجسٹرڈ ہیں۔`);
        return setIsProcessing(false);
      }
    }

    // 2. FINANCE (Adding entries)
    if (isFinance && !isNav) {
      const amountMatch = text.match(/\d+/) || text.match(/(ہزار|لاکھ)/);
      let amount = 0;
      if (amountMatch) {
        if (amountMatch[0] === 'ہزار') amount = 1000;
        else if (amountMatch[0] === 'لاکھ') amount = 100000;
        else amount = parseInt(amountMatch[0]);
      }

      if (amount > 0) {
        let name = text.replace(/\d+|ہزار|لاکھ|روپے|روپیہ|شامل|ایڈ|جمع|دیے|دیا|الفا|alpha/g, '').trim();
        name = name.split(' ')[0] || 'Voice Entry'; // Take first word as name if many

        const accounts = JSON.parse(localStorage.getItem('fin_accounts') || '[]');
        const newTrans = {
          id: `TR-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: `الفا انٹری: ${name}`,
          contributor: name,
          headId: '1', accountId: '1', type: 'income', amount: amount
        };

        localStorage.setItem('fin_transactions', JSON.stringify([newTrans, ...fin_transactions]));
        if (accounts.length > 0) {
          accounts[0].balance += amount;
          localStorage.setItem('fin_accounts', JSON.stringify(accounts));
        }
        window.dispatchEvent(new Event('storage_updated'));
        syncToServer();
        speak(`جی، میں نے ${name} کی طرف سے ${amount} روپے کا اندراج کر دیا ہے۔`);
        return setIsProcessing(false);
      }
    }

    // 3. EDIT STUDENT
    if (isEdit) {
      const student = students.find((s: any) => text.includes(s.name.toLowerCase()));
      if (student) {
        const remainingText = text.replace(student.name.toLowerCase(), '').replace(/نام|بدل|تبدیل|کر دو|رکھ دو|ایڈٹ/g, '').trim();
        const newName = remainingText.split(' ').pop(); // Assume last word is new name if not clear
        
        if (newName && newName.length > 1) {
          const old = student.name;
          student.name = newName;
          localStorage.setItem('students', JSON.stringify(students));
          window.dispatchEvent(new Event('storage_updated'));
          syncToServer();
          speak(`جی، میں نے ${old} کا نام بدل کر ${newName} کر دیا ہے۔`);
          return setIsProcessing(false);
        }
      }
    }

    // 4. LIBRARY SEARCH
    if (text.includes('کتاب') && (text.includes('کہاں') || text.includes('تلاش') || text.includes('ملے گی'))) {
      const libraryBooks = JSON.parse(localStorage.getItem('library_books') || '[]');
      const query = text.replace(/الفا|alpha|کتاب|کہاں|تلاش|ملے گی|دکھاؤ|بتاؤ/g, '').trim();
      
      if (query) {
        const foundBook = libraryBooks.find((b: any) => b.title.toLowerCase().includes(query.toLowerCase()));
        if (foundBook) {
          let loc = `کتاب ${foundBook.title} دیوار نمبر ${foundBook.wall}، رو نمبر ${foundBook.row}، اور باکس نمبر ${foundBook.box} میں موجود ہے۔`;
          if (foundBook.subBox) loc += ` یہ اس باکس کے خانہ نمبر ${foundBook.subBox} میں رکھی گئی ہے۔`;
          speak(loc);
          return setIsProcessing(false);
        } else {
          speak(`معذرت، مجھے لائبریری میں ${query} نامی کوئی کتاب نہیں ملی۔`);
          return setIsProcessing(false);
        }
      }
    }

    // 5. NAVIGATION
    if (isNav || (isStudent && !isCount && !isEdit)) {
      if (/ڈیش بورڈ|ہوم/.test(text)) {
        document.getElementById('nav-dashboard')?.click();
        speak('جی، ڈیش بورڈ حاضر ہے۔');
      } else if (/تمام|لسٹ|ریکارڈ/.test(text) && isStudent) {
        document.getElementById('nav-all_students')?.click();
        speak('جی، طلبہ کا مکمل ریکارڈ کھول دیا گیا ہے۔');
      } else if (/داخلہ|فارم|ایڈمشن/.test(text)) {
        document.getElementById('nav-students')?.click();
        speak('جی، داخلہ فارم کھول دیا گیا ہے۔');
      } else if (isFinance) {
        document.getElementById('nav-finance')?.click();
        speak('جی، مالیاتی نظام (Finance) حاضر ہے۔');
      } else if (/لائبریری|کتب خانہ/.test(text)) {
        document.getElementById('nav-library')?.click();
        speak('جی، لائبریری مینجمنٹ سسٹم حاضر ہے۔');
      } else if (/سیٹنگ|ترتیبات/.test(text)) {
        document.getElementById('nav-settings')?.click();
        speak('جی، سافٹ ویئر کی ترتیبات حاضر ہیں۔');
      } else {
        speak('میں آپ کا حکم سمجھ گیا ہوں، لیکن مجھے وہ صفحہ نہیں ملا۔ کیا آپ دوبارہ واضح کر سکتے ہیں؟');
      }
      return setIsProcessing(false);
    }

    // 5. GREETINGS & MISC
    if (isGreeting) {
      speak('و علیکم السلام! میں الفا ہوں، آپ کا سمارٹ اسسٹنٹ۔ میں آپ کی کیا مدد کر سکتا ہوں؟');
    } else {
      speak('معذرت، میں آپ کی یہ بات مکمل طور پر نہیں سمجھ سکا۔ کیا آپ سادہ الفاظ میں بتا سکتے ہیں کہ آپ کیا کرنا چاہتے ہیں؟');
    }

    setTimeout(() => setIsProcessing(false), 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 bg-[#0a0f1c] rounded-[32px] shadow-2xl border border-white/10 overflow-hidden mb-4"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-widest uppercase">Alpha Assistant</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-blue-100 uppercase font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white/5 p-4 rounded-2xl min-h-[80px] flex flex-col gap-2 border border-white/5 relative group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Listening...</span>
                <p className="text-sm font-urdu text-slate-200 leading-relaxed text-right" dir="rtl">
                  {transcript || 'کچھ بولیں یا "الفا" پکاریں...'}
                </p>
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>

              <div className="bg-blue-600/10 p-4 rounded-2xl min-h-[80px] flex flex-col gap-2 border border-blue-500/20">
                <div className="flex items-center justify-between">
                   <Volume2 className="w-3 h-3 text-blue-400" />
                   <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Alpha Says:</span>
                </div>
                <p className="text-sm font-urdu text-blue-100 leading-relaxed text-right" dir="rtl">
                  {response || 'جی، میں آپ کا کام کرنے کے لیے تیار ہوں۔'}
                </p>
              </div>

              <div className="flex justify-center relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative ${
                    isListening ? 'bg-blue-600/20' : 'bg-slate-800'
                  }`}>
                  {isListening && (
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-blue-500 rounded-full"
                    />
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-blue-600 shadow-2xl shadow-blue-500/50' : 'bg-slate-700'}`}>
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-1.5 h-4">
                {isListening && [1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 16, 4], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-blue-500 rounded-full"
                  />
                ))}
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] text-slate-500 font-urdu italic">مثال: "الفا، 1000 روپے اسلم نے دیے ہیں شامل کرو"</p>
                <p className="text-[10px] text-slate-500 font-urdu italic">"الفا، تمام طالب علموں کی لسٹ دکھاؤ"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl relative overflow-hidden group ${
          isOpen ? 'bg-rose-600 text-white' : 'bg-[#0a0f1c] text-white border border-white/10'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-7 h-7 text-blue-400" />}
        {!isOpen && isListening && (
           <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 border-2 border-blue-500/50 rounded-2xl"
           />
        )}
      </motion.button>
    </div>
  );
}
