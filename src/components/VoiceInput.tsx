import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Keyboard, Languages } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: 'ur-PK' | 'en-US';
}

export default function VoiceInput({ onTranscript, language: defaultLang = 'ur-PK' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'ur-PK' | 'en-US'>(defaultLang);
  const [showAccent, setShowAccent] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setShowAccent(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        setShowAccent(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setShowAccent(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setShowAccent(false);
      };
    }
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      } else {
        alert('آپ کا براؤزر وائس ٹائپنگ کو سپورٹ نہیں کرتا۔');
      }
    }
  };

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLanguage(prev => prev === 'ur-PK' ? 'en-US' : 'ur-PK');
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        onClick={toggleListening}
        className={`p-2 rounded-full transition-all flex items-center justify-center ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
        title={isListening ? 'بولنا بند کریں' : 'وائس ٹائپنگ'}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {isListening && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-300">
           <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 flex flex-col items-center gap-6 animate-in zoom-in duration-300">
              <div className="relative">
                 <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-ping absolute inset-0 opacity-20"></div>
                 <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-red-500/30">
                    <Mic className="w-10 h-10 text-white" />
                 </div>
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-bold text-slate-800 font-urdu">سن رہا ہوں...</h3>
                 <p className="text-slate-500 font-urdu">{language === 'ur-PK' ? 'اردو میں بولیں' : 'Speak in English'}</p>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={toggleLanguage}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
                 >
                    <Languages className="w-4 h-4" />
                    {language === 'ur-PK' ? 'English' : 'اردو'}
                 </button>
                 <button 
                  onClick={() => recognitionRef.current?.stop()}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                 >
                    بند کریں
                 </button>
              </div>
           </div>
        </div>
      )}

      <button
        onClick={toggleLanguage}
        className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
        title="زبان تبدیل کریں"
      >
        <span className="text-[10px] font-bold">{language === 'ur-PK' ? 'اردو' : 'EN'}</span>
      </button>
    </div>
  );
}
