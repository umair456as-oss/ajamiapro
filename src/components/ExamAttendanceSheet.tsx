import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { getMadrassaName } from '../config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';

interface ExamAttendanceSheetProps {
  onClose: () => void;
}

const ExamAttendanceSheet: React.FC<ExamAttendanceSheetProps> = ({ onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [examClass, setExamClass] = useState('');
  const [examName, setExamName] = useState('سالانہ امتحان 2026');
  const [examSubject, setExamSubject] = useState('القرآن الکریم / الحدیث');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examRoom, setExamRoom] = useState('کمرہ نمبر 1');
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(savedStudents);
    const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    setClasses(savedGrades.map((g: any) => g.name).length > 0 ? savedGrades.map((g: any) => g.name) : ['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'سادسہ', 'سابعہ', 'دورہ حدیث']);
  }, []);

  const downloadPDF = async () => {
    const input = printRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Exam-Attendance-${examClass}-${examDate}.pdf`);
  };

  const renderExamSheet = () => {
    const examStudents = students.filter(s => s && s.grade === examClass);
    const totalRowsCount = Math.max(25, examStudents.length);
    const rows = Array.from({ length: totalRowsCount });

    return (
      <div className="w-full text-right p-4 bg-white select-text font-urdu" dir="rtl">
        <div className="text-center space-y-2 pb-6 border-b-[2px] border-black">
          <h1 className="text-2xl font-black text-black tracking-wide leading-relaxed">{getMadrassaName()}</h1>
          <h2 className="text-lg font-bold text-black tracking-wide bg-slate-100 py-1.5 px-4 rounded-xl inline-block">امتحانی حاضری شیٹ</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 py-4 text-xs font-bold text-black border-b-[2px] border-black text-right">
          <div className="flex gap-2"><span className="text-slate-600">امتحان:</span><span className="border-b border-black/40 flex-1 px-1">{examName}</span></div>
          <div className="flex gap-2"><span className="text-slate-600">درجہ:</span><span className="border-b border-black/40 flex-grow px-1">{examClass}</span></div>
          <div className="flex gap-2"><span className="text-slate-600">مضمون:</span><span className="border-b border-black/40 flex-grow px-1">{examSubject}</span></div>
          <div className="flex gap-2"><span className="text-slate-600">تاریخ:</span><span className="border-b border-black/40 flex-grow px-1 font-mono">{examDate}</span></div>
          <div className="flex gap-2"><span className="text-slate-600">کمرہ:</span><span className="border-b border-black/40 flex-grow px-1">{examRoom}</span></div>
        </div>
        <table className="w-full border-collapse mt-4 text-black">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-[1.5px] border-black px-2 py-3 w-10 text-center text-[10px] font-bold">شمار</th>
              <th className="border-[1.5px] border-black px-2 py-3 w-28 text-center text-[10px] font-bold">رول نمبر</th>
              <th className="border-[1.5px] border-black px-3 py-3 text-right text-[11px] font-bold">نام طالب علم</th>
              <th className="border-[1.5px] border-black px-2 py-3 w-16 text-center text-[10px] font-bold">پروفائل QR</th>
              <th className="border-[1.5px] border-black px-2 py-3 w-16 text-center text-[10px] font-bold">حاضری</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((_, idx) => {
              const student = examStudents[idx];
              const profileUrl = `${window.location.origin}/student-profile/${student?.id}`;
              return (
                <tr key={idx} className="h-16">
                  <td className="border-[1.5px] border-black text-center text-xs font-mono font-bold leading-none">{idx + 1}</td>
                  <td className="border-[1.5px] border-black text-center text-xs font-mono font-medium leading-none">{student?.rollNo || '---'}</td>
                  <td className="border-[1.5px] border-black px-3 text-right text-xs font-black">{student?.name || ""}</td>
                  <td className="border-[1.5px] border-black flex justify-center items-center p-1">
                    {student ? <QRCodeCanvas value={profileUrl} size={40} /> : null}
                  </td>
                  <td className="border-[1.5px] border-black text-center text-[10px] text-slate-300">حاضر/غائب</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden font-urdu">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold">امتحانی حاضری شیٹ جنریٹر</h3>
          <div className="flex gap-3">
             <button onClick={downloadPDF} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Download className="w-4 h-4"/>PDF</button>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 p-6 bg-slate-50 space-y-4">
            <select value={examClass} onChange={e => setExamClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl">{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <input value={examName} onChange={e => setExamName(e.target.value)} className="w-full px-3 py-2 border rounded-xl" placeholder="امتحان کا نام"/>
            <input value={examSubject} onChange={e => setExamSubject(e.target.value)} className="w-full px-3 py-2 border rounded-xl" placeholder="مضمون"/>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl"/>
            <input value={examRoom} onChange={e => setExamRoom(e.target.value)} className="w-full px-3 py-2 border rounded-xl" placeholder="کمرہ نمبر"/>
          </div>
          <div className="w-2/3 p-6 bg-slate-200 overflow-auto" ref={printRef}>
            {renderExamSheet()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExamAttendanceSheet;
