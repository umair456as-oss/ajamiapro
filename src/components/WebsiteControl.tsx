import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Globe, Layout, Search, FileText, MessageSquare,
  Settings, Eye, Plus, Trash2, Save, Image as ImageIcon,
  CheckCircle, AlertCircle, ExternalLink, Megaphone, Phone, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';
import { getMadrassaName } from '../config';

interface WebsiteControlProps {
  onBack: () => void;
}

export default function WebsiteControl({ onBack }: WebsiteControlProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'fatwa' | 'gallery' | 'home_sections'>('overview');
  const [showPreview, setShowPreview] = useState(false);

  // Website Settings State
  const [webSettings, setWebSettings] = useState(() => {
    const saved = localStorage.getItem('website_settings');
    return saved ? JSON.parse(saved) : {
      heroTitle: getMadrassaName(),
      heroSubtitle: 'علم و عمل کا مرکز، روشن مستقبل کی ضمانت',
      marqueeText: 'جامعہ میں سالانہ امتحانات کے داخلے شروع ہو چکے ہیں۔ | مفتی صاحب کا نیا فتویٰ ویب سائٹ پر اپلوڈ کر دیا گیا ہے۔',
      logo: '',
      phone: '0997-123456',
      email: 'info@sirajuloom.edu.pk',
      primaryColor: '#005682',
      secondaryColor: '#0077be',
      showResults: true,
      showFatwa: true,
      lastUpdated: new Date().toLocaleDateString(),
      bannerImage: '',
      tabImages: {
        news: '', rabta: '', admission: '', results: '',
        arabicMonthly: '', arabicQuarterly: '', urduMonthly: '',
        books: '', gallery: ''
      },
      language: 'ur'
    };
  });
  // Fatwa Management State
  const [fatawa, setFatawa] = useState(() => {
    const saved = localStorage.getItem('website_fatawa');
    return saved ? JSON.parse(saved) : [
      { id: 1, question: 'کیا زکوٰۃ کی رقم سے دینی کتب خریدی جا سکتی ہیں؟', answer: 'الجواب وباللہ التوفیق: زکوٰۃ کی رقم کا مصرف فقراء اور مساکین ہیں، لہذا کتب کی خریداری اگر ان کو مالک بنا کر کی جائے تو جائز ہے۔', category: 'زکوٰۃ', date: '2024-05-10', status: 'published' }
    ];
  });

  // Gallery Categories State
  const [galleryCategories, setGalleryCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('website_gallery_categories');
    return saved ? JSON.parse(saved) : ['تعلیمی پروگرام', 'عمارت', 'میڈیا کوریج'];
  });

  // Gallery Management State
  const [gallery, setGallery] = useState<{ id: number, url: string, title: string, category: string }[]>(() => {
    const saved = localStorage.getItem('website_gallery');
    return saved ? JSON.parse(saved) : [
      { id: 1, url: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e', title: 'جامعہ کی عمارت', category: 'عمارت' },
      { id: 2, url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713', title: 'تعلیمی سرگرمیاں', category: 'تعلیمی پروگرام' }
    ];
  });

  // Home Sections State
  const [homeSections, setHomeSections] = useState(() => {
    const saved = localStorage.getItem('website_home_sections');
    return saved ? JSON.parse(saved) : {
      team: [
        { id: 1, image: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e', nameEn: 'Qari Abdul Haleem', nameAr: 'جناب قاری عبد الحلیم رحمہ اللہ', title: 'Patron-in-Chief' },
        { id: 2, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713', nameEn: 'Dr Mufti Noman Naeem', nameAr: 'المفتی نعمان نعیم', title: 'President' },
        { id: 3, image: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e', nameEn: 'Mufti Muhammad Naeem', nameAr: 'مفتی محمد نعیم رحمہ اللہ', title: 'Founder' }
      ],
      professionals: [
        { id: 1, image: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e' },
        { id: 2, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' },
        { id: 3, image: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e' },
        { id: 4, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' }
      ],
      alumni: [
        { id: 1, image: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e' },
        { id: 2, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' },
        { id: 3, image: 'https://images.unsplash.com/photo-1591011311090-f9479b4a112e' },
        { id: 4, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('website_settings', JSON.stringify(webSettings));
    localStorage.setItem('website_fatawa', JSON.stringify(fatawa));
    localStorage.setItem('website_gallery', JSON.stringify(gallery));
    localStorage.setItem('website_gallery_categories', JSON.stringify(galleryCategories));
    localStorage.setItem('website_home_sections', JSON.stringify(homeSections));
  }, [webSettings, fatawa, gallery, galleryCategories, homeSections]);

  useEffect(() => {
    const handleUpdate = () => {
      const savedSettings = localStorage.getItem('website_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (JSON.stringify(parsed) !== JSON.stringify(webSettings)) setWebSettings(parsed);
      }
      const savedFatawa = localStorage.getItem('website_fatawa');
      if (savedFatawa) {
        const parsed = JSON.parse(savedFatawa);
        if (JSON.stringify(parsed) !== JSON.stringify(fatawa)) setFatawa(parsed);
      }
      const savedGallery = localStorage.getItem('website_gallery');
      if (savedGallery) {
        const parsed = JSON.parse(savedGallery);
        if (JSON.stringify(parsed) !== JSON.stringify(gallery)) setGallery(parsed);
      }
      const savedCats = localStorage.getItem('website_gallery_categories');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (JSON.stringify(parsed) !== JSON.stringify(galleryCategories)) setGalleryCategories(parsed);
      }
      const savedSections = localStorage.getItem('website_home_sections');
      if (savedSections) {
        const parsed = JSON.parse(savedSections);
        if (JSON.stringify(parsed) !== JSON.stringify(homeSections)) setHomeSections(parsed);
      }
    };

    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, [webSettings, fatawa, gallery, galleryCategories, homeSections]);

  const handleSaveSettings = () => {
    setWebSettings({ ...webSettings, lastUpdated: new Date().toLocaleDateString() });
    alert('ویب سائٹ کی ترتیبات محفوظ کر لی گئی ہیں!');
  };

  const handleExportToGitHub = () => {
    const allResults = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    const D = {
      settings: webSettings,
      fatawa,
      gallery,
      galleryCategories,
      homeSections,
      all_exam_results: allResults
    };
    const S = D.settings;
    const PRM = '#A0522D'; // Terracotta
    const ACC = '#C5A059'; // Gold/Khaki
    const DRK = '#2D1B10'; // Dark Brown
    const LGT = '#FAF7F2'; // Light Cream
    const WHT = '#FFFFFF'; // White
    // Re-read results in case they were updated
    D.all_exam_results = JSON.parse(localStorage.getItem('all_exam_results') || '[]');

    const html = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${S.heroTitle} | جامعہ پورٹل</title>
<meta name="description" content="${S.heroTitle} - تعلیمی پورٹل، آن لائن نتائج، دارالافتاء">
<meta name="google-site-verification" content="google86510787e1b5cbcd" />
<meta name="google-site-verification" content="4ZVTqf3Jf-GRbhqaQM_RZqWciRZhEzuputx7sPtG6jY" />
<script src="https://cdn.tailwindcss.com"><\/script>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
<style>
body{font-family:'Noto Nastaliq Urdu',serif}
@keyframes marquee{0%{transform:translateX(100%)}100%{transform:translateX(-200%)}}
.mq{animation:marquee 22s linear infinite;display:inline-block;white-space:nowrap}
.scrollbar-hide::-webkit-scrollbar{display:none}
</style>
</head>
<body class="bg-white">
<div id="root"></div>
<script>
const SITE=${JSON.stringify(D)};
const {useState,useEffect,createElement:h}=React;
const ACC='${ACC}',PRM='${PRM}',DRK='${DRK}',LGT='${LGT}',WHT='${WHT}';
function App(){
  const [page,setPageRaw]=useState(()=>{
    const p = window.location.pathname.replace('/','');
    return ['home','result','fatwa','gallery','about','departments','contact','login'].includes(p) ? p : 'home';
  });
  const setPage = (p) => {
    setPageRaw(p);
    window.history.pushState({}, '', '/'+(p==='home'?'':p));
  };
  useEffect(()=>{
    const h = () => {
      const p = window.location.pathname.replace('/','');
      setPageRaw(['home','result','fatwa','gallery','about','departments','contact','login'].includes(p) ? p : 'home');
    };
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  },[]);
  const [gf,setGf]=useState('تمام تصاویر');
  const [rn,setRn]=useState('');
  const [res,setRes]=useState(null);
  const [gender,setGender]=useState('بنین');
  const [term,setTerm]=useState('سالانہ');
  const [year,setYear]=useState('1447');
  const [exClass,setExClass]=useState('');
  const S=SITE.settings;
  const nav=[{id:'home',label:'HOME'},{id:'fatwa',label:'ONLINE FATWA'},{id:'result',label:'RESULTS'},{id:'gallery',label:'GALLERY'}];
  function search(){
    let f=null;
    (SITE.all_exam_results||[]).forEach(ex=>{
      const st=(ex.records||[]).find(r=>r.rollNo===rn);
      if(st)f={...st,examType:ex.examType,className:ex.className};
    });
    setRes(f||{error:true});
  }
  const hdr=h('div',{key:'hdr'},
    h('div',{style:{backgroundColor:DRK},className:'text-white py-2 px-6 flex justify-between items-center text-xs font-bold'},
      h('span',null,h('span',{style:{color:ACC}},'📞 ')+ (S.phone || '0997-123456')),
      h('div',{className:'flex gap-6 items-center'},
        h('div',{className:'flex gap-2 border-l border-white/20 pl-6 ml-6'},
          h('button',{onClick:()=>setPage('home')},'اردو'),
          h('button',{onClick:()=>setPage('home')},'العربية'),
          h('button',{onClick:()=>setPage('home')},'English')
        ),
        h('button',{onClick:()=>setPage('fatwa'),className:'hover:text-emerald-400'},'آن لائن فتاویٰ'),
        h('button',{onClick:()=>setPage('login'),className:'hover:text-emerald-400'},'لاگ ان'),
        h('span',{className:'hover:text-emerald-400 cursor-pointer'},'ڈونیٹ کریں')
      )
    ),
    h('header',{className:'bg-white border-b border-slate-100 overflow-hidden'},
      h('div',{className:'max-w-7xl mx-auto'},
        S.bannerImage ? h('img',{src:S.bannerImage,className:'w-full h-auto',alt:'Banner'}) : 
        h('div',{className:'py-8 flex flex-col items-center gap-4 text-center'},
          S.logo ? h('img',{src:S.logo,className:'h-24 w-auto',alt:'Logo'}) : h('div',{style:{backgroundColor:ACC},className:'w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl'},'س'),
          h('div',null,
            h('h1',{className:'text-4xl font-bold text-slate-900'},S.heroTitle),
            h('p',{className:'text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'},'Islamic Educational Institution')
          )
        )
      )
    ),
    h('nav',{style:{backgroundColor:DRK},className:'sticky top-0 z-50 shadow-lg overflow-x-auto whitespace-nowrap scrollbar-hide text-center'},
      h('div',{className:'max-w-7xl mx-auto flex items-center justify-center gap-1'},
        nav.map(m=>h('button',{key:m.id,onClick:()=>setPage(m.id),className:'px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400 hover:text-white transition-all',style:{color:page===m.id?'white':'',borderBottom:page===m.id?'4px solid '+ACC:''}},m.label))
      )
    ),
    h('div',{style:{backgroundColor:WHT},className:'py-2 overflow-hidden border-b border-slate-100 relative'},
      h('div',{className:'absolute right-0 top-0 bottom-0 flex items-center px-4 z-10',style:{backgroundColor:PRM}},h('span',{className:'text-white text-xs font-bold'},'تازہ ترین')),
      h('div',{className:'mq pr-24'},h('span',{className:'text-xs text-slate-500'},S.marqueeText.split('|').map((t,i)=>h('span',{key:i},h('span',{style:{color:ACC}},' ✦ ')+t))))
    )
  );
  const hi=(SITE.gallery&&SITE.gallery[0])?SITE.gallery[0].url:'https://images.unsplash.com/photo-1591011311090-f9479b4a112e?w=1200';
  const home=h('div',{className:'max-w-[1400px] mx-auto py-10 px-4'},
    h('div',{className:'grid grid-cols-1 lg:grid-cols-12 gap-8'},
      h('div',{className:'lg:col-span-2 space-y-4'},
        [{l:'اردو',s:'Urdu Intro',i:'✍️'},{l:'العربية',s:'Arabic Intro',i:'📜'},{l:'ENGLISH',s:'English Intro',i:'🌐'},{l:'हिन्दी',s:'Hindi Intro',i:'🇮🇳'},{l:'رابطہ',s:'Contact',i:'📞'}].map(item=>
          h('div',{className:'bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm'},
            h('div',{className:'text-2xl mb-2'},item.i),h('h4',{className:'text-lg font-bold'},item.l),h('p',{className:'text-[10px] text-slate-400 font-bold uppercase'},item.s)
          )
        )
      ),
      h('div',{className:'lg:col-span-7'},
        h('div',{className:'grid grid-cols-1 md:grid-cols-2 gap-4 text-right'},
          [
            {id:'news',t:'خبریں و اعلانات',s:'News & Notices',i:'📢'},
            {id:'rabta',t:'رابطہ مدارس',s:'Rabta Madaris',i:'🌐'},
            {id:'admission',t:'قواعدِ داخلہ',s:'Admission Rules',i:'📄'},
            {id:'results',t:'نتائجِ امتحانات',s:'Exam Results',a:'result',i:'🔍'},
            {id:'arabicMonthly',t:'ماہنامہ الداعی',s:'Arabic Monthly',i:'📖'},
            {id:'urduMonthly',t:'ماہنامہ سراج العلوم',s:'Urdu Monthly',i:'📚'},
            {id:'gallery',t:'تصاویر و آڈیو',s:'Gallery',a:'gallery',i:'🖼️'},
            {id:'books',t:'کتب ڈاؤن لوڈ',s:'Download Books',i:'📥'}
          ].map(item=>
            h('div',{style:{backgroundColor:LGT},className:'border border-slate-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer group aspect-[768/294]',onClick:()=>item.a&&setPage(item.a)},
              h('div',{className:'w-full h-full relative overflow-hidden'},
                S.tabImages[item.id] ? h('img',{src:S.tabImages[item.id],className:'w-full h-full object-cover group-hover:scale-110 transition-all duration-700'}) : 
                h('div',{className:'w-full h-full flex flex-col items-center justify-center gap-2'},
                  h('div',{style:{color:ACC},className:'text-3xl opacity-20'},item.i),
                  h('span',{className:'text-[8px] font-bold text-slate-300 uppercase'},item.s)
                ),
                h('div',{className:'absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all'})
              )
            )
          )
        )
      ),
      h('div',{className:'lg:col-span-3 space-y-6'},
        h('div',{className:'bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm'},
          h('div',{className:'bg-slate-900 p-4 text-white text-center font-bold'},'آن لائن چندہ'),
          h('div',{className:'p-6 text-center space-y-4'},
            h('h4',{className:'text-lg font-bold'},'Online Donation'),
            h('p',{className:'text-[10px] text-slate-500'},'جامعہ کے رفاہی کاموں میں تعاون کریں۔'),
            h('button',{style:{backgroundColor:ACC},className:'w-full py-3 rounded-xl text-white font-bold'},'ڈونیٹ کریں')
          )
        ),
        h('div',{className:'bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm'},
          h('div',{className:'bg-teal-600 p-4 text-white text-center font-bold'},'آن لائن فتویٰ'),
          h('div',{className:'p-4 space-y-3 text-center'},
            h('button',{onClick:()=>setPage('fatwa'),className:'w-full py-3 bg-blue-600 text-white rounded-xl font-bold'},'اردو فتاویٰ'),
            h('button',{onClick:()=>setPage('fatwa'),className:'w-full py-3 bg-blue-500 text-white rounded-xl font-bold'},'English Fatwas'),
            h('div',{className:'pt-4 border-t border-slate-100 flex flex-col gap-2'},
              h('button',{className:'w-full py-2 text-sm font-bold text-blue-600 border border-blue-600 rounded-lg'},'لاگ ان کریں'),
              h('button',{className:'w-full py-2 text-sm font-bold text-emerald-600 border border-emerald-600 rounded-lg'},'اکاؤنٹ بنائیں')
            )
          )
        )
      )
    ),
    SITE.homeSections&&SITE.homeSections.alumni&&h('div',{className:'py-16 bg-white mt-10 border-t border-slate-100'},
      h('div',{className:'max-w-7xl mx-auto px-8'},
        h('div',{className:'text-center mb-12'},h('h2',{className:'text-3xl font-bold text-slate-800',dir:'ltr'},'Our Alumni'),h('div',{style:{backgroundColor:ACC},className:'w-20 h-1 mx-auto mt-4 rounded-full'})),
        h('div',{className:'grid grid-cols-4 gap-6'},
          SITE.homeSections.alumni.map(a=>h('div',{key:a.id,className:'relative rounded-2xl overflow-hidden shadow-xl group',style:{height:'360px'}},
            h('img',{src:a.image,alt:'',className:'w-full h-full object-cover group-hover:scale-110 transition-all duration-700'}),
            h('div',{className:'absolute inset-x-0 bottom-0 p-4 text-white text-xs font-bold uppercase',style:{background:'linear-gradient(to top,rgba(0,0,0,.8),transparent)'}},'SIRAJ UL OOOM MEDIA')
          ))
        )
      )
    )
  );
  const resultPg=h('div',{className:'max-w-4xl mx-auto py-16 px-4'},
    h('div',{className:'bg-white shadow-sm border border-slate-100 rounded-sm overflow-hidden mb-8'},
      h('div',{className:'bg-[#eaf4fb] text-center py-5 border-b border-slate-100 flex items-center justify-center gap-3'},
        h('h2',{className:'text-[#2980b9] text-3xl font-medium'},'انفرادی مکتب نتائج'),
        h('span',{className:'text-[#2980b9] text-2xl'},'👥')
      ),
      h('div',{className:'p-10 space-y-8'},
        h('div',{className:'flex justify-center gap-24 mb-6'},
          h('div',{className:'flex flex-col gap-6'},
            h('label',{className:'flex items-center justify-end gap-3 cursor-pointer group'},
              h('span',{className:'text-xl text-slate-700'},'بنات'),
              h('div',{className:\`w-6 h-6 rounded-full border-[2px] flex items-center justify-center \${gender==='بنات'?'border-[#3498db]':'border-slate-400'}\`}, gender==='بنات'&&h('div',{className:'w-3 h-3 bg-[#3498db] rounded-full'})),
              h('input',{type:'radio',className:'hidden',checked:gender==='بنات',onChange:()=>setGender('بنات')})
            ),
            h('label',{className:'flex items-center justify-end gap-3 cursor-pointer group'},
              h('span',{className:'text-xl text-slate-700'},'ضمنی'),
              h('div',{className:\`w-6 h-6 rounded-full border-[2px] flex items-center justify-center \${term==='ضمنی'?'border-[#3498db]':'border-slate-400'}\`}, term==='ضمنی'&&h('div',{className:'w-3 h-3 bg-[#3498db] rounded-full'})),
              h('input',{type:'radio',className:'hidden',checked:term==='ضمنی',onChange:()=>setTerm('ضمنی')})
            )
          ),
          h('div',{className:'flex flex-col gap-6'},
            h('label',{className:'flex items-center justify-end gap-3 cursor-pointer group'},
              h('span',{className:'text-xl text-slate-700'},'بنین'),
              h('div',{className:\`w-6 h-6 rounded-full border-[2px] flex items-center justify-center \${gender==='بنین'?'border-[#3498db]':'border-slate-400'}\`}, gender==='بنین'&&h('div',{className:'w-3 h-3 bg-[#3498db] rounded-full'})),
              h('input',{type:'radio',className:'hidden',checked:gender==='بنین',onChange:()=>setGender('بنین')})
            ),
            h('label',{className:'flex items-center justify-end gap-3 cursor-pointer group'},
              h('span',{className:'text-xl text-slate-700'},'سالانہ'),
              h('div',{className:\`w-6 h-6 rounded-full border-[2px] flex items-center justify-center \${term==='سالانہ'?'border-[#3498db]':'border-slate-400'}\`}, term==='سالانہ'&&h('div',{className:'w-3 h-3 bg-[#3498db] rounded-full'})),
              h('input',{type:'radio',className:'hidden',checked:term==='سالانہ',onChange:()=>setTerm('سالانہ')})
            )
          )
        ),
        h('div',{className:'space-y-5 max-w-lg mx-auto'},
          h('div',{className:'grid grid-cols-[1fr_150px] items-center gap-6'},
            h('select',{value:year,onChange:e=>setYear(e.target.value),className:'w-full border border-slate-300 rounded p-2.5 text-right outline-none text-xl bg-white'},
              ['1447','1446','1445'].map(y=>h('option',{key:y,value:y},y))
            ),
            h('label',{className:'text-right text-xl text-slate-800'},'سال کا انتخاب')
          ),
          h('div',{className:'grid grid-cols-[1fr_150px] items-center gap-6'},
            h('select',{value:exClass,onChange:e=>setExClass(e.target.value),className:'w-full border border-slate-300 rounded p-2.5 text-right outline-none text-xl bg-white'},
              [{v:'',l:'عالمیہ سال دوم'},{v:'عالمیہ سال اول',l:'عالمیہ سال اول'},{v:'سادسہ',l:'سادسہ'},{v:'خامسہ',l:'خامسہ'}].map(o=>h('option',{key:o.v,value:o.v},o.l))
            ),
            h('label',{className:'text-right text-xl text-slate-800'},'متعلقہ درجہ کا انتخاب')
          ),
          h('div',{className:'grid grid-cols-[1fr_150px] items-center gap-6'},
            h('input',{type:'text',value:rn,onChange:e=>setRn(e.target.value),className:'w-full border border-slate-300 rounded p-2.5 text-right outline-none text-xl focus:border-[#3498db]'}),
            h('label',{className:'text-right text-xl text-slate-800'},'طالب علم کا رول نمبر')
          )
        ),
        h('div',{className:'max-w-lg mx-auto mt-8 pt-4'},
          h('button',{onClick:search,className:'w-full bg-[#5bc0de] hover:bg-[#31b0d5] text-white text-xl font-medium py-3 rounded shadow-sm'},'تلاش کریں')
        )
      )
    ),
    res&&(res.error?h('div',{className:'text-center py-8 text-red-500 font-bold text-lg'},'یہ رول نمبر نہیں ملا۔'):
      h('div',{className:'bg-white border-8 border-slate-900 p-12 shadow-2xl'},
        h('div',{className:'text-center border-b-4 border-slate-900 pb-8 mb-8'},
          h('div',{style:{backgroundColor:ACC},className:'w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4'},'ج'),
          h('h3',{className:'text-3xl font-bold'},S.heroTitle),h('p',{className:'text-xs font-bold uppercase tracking-widest text-slate-400 mt-1'},'Official Result Card')
        ),
        h('div',{className:'grid grid-cols-2 gap-6 text-lg mb-8'},
          h('div',null,h('strong',null,'نام: '),res.studentName),h('div',null,h('strong',null,'رول نمبر: '),res.rollNo),
          h('div',null,h('strong',null,'امتحان: '),res.examType),h('div',null,h('strong',null,'درجہ: '),res.className)
        ),
        h('table',{className:'w-full border-collapse border-4 border-slate-900 text-center text-2xl font-bold'},
          h('thead',{className:'bg-slate-900 text-white'},h('tr',null,['کل نمبر','حاصل کردہ','فیصد','تقدیر'].map(c=>h('th',{key:c,className:'p-4'},c)))),
          h('tbody',null,h('tr',{className:'bg-slate-50'},
            [['500',false],[(res.obtained||'0'),true],[(res.percentage||'0')+'%',false],[res.quality||'مقبول',true]].map(([v,tl],i)=>h('td',{key:i,className:'border-4 border-slate-900 p-6',style:{color:tl?ACC:''}},v))
          ))
        )
      )
    )
  );
  const fatwaP=h('div',{className:'max-w-5xl mx-auto py-16 px-8 space-y-8'},
    h('div',{style:{backgroundColor:ACC},className:'text-white p-12 rounded-3xl shadow-2xl text-center'},h('h2',{className:'text-3xl font-bold'},'آن لائن دارالافتاء پورٹل'),h('p',{className:'text-lg opacity-80 mt-3'},'اپنے شرعی مسائل کا حل قرآن و سنت کی روشنی میں معلوم کریں۔')),
    h('div',{className:'space-y-6'},(SITE.fatawa||[]).map(f=>h('div',{key:f.id,className:'bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden'},
      h('div',{className:'bg-blue-50 p-6 border-b border-blue-100'},h('span',{className:'text-xs font-bold text-teal-600 uppercase block mb-2'},'سوال - #'+f.id),h('h4',{className:'text-xl font-bold text-blue-900'},f.question)),
      h('div',{className:'p-8'},h('p',{className:'text-lg text-slate-700 font-medium leading-loose'},f.answer),
        h('div',{className:'mt-6 pt-6 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-400'},h('span',null,'Cat: ',h('strong',{style:{color:ACC}},f.category)),h('span',null,f.date)))
    )))
  );
  const fg=(SITE.gallery||[]).filter(img=>gf==='تمام تصاویر'||img.category===gf);
  const galP=h('div',{className:'max-w-7xl mx-auto py-16 px-8 space-y-10'},
    h('div',{className:'text-center'},h('h2',{className:'text-4xl font-bold text-slate-900'},'تصویری گیلری'),h('div',{style:{backgroundColor:ACC},className:'w-20 h-1.5 mx-auto mt-4 rounded-full'})),
    h('div',{className:'flex justify-center gap-3 flex-wrap'},['تمام تصاویر',...(SITE.galleryCategories||[])].map((p,i)=>h('button',{key:i,onClick:()=>setGf(p),style:{backgroundColor:gf===p?ACC:'',color:gf===p?'white':''},className:\`px-6 py-2 rounded-full text-sm font-bold shadow \${gf===p?'':'bg-white border border-slate-200 text-slate-700'}\`},p))),
    h('div',{className:'grid grid-cols-3 gap-8'},fg.map(img=>h('div',{key:img.id,className:'group relative rounded-3xl overflow-hidden shadow-2xl',style:{aspectRatio:'4/3'}},
      h('img',{src:img.url,alt:img.title,className:'w-full h-full object-cover group-hover:scale-110 transition-all duration-700'}),
      h('div',{className:'absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-all',style:{background:'linear-gradient(to top,rgba(0,0,0,.8),transparent)'}},h('span',{className:'text-white font-bold text-xl'},img.title))
    )))
  );
  const ftr=h('footer',{style:{backgroundColor:DRK},className:'text-white py-16 px-8 mt-16 text-center'},
    h('div',{className:'max-w-4xl mx-auto space-y-4'},
      h('div',{style:{backgroundColor:ACC},className:'w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto'},'ج'),
      h('h4',{className:'text-xl font-bold'},S.heroTitle),
      h('div',{className:'flex justify-center gap-8 mt-6 text-sm text-slate-400'},nav.map(m=>h('button',{key:m.id,onClick:()=>setPage(m.id),className:'hover:text-white transition-all'},m.label))),
      h('div',{className:'border-t border-white/10 mt-8 pt-8 text-xs text-slate-500'},'© 2026 ',S.heroTitle,' | Designed & Developed by Abdulrehman Habib')
    )
  );
  const loginP=h('div',{className:'max-w-md mx-auto py-32 px-8'},
    h('div',{className:'bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 space-y-8'},
      h('div',{className:'text-center space-y-2'},h('h2',{className:'text-2xl font-bold text-slate-900'},'لاگ ان کریں'),h('p',{className:'text-xs text-slate-400'},'اپنے اکاؤنٹ میں داخل ہوں')),
      h('div',{className:'space-y-4'},
        h('div',{className:'space-y-1'},h('label',{className:'text-xs font-bold text-slate-500'},'صارف کا نام (Username)'),h('input',{type:'text',className:'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none'})),
        h('div',{className:'space-y-1'},h('label',{className:'text-xs font-bold text-slate-500'},'پاس ورڈ (Password)'),h('input',{type:'password',className:'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none'})),
        h('button',{style:{backgroundColor:ACC},className:'w-full py-4 text-white font-bold rounded-xl shadow-lg mt-4'},'لاگ ان کریں')
      )
    )
  );
  return h('div',{className:'min-h-screen flex flex-col bg-white'},hdr,
    h('div',{className:'flex-1'},page==='home'&&home,page==='result'&&resultPg,page==='fatwa'&&fatwaP,page==='gallery'&&galP,page==='login'&&loginP),ftr);
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert('✅ index.html ڈاؤنلوڈ ہو گئی!\n\nاب یہ کریں:\n1. اس فائل کو Public_Portal فولڈر میں paste کریں (پرانی کو replace کریں)\n2. GitHub Desktop کھولیں\n3. Commit کریں اور Push کریں\n4. Vercel خودکار deploy کر دے گا!');
  };

  const ResultSearchPreview = () => {
    const [rollNo, setRollNo] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleSearch = () => {
      const allResults = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
      let found: any = null;
      allResults.forEach((exam: any) => {
        const student = exam.records.find((r: any) => r.rollNo === rollNo);
        if (student) found = { ...student, examType: exam.examType, className: exam.className };
      });
      setResult(found);
    };

    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-right" dir="rtl">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" /> رول نمبر سے نتیجہ تلاش کریں (Wifaq Style)
        </h3>
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="رول نمبر لکھیں..."
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            تلاش کریں
          </button>
        </div>

        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-slate-800 p-8 rounded-none relative bg-white font-urdu"
          >
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h4 className="text-2xl font-bold">سالانہ امتحانی نتیجہ</h4>
              <p className="text-sm font-bold">{result.examType} - {result.className}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-lg">
              <p><strong>نام طالب علم:</strong> {result.studentName}</p>
              <p><strong>والد کا نام:</strong> {result.fatherName}</p>
              <p><strong>رول نمبر:</strong> {result.rollNo}</p>
              <p><strong>تقدیر (Grade):</strong> <span className="text-blue-600 font-bold">{result.quality}</span></p>
            </div>
            <table className="w-full border-collapse border border-slate-800 text-center">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-800 p-2">کل نمبر</th>
                  <th className="border border-slate-800 p-2">حاصل کردہ</th>
                  <th className="border border-slate-800 p-2">فیصد</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-800 p-2">500</td>
                  <td className="border border-slate-800 p-2 font-bold">{result.obtained}</td>
                  <td className="border border-slate-800 p-2">{result.percentage}%</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        ) : rollNo && (
          <div className="text-center py-10 text-slate-400">کوئی نتیجہ نہیں ملا</div>
        )}
      </div>
    );
  };

  const FatwaManagement = () => {
    const [newQuestion, setNewQuestion] = useState({ q: '', a: '', cat: 'عمومی' });

    const handleAddFatwa = () => {
      if (!newQuestion.q || !newQuestion.a) return;
      setFatawa([{ id: Date.now(), question: newQuestion.q, answer: newQuestion.a, category: newQuestion.cat, date: new Date().toLocaleDateString(), status: 'published' }, ...fatawa]);
      setNewQuestion({ q: '', a: '', cat: 'عمومی' });
    };

    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> نیا فتویٰ اپلوڈ کریں
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">سوال (Question):</label>
                <textarea
                  value={newQuestion.q}
                  onChange={(e) => setNewQuestion({ ...newQuestion, q: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none min-h-[100px] font-urdu"
                  placeholder="سائل کا سوال یہاں لکھیں..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">جواب (Fatwa):</label>
                <textarea
                  value={newQuestion.a}
                  onChange={(e) => setNewQuestion({ ...newQuestion, a: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none min-h-[100px] font-urdu"
                  placeholder="مفتی صاحب کا جواب یہاں لکھیں..."
                />
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-bold text-slate-600">کیٹیگری:</label>
                <select
                  value={newQuestion.cat}
                  onChange={(e) => setNewQuestion({ ...newQuestion, cat: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                >
                  <option>عمومی</option>
                  <option>نماز</option>
                  <option>زکوٰۃ</option>
                  <option>نکاح و طلاق</option>
                  <option>خرید و فروخت</option>
                </select>
              </div>
              <button
                onClick={handleAddFatwa}
                className="bg-emerald-600 text-white px-12 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                فتویٰ شائع کریں
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 font-bold">سوال</th>
                <th className="p-4 font-bold text-center">کیٹیگری</th>
                <th className="p-4 font-bold text-center">تاریخ</th>
                <th className="p-4 font-bold text-center">عمل</th>
              </tr>
            </thead>
            <tbody>
              {fatawa.map((f: any) => (
                <tr key={f.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-urdu text-sm line-clamp-1 max-w-md">{f.question}</td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{f.category}</span>
                  </td>
                  <td className="p-4 text-center text-xs text-slate-400">{f.date}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setFatawa(fatawa.filter((x: any) => x.id !== f.id))} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ResultManagement = () => {
    const [allResults, setAllResults] = useState<any[]>(() => JSON.parse(localStorage.getItem('all_exam_results') || '[]'));
    const [newExam, setNewExam] = useState({ examType: 'سالانہ', className: '', records: [] });
    const [showAddResult, setShowAddResult] = useState(false);

    const handleAddExam = () => {
      if (!newExam.className) return;
      const updated = [{ ...newExam, id: Date.now() }, ...allResults];
      setAllResults(updated);
      localStorage.setItem('all_exam_results', JSON.stringify(updated));
      setNewExam({ examType: 'سالانہ', className: '', records: [] });
      setShowAddResult(false);
    };

    const deleteExam = (id: number) => {
      const updated = allResults.filter(e => e.id !== id);
      setAllResults(updated);
      localStorage.setItem('all_exam_results', JSON.stringify(updated));
    };

    return (
      <div className="space-y-6 text-right" dir="rtl">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={() => setShowAddResult(!showAddResult)} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> نیا رزلٹ شامل کریں
          </button>
          <h3 className="text-xl font-bold text-slate-800">امتحانی نتائج مینیجر</h3>
        </div>

        {showAddResult && (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">امتحان کی قسم (مثلاً: سالانہ):</label>
                <input
                  type="text"
                  value={newExam.examType}
                  onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">درجہ (Class):</label>
                <input
                  type="text"
                  value={newExam.className}
                  onChange={(e) => setNewExam({ ...newExam, className: e.target.value })}
                  placeholder="مثلاً: عالمیہ سال دوم"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>
            </div>
            <button onClick={handleAddExam} className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">محفوظ کریں</button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 font-bold">امتحان</th>
                <th className="p-4 font-bold text-center">درجہ</th>
                <th className="p-4 font-bold text-center">طلبہ کی تعداد</th>
                <th className="p-4 font-bold text-center">عمل</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((e: any) => (
                <tr key={e.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-blue-600">{e.examType}</td>
                  <td className="p-4 text-center font-urdu">{e.className}</td>
                  <td className="p-4 text-center">{e.records?.length || 0}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => deleteExam(e.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {allResults.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400">کوئی ریکارڈ موجود نہیں ہے۔</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const GalleryManagement = () => {
    const [selectedCategory, setSelectedCategory] = useState(galleryCategories[0] || '');
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImg = { id: Date.now(), url: reader.result as string, title: file.name.split('.')[0], category: selectedCategory };
          setGallery([newImg, ...gallery]);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleAddCategory = () => {
      if (newCategoryName.trim() && !galleryCategories.includes(newCategoryName)) {
        setGalleryCategories([...galleryCategories, newCategoryName.trim()]);
        setNewCategoryName('');
      }
    };

    const handleDeleteCategory = (cat: string) => {
      if (confirm(`کیا آپ واقعی '${cat}' کیٹیگری کو حذف کرنا چاہتے ہیں؟`)) {
        setGalleryCategories(galleryCategories.filter(c => c !== cat));
        // Reset category of images that had this category
        setGallery(gallery.map(img => img.category === cat ? { ...img, category: 'Uncategorized' } : img));
      }
    };

    return (
      <div className="space-y-6 text-right" dir="rtl">
        {/* Categories Manager */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> گیلری کیٹیگریز (Categories)
          </h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="نئی کیٹیگری کا نام..."
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            />
            <button onClick={handleAddCategory} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">شامل کریں</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {galleryCategories.map((cat, i) => (
              <div key={i} className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-blue-100">
                <span>{cat}</span>
                <button onClick={() => handleDeleteCategory(cat)} className="text-blue-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload & Grid */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" /> تصویری گیلری
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
            >
              {galleryCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              <option value="Uncategorized">Uncategorized</option>
            </select>
            <label className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-2">
              <Plus className="w-5 h-5" />
              نئی تصویر اپلوڈ کریں
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {gallery.map((img) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group relative"
            >
              <img src={img.url} className="w-full h-40 object-cover" alt={img.title} />
              <div className="p-3">
                <p className="text-[10px] font-bold text-slate-600 truncate">{img.title}</p>
                <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">{img.category}</span>
              </div>
              <button
                onClick={() => setGallery(gallery.filter(i => i.id !== img.id))}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const HomeSectionsManagement = () => {
    const handleImageUpload = (section: 'team' | 'professionals' | 'alumni', id: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newArray = homeSections[section].map((item: any) =>
            item.id === id ? { ...item, image: reader.result as string } : item
          );
          setHomeSections({ ...homeSections, [section]: newArray });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="space-y-8 text-right" dir="rtl">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            ٹیم مینجمنٹ (Meet Our Team)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeSections.team.map((t: any) => (
              <div key={t.id} className="border border-slate-200 p-4 rounded-xl space-y-4 relative bg-slate-50">
                <div className="relative">
                  <img src={t.image} className="w-full h-48 object-cover rounded-lg" alt={t.nameEn} />
                  <label className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-lg cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('team', t.id, e)} />
                  </label>
                </div>
                <input type="text" value={t.nameEn} onChange={(e) => {
                  const newTeam = homeSections.team.map((x: any) => x.id === t.id ? { ...x, nameEn: e.target.value } : x);
                  setHomeSections({ ...homeSections, team: newTeam });
                }} className="w-full text-sm p-2 border rounded text-left font-bold outline-none" dir="ltr" placeholder="Name (English)" />
                <input type="text" value={t.nameAr} onChange={(e) => {
                  const newTeam = homeSections.team.map((x: any) => x.id === t.id ? { ...x, nameAr: e.target.value } : x);
                  setHomeSections({ ...homeSections, team: newTeam });
                }} className="w-full text-sm p-2 border rounded font-urdu font-bold outline-none" placeholder="نام (اردو/عربی)" />
                <input type="text" value={t.title} onChange={(e) => {
                  const newTeam = homeSections.team.map((x: any) => x.id === t.id ? { ...x, title: e.target.value } : x);
                  setHomeSections({ ...homeSections, team: newTeam });
                }} className="w-full text-sm p-2 border rounded text-center text-slate-500 font-bold outline-none" placeholder="عہدہ" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            پروفیشنلز (Education Professionals)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homeSections.professionals.map((p: any) => (
              <div key={p.id} className="border border-slate-200 p-2 rounded-xl relative bg-slate-50">
                <img src={p.image} className="w-full h-40 object-cover rounded-lg" alt="Professional" />
                <label className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('professionals', p.id, e)} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            الومنائی (Binoria Alumni)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homeSections.alumni.map((a: any) => (
              <div key={a.id} className="border border-slate-200 p-2 rounded-xl relative bg-slate-50">
                <img src={a.image} className="w-full h-48 object-cover rounded-lg" alt="Alumni" />
                <label className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('alumni', a.id, e)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-urdu" dir="rtl">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">ویب سائٹ کنٹرول (Website Control)</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportToGitHub}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            ایکسپورٹ (GitHub)
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm"
          >
            <Eye className="w-4 h-4" />
            لائیو پریویو
          </button>
          <button
            onClick={handleSaveSettings}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm"
          >
            <Save className="w-4 h-4" />
            تبدیلیاں محفوظ کریں
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-2xl px-6 pt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-8 py-3 text-sm font-bold transition-all relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              بنیادی ترتیبات
              {activeTab === 'overview' && <motion.div layoutId="webTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-8 py-3 text-sm font-bold transition-all relative ${activeTab === 'results' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              رزلٹ پورٹل
              {activeTab === 'results' && <motion.div layoutId="webTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('fatwa')}
              className={`px-8 py-3 text-sm font-bold transition-all relative ${activeTab === 'fatwa' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              دارالافتاء مینجمنٹ
              {activeTab === 'fatwa' && <motion.div layoutId="webTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-8 py-3 text-sm font-bold transition-all relative ${activeTab === 'gallery' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              گیلری مینجمنٹ
              {activeTab === 'gallery' && <motion.div layoutId="webTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('home_sections')}
              className={`px-8 py-3 text-sm font-bold transition-all relative ${activeTab === 'home_sections' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ہوم پیج مینجمنٹ
              {activeTab === 'home_sections' && <motion.div layoutId="webTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Layout className="w-5 h-5 text-blue-600" /> ہیرو سیکشن (Hero Section)
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">ویب سائٹ کا عنوان (Main Title):</label>
                        <input
                          type="text"
                          value={webSettings.heroTitle}
                          onChange={(e) => setWebSettings({ ...webSettings, heroTitle: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-urdu"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">ذیلی عنوان (Subtitle):</label>
                        <input
                          type="text"
                          value={webSettings.heroSubtitle}
                          onChange={(e) => setWebSettings({ ...webSettings, heroSubtitle: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-urdu"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-blue-600" /> خبریں پٹی (News Marquee)
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">چلتی ہوئی خبریں (الگ کرنے کے لیے | استعمال کریں):</label>
                      <textarea
                        value={webSettings.marqueeText}
                        onChange={(e) => setWebSettings({ ...webSettings, marqueeText: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none min-h-[120px] font-bold font-urdu"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" /> ویب سائٹ بینر (Main Header Banner)
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="w-full h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {webSettings.bannerImage ? (
                          <img src={webSettings.bannerImage} className="w-full h-full object-contain" alt="Banner" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-slate-300" />
                        )}
                      </div>
                      <div className="shrink-0 space-y-3">
                        <label className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-all inline-block shadow-lg">
                          بینر اپلوڈ کریں
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setWebSettings({ ...webSettings, bannerImage: reader.result as string });
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Layout className="w-5 h-5 text-emerald-600" /> ہوم پیج ٹیبز تصاویر (Home Tabs Images)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { id: 'news', label: 'خبریں و اعلانات' },
                        { id: 'rabta', label: 'رابطہ مدارس' },
                        { id: 'admission', label: 'قواعدِ داخلہ' },
                        { id: 'results', label: 'نتائجِ امتحانات' },
                        { id: 'arabicMonthly', label: 'ماہنامہ الداعی' },
                        { id: 'arabicQuarterly', label: 'ماہنامہ النھضۃ' },
                        { id: 'urduMonthly', label: 'ماہنامہ سراج العلوم' },
                        { id: 'books', label: 'مطبوعہ کتب' },
                        { id: 'gallery', label: 'تصاویر و آڈیو' }
                      ].map(tab => (
                        <div key={tab.id} className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">{tab.label}</label>
                          <div className="relative group h-24 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                            {webSettings.tabImages[tab.id] ? (
                              <img src={webSettings.tabImages[tab.id]} className="w-full h-full object-cover" alt={tab.label} />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all">
                              تبدیل کریں
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setWebSettings({
                                    ...webSettings,
                                    tabImages: { ...webSettings.tabImages, [tab.id]: reader.result as string }
                                  });
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'results' && (
              <motion.div
                key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <ResultManagement />
                <ResultSearchPreview />
              </motion.div>
            )}

            {activeTab === 'fatwa' && (
              <motion.div
                key="fatwa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <FatwaManagement />
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div
                key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <GalleryManagement />
              </motion.div>
            )}

            {activeTab === 'home_sections' && (
              <motion.div
                key="home_sections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <HomeSectionsManagement />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Website Live Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowPreview(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-blue-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-mono tracking-widest uppercase">Live Site Preview</span>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">
                Browser: localhost:3000/jamia-portal
              </div>
            </div>
            <div className="flex-1 bg-[#f0f4f8] overflow-y-auto">
              <PublicWebsite settings={webSettings} setSettings={setWebSettings} fatawa={fatawa} gallery={gallery} galleryCategories={galleryCategories} homeSections={homeSections} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- PUBLIC WEBSITE COMPONENT (Binoria Style) ---
function PublicWebsite({ settings, setSettings, fatawa, gallery, galleryCategories, homeSections }: { settings: any, setSettings: any, fatawa: any[], gallery: any[], galleryCategories: string[], homeSections: any }) {
  const [activePage, setActivePage] = useState('home');
  const [rollNo, setRollNo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('تمام تصاویر');

  // Wifaq ul Madaris Style Result Portal State
  const [gender, setGender] = useState('بنین');
  const [examTerm, setExamTerm] = useState('سالانہ');
  const [year, setYear] = useState('1447');
  const [examClass, setExamClass] = useState('');

  const colors = {
    primary: '#A0522D', // Terracotta
    accent: '#C5A059',  // Gold/Khaki
    dark: '#2D1B10',    // Dark Brown
    light: '#FAF7F2',   // Light Cream
    white: '#FFFFFF'
  };

  const handleResultSearch = () => {
    const allResults = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    let found: any = null;
    allResults.forEach((exam: any) => {
      const student = exam.records.find((r: any) => r.rollNo === rollNo);
      if (student) found = { ...student, examType: exam.examType, className: exam.className };
    });
    setResult(found);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-urdu" dir="rtl">
      {/* Top Bar */}
      <div style={{ backgroundColor: colors.dark }} className="text-white py-2 px-8 flex justify-between items-center text-[11px] font-bold shadow-md relative z-[60]">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><Phone className="w-3 h-3 text-emerald-400" /> {settings.phone || '0997-123456'}</span>
          <span className="flex items-center gap-2"><Globe className="w-3 h-3 text-emerald-400" /> {settings.email || 'info@sirajuloom.edu.pk'}</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex gap-2 border-l border-white/20 pl-6 ml-6">
            <button onClick={() => setSettings({...settings, language: 'ur'})} className={`px-2 py-0.5 rounded ${settings.language === 'ur' ? 'bg-white text-teal-700' : 'hover:bg-white/10'}`}>اردو</button>
            <button onClick={() => setSettings({...settings, language: 'ar'})} className={`px-2 py-0.5 rounded ${settings.language === 'ar' ? 'bg-white text-teal-700' : 'hover:bg-white/10'}`}>العربية</button>
            <button onClick={() => setSettings({...settings, language: 'en'})} className={`px-2 py-0.5 rounded ${settings.language === 'en' ? 'bg-white text-teal-700' : 'hover:bg-white/10'}`}>English</button>
          </div>
          <button onClick={() => setActivePage('fatwa')} className="hover:text-emerald-400 transition-all">آن لائن فتاویٰ</button>
          <button onClick={() => setActivePage('home')} className="hover:text-emerald-400 transition-all">آن لائن داخلہ</button>
          <button className="hover:text-emerald-400 transition-all">ڈونیٹ کریں</button>
        </div>
      </div>

      <header className="bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {settings.bannerImage ? (
            <img src={settings.bannerImage} className="w-full h-auto object-contain" alt="Header Banner" />
          ) : (
            <div className="py-8 flex flex-col items-center gap-6 text-center">
              {settings.logo ? (
                <img src={settings.logo} className="h-28 w-auto object-contain" alt="Logo" />
              ) : (
                <div style={{ backgroundColor: colors.accent }} className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-5xl shadow-2xl">س</div>
              )}
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-slate-900 font-urdu tracking-tight">{settings.heroTitle}</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Islamic Educational Institution</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Bar (Dark) */}
      <nav style={{ backgroundColor: colors.dark }} className="sticky top-0 z-50 shadow-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {[
            { id: 'home', label: 'HOME' },
            { id: 'about', label: 'INTRODUCTION' },
            { id: 'departments', label: 'DEPARTMENTS' },
            { id: 'fatwa', label: 'ONLINE FATWA' },
            { id: 'result', label: 'RESULTS' },
            { id: 'gallery', label: 'GALLERY' },
            { id: 'contact', label: 'CONTACT' }
          ].map((m, idx) => (
            <button
              key={idx}
              onClick={() => setActivePage(m.id)}
              className={`px-6 py-4 text-[11px] font-bold tracking-widest transition-all hover:bg-white/10 ${activePage === m.id ? 'text-white border-b-4' : 'text-slate-400'}`}
              style={{ borderBottomColor: activePage === m.id ? colors.accent : 'transparent' }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Ticker (Marquee) */}
      <div style={{ backgroundColor: colors.white }} className="py-2.5 overflow-hidden border-b border-slate-100 relative">
        <div style={{ backgroundColor: colors.primary }} className="absolute right-0 top-0 bottom-0 text-white px-4 flex items-center text-[10px] font-bold z-10 shadow-xl">تازہ ترین خبریں</div>
        <div className="inline-block animate-marquee-fast pr-[150px]">
          <span className="text-xs font-medium text-slate-500 px-10 flex items-center gap-2">
            {settings.marqueeText.split('|').map((t: string, i: number) => (
              <React.Fragment key={i}>
                <span style={{ color: colors.accent }} className="font-bold text-lg">✦</span> {t}
              </React.Fragment>
            ))}
          </span>
        </div>
      </div>

      <div className="flex-1">
        {activePage === 'home' && (
          <div className="max-w-[1400px] mx-auto py-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Sidebar - Language Introductions */}
              <div className="lg:col-span-2 space-y-4">
                {[
                  { label: 'اردو', sub: 'Urdu Introduction', icon: '✍️' },
                  { label: 'العربية', sub: 'Arabic Introduction', icon: '📜' },
                  { label: 'ENGLISH', sub: 'English Introduction', icon: '🌐' },
                  { label: 'हिन्दी', sub: 'Hindi Introduction', icon: '🇮🇳' },
                  { label: 'رابطہ', sub: 'Contact Us', icon: '📞' }
                ].map((l, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="p-4 text-center space-y-1">
                      <div className="text-3xl mb-2">{l.icon}</div>
                      <h4 className="text-xl font-bold text-slate-800">{l.label}</h4>
                      <div className="h-px bg-slate-100 w-full" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Center - Main Grid */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'news', title: 'خبریں و اعلانات', sub: 'News & Notices', icon: '📢' },
                    { id: 'rabta', title: 'رابطہ مدارس اسلامیہ عربیہ', sub: 'Rabta Madaris Islamia Arabia', icon: '🌐' },
                    { id: 'admission', title: 'قواعدِ داخلہ', sub: 'Admission Rules', icon: '📄' },
                    { id: 'results', title: 'نتائجِ امتحانات', sub: 'Exam Results', icon: '🔍', action: () => setActivePage('result') },
                    { id: 'arabicMonthly', title: 'ماہنامہ الداعی', sub: 'Arabic Monthly', icon: '📖' },
                    { id: 'arabicQuarterly', title: 'ماہنامہ النھضۃ', sub: 'Arabic Quarterly', icon: '📖' },
                    { id: 'urduMonthly', title: 'ماہنامہ سراج العلوم', sub: 'Urdu Monthly', icon: '📚' },
                    { id: 'books', title: 'مطبوعہ کتب', sub: 'Order Books', icon: '📕' },
                    { id: 'gallery', title: 'تصاویر و آڈیو', sub: 'Photo Gallery & Audios', icon: '🖼️', action: () => setActivePage('gallery') }
                  ].map((item, i) => (
                    <div key={i} onClick={item.action} style={{ backgroundColor: colors.light }} className="border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group aspect-[768/294]">
                      <div className="w-full h-full relative overflow-hidden">
                        {settings.tabImages[item.id] ? (
                          <img src={settings.tabImages[item.id]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={item.id} />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <div style={{ color: colors.accent }} className="text-4xl opacity-20">{item.icon}</div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.sub}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Sidebar - Services & Buttons */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 p-4 text-white text-center font-bold flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" /> آن لائن چندہ
                  </div>
                  <div className="p-6 text-center space-y-4">
                    <h4 className="text-lg font-bold">Online Donation</h4>
                    <p className="text-xs text-slate-500">جامعہ کے تعلیمی و رفاہی کاموں میں اپنا حصہ ڈالیں۔</p>
                    <button style={{ backgroundColor: colors.accent }} className="w-full py-3 rounded-xl text-white font-bold shadow-lg">ڈونیٹ کریں</button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
                  <h4 className="text-lg font-bold border-b pb-2">بینک اکاؤنٹس</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-[10px] font-bold">BANK</div>)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">Bank Account Details</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-teal-600 p-4 text-white text-center font-bold">آن لائن فتویٰ</div>
                  <div className="p-4 space-y-3">
                    <button onClick={() => setActivePage('fatwa')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">اردو فتاویٰ</button>
                    <button onClick={() => setActivePage('fatwa')} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md">English Fatwas</button>
                    <div className="h-px bg-slate-100 my-4" />
                    <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">لاگ ان کریں</button>
                    <button className="w-full py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all">اکاؤنٹ بنائیں</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === 'result' && (
          <div className="max-w-4xl mx-auto py-16 px-4">
            <div className="bg-white shadow-sm border border-slate-100 rounded-sm overflow-hidden mb-8">
              {/* Header */}
              <div className="bg-[#eaf4fb] text-center py-5 border-b border-slate-100">
                <h2 className="text-[#2980b9] text-3xl font-medium flex items-center justify-center gap-3">
                  انفرادی مکتب نتائج
                  <Users className="w-7 h-7 text-[#2980b9]" />
                </h2>
              </div>

              {/* Form Body */}
              <div className="p-10 space-y-8">
                {/* Radios */}
                <div className="flex justify-center gap-24 mb-6">
                  <div className="flex flex-col gap-6">
                    <label className="flex items-center justify-end gap-3 cursor-pointer group">
                      <span className="text-xl text-slate-700">بنات</span>
                      <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center ${gender === 'بنات' ? 'border-[#3498db]' : 'border-slate-400 group-hover:border-[#3498db]'}`}>
                        {gender === 'بنات' && <div className="w-3 h-3 bg-[#3498db] rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" checked={gender === 'بنات'} onChange={() => setGender('بنات')} />
                    </label>
                    <label className="flex items-center justify-end gap-3 cursor-pointer group">
                      <span className="text-xl text-slate-700">ضمنی</span>
                      <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center ${examTerm === 'ضمنی' ? 'border-[#3498db]' : 'border-slate-400 group-hover:border-[#3498db]'}`}>
                        {examTerm === 'ضمنی' && <div className="w-3 h-3 bg-[#3498db] rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" checked={examTerm === 'ضمنی'} onChange={() => setExamTerm('ضمنی')} />
                    </label>
                  </div>
                  <div className="flex flex-col gap-6">
                    <label className="flex items-center justify-end gap-3 cursor-pointer group">
                      <span className="text-xl text-slate-700">بنین</span>
                      <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center ${gender === 'بنین' ? 'border-[#3498db]' : 'border-slate-400 group-hover:border-[#3498db]'}`}>
                        {gender === 'بنین' && <div className="w-3 h-3 bg-[#3498db] rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" checked={gender === 'بنین'} onChange={() => setGender('بنین')} />
                    </label>
                    <label className="flex items-center justify-end gap-3 cursor-pointer group">
                      <span className="text-xl text-slate-700">سالانہ</span>
                      <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center ${examTerm === 'سالانہ' ? 'border-[#3498db]' : 'border-slate-400 group-hover:border-[#3498db]'}`}>
                        {examTerm === 'سالانہ' && <div className="w-3 h-3 bg-[#3498db] rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" checked={examTerm === 'سالانہ'} onChange={() => setExamTerm('سالانہ')} />
                    </label>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-5 max-w-lg mx-auto">
                  <div className="grid grid-cols-[1fr_150px] items-center gap-6">
                    <select
                      value={year} onChange={(e) => setYear(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2.5 text-right outline-none text-xl bg-white text-slate-700 focus:border-[#3498db]"
                    >
                      <option value="1447">1447</option>
                      <option value="1446">1446</option>
                      <option value="1445">1445</option>
                    </select>
                    <label className="text-right text-xl text-slate-800">سال کا انتخاب</label>
                  </div>

                  <div className="grid grid-cols-[1fr_150px] items-center gap-6">
                    <select
                      value={examClass} onChange={(e) => setExamClass(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2.5 text-right outline-none text-xl bg-white text-slate-500 focus:border-[#3498db]"
                    >
                      <option value="">عالمیہ سال دوم</option>
                      <option value="عالمیہ سال اول">عالمیہ سال اول</option>
                      <option value="سادسہ">سادسہ</option>
                      <option value="خامسہ">خامسہ</option>
                    </select>
                    <label className="text-right text-xl text-slate-800">متعلقہ درجہ کا انتخاب</label>
                  </div>

                  <div className="grid grid-cols-[1fr_150px] items-center gap-6">
                    <input
                      type="text"
                      value={rollNo} onChange={(e) => setRollNo(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2.5 text-right outline-none text-xl focus:border-[#3498db]"
                    />
                    <label className="text-right text-xl text-slate-800">طالب علم کا رول نمبر</label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="max-w-lg mx-auto mt-8 pt-4">
                  <button
                    onClick={handleResultSearch}
                    className="w-full bg-[#5bc0de] hover:bg-[#31b0d5] text-white text-xl font-medium py-3 rounded transition-all shadow-sm"
                  >
                    تلاش کریں
                  </button>
                </div>
              </div>
            </div>

            {result && (
              <div className="bg-white border-[12px] border-slate-900 p-16 rounded-none shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-4 mb-16 border-b-4 border-slate-900 pb-10">
                  <div style={{ backgroundColor: colors.accent }} className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl">ج</div>
                  <h3 className="text-4xl font-bold font-urdu">{settings.heroTitle}</h3>
                  <p className="text-sm font-bold uppercase tracking-[0.5em] text-slate-400">Official Examination Result Card</p>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-xl mb-16">
                  <div className="flex justify-between border-b-2 border-slate-100 pb-2"><strong>نام طالب علم:</strong> <span className="text-slate-600">{result.studentName}</span></div>
                  <div className="flex justify-between border-b-2 border-slate-100 pb-2"><strong>رول نمبر:</strong> <span className="text-slate-600">{result.rollNo}</span></div>
                  <div className="flex justify-between border-b-2 border-slate-100 pb-2"><strong>والد کا نام:</strong> <span className="text-slate-600">{result.fatherName}</span></div>
                  <div className="flex justify-between border-b-2 border-slate-100 pb-2"><strong>امتحان:</strong> <span className="text-slate-600">{result.examType}</span></div>
                </div>

                <table className="w-full text-center border-collapse border-4 border-slate-900 mb-16 overflow-hidden rounded-xl">
                  <thead className="bg-slate-900 text-white">
                    <tr className="text-lg">
                      <th className="p-5 border-l border-white/10">کل نمبر (Total)</th>
                      <th className="p-5 border-l border-white/10">حاصل کردہ (Obtained)</th>
                      <th className="p-5 border-l border-white/10">فیصد (%)</th>
                      <th className="p-5">تقدیر (Division)</th>
                    </tr>
                  </thead>
                  <tbody className="text-3xl font-bold">
                    <tr className="bg-slate-50">
                      <td className="border-4 border-slate-900 p-8">500</td>
                      <td className="border-4 border-slate-900 p-8 text-teal-600">{result.obtained}</td>
                      <td className="border-4 border-slate-900 p-8">{result.percentage}%</td>
                      <td className="border-4 border-slate-900 p-8 text-blue-700">{result.quality}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between items-end mt-20">
                  <div className="text-center opacity-40">
                    <div className="w-40 border-t-2 border-slate-900 mb-2" />
                    <p className="text-[10px] font-bold uppercase">Controller of Exams</p>
                  </div>
                  <div className="text-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=VALIDATED_RESULT" className="w-20 h-20 opacity-20 grayscale mb-2" alt="QR" />
                    <p className="text-[8px] font-bold text-slate-300">SCAN TO VERIFY</p>
                  </div>
                  <div className="text-center opacity-40">
                    <div className="w-40 border-t-2 border-slate-900 mb-2" />
                    <p className="text-[10px] font-bold uppercase">Administrator</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activePage === 'fatwa' && (
          <div className="max-w-6xl mx-auto py-20 px-8 space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            <div style={{ backgroundColor: colors.accent }} className="text-white p-16 rounded-[50px] flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10 text-right space-y-6 max-w-xl">
                <h2 className="text-4xl font-bold">آن لائن دارالافتاء پورٹل</h2>
                <p className="text-lg opacity-80 leading-relaxed">قرآن و سنت کی روشنی میں اپنے روزمرہ کے مسائل کا حل جانیے۔ مستند مفتیانِ کرام کی نگرانی میں آپ کے سوالات کے جوابات دیے جاتے ہیں۔</p>
                <div className="flex gap-4">
                  <button className="bg-white text-teal-600 px-10 py-4 rounded-2xl font-bold shadow-2xl hover:bg-slate-50 transition-all">سوال پوچھیں</button>
                  <button className="bg-black/20 text-white px-10 py-4 rounded-2xl font-bold border border-white/20 hover:bg-black/30 transition-all">فتاویٰ سرچ کریں</button>
                </div>
              </div>
              <div className="w-48 h-48 bg-white/10 rounded-[40px] flex items-center justify-center backdrop-blur-md relative z-10 border border-white/20">
                <MessageSquare className="w-24 h-24 opacity-40" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div style={{ backgroundColor: colors.accent }} className="w-1 h-6 rounded-full" />
                  موضوعات (Categories)
                </h4>
                {['ایمان و عقائد', 'عبادات (نماز، روزہ)', 'مالیاتی امور', 'نکاح و طلاق', 'میراث و وصیت', 'خوابوں کی تعبیر'].map((c, i) => (
                  <button key={i} className="w-full text-right px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm flex items-center justify-between group">
                    <span>{c}</span>
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-teal-400 transition-all" />
                  </button>
                ))}
              </div>

              <div className="lg:col-span-3 space-y-8">
                {fatawa.map((f: any) => (
                  <div key={f.id} className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-slate-50 group hover:shadow-2xl transition-all duration-500">
                    <div className="bg-[#f0f9ff] p-8 text-blue-900 border-b border-blue-50 relative">
                      <div style={{ backgroundColor: colors.accent }} className="absolute top-8 left-8 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-all transform -rotate-12 shadow-lg">س</div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-4">Question - #{f.id}</span>
                      <h4 className="text-2xl font-bold leading-relaxed">{f.question}</h4>
                    </div>
                    <div className="p-10 text-slate-700 leading-relaxed text-lg bg-white relative">
                      <div style={{ backgroundColor: colors.primary }} className="absolute bottom-10 left-10 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-all transform rotate-12 shadow-lg">ج</div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-6">Answer from Mufti Office</span>
                      <p className="font-medium whitespace-pre-wrap">{f.answer}</p>
                      <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-2">Category: <strong className="text-teal-600">{f.category}</strong></span>
                        <span>Published: {f.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePage === 'gallery' && (
          <div className="max-w-7xl mx-auto py-20 px-8 space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-5xl font-bold text-slate-900">تصویری گیلری</h2>
              <div style={{ backgroundColor: colors.accent }} className="w-24 h-1.5 rounded-full mx-auto" />
              <p className="text-slate-500 font-medium">جامعہ کی اہم تقریبات اور سرگرمیوں کے چند تصویری مناظر</p>
            </div>

            {/* Filter Pills (Binoria Style) */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {['تمام تصاویر', ...galleryCategories].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveGalleryFilter(p)}
                  style={{ backgroundColor: activeGalleryFilter === p ? colors.accent : '', color: activeGalleryFilter === p ? 'white' : '' }}
                  className={`px-8 py-2.5 rounded-full text-xs font-bold shadow-lg transition-all ${activeGalleryFilter === p ? '' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.filter(img => activeGalleryFilter === 'تمام تصاویر' || img.category === activeGalleryFilter).map((img: any) => (
                <div key={img.id} className="group relative rounded-[40px] overflow-hidden shadow-2xl aspect-[4/3] cursor-pointer">
                  <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={img.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                    <div style={{ backgroundColor: colors.accent }} className="w-10 h-1 rounded-full mb-4" />
                    <span className="text-white font-bold text-xl">{img.title}</span>
                    <p className="text-white/60 text-xs mt-2 uppercase tracking-widest font-bold">{img.category || 'Uncategorized'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: colors.dark }} className="text-white py-24 px-8 mt-20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="md:col-span-1 space-y-8">
            <div className="flex items-center gap-4">
              {settings.logo ? (
                <img src={settings.logo} className="h-12 w-auto object-contain" alt="Logo" />
              ) : (
                <div style={{ backgroundColor: colors.accent }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl">س</div>
              )}
              <h4 className="text-xl font-bold">{settings.heroTitle}</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{settings.heroTitle} ایک عظیم الشان علمی مرکز ہے جو قرآن و سنت کی روشنی میں امتِ مسلمہ کی بہترین رہنمائی کے لیے کوشاں ہے۔</p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-teal-600 transition-all cursor-pointer border border-white/5">FB</div>)}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-lg font-bold border-r-4 border-teal-600 pr-4">اہم شعبہ جات</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-400">
              {['درسِ نظامی', 'تخصصات', 'آن لائن اکیڈمی', 'شعبہ نشر و اشاعت'].map((l, i) => (
                <button key={i} className="hover:text-white transition-all text-right flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-teal-600 opacity-0 group-hover:opacity-100 transition-all" />
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-lg font-bold border-r-4 border-teal-600 pr-4">روابط</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-400">
              {[{ id: 'home', l: 'ہوم پیج' }, { id: 'result', l: 'رزلٹ پورٹل' }, { id: 'fatwa', l: 'دارالافتاء' }].map((m, i) => (
                <button key={i} onClick={() => setActivePage(m.id)} className="hover:text-white transition-all text-right flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-teal-600 opacity-0 group-hover:opacity-100 transition-all" />
                  {m.l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-lg font-bold border-r-4 border-teal-600 pr-4">رابطہ کی تفصیلات</h4>
            <div className="space-y-6 text-sm text-slate-400">
              <div className="flex items-start gap-4">
                <div className="bg-white/5 p-3 rounded-xl"><Phone className="w-4 h-4 text-teal-400" /></div>
                <div className="text-right">
                  <p className="font-bold text-white">فون نمبر</p>
                  <p>{settings.phone || '0997-123456'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/5 p-3 rounded-xl"><Globe className="w-4 h-4 text-teal-400" /></div>
                <div className="text-right">
                  <p className="font-bold text-white">ای میل</p>
                  <p>{settings.email || 'info@sirajuloom.edu.pk'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-20 pt-10 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">
          © 2026 {settings.heroTitle} | Designed & Developed by Abdulrehman Habib
        </div>
      </footer>
    </div>
  );
}
