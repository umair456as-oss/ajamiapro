import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Plus, Search, Trash, Edit, Printer, 
  StickyNote, Calendar, Users, FileText, CheckCircle2,
  AlertTriangle, Share2, Layers, Image as ImageIcon, Upload, RefreshCw
} from 'lucide-react';

interface JamiaPostsProps {
  onBack: () => void;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: 'important' | 'holiday' | 'exam' | 'news' | 'general';
  audience: 'all' | 'students' | 'teachers' | 'staff';
  dateHijri: string;
  dateGregorian: string;
  author: string;
}

export default function JamiaPosts({ onBack }: JamiaPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreator, setShowCreator] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Custom navigation between announcements and banner designer
  const [viewMode, setViewMode] = useState<'announcements' | 'banners'>('announcements');
  
  // Theme state synced from Dashboard context/localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Creator Form States
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<'important' | 'holiday' | 'exam' | 'news' | 'general'>('important');
  const [formAudience, setFormAudience] = useState<'all' | 'students' | 'teachers' | 'staff'>('all');
  const [formAuthor, setFormAuthor] = useState('ادارہ جامعہ عربیہ سراج العلوم');
  const [formDateHijri, setFormDateHijri] = useState('شوال المکرم ۱۴۴۷ھ');

  // Banner Generator States
  const [bannerMainTitle, setBannerMainTitle] = useState('سالانہ دستار بندی کانفرنس');
  const [bannerSubtitle, setBannerSubtitle] = useState('جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ');
  const [bannerLogo, setBannerLogo] = useState<string | null>(null);
  const [bannerBodyPhoto, setBannerBodyPhoto] = useState<string | null>(null);
  const [bannerDateNumeric, setBannerDateNumeric] = useState('25');
  const [bannerMonthText, setBannerMonthText] = useState('شوال');
  const [bannerYearNumeric, setBannerYearNumeric] = useState('2026');
  const [bannerDayText, setBannerDayText] = useState('بروز اتوار');
  const [bannerHijriRange, setBannerHijriRange] = useState('۱۴۴۷ھ / ۲۰۲۶ء');
  const [bannerFooterBranding, setBannerFooterBranding] = useState('SIRAJ UL ULOOM MEDIA');
  const [bannerOrientation, setBannerOrientation] = useState<'landscape' | 'portrait'>('portrait');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load and Seed Posts
  useEffect(() => {
    const savedTheme = localStorage.getItem('darulifta_theme') || 'dark';
    setTheme(savedTheme as 'dark' | 'light');

    const savedPosts = localStorage.getItem('jamia_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const defaultPosts: Post[] = [
        {
          id: 1,
          title: 'تعطیل برائے عید الفطر السعید',
          content: 'تمام معزز اساتذہ کرام اور عزیز طلبہ عظام کو مطلع کیا جاتا ہے کہ عید الفطر کے پرمسرت موقع پر جامعہ میں مؤرخہ ۲۵ رمضان المبارک تا ۶ شوال المکرم تعطیلات ہوں گی۔ تمام طلبہ سے گزارش ہے کہ چھٹیوں کے دوران اپنے تعلیمی اسباق اور وظائف کا خصوصی اہتمام کریں اور واپسی پر تعلیمی نظام کے مطابق اپنی حاضری یقینی بنائیں۔',
          category: 'holiday',
          audience: 'all',
          dateHijri: '۲۳ رمضان المبارک ۱۴۴۷ھ',
          dateGregorian: new Date().toLocaleDateString('ur-PK'),
          author: 'ناظمِ دفتر تعلیمات / مہتمم صاحب'
        },
        {
          id: 2,
          title: 'سالانہ امتحانات کا حتمی نظام الاوقات',
          content: 'شعبہ امتحانات کے زیرِ اہتمام سالانہ امتحانات کا آغاز مؤرخہ ۱۵ شوال المکرم سے ہو رہا ہے۔ تمام درجات کے طلبہ اپنے رول نمبر سلپ دفترِ امتحانات سے حاصل کر لیں۔ امتحان ہال میں موبائل فون، کتب اور کسی بھی قسم کے امتحانی مواد کا داخلہ شرعاً و قانوناً ممنوع ہے۔ خوش خطی اور ترتیبِ جوابات پر خصوصی توجہ دیں۔',
          category: 'exam',
          audience: 'students',
          dateHijri: '۱۸ رمضان المبارک ۱۴۴۷ھ',
          dateGregorian: new Date().toLocaleDateString('ur-PK'),
          author: 'ناظمِ شعبہ امتحاناتِ عالیہ'
        },
        {
          id: 3,
          title: 'اہم ہدایات برائے اساتذہ درجاتِ عالیہ',
          content: 'تمام اساتذہ کرام سے مؤدبانہ گزارش ہے کہ سالانہ امتحان کے پرچہ جات کی تیاری اور نمبرات کی تنقیح مؤرخہ ۲۰ رمضان المبارک تک مکمل کر کے دفترِ تعلیمات میں جمع فرما دیں۔ تاکہ حتمی نتائج اور میرٹ لسٹ وقتِ مقررہ پر شائع کی جا سکے۔ تعاون فرمانے پر عند اللہ ماجور ہوں گے۔',
          category: 'important',
          audience: 'teachers',
          dateGregorian: new Date().toLocaleDateString('ur-PK'),
          dateHijri: '۱۵ رمضان المبارک ۱۴۴۷ھ',
          author: 'مجلسِ شوریٰ و تعلیمی کمیٹی'
        }
      ];
      localStorage.setItem('jamia_posts', JSON.stringify(defaultPosts));
      setPosts(defaultPosts);
    }
  }, []);

  const savePostsToStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('jamia_posts', JSON.stringify(updatedPosts));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    if (editingPost) {
      const updated = posts.map(p => p.id === editingPost.id ? {
        ...p,
        title: formTitle,
        content: formContent,
        category: formCategory,
        audience: formAudience,
        author: formAuthor,
        dateHijri: formDateHijri,
      } : p);
      savePostsToStorage(updated);
      setEditingPost(null);
    } else {
      const newPost: Post = {
        id: Date.now(),
        title: formTitle,
        content: formContent,
        category: formCategory,
        audience: formAudience,
        author: formAuthor,
        dateHijri: formDateHijri,
        dateGregorian: new Date().toLocaleDateString('ur-PK')
      };
      savePostsToStorage([newPost, ...posts]);
    }

    // Reset Form
    setFormTitle('');
    setFormContent('');
    setFormCategory('important');
    setFormAudience('all');
    setFormAuthor('ادارہ جامعہ عربیہ سراج العلوم');
    setFormDateHijri('شوال المکرم ۱۴۴۷ھ');
    setShowCreator(false);
  };

  const handleDeletePost = (id: number) => {
    if (window.confirm('کیا آپ واقعی اس پوسٹ کو حذف کرنا چاہتے ہیں؟')) {
      const filtered = posts.filter(p => p.id !== id);
      savePostsToStorage(filtered);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormCategory(post.category);
    setFormAudience(post.audience);
    setFormAuthor(post.author);
    setFormDateHijri(post.dateHijri);
    setShowCreator(true);
  };

  const handlePrintPost = (post: Post) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${post.title} - پرنٹ نوٹس بورڈ</title>
          <style>
            @font-face {
              font-family: 'Jameel Noori';
              src: url('https://cdn.jsdelivr.net/gh/naeem-ur-rehman/jameel-noori-nastaleeq@master/Jameel%20Noori%20Nastaleeq.ttf') format('truetype');
            }
            body {
              font-family: 'Jameel Noori', 'Noto Nastaliq Urdu', Arial, sans-serif;
              direction: rtl;
              text-align: right;
              padding: 20mm;
              background-color: white;
              color: black;
            }
            .border-double {
              border: 6px double black;
              padding: 15mm;
              min-height: 250mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid black;
              padding-bottom: 5mm;
              margin-bottom: 10mm;
            }
            .header h1 {
              font-size: 28px;
              margin: 0 0 2mm 0;
            }
            .header h2 {
              font-size: 18px;
              margin: 0;
              font-weight: normal;
              letter-spacing: 1px;
            }
            .meta-info {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              border-bottom: 1px dashed black;
              padding-bottom: 3mm;
              margin-bottom: 10mm;
            }
            .title-box {
              text-align: center;
              margin-bottom: 10mm;
            }
            .title-box h3 {
              font-size: 24px;
              border: 2px solid black;
              padding: 3mm 10mm;
              display: inline-block;
              margin: 0;
              background-color: #f9f9f9;
            }
            .content {
              font-size: 18px;
              line-height: 2;
              text-align: justify;
              flex-grow: 1;
              white-space: pre-line;
            }
            .footer {
              margin-top: 15mm;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px dashed black;
              padding-top: 5mm;
            }
            .sign-box {
              text-align: center;
              width: 150px;
            }
            .sign-line {
              border-top: 1px solid black;
              margin-top: 12mm;
              padding-top: 1mm;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
              .border-double { min-height: 100%; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="border-double">
            <div>
              <div class="header">
                <h1>جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ</h1>
                <h2>شعبہ اطلاعات، پبلیکیشنز اینڈ پبلک ریلیشنز</h2>
              </div>
              <div class="meta-info">
                <div>تاریخ ہجری: <strong>${post.dateHijri}</strong></div>
                <div>تاریخ عیسوی: <strong>${post.dateGregorian}</strong></div>
              </div>
              <div class="title-box">
                <h3>مراسلہ: ${post.title}</h3>
              </div>
              <div class="content">
                ${post.content}
              </div>
            </div>
            <div class="footer">
              <div class="sign-box">
                <div class="sign-line">تصدیقِ دفتر مہتمم</div>
              </div>
              <div class="sign-box">
                <strong>${post.author}</strong>
                <div class="sign-line">دستخط و مہرِ جاری کنندہ</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Image Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBodyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerBodyPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintBanner = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${bannerMainTitle} - بینر پرنٹ</title>
          <style>
            @font-face {
              font-family: 'Jameel Noori';
              src: url('https://cdn.jsdelivr.net/gh/naeem-ur-rehman/jameel-noori-nastaleeq@master/Jameel%20Noori%20Nastaleeq.ttf') format('truetype');
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .banner-container {
              width: ${bannerOrientation === 'landscape' ? '297mm' : '210mm'};
              height: ${bannerOrientation === 'landscape' ? '210mm' : '297mm'};
              border: 5px solid #006653;
              box-shadow: inset 0 0 0 3px #D4AF37, inset 0 0 0 6px #006653;
              background-color: #FDFBF7;
              padding: 12mm;
              box-sizing: border-box;
              position: relative;
              font-family: 'Jameel Noori', 'Noto Nastaliq Urdu', sans-serif;
              direction: rtl;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
            }
            
            .banner-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #006653;
              padding-bottom: 4mm;
              margin-bottom: 4mm;
              width: 100%;
              box-sizing: border-box;
            }
            .logo-placeholder {
              width: 85px;
              height: 85px;
              display: flex;
              justify-content: center;
              align-items: center;
              color: #D4AF37;
              order: 1; /* In RTL, renders at Top Right Corner */
            }
            .logo-img {
              max-width: 85px;
              max-height: 85px;
              object-fit: contain;
            }
            .header-text-container {
              text-align: center;
              flex-grow: 1;
              order: 2; /* Top Center */
              padding: 0 4mm;
            }
            .main-title {
              font-size: 32px;
              color: #006653;
              margin: 0 0 1mm 0;
              font-weight: bold;
              text-shadow: 0.5px 0.5px 0px #D4AF37;
            }
            .subtitle {
              font-size: 16px;
              color: #D4AF37;
              margin: 0;
              font-weight: bold;
            }
            .date-box {
              border: 2px dashed #006653;
              background-color: white;
              padding: 2mm 4mm;
              text-align: center;
              min-width: 80px;
              order: 3; /* In RTL, balanced at Top Left Corner */
            }
            .date-num {
              font-size: 26px;
              color: #D4AF37;
              font-weight: bold;
              line-height: 1;
              margin-bottom: 0.5mm;
            }
            .date-month {
              font-size: 13px;
              color: #006653;
              font-weight: bold;
            }
            .date-day {
              font-size: 10px;
              color: #666;
              margin-top: 0.5mm;
              display: block;
            }
            
            .banner-body {
              flex-grow: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              width: 100%;
              height: calc(100% - 150px);
              box-sizing: border-box;
            }
            .image-frame {
              width: 100%;
              height: 100%;
              border: 3px solid #D4AF37;
              background: #F4EFE6;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
              box-sizing: border-box;
            }
            .image-frame img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .banner-footer {
              border-top: 2px solid #006653;
              padding-top: 3mm;
              margin-top: 3mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #006653;
              font-size: 11px;
              width: 100%;
              box-sizing: border-box;
            }
            
            @media print {
              body { padding: 0; }
              @page {
                size: A4 ${bannerOrientation};
                margin: 0;
              }
              .banner-container {
                width: 100%;
                height: 100vh;
                border-width: 5px;
                padding: 10mm;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="banner-container">
            <div class="banner-header">
              <!-- Dynamically structured Logo Area at Top Right in RTL -->
              <div class="logo-placeholder">
                ${bannerLogo 
                  ? `<img src="${bannerLogo}" class="logo-img" />`
                  : `<svg viewBox="0 0 100 100" style="width:65px; height:65px; fill:none; stroke:#D4AF37; stroke-width:1.5;">
                       <circle cx="50" cy="50" r="45" stroke-dasharray="4 2" />
                       <circle cx="50" cy="50" r="40" />
                       <path d="M50 20 L60 35 L75 35 L65 50 L75 65 L60 65 L50 80 L40 65 L25 65 L35 50 L25 35 L40 35 Z" />
                       <text x="50" y="55" text-anchor="middle" font-size="10" font-weight="bold" fill="#D4AF37" font-family="Arial">سراج</text>
                     </svg>`
                }
              </div>
              
              <!-- Title System in Center -->
              <div class="header-text-container">
                <div class="main-title">${bannerMainTitle}</div>
                <div class="subtitle">${bannerSubtitle}</div>
              </div>
              
              <!-- Balanced Date Box at Top Left in RTL -->
              <div class="date-box">
                <div class="date-num">${bannerDateNumeric}</div>
                <div class="date-month">${bannerMonthText}</div>
                <span class="date-day">${bannerDayText}</span>
              </div>
            </div>

            <!-- Massive visual frame spanning line to line with zero text overlays -->
            <div class="banner-body">
              <div class="image-frame">
                ${bannerBodyPhoto
                  ? `<img src="${bannerBodyPhoto}" />`
                  : `<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: rgba(0, 102, 83, 0.05); color: #006653; padding: 20px; box-sizing: border-box;">
                       <svg viewBox="0 0 100 100" style="width: 200px; height: 200px; fill: #006653; opacity: 0.85;">
                         <path d="M50 15 C30 35 30 50 30 75 L70 75 C70 50 70 35 50 15 Z" />
                         <rect x="47" y="5" width="6" height="10" />
                         <circle cx="50" cy="4" r="2" />
                         <rect x="25" y="75" width="50" height="8" rx="2" />
                       </svg>
                     </div>`
                }
              </div>
            </div>

            <!-- Absolute bottom baseline branding line -->
            <div class="banner-footer">
              <div>سوشل میڈیا براڈکاسٹ: <strong>${bannerFooterBranding}</strong></div>
              <div>YouTube | Facebook | Instagram | Twitter</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'important': return 'اہم اعلان';
      case 'holiday': return 'چھٹی کا نوٹس';
      case 'exam': return 'امتحانی خبر';
      case 'news': return 'عام خبر';
      default: return 'متفرق مراسلہ';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'important': return theme === 'dark' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200';
      case 'holiday': return theme === 'dark' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200';
      case 'exam': return theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'news': return theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return theme === 'dark' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen font-urdu flex flex-col h-full overflow-hidden no-print transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`} dir="rtl">
      
      {/* Header Panel */}
      <header className={`h-20 border-b flex items-center justify-between px-8 shrink-0 relative z-20 transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-750' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-urdu flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-teal-500" />
              جامعہ پبلک پوسٹس اینڈ نوٹس بورڈ
            </h1>
            <p className={`text-[10px] font-bold font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>JAMIA COMMUNICATIONS & BULLETIN BOARD</p>
          </div>
        </div>

        {/* Dual Mode Tab Selector */}
        <div className={`p-1 rounded-2xl border flex gap-2 transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-850 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <button 
            onClick={() => setViewMode('announcements')}
            className={`px-5 py-1.5 rounded-xl text-xs font-bold font-urdu transition-all ${
              viewMode === 'announcements' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            مراسلات اور اعلانات (Notices)
          </button>
          <button 
            onClick={() => setViewMode('banners')}
            className={`px-5 py-1.5 rounded-xl text-xs font-bold font-urdu transition-all ${
              viewMode === 'banners' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            بینر اور فلائر ڈیزائنر (Ceremony Banners)
          </button>
        </div>

        {/* Theme and Creator Actions */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              setTheme(newTheme);
              localStorage.setItem('darulifta_theme', newTheme);
            }}
            className={`p-3 rounded-xl transition-all active:scale-95 border ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-750' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={theme === 'dark' ? "لائٹ موڈ آن کریں" : "ڈارک موڈ آن کریں"}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9.75-9h-2.25m-13.5 0H3m16.5-6.75l-1.58 1.58m-11.62 0l-1.58-1.58m15.3 11.62l-1.58-1.58m-11.62 0l-1.58 1.58M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          {viewMode === 'announcements' ? (
            <button 
              onClick={() => {
                setEditingPost(null);
                setFormTitle('');
                setFormContent('');
                setFormCategory('important');
                setFormAudience('all');
                setFormAuthor('ادارہ جامعہ عربیہ سراج العلوم');
                setFormDateHijri('شوال المکرم ۱۴۴۷ھ');
                setShowCreator(true);
              }}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold font-urdu transition-all flex items-center gap-2 shadow-lg shadow-teal-600/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              نیا مراسلہ لکھیں (Create Post)
            </button>
          ) : (
            <button 
              onClick={handlePrintBanner}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-urdu transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              بینر پرنٹ کریں (A4 Banner)
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace based on ViewMode */}
      {viewMode === 'announcements' ? (
        <main className="flex-1 flex overflow-hidden">
          
          {/* RIGHT COLUMN: Posts Feed & Filters */}
          <section className="flex-1 flex flex-col overflow-hidden">
            
            {/* Filter Bar */}
            <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 ${
              theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* Search */}
              <div className="relative w-full md:w-80">
                <input 
                  type="text" 
                  placeholder="موضوع، تفصیل یا دستخط سے تلاش کریں..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-xl pr-10 pl-4 py-2.5 text-xs font-urdu outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                  }`}
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>

              {/* Category Badges Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>فیلٹر کیٹیگری:</span>
                {[
                  { id: 'all', label: 'تمام مراسلات' },
                  { id: 'important', label: 'اہم اعلان' },
                  { id: 'holiday', label: 'چھٹی نوٹس' },
                  { id: 'exam', label: 'امتحانات' },
                  { id: 'news', label: 'تعلیمی خبریں' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-urdu border transition-all active:scale-95 ${
                      selectedCategory === cat.id
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                        : theme === 'dark'
                          ? 'bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-750'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid List */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {filteredPosts.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center opacity-60">
                  <StickyNote className="w-16 h-16 text-slate-500 mb-4 stroke-[1.2]" />
                  <h3 className="text-base font-bold font-urdu">کوئی مراسلہ دستیاب نہیں ہے!</h3>
                  <p className="text-xs text-slate-400 mt-1">آپ اوپر موجود بٹن سے نیا مراسلہ لکھ سکتے ہیں۔</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPosts.map(post => (
                    <div 
                      key={post.id}
                      className={`border rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-white/5 hover:border-teal-500/30' 
                          : 'bg-white border-slate-200/80 hover:border-teal-500/40'
                      }`}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex justify-between items-center mb-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-urdu border ${getCategoryColor(post.category)}`}>
                            {getCategoryLabel(post.category)}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{post.dateHijri}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-base font-bold font-urdu leading-snug mb-3 hover:text-teal-500 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className={`text-xs leading-relaxed font-urdu mb-6 line-clamp-4 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {post.content}
                        </p>
                      </div>

                      {/* Bottom Actions */}
                      <div className={`pt-4 border-t flex items-center justify-between ${
                        theme === 'dark' ? 'border-white/5' : 'border-slate-100'
                      }`}>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] text-slate-400 font-bold">دستخط کنندہ:</span>
                          <span className={`text-[11px] font-urdu font-bold mt-0.5 ${
                            theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                        }`}>{post.author}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => handlePrintPost(post)}
                            className={`p-2 rounded-xl transition-all border ${
                              theme === 'dark' 
                                ? 'bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-750' 
                                : 'bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100'
                            }`}
                            title="نوٹس بورڈ کے لیے پرنٹ نکالیں"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleEditPost(post)}
                            className={`p-2 rounded-xl transition-all border ${
                              theme === 'dark' 
                                ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-750' 
                                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                            }`}
                            title="ترمیم کریں"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className={`p-2 rounded-xl transition-all border ${
                              theme === 'dark' 
                                ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-slate-750' 
                                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                            }`}
                            title="حذف کریں"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          {/* LEFT COLUMN: Slide-over Modal Creator Panel */}
          {showCreator && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex justify-end no-print" onClick={() => setShowCreator(false)}>
              <div 
                className={`w-[500px] h-full shadow-2xl flex flex-col p-8 overflow-y-auto custom-scrollbar select-none animate-slide-left ${
                  theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/10">
                  <h3 className="text-base font-bold font-urdu flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-teal-500" />
                    {editingPost ? 'مراسلہ میں ترمیم کریں' : 'نیا مراسلہ تحریر کریں'}
                  </h3>
                  <button 
                    onClick={() => setShowCreator(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-750' : 'bg-slate-100 text-slate-500 hover:bg-slate-250'
                    }`}
                  >
                    بند کریں
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-5">
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 mr-1">مراسلہ کا عنوان / موضوع (Post Title)</label>
                    <input 
                      type="text" 
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      placeholder="جیسے: تعطیل برائے عید الفطر السعید"
                      className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-850 border-slate-750 text-white focus:border-teal-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 mr-1">مراسلاتی زمرہ (Post Category)</label>
                      <select
                        value={formCategory}
                        onChange={(e: any) => setFormCategory(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-850 border-slate-750 text-white focus:border-teal-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                        }`}
                      >
                        <option value="important">اہم اعلان</option>
                        <option value="holiday">تعطیل / چھٹی نوٹس</option>
                        <option value="exam">امتحانی اطلاع</option>
                        <option value="news">تعلیمی خبریں</option>
                        <option value="general">عام مراسلہ</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 mr-1">مخاطب حضرات (Target Audience)</label>
                      <select
                        value={formAudience}
                        onChange={(e: any) => setFormAudience(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-850 border-slate-750 text-white focus:border-teal-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                        }`}
                      >
                        <option value="all">تمام اراکین جامعہ (سب کے لیے)</option>
                        <option value="students">صرف عزیز طلبہ عظام</option>
                        <option value="teachers">صرف معزز اساتذہ کرام</option>
                        <option value="staff">صرف دیگر دفتری عملہ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 mr-1">مراسلہ کا تفصیلی متن (Announcement Content)</label>
                    <textarea 
                      rows={8}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      required
                      placeholder="یہاں مراسلہ کی مکمل تفصیل جلی حروف میں اردو زبان میں تحریر کریں..."
                      className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu leading-relaxed outline-none transition-all custom-scrollbar ${
                        theme === 'dark' 
                          ? 'bg-slate-850 border-slate-750 text-white focus:border-teal-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 mr-1">جاری کنندہ / دستخط کنندہ (Author Signature)</label>
                      <input 
                        type="text" 
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        required
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-850 border-slate-750 text-white focus:border-teal-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 mr-1">ہجری تاریخ (Hijri Calendar Date)</label>
                      <input 
                        type="text" 
                        value={formDateHijri}
                        onChange={(e) => setFormDateHijri(e.target.value)}
                        required
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-850 border-slate-750 text-white focus:border-teal-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-urdu font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-600/10 active:scale-95"
                    >
                      {editingPost ? 'مراسلہ اپڈیٹ کریں (Update Post)' : 'مراسلہ شائع کریں (Publish Post)'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </main>
      ) : (
        /* BANNER DESIGNER WORKSPACE */
        <main className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: Banners Controls */}
          <section className={`w-[450px] border-l flex flex-col overflow-y-auto p-6 custom-scrollbar select-none transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800 theme-light'
          }`}>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200/10">
              <Layers className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">تقریبی اشتہار و بینر کنٹرولز</h3>
            </div>

            <div className="space-y-5">
              {/* Orientation selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">بینر اورینٹیشن (Banner Orientation)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBannerOrientation('landscape')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      bannerOrientation === 'landscape'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    چوڑائی (Landscape)
                  </button>
                  <button
                    onClick={() => setBannerOrientation('portrait')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      bannerOrientation === 'portrait'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    لمبائی (Portrait)
                  </button>
                </div>
              </div>

              {/* Main Title Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">بنیادی عنوان (Main Ceremony Title)</label>
                <input 
                  type="text" 
                  value={bannerMainTitle}
                  onChange={(e) => setBannerMainTitle(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                    theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="تقریبِ دستارِ فضیلت"
                />
              </div>

              {/* Subtitle Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">ذیلی عنوان - مدرسہ کا نام (Madrasa Name)</label>
                <input 
                  type="text" 
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-xs font-urdu font-bold outline-none transition-all ${
                    theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Logo / crest input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">جامعہ کا مونوگرام (Replace Crest Logo)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className={`flex-grow py-3 border border-dashed rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      theme === 'dark' ? 'border-slate-700 bg-slate-850 text-slate-300' : 'border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-emerald-500" />
                    مونوگرام اپلوڈ کریں
                  </button>
                  {bannerLogo && (
                    <button
                      onClick={() => setBannerLogo(null)}
                      className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold active:scale-95"
                    >
                      ری سیٹ
                    </button>
                  )}
                </div>
                <input 
                  ref={logoInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              {/* Date controls inside dashed box */}
              <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 space-y-4">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">تاریخ اور دن کے کنٹرولز</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">بڑا ہندسہ تاریخ (Day Digit)</label>
                    <input 
                      type="text" 
                      value={bannerDateNumeric} 
                      onChange={(e) => setBannerDateNumeric(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-bold outline-none ${
                        theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">مہینہ (Urdu Month)</label>
                    <input 
                      type="text" 
                      value={bannerMonthText} 
                      onChange={(e) => setBannerMonthText(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-urdu font-bold outline-none ${
                        theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">عیسوی سال (Year Digit)</label>
                    <input 
                      type="text" 
                      value={bannerYearNumeric} 
                      onChange={(e) => setBannerYearNumeric(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-bold outline-none ${
                        theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">ہفتے کا دن (Day Script)</label>
                    <input 
                      type="text" 
                      value={bannerDayText} 
                      onChange={(e) => setBannerDayText(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-urdu font-bold outline-none ${
                        theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">سالِ ہجری رینج (Hijri Spine Text)</label>
                  <input 
                    type="text" 
                    value={bannerHijriRange} 
                    onChange={(e) => setBannerHijriRange(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-urdu font-bold outline-none ${
                      theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Center Photo Upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">مرکزی اشتہاری تصویر (Replace Active Scene Image)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className={`flex-grow py-3 border border-dashed rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      theme === 'dark' ? 'border-slate-700 bg-slate-850 text-slate-300' : 'border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-teal-500" />
                    مرکزی تصویر سلیکٹ کریں
                  </button>
                  {bannerBodyPhoto && (
                    <button
                      onClick={() => setBannerBodyPhoto(null)}
                      className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold active:scale-95"
                    >
                      ری سیٹ
                    </button>
                  )}
                </div>
                <input 
                  ref={photoInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleBodyPhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Social Media branding */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 mr-1">فٹر برانڈنگ (Footer Brand Title)</label>
                <input 
                  type="text" 
                  value={bannerFooterBranding}
                  onChange={(e) => setBannerFooterBranding(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${
                    theme === 'dark' ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

            </div>
          </section>

          {/* RIGHT PANEL: Live rendered Arabesque Ceremony Banner Canvas */}
          <section className={`flex-1 p-8 overflow-y-auto flex items-center justify-center custom-scrollbar transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'
          }`}>
            
            {/* Live Interactive Canvas */}
            <div 
              style={{
                width: bannerOrientation === 'landscape' ? '800px' : '520px',
                height: bannerOrientation === 'landscape' ? '540px' : '760px',
                border: '5px solid #006653',
                boxShadow: 'inset 0 0 0 3px #D4AF37, inset 0 0 0 6px #006653, 0 10px 30px rgba(0,0,0,0.15)'
              }}
              className="bg-[#FDFBF7] p-8 flex flex-col justify-between relative overflow-hidden font-urdu select-none rounded-sm transition-all duration-350"
            >
              {/* Islamic Arabesque Corners */}
              <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-[#D4AF37]"></div>
              <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-[#D4AF37]"></div>
              <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-[#D4AF37]"></div>
              <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-[#D4AF37]"></div>

              {/* Banner Header */}
              <div className="flex justify-between items-center border-b-2 border-[#006653] pb-4 mb-4 z-10 w-full shrink-0">
                {/* Logo input area */}
                <div className="w-16 h-16 flex items-center justify-center">
                  {bannerLogo ? (
                    <img src={bannerLogo} alt="Monogram" className="max-w-16 max-h-16 object-contain" />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="50" cy="50" r="45" strokeDasharray="4 2" />
                      <circle cx="50" cy="50" r="40" />
                      <path d="M50 20 L60 35 L75 35 L65 50 L75 65 L60 65 L50 80 L40 65 L25 65 L35 50 L25 35 L40 35 Z" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
                      <text x="50" y="55" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#D4AF37" fontFamily="Arial">سراج</text>
                    </svg>
                  )}
                </div>

                {/* Calligraphic Titles */}
                <div className="text-center flex-grow px-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#006653] leading-snug drop-shadow-sm font-urdu">
                    {bannerMainTitle}
                  </h1>
                  <h2 className="text-sm md:text-base font-bold text-[#D4AF37] mt-1 font-urdu">
                    {bannerSubtitle}
                  </h2>
                </div>

                {/* Date Spine Bounding Box */}
                <div className="border-2 border-dashed border-[#006653] bg-white px-3.5 py-1.5 text-center min-w-[70px]">
                  <div className="text-2xl font-bold text-[#D4AF37] leading-none">{bannerDateNumeric}</div>
                  <div className="text-[11px] font-bold text-[#006653] mt-0.5">{bannerMonthText}</div>
                  <div className="text-[9px] text-slate-500 leading-none mt-1">{bannerDayText}</div>
                </div>
              </div>

              {/* Banner Body: MASSIVE FULL FRAME CONTAINER (No text overlays/paragraphs) */}
              <div className="flex-grow flex items-center justify-center my-4 z-10 w-full h-[calc(100%-140px)]">
                <div className="border-4 border-[#D4AF37] bg-[#F4EFE6] rounded overflow-hidden shadow-md flex items-center justify-center w-full h-full">
                  {bannerBodyPhoto ? (
                    <img src={bannerBodyPhoto} alt="Center Scene" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FDFBF7] to-[#F4EFE6] p-8 text-center text-[#006653] relative">
                      <svg viewBox="0 0 100 100" className="w-40 h-40 fill-none stroke-[#006653] stroke-[1.2] opacity-80 z-10">
                        <path d="M50,15 C35,33 32,50 32,80 L68,80 C68,50 65,33 50,15 Z" />
                        <path d="M41,40 C41,40 45,50 50,50 C55,50 59,40 59,40" />
                        <line x1="50" y1="15" x2="50" y2="2" />
                        <circle cx="50" cy="2" r="1.5" fill="#006653" />
                        <rect x="25" y="80" width="50" height="6" rx="1" fill="#006653" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Footer */}
              <div className="border-t-2 border-[#006653] pt-3 flex justify-between items-center text-[#006653] text-[10px] z-10 w-full shrink-0">
                <div className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>براڈکاسٹ میڈیا: <strong>{bannerFooterBranding}</strong></span>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span>YouTube</span>
                  <span>•</span>
                  <span>Facebook</span>
                  <span>•</span>
                  <span>Instagram</span>
                </div>
              </div>

            </div>

          </section>

        </main>
      )}

      {/* Slide-in styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s ease-out forwards;
        }
      `}} />

    </div>
  );
}
