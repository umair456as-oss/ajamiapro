import React from 'react';
import { Printer, ChevronLeft } from 'lucide-react';
import { getMadrassaName } from '../config';

interface AdmissionFormBlankProps {
  onBack: () => void;
}

export default function AdmissionFormBlank({ onBack }: AdmissionFormBlankProps) {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center admission-form-root">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        
        .admission-form-root {
            --primary-color: #004d40;
            --secondary-color: #c5a059;
            --bg-color: #ffffff;
            --text-color: #1a1a1a;
            --white: #ffffff;
        }

        .main-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: var(--bg-color);
            border: 1px solid #ddd;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        }

        .form-border-outer {
            position: absolute;
            top: 5mm;
            right: 5mm;
            bottom: 5mm;
            left: 5mm;
            border: 2px solid var(--primary-color);
            padding: 1mm;
        }

        .form-border-inner {
            height: 100%;
            border: 1px solid var(--secondary-color);
            padding: 8mm;
            box-sizing: border-box;
            position: relative;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0, 77, 64, 0.03);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
            font-family: 'Noto Nastaliq Urdu', serif;
        }

        .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px double var(--primary-color);
            padding-bottom: 10px;
            margin-bottom: 15px;
            position: relative;
            z-index: 1;
        }

        .institution-header { text-align: center; flex: 1; }
        .institution-header h1 {
            font-family: 'Noto Nastaliq Urdu', serif;
            font-size: 2.2em;
            color: var(--primary-color);
            margin: 0;
            line-height: 1.6;
        }
        .institution-header p {
            margin: 0;
            font-size: 11px;
            font-weight: bold;
            color: var(--secondary-color);
        }

        .logo-box {
            width: 80px; height: 80px;
            border: 2px solid var(--primary-color);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            background: var(--white);
        }

        .student-photo-box {
            width: 100px; height: 120px;
            border: 1px solid var(--primary-color);
            background: var(--white);
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; text-align: center; color: #666;
        }

        .form-title-badge {
            background: var(--primary-color);
            color: white;
            padding: 4px 30px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            margin-top: 8px;
            font-size: 14px;
            border: 1px solid var(--secondary-color);
        }

        .section-header {
            background: #f0f7f4;
            border-right: 4px solid var(--primary-color);
            color: var(--primary-color);
            padding: 6px 12px;
            font-weight: bold;
            margin: 15px 0 10px 0;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
        }

        .field-row {
            display: flex; gap: 10px; margin-bottom: 12px; align-items: center;
            font-size: 13px;
        }
        .label {
            font-weight: bold; color: var(--primary-color); min-width: 100px;
        }
        .line-input {
            border-bottom: 1px solid #ccc;
            flex: 1; height: 20px;
        }

        .boxes-group { display: flex; gap: 3px; direction: ltr; }
        .digit-box {
            width: 22px; height: 22px;
            border: 1px solid #999;
            background: var(--white);
        }

        .office-box {
            border: 1px solid var(--primary-color);
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            background: #fafafa;
        }
        .office-title {
            text-align: center; color: var(--primary-color);
            font-weight: bold; margin-bottom: 8px;
            font-size: 14px;
            border-bottom: 1px solid var(--primary-color);
            display: inline-block;
            width: 100%;
        }

        .agreement {
            font-size: 11px; line-height: 1.5;
            border: 1px solid #eee;
            padding: 8px; margin: 10px 0; color: #444;
            background: #fff;
        }

        .sig-area {
            display: flex; justify-content: space-around; margin-top: 25px;
        }
        .sig-line {
            border-top: 1px solid var(--text-color); width: 150px;
            text-align: center; padding-top: 3px; font-weight: bold;
            font-size: 12px;
        }

        @page {
            size: A4;
            margin: 0;
        }

        @media print {
            .no-print { display: none !important; }
            body { background: none; -webkit-print-color-adjust: exact; }
            .main-container { 
                margin: 0; 
                box-shadow: none; 
                border: none;
                width: 210mm;
                height: 297mm;
            }
            .admission-form-root { background: white !important; padding: 0 !important; }
        }

      `}} />

      {/* Control Panel */}
      <div className="w-full max-w-4xl mb-8 no-print flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button 
          onClick={onBack}
          className="bg-slate-800 text-white px-6 py-2 rounded-xl font-urdu font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 ml-1" />
          واپس (Back)
        </button>
        
        <div className="text-center font-urdu">
          <h2 className="text-xl font-bold text-slate-800">خالی داخلہ فارم</h2>
          <p className="text-xs text-slate-500">Manual Admission Form for Printing</p>
        </div>

        <button 
          onClick={() => window.print()}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-urdu font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg"
        >
          <Printer className="w-4 h-4" />
          پرنٹ کریں (Print)
        </button>
      </div>

      {/* Printable Form */}
      <div className="main-container font-urdu" dir="rtl" id="admission-form-printable">
          <div className="watermark">جامعہ عربیہ</div>
          
          <div className="form-border-outer">
            <div className="form-border-inner">
              {/* Header */}
              <header className="form-header">
                  <div className="logo-box"><span className="text-[10px] text-slate-400">لوگو</span></div>
                  <div className="institution-header">
                      <h1>{getMadrassaName()}</h1>
                      <p>مدینہ کالونی، چنار روڈ ٹھاکرہ مانسہرہ (KPK)</p>
                      <div className="form-title-badge">داخلہ فارم (Admission Form)</div>
                  </div>
                  <div className="student-photo-box"><span className="p-2">تصویر یہاں چسپاں کریں</span></div>
              </header>

              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px', color: 'var(--primary-color)', fontSize: '12px'}}>
                  <span>فارم نمبر: ________________</span>
                  <span>تعلیمی سال: 2026ء - 2027ء</span>
              </div>

              {/* Personal Section */}
              <div className="section-header">
                  <span>ذاتی معلومات (Personal Information)</span>
                  <span>حصہ اول</span>
              </div>

              <div className="field-row">
                  <span className="label">نام طالب علم:</span>
                  <div className="boxes-group">
                      {[...Array(14)].map((_, i) => <div key={i} className="digit-box"></div>)}
                  </div>
              </div>

              <div className="field-row">
                  <span className="label">ولدیت:</span>
                  <div className="line-input"></div>
                  <span className="label" style={{minWidth: '40px'}}>قوم:</span>
                  <div className="line-input"></div>
              </div>

              <div className="field-row">
                  <span className="label">شناختی کارڈ نمبر:</span>
                  <div className="boxes-group">
                      {[...Array(5)].map((_, i) => <div key={i} className="digit-box"></div>)}
                      <span style={{fontWeight: 'bold', lineHeight: '22px'}}>-</span>
                      {[...Array(7)].map((_, i) => <div key={i} className="digit-box"></div>)}
                      <span style={{fontWeight: 'bold', lineHeight: '22px'}}>-</span>
                      <div className="digit-box"></div>
                  </div>
              </div>

              <div className="field-row">
                  <span className="label">تاریخ پیدائش:</span>
                  <div className="line-input" style={{flex: 0.4}}></div>
                  <span className="label" style={{minWidth: '60px'}}>رہائش:</span>
                  <div style={{display: 'flex', gap: '15px', fontWeight: 'bold'}}>
                      <label><input type="checkbox" /> مقامی</label>
                      <label><input type="checkbox" /> ہاسٹل</label>
                  </div>
              </div>

              {/* Contact Section */}
              <div className="section-header">
                  <span>رابطہ کی تفصیلات (Contact Details)</span>
                  <span>حصہ دوم</span>
              </div>

              <div className="field-row">
                  <span className="label">مکمل پتہ:</span>
                  <div className="line-input"></div>
              </div>

              <div className="field-row">
                  <span className="label">تحصیل / ضلع:</span>
                  <div className="line-input"></div>
                  <span className="label" style={{minWidth: '90px'}}>موبائل نمبر:</span>
                  <div className="line-input"></div>
              </div>

              {/* Academic Section */}
              <div className="section-header">
                  <span>تعلیمی ریکارڈ (Academic Record)</span>
                  <span>حصہ سوم</span>
              </div>

              <div className="field-row">
                  <span className="label">سابقہ ادارہ:</span>
                  <div className="line-input"></div>
              </div>

              <div className="field-row">
                  <span className="label">سابقہ درجہ:</span>
                  <div className="line-input"></div>
                  <span className="label" style={{minWidth: '90px'}}>مطلوبہ درجہ:</span>
                  <div className="line-input"></div>
              </div>

              {/* Agreement */}
              <div className="agreement">
                  <strong>اقرار نامہ:</strong> میں حلفاً اقرار کرتا ہوں کہ میں جامعہ کے تمام وضع کردہ قوانین کا پابند رہوں گا اور کسی بھی قسم کی غیر قانونی یا غیر اخلاقی سرگرمی میں ملوث نہیں ہوں گا۔ غلط معلومات فراہم کرنے کی صورت میں میرا داخلہ منسوخ کیا جا سکتا ہے۔
              </div>

              <div className="sig-area">
                  <div className="sig-line">دستخط طالب علم</div>
                  <div className="sig-line">دستخط سرپرست</div>
              </div>

              {/* Office Section */}
              <div className="office-box">
                  <div className="office-title">صرف دفتری استعمال کے لیے</div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                      <div className="field-row"><span className="label">داخلہ نمبر:</span><div className="line-input"></div></div>
                      <div className="field-row"><span className="label">تاریخ داخلہ:</span><div className="line-input"></div></div>
                      <div className="field-row"><span className="label">درجہ:</span><div className="line-input"></div></div>
                      <div className="field-row"><span className="label">ماہانہ فیس:</span><div className="line-input"></div></div>
                  </div>
                  <div style={{textAlign: 'center', marginTop: '12px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px'}}>
                      دستخط و مہر ناظم جامعہ: ________________________________
                  </div>
              </div>
            </div>
          </div>
      </div>

    </div>
  );
}

