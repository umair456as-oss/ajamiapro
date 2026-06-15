import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Plus, Pencil, Trash2, Search, Filter, 
  Download, Printer, ArrowUpCircle, ArrowDownCircle, 
  Wallet, List, RefreshCw, Landmark, HelpCircle, CheckCircle2, Upload
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { addToRecycleBin } from './RecycleBin';

interface FinanceManagementProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  date: string;
  title: string;
  contributor: string;
  headId: string;
  accountId: string;
  type: 'income' | 'expense';
  regNo?: string;
  amount: number;
}

interface Head {
  id: string;
  urduName: string;
  englishName: string;
  type: 'income' | 'expense';
  details?: string;
}

interface FinancialAccount {
  id: string;
  urduName: string;
  englishName: string;
  balance: number;
  details?: string;
}

const FinanceManagement: React.FC<FinanceManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'heads' | 'accounts' | 'transfer'>('transactions');
  const [showSuccess, setShowSuccess] = useState(false);
  const [printingReceipt, setPrintingReceipt] = useState<Transaction | null>(null);

  const [systemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : { jamiaName: 'جامعہ عربیہ سراج العلوم', monogram: '' };
  });

  // Data Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [heads, setHeads] = useState<Head[]>(() => {
    const saved = localStorage.getItem('fin_heads');
    return saved ? JSON.parse(saved) : [
      { id: '1', urduName: 'داخلہ فیس', englishName: 'Admission Fee', type: 'income' },
      { id: '2', urduName: 'زکوۃ', englishName: 'Zakat', type: 'income' },
      { id: '3', urduName: 'تنخواہ', englishName: 'Salaries', type: 'expense' }
    ];
  });

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    const saved = localStorage.getItem('fin_accounts');
    return saved ? JSON.parse(saved) : [
      { id: '1', urduName: 'جامعہ', englishName: 'Jamia', balance: 0 },
      { id: '2', urduName: 'تقویٰ', englishName: 'Tawun', balance: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    localStorage.setItem('fin_heads', JSON.stringify(heads));
    localStorage.setItem('fin_accounts', JSON.stringify(accounts));
  }, [transactions, heads, accounts]);

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const totalAccountBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Form States
  const [transForm, setTransForm] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    title: '',
    contributor: '',
    headId: '',
    accountId: '',
    amount: 0
  });

  const [headForm, setHeadForm] = useState<Partial<Head>>({
    urduName: '',
    englishName: '',
    type: 'income',
    details: ''
  });

  const [accForm, setAccForm] = useState<Partial<FinancialAccount>>({
    urduName: '',
    englishName: '',
    balance: 0,
    details: ''
  });

  const [transferForm, setTransferForm] = useState({
    fromAcc: '',
    toAcc: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  // Handlers
  const handleAddTransaction = () => {
    if (!transForm.title || !transForm.headId || !transForm.accountId || transForm.amount === 0) return;
    
    const newTrans: Transaction = {
      ...transForm as Transaction,
      id: `TR-${Date.now()}`
    };

    setTransactions([newTrans, ...transactions]);
    
    // Update Account Balance
    setAccounts(accounts.map(acc => {
      if (acc.id === newTrans.accountId) {
        return {
          ...acc,
          balance: newTrans.type === 'income' ? acc.balance + newTrans.amount : acc.balance - newTrans.amount
        };
      }
      return acc;
    }));

    setTransForm({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      title: '',
      contributor: '',
      headId: '',
      accountId: '',
      amount: 0
    });
    
    triggerSuccess();
  };

  const handleDeleteTransaction = (id: string) => {
    const trans = transactions.find(t => t.id === id);
    if (!trans) return;

    if (!window.confirm('کیا آپ واقعی یہ ریکارڈ حذف کرنا چاہتے ہیں؟')) return;

    addToRecycleBin('finance', trans, 'title');

    // Reverse Account Balance
    setAccounts(accounts.map(acc => {
      if (acc.id === trans.accountId) {
        return {
          ...acc,
          balance: trans.type === 'income' ? acc.balance - trans.amount : acc.balance + trans.amount
        };
      }
      return acc;
    }));

    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleDeleteHead = (id: string) => {
    if (!window.confirm('کیا آپ واقعی یہ مد حذف کرنا چاہتے ہیں؟')) return;
    const head = heads.find(h => h.id === id);
    if (head) addToRecycleBin('finance', head, 'urduName');
    setHeads(heads.filter(x => x.id !== id));
  };

  const handleDeleteAccount = (id: string) => {
    if (!window.confirm('کیا آپ واقعی یہ اکاؤنٹ حذف کرنا چاہتے ہیں؟')) return;
    const acc = accounts.find(a => a.id === id);
    if (acc) addToRecycleBin('finance', acc, 'urduName');
    setAccounts(accounts.filter(x => x.id !== id));
  };

  const handleAddHead = () => {
    if (!headForm.urduName) return;
    const newHead: Head = {
      ...headForm as Head,
      id: `H-${Date.now()}`
    };
    setHeads([...heads, newHead]);
    setHeadForm({ urduName: '', englishName: '', type: 'income', details: '' });
    triggerSuccess();
  };

  const handleAddAccount = () => {
    if (!accForm.urduName) return;
    const newAcc: FinancialAccount = {
      ...accForm as FinancialAccount,
      id: `ACC-${Date.now()}`
    };
    setAccounts([...accounts, newAcc]);
    setAccForm({ urduName: '', englishName: '', balance: 0, details: '' });
    triggerSuccess();
  };

  const handleTransfer = () => {
    if (!transferForm.fromAcc || !transferForm.toAcc || transferForm.amount <= 0 || transferForm.fromAcc === transferForm.toAcc) return;

    const fromAccount = accounts.find(a => a.id === transferForm.fromAcc);
    const toAccount = accounts.find(a => a.id === transferForm.toAcc);
    if (!fromAccount || !toAccount) return;

    const transferId = Date.now();
    
    // Create Expense Trans for From Account
    const expenseTrans: Transaction = {
      id: `TR-${transferId}-1`,
      date: transferForm.date,
      title: `Transfer Out to ${toAccount.urduName}`,
      contributor: 'System',
      headId: 'transfer-out',
      accountId: transferForm.fromAcc,
      type: 'expense',
      amount: transferForm.amount
    };

    // Create Income Trans for To Account
    const incomeTrans: Transaction = {
      id: `TR-${transferId}-2`,
      date: transferForm.date,
      title: `Transfer In from ${fromAccount.urduName}`,
      contributor: 'System',
      headId: 'transfer-in',
      accountId: transferForm.toAcc,
      type: 'income',
      amount: transferForm.amount
    };

    setTransactions([expenseTrans, incomeTrans, ...transactions]);

    // Update Balances
    setAccounts(accounts.map(acc => {
      if (acc.id === transferForm.fromAcc) return { ...acc, balance: acc.balance - transferForm.amount };
      if (acc.id === transferForm.toAcc) return { ...acc, balance: acc.balance + transferForm.amount };
      return acc;
    }));

    setTransferForm({ ...transferForm, amount: 0, details: '' });
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>محفوظ کر لیا گیا ہے!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
           <button 
             onClick={onBack}
             className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition-all font-bold"
           >
             <ArrowRight className="w-5 h-5" />
             <span>ڈیش بورڈ</span>
           </button>

           <button 
             onClick={() => exportToExcel(transactions, 'finance_transactions')}
             className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
           >
             <Download className="w-4 h-4" />
             ایکسل ایکسپورٹ
           </button>
           
           <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer text-sm">
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
                     const merged = [...transactions, ...data];
                     setTransactions(merged);
                     localStorage.setItem('fin_transactions', JSON.stringify(merged));
                     alert('ڈیٹا کامیابی سے اپلوڈ ہو گیا۔');
                   } catch (err) {
                     alert('ایکسل فائل پڑھنے میں خرابی۔');
                   }
                 }
               }} 
             />
           </label>

           <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2">تمام رسیدیں</button>
        </div>

        <div className="flex flex-col text-right">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">آمد و خرچ مینجمنٹ (Finance Management)</h1>
          <p className="text-slate-400 text-xs mt-1">آمدنی اور اخراجات کا جامع و مکمل نظام</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-8 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="کل آمدنی" value={totalIncome} color="bg-emerald-600" />
        <StatCard title="کل خرچ" value={totalExpense} color="bg-rose-600" />
        <StatCard title="نیٹ بیلنس" value={netBalance} color="bg-purple-600" />
        <StatCard title="تمام اکاؤنٹ کی موجودہ رقم" value={totalAccountBalance} color="bg-blue-700" />
      </div>

      {/* Tabs Layout */}
      <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200">
          <TabButton active={activeTab === 'transactions'} label="آمد و خرچ" onClick={() => setActiveTab('transactions')} />
          <TabButton active={activeTab === 'heads'} label="بمرہ جات" onClick={() => setActiveTab('heads')} />
          <TabButton active={activeTab === 'accounts'} label="اکاؤنٹس" onClick={() => setActiveTab('accounts')} />
          <TabButton active={activeTab === 'transfer'} label="اکاؤنٹ ٹرانسفر" onClick={() => setActiveTab('transfer')} />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode='wait'>
            {activeTab === 'transactions' && (
              <motion.div 
                key="trans"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Form Column */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-3 font-bold text-sm">نیا لین دین شامل کریں</div>
                    <div className="p-6 space-y-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setTransForm({...transForm, type: 'income'})}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${transForm.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >آمدنی</button>
                        <button 
                          onClick={() => setTransForm({...transForm, type: 'expense'})}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${transForm.type === 'expense' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >خرچ</button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">عنوان *</label>
                        <input 
                          value={transForm.title} onChange={e => setTransForm({...transForm, title: e.target.value})}
                          placeholder="مثال: مجموعی دن کا چندہ" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">رقم *</label>
                          <input 
                            type="number"
                            value={transForm.amount || ''} onChange={e => setTransForm({...transForm, amount: Number(e.target.value)})}
                            placeholder="0.0" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">تاریخ *</label>
                          <input 
                            type="date"
                            value={transForm.date} onChange={e => setTransForm({...transForm, date: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-mono" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">بمرہ / مد *</label>
                        <select 
                          value={transForm.headId} onChange={e => setTransForm({...transForm, headId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        >
                          <option value="">-- منتخب کریں --</option>
                          {heads.filter(h => h.type === transForm.type).map(h => (
                            <option key={h.id} value={h.id}>{h.urduName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">اکاؤنٹ *</label>
                        <select 
                          value={transForm.accountId} onChange={e => setTransForm({...transForm, accountId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        >
                          <option value="">-- منتخب کریں --</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.urduName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">چندہ دہندہ کا نام</label>
                        <input 
                          value={transForm.contributor} onChange={e => setTransForm({...transForm, contributor: e.target.value})}
                          placeholder="نام منتخب کریں" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>

                      <button 
                        onClick={handleAddTransaction}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                      >
                         <CheckCircle2 className="w-5 h-5" />
                         <span>محفوظ کریں</span>
                      </button>
                    </div>
                  </div>

                  {/* Guidance Info Box */}
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                    <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" /> رہنمائی
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-2 list-disc pr-4">
                      <li><strong>آمدنی:</strong> جب مدرسے کو چندہ، عطیات وغیرہ موصول ہوں، انہیں آمدنی میں درج کریں۔</li>
                      <li><strong>خرچ:</strong> مدرسے کے تمام اخراجات (تنخواہ، یوٹیلیٹی بلز وغیرہ) یہاں درج کریں۔</li>
                      <li>نیٹ بیلنس آپ کی کل آمدنی میں سے کل خرچ نکال کر بنتا ہے۔</li>
                    </ul>
                  </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-6">
                   {/* Table Controls */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 relative min-w-[200px]">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input placeholder="چندہ دہندہ، عنوان یا رسید نمبر سے تلاش کریں..." className="w-full pr-10 pl-4 py-2 bg-slate-50 rounded-lg text-xs outline-none" />
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2">تلاش کریں</button>
                    <button className="bg-slate-100 text-slate-500 px-6 py-2 rounded-lg text-xs font-bold">ری سیٹ</button>
                    <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                      <Printer className="w-4 h-4" /> پرنٹ
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4 border-b border-slate-100">تاریخ</th>
                          <th className="px-6 py-4 border-b border-slate-100">عنوان / رسید نمبر</th>
                          <th className="px-6 py-4 border-b border-slate-100">بمرہ / مد</th>
                          <th className="px-6 py-4 border-b border-slate-100">اکاؤنٹ</th>
                          <th className="px-6 py-4 border-b border-slate-100">قسم</th>
                          <th className="px-6 py-4 border-b border-slate-100 text-left">رقم</th>
                          <th className="px-6 py-4 border-b border-slate-100 text-center">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.map((trans) => {
                          const head = heads.find(h => h.id === trans.headId);
                          const account = accounts.find(a => a.id === trans.accountId);
                          return (
                            <tr key={trans.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-xs text-slate-500 font-mono">{trans.date}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-700">{trans.title}</span>
                                  <span className="text-[10px] text-blue-500 uppercase">{trans.id}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${trans.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                  {head?.urduName || trans.headId}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-600">{account?.urduName || 'N/A'}</td>
                              <td className="px-6 py-4">
                                {trans.type === 'income' ? (
                                  <span className="text-emerald-600 flex items-center gap-1 text-[10px] uppercase font-bold">
                                    <ArrowUpCircle className="w-4 h-4" /> آمدنی
                                  </span>
                                ) : (
                                  <span className="text-rose-600 flex items-center gap-1 text-[10px] uppercase font-bold">
                                    <ArrowDownCircle className="w-4 h-4" /> خرچ
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-900 text-left" dir="ltr">
                                {trans.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => setPrintingReceipt(trans)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="پرنٹ رسید"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteTransaction(trans.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {transactions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-slate-400">کوئی لین دین درج نہیں ہے۔</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'heads' && (
              <motion.div 
                key="heads"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-3 font-bold text-sm">نیا بمرہ / مد شامل کریں</div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">بمرہ / مد کا نام *</label>
                        <input 
                          value={headForm.urduName} onChange={e => setHeadForm({...headForm, urduName: e.target.value})}
                          placeholder="مثال: مدرسہ کا اجتماعی اکاؤنٹ" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">انگریزی نام (اختیاری)</label>
                        <input 
                          value={headForm.englishName} onChange={e => setHeadForm({...headForm, englishName: e.target.value})}
                          placeholder="e.g. Donation Account" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>
                      <div className="flex gap-4 items-center py-2">
                        <span className="text-sm font-bold text-slate-600">قسم:</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="headType" checked={headForm.type === 'income'} onChange={() => setHeadForm({...headForm, type: 'income'})} className="accent-emerald-600" />
                          <span className="text-sm">آمدنی</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="headType" checked={headForm.type === 'expense'} onChange={() => setHeadForm({...headForm, type: 'expense'})} className="accent-rose-600" />
                          <span className="text-sm">خرچ</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">تفصیل</label>
                        <textarea 
                          value={headForm.details} onChange={e => setHeadForm({...headForm, details: e.target.value})}
                          placeholder="مد سے متعلق مختصراً تفصیل..." 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none min-h-[100px]" 
                        />
                      </div>
                      <button 
                        onClick={handleAddHead}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                      >
                         <Plus className="w-5 h-5" />
                         <span>بمرہ شامل کریں</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="bg-[#0f172a] text-white px-6 py-3 font-bold text-xs uppercase tracking-widest text-center">موجودہ بمرے</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                           <th className="px-4 py-3 border-b">نام</th>
                           <th className="px-4 py-3 border-b">انگریزی نام</th>
                           <th className="px-4 py-3 border-b">قسم</th>
                           <th className="px-4 py-3 border-b text-center">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {heads.map(h => (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-700">{h.urduName}</td>
                            <td className="px-4 py-3 text-slate-400 italic">{h.englishName}</td>
                            <td className="px-4 py-3">
                               <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${h.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {h.type === 'income' ? 'آمدنی' : 'خرچ'}
                               </span>
                            </td>
                            <td className="px-4 py-3">
                               <div className="flex justify-center gap-2">
                                  <button onClick={() => handleDeleteHead(h.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Pencil size={14}/></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'accounts' && (
              <motion.div 
                key="accounts"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-3 font-bold text-sm">نیا اکاؤنٹ بنائیں</div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">اکاؤنٹ کا نام *</label>
                        <input 
                          value={accForm.urduName} onChange={e => setAccForm({...accForm, urduName: e.target.value})}
                          placeholder="مثال: مدرسہ کا اجتماعی اکاؤنٹ" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">انگریزی نام *</label>
                        <input 
                          value={accForm.englishName} onChange={e => setAccForm({...accForm, englishName: e.target.value})}
                          placeholder="e.g. Madrasah Ijtima Khata" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">ابتدائی بیلنس</label>
                        <input 
                          type="number"
                          value={accForm.balance || ''} onChange={e => setAccForm({...accForm, balance: Number(e.target.value)})}
                          placeholder="0.0" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                        />
                      </div>
                      <button 
                        onClick={handleAddAccount}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                      >
                         <Plus className="w-5 h-5" />
                         <span>حساب محفوظ کریں</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="bg-amber-400 text-slate-900 px-6 py-3 font-bold text-xs uppercase tracking-widest text-center">موجودہ اکاؤنٹس</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                           <th className="px-4 py-3 border-b">نام</th>
                           <th className="px-4 py-3 border-b">انگریزی نام</th>
                           <th className="px-4 py-3 border-b">موجودہ بیلنس</th>
                           <th className="px-4 py-3 border-b text-center">عمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {accounts.map(acc => (
                          <tr key={acc.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-700">{acc.urduName}</td>
                            <td className="px-4 py-3 text-slate-400 italic">{acc.englishName}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600" dir="ltr">{acc.balance.toLocaleString()}</td>
                            <td className="px-4 py-3">
                               <div className="flex justify-center gap-2">
                                  <button onClick={() => handleDeleteAccount(acc.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Pencil size={14}/></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'transfer' && (
              <motion.div 
                key="transfer"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-[#059669] text-white px-8 py-4 font-bold">اکاؤنٹس کے درمیان رقم ٹرانسفر کریں</div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">کس اکاؤنٹ سے (From) *</label>
                          <select 
                            value={transferForm.fromAcc} onChange={e => setTransferForm({...transferForm, fromAcc: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          >
                            <option value="">-- منتخب کریں --</option>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.urduName}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">کس اکاؤنٹ میں (To) *</label>
                          <select 
                            value={transferForm.toAcc} onChange={e => setTransferForm({...transferForm, toAcc: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                          >
                            <option value="">-- منتخب کریں --</option>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.urduName}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">رقم *</label>
                          <input 
                            type="number"
                            value={transferForm.amount || ''} onChange={e => setTransferForm({...transferForm, amount: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">تاریخ *</label>
                          <input 
                            type="date"
                            value={transferForm.date} onChange={e => setTransferForm({...transferForm, date: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-600">تفصیل (اختیاری)</label>
                       <textarea 
                          value={transferForm.details} onChange={e => setTransferForm({...transferForm, details: e.target.value})}
                          placeholder="مثال: بجلی کے بل کے لیے رقم ٹرانسفر" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none min-h-[120px]" 
                       />
                    </div>

                    <button 
                       onClick={handleTransfer}
                       className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold hover:bg-[#047857] transition-all shadow-xl shadow-emerald-500/20"
                    >
                      ٹرانسفر کریں
                    </button>
                  </div>
                </div>

                <div className="bg-slate-100 p-8 rounded-[40px] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6">
                    <RefreshCw className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">نوٹ</h3>
                  <div className="text-right space-y-4 text-slate-600 px-6 font-urdu">
                    <p>رقم ٹرانسفر کرنے پر سسٹم خودکار طور پر:</p>
                    <ul className="space-y-2 list-decimal pr-6">
                      <li>From اکاؤنٹ میں <strong>خرچ (کم)</strong> کرے گا</li>
                      <li>To اکاؤنٹ میں <strong>آمدنی (زیادہ)</strong> کرے گا</li>
                      <li>دونوں ریکارڈ ایک ہی Transfer ID کے تحت محفوظ ہوں گے۔</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Receipt Print View */}
      {printingReceipt && (
        <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col items-center justify-center p-8 no-print overflow-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8 flex gap-4 w-full max-w-lg">
             <button 
               onClick={() => setPrintingReceipt(null)}
               className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold font-urdu"
             >واپس (Back)</button>
             <button 
               onClick={() => window.print()}
               className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold font-urdu flex items-center justify-center gap-2"
             >
               <Printer className="w-5 h-5" />
               پرنٹ کریں
             </button>
          </div>

          <div 
            id="receipt-print"
            className="w-[148mm] h-[210mm] bg-white p-8 border-[10px] border-double border-slate-900 relative print:m-0 print:border-none print:shadow-none print:w-full font-urdu"
            dir="rtl"
          >
             {/* Receipt Border Decoration */}
             <div className="absolute inset-2 border border-slate-200 pointer-events-none" />

             {/* Header Section */}
             <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-900">
                <div className="space-y-1">
                   <div className="w-20 h-20 bg-slate-100 rounded-2xl border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                      {systemSettings.monogram ? (
                        <img src={systemSettings.monogram} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <Landmark className="w-10 h-10 text-slate-400" />
                      )}
                   </div>
                </div>
                
                <div className="flex-1 text-center px-4 pt-2">
                   <h1 className="text-3xl font-black text-slate-900 mb-1 leading-none">{systemSettings.jamiaName}</h1>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Official Accounting Receipt</p>
                   <div className="mt-4 flex justify-center">
                      <span className={`px-8 py-1.5 rounded-full text-white font-black text-xl shadow-lg ${printingReceipt.type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        {printingReceipt.type === 'income' ? 'آمدنی رسید' : 'خرچ کی رسید'}
                      </span>
                   </div>
                </div>

                <div className="text-left font-mono space-y-1 pt-2">
                   <div className="flex flex-col items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Receipt ID</span>
                      <span className="text-sm font-black text-slate-900">{printingReceipt.id}</span>
                   </div>
                </div>
             </div>

             {/* Main Receipt Content */}
             <div className="space-y-8 mt-12 px-4 relative">
                {/* Background Watermark Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                   <Landmark className="w-64 h-64" />
                </div>

                <div className="flex items-center gap-4 border-b border-dotted border-slate-300 pb-2">
                   <span className="text-lg font-bold text-slate-600 min-w-[120px]">تاریخ (Date):</span>
                   <span className="text-xl font-black text-slate-900 border-b-2 border-slate-100 flex-1 pb-1">{printingReceipt.date}</span>
                </div>

                <div className="flex items-center gap-4 border-b border-dotted border-slate-300 pb-2">
                   <span className="text-lg font-bold text-slate-600 min-w-[120px]">
                     {printingReceipt.type === 'income' ? 'وصولندہ کا نام:' : 'نام / کمپنی:'}
                   </span>
                   <span className="text-2xl font-black text-slate-900 border-b-2 border-slate-100 flex-1 pb-1">{printingReceipt.contributor || '---'}</span>
                </div>

                <div className="flex items-center gap-4 border-b border-dotted border-slate-300 pb-2">
                   <span className="text-lg font-bold text-slate-600 min-w-[120px]">مد / تفصیل:</span>
                   <span className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 flex-1 pb-1">{printingReceipt.title}</span>
                </div>

                <div className="flex items-center gap-4 border-b border-dotted border-slate-300 pb-2">
                   <span className="text-lg font-bold text-slate-600 min-w-[120px]">بمرہ (Head):</span>
                   <span className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 flex-1 pb-1">
                     {heads.find(h => h.id === printingReceipt.headId)?.urduName || printingReceipt.headId}
                   </span>
                </div>

                {/* Amount Area */}
                <div className="mt-16 flex justify-between items-end gap-12 pt-10">
                   <div className="flex-1 bg-slate-900 text-white p-6 rounded-3xl group shadow-2xl relative">
                      <div className="absolute -top-3 right-8 bg-amber-400 text-slate-900 px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">تعداد (Amount)</div>
                      <div className="flex items-center gap-4">
                         <span className="text-2xl font-bold opacity-50">RS.</span>
                         <span className="text-4xl font-black tracking-wider font-mono">{printingReceipt.amount.toLocaleString()}/-</span>
                      </div>
                   </div>

                   <div className="space-y-12 min-w-[200px]">
                      <div className="text-center pt-8 border-t-2 border-slate-900 font-bold text-slate-800">دستخط معتمد (Sign Accountant)</div>
                      <div className="text-center pt-8 border-t-2 border-slate-200 font-medium text-slate-400 text-sm italic">Computer Generated Receipt</div>
                   </div>
                </div>
             </div>

             {/* Footer Attribution */}
             <div dir="ltr" className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400 group">
                <div className="flex gap-4">
                   <span>Jamia System v2.0</span>
                   <span className="text-blue-500/50">Finance Module</span>
                </div>
                <div>Developed by: AbdulRehman Habib</div>
             </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body { background: white !important; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              #receipt-print { 
                box-shadow: none !important; 
                margin: 0 !important;
                border: none !important;
                width: 100% !important;
                height: 100% !important;
              }
              @page { size: A5 landscape; margin: 5mm; }
            }
          `}} />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div className={`${color} p-6 rounded-3xl border border-white/10 shadow-xl text-white relative overflow-hidden group transition-all hover:scale-[1.02]`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
    <span className="text-xs font-bold font-urdu opacity-80 mb-2 block">{title}</span>
    <div className="text-2xl font-bold font-mono tracking-wider flex items-center gap-2" dir="ltr">
      <span className="text-sm opacity-60">PKR</span>
      {value.toLocaleString()}
    </div>
  </div>
);

const TabButton = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 text-sm font-urdu font-bold transition-all relative ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
    {active && (
      <motion.div layoutId="finTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600" />
    )}
  </button>
);

export default FinanceManagement;
