import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, CheckCircle, X } from 'lucide-react';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const foundStudent = savedStudents.find((s: any) => s.id.toString() === id);
        setStudent(foundStudent);
        setIsVerified(localStorage.getItem(`verified_${id}`) === 'true');
    }, [id]);

    const handleVerify = () => {
        localStorage.setItem(`verified_${id}`, 'true');
        setIsVerified(true);
    };

    if (!student) return <div className="p-8 text-center">طالب علم نہیں ملا۔</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-urdu" dir="rtl">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-white text-center">
                   <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600 text-4xl">
                      {student.photo ? <img src={student.photo} className="w-full h-full rounded-full object-cover" /> : <User size={48} />}
                   </div>
                   <h2 className="text-2xl font-bold">{student.name}</h2>
                   <p className="opacity-80">{student.grade} - {student.rollNo}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500 font-bold">ولدیت:</span>
                        <span className="font-medium">{student.fatherName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500 font-bold">رجسٹریشن نمبر:</span>
                        <span className="font-mono">{student.regNo}</span>
                    </div>
                    
                    {isVerified ? (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-6">
                            <CheckCircle /> تصدیق شدہ
                        </div>
                    ) : (
                        <button 
                            onClick={handleVerify}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-6 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            دستخط / تصدیق کریں
                        </button>
                    )}

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold mt-2"
                    >
                        واپس
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
