import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, logOut } from '../lib/firebase';
import { Loader2, Sparkles, X, Briefcase, ShieldCheck, CheckCircle2, Network, Star, Trash2, Download, Image as ImageIcon, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Markdown from 'react-markdown';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

interface JobDescription {
  title: string;
  description?: string;
  responsibilities: string[];
  authorities: string[];
  tasks: string[];
  directManagement: string;
  importanceToBrands: string;
}

interface AdvisorRecord {
  id: string;
  timestamp: number;
  prompt: string;
  response: string;
}

const departmentDetails: Record<string, JobDescription> = {
  'إدارة الموارد البشرية': {
    title: 'إدارة الموارد البشرية',
    responsibilities: [
      'تخطيط القوى العاملة واستقطاب الكفاءات لجميع العلامات التجارية.',
      'إدارة نظام الرواتب والمزايا والتعويضات بشكل مركزي.',
      'تطوير وتقييم أداء الموظفين ووضع خطط التدريب.',
      'ضمان بيئة عمل صحية وتطبيق لوائح العمل الموحدة.'
    ],
    authorities: [
      'اعتماد التعيينات الجديدة وإنهاء العقود بناءً على توصيات مدراء العلامات.',
      'تحديد سلم الرواتب والمكافآت وفقاً للميزانية المعتمدة.',
      'تطبيق الجزاءات الإدارية حسب اللوائح.'
    ],
    tasks: [
      'إعداد مسيرات الرواتب الشهرية.',
      'إجراء المقابلات الشخصية وفرز السير الذاتية.',
      'متابعة الحضور والانصراف والإجازات.',
      'تحديث الهياكل التنظيمية والوصف الوظيفي.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'توفر للعلامات التجارية كوادر بشرية مؤهلة دون تحمل تكلفة قسم موارد بشرية كامل لكل علامة، مما يضمن استقرار العمليات التشغيلية وتوحيد ثقافة العمل.'
  },
  'الإدارة المالية': {
    title: 'الإدارة المالية',
    responsibilities: [
      'إدارة التدفقات النقدية والميزانيات لجميع العلامات.',
      'إعداد التقارير المالية الدورية والقوائم الختامية.',
      'تطبيق نظام حساب التكاليف الموزعة بدقة.',
      'إدارة العلاقة مع البنوك والجهات الضريبية.'
    ],
    authorities: [
      'اعتماد المصروفات والمدفوعات وفقاً للصلاحيات المالية.',
      'إيقاف أي تعاملات مالية تتجاوز الميزانية المعتمدة.',
      'تحديد سياسات الائتمان والتحصيل.'
    ],
    tasks: [
      'تسجيل القيود المحاسبية اليومية.',
      'إصدار الفواتير ومتابعة التحصيل.',
      'إعداد ميزانيات تقديرية لكل علامة تجارية.',
      'حساب وتوزيع التكاليف المشتركة شهرياً.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'تمنح العلامات التجارية رؤية واضحة ودقيقة لأدائها المالي الحقيقي (ROI) وتضمن الامتثال المالي والضريبي دون الحاجة لتعيين مدير مالي لكل مشروع.'
  },
  'إدارة التسويق': {
    title: 'إدارة التسويق',
    responsibilities: [
      'بناء الاستراتيجيات التسويقية والهوية البصرية للعلامات.',
      'إدارة الحملات الإعلانية الرقمية والتقليدية.',
      'إدارة حسابات التواصل الاجتماعي وصناعة المحتوى.',
      'تحليل بيانات السوق وسلوك المستهلك.'
    ],
    authorities: [
      'اعتماد المحتوى الإعلاني والتصاميم قبل النشر.',
      'توزيع ميزانية التسويق على القنوات المختلفة.',
      'اختيار وتوجيه وكالات الإعلان الخارجية (إن وجدت).'
    ],
    tasks: [
      'تصميم الجرافيك وإنتاج الفيديو.',
      'كتابة المحتوى التسويقي (Copywriting).',
      'إطلاق وتحسين الحملات الممولة (Ads).',
      'استخدام أدوات الذكاء الاصطناعي لتسريع الإنتاج.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'توفر فريق تسويق متكامل (مصممين، صناع محتوى، مسوقين رقميين) لكل علامة تجارية بتكلفة جزئية، مما يضمن تواجداً احترافياً وقوياً في السوق.'
  },
  'إدارة خدمة العملاء': {
    title: 'إدارة خدمة العملاء',
    responsibilities: [
      'الرد على استفسارات وشكاوى العملاء عبر جميع القنوات.',
      'تقديم خدمات ما بعد البيع والدعم الفني.',
      'قياس وتحسين مستوى رضا العملاء.',
      'إدارة عمليات التسويق عبر الهاتف (Telemarketing).'
    ],
    authorities: [
      'تعويض العملاء ضمن الحدود المعتمدة في سياسة الإرجاع والتعويض.',
      'تصعيد الشكاوى المعقدة للإدارات المعنية.',
      'تحديث نصوص الردود الجاهزة (Scripts).'
    ],
    tasks: [
      'استقبال المكالمات والرد على رسائل الشات.',
      'توثيق تذاكر الدعم الفني ومتابعة إغلاقها.',
      'إجراء مكالمات تقييم الخدمة.',
      'إعداد تقارير دورية عن أبرز مشاكل العملاء.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'تضمن تجربة عميل موحدة وعالية الجودة لجميع العلامات، وتوفر مركز اتصال احترافي يعمل على مدار الساعة بتكلفة مشتركة.'
  },
  'العلاقات العامة': {
    title: 'العلاقات العامة',
    responsibilities: [
      'بناء وإدارة السمعة المؤسسية للمجموعة وعلاماتها.',
      'إدارة العلاقات مع الجهات الحكومية والتنظيمية.',
      'إدارة علاقات كبار العملاء (VIP) والشركاء الاستراتيجيين.',
      'إدارة الأزمات الإعلامية.'
    ],
    authorities: [
      'تمثيل المجموعة أمام الجهات الرسمية والإعلامية.',
      'اعتماد البيانات الصحفية والتصريحات الرسمية.',
      'توقيع مذكرات التفاهم الأولية (حسب الصلاحية).'
    ],
    tasks: [
      'تجديد التراخيص والسجلات التجارية.',
      'تنظيم الفعاليات والمؤتمرات الخاصة بالشركة.',
      'صياغة البيانات الصحفية ونشرها.',
      'متابعة وتخليص المعاملات الحكومية.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'تحمي العلامات التجارية قانونياً ونظامياً، وتسهل أعمالها مع الجهات الحكومية، وتبني شبكة علاقات قوية تدعم نمو المبيعات وتوسع الأعمال.'
  },
  'إدارة الجودة والتطوير': {
    title: 'إدارة الجودة والتطوير',
    responsibilities: [
      'وضع معايير الجودة ومؤشرات الأداء (KPIs) لجميع العمليات.',
      'مراقبة وتقييم جودة المنتجات والخدمات المقدمة.',
      'البحث والتطوير المستمر لتحسين كفاءة التشغيل.',
      'إدارة وتحديث أدلة السياسات والإجراءات (SOPs).'
    ],
    authorities: [
      'إيقاف أي عملية تشغيلية أو منتج يخالف معايير الجودة.',
      'فرض إجراءات تصحيحية على الإدارات المخالفة.',
      'اعتماد التعديلات على أدلة الإجراءات.'
    ],
    tasks: [
      'إجراء جولات تفتيشية وتدقيق داخلي دوري.',
      'تحليل تقارير الأخطاء والانحرافات.',
      'تدريب الموظفين على معايير الجودة الجديدة.',
      'دراسة وتطبيق أفضل الممارسات في السوق.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'تضمن استدامة جودة المخرجات في جميع العلامات التجارية، وتقلل من الهدر والأخطاء التشغيلية، مما ينعكس إيجاباً على سمعة العلامة وتكلفتها.'
  },
  'تقنية المعلومات': {
    title: 'تقنية المعلومات',
    responsibilities: [
      'إدارة وتطوير البنية التحتية التقنية للمجموعة.',
      'تطوير وصيانة المواقع الإلكترونية والتطبيقات.',
      'إدارة أنظمة تخطيط موارد المؤسسة (ERP) وقواعد البيانات.',
      'تطبيق حلول الذكاء الاصطناعي والأتمتة.'
    ],
    authorities: [
      'تحديد الصلاحيات التقنية ومستويات الوصول للموظفين.',
      'اعتماد شراء الأجهزة والبرامج التقنية.',
      'إيقاف الأنظمة في حالات الاختراق أو الصيانة الطارئة.'
    ],
    tasks: [
      'تقديم الدعم الفني التقني للموظفين.',
      'أخذ النسخ الاحتياطية الدورية للبيانات.',
      'برمجة وتطوير واجهات المستخدم والأنظمة الخلفية.',
      'حماية الشبكات والبيانات من الاختراقات.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'توفر بنية تقنية متطورة وآمنة لكل علامة تجارية، وتدعم التحول الرقمي والأتمتة لتقليل الجهد البشري وتسريع العمليات بتكلفة تطوير مشتركة.'
  },
  'إدارة المشتريات': {
    title: 'إدارة المشتريات',
    responsibilities: [
      'توفير احتياجات المجموعة وعلاماتها من المواد والخدمات.',
      'إدارة العلاقات مع الموردين والتفاوض على العقود.',
      'البحث عن مصادر توريد بديلة وأكثر كفاءة.',
      'إدارة المشتريات الداخلية والخارجية والوكالات.'
    ],
    authorities: [
      'اختيار واعتماد الموردين بناءً على معايير الجودة والسعر.',
      'توقيع عقود التوريد ضمن الصلاحيات المالية.',
      'رفض استلام المواد غير المطابقة للمواصفات.'
    ],
    tasks: [
      'استدراج عروض الأسعار ومقارنتها.',
      'إصدار أوامر الشراء ومتابعة التوريد.',
      'تقييم أداء الموردين بشكل دوري.',
      'التنسيق مع الإدارة المالية لسداد مستحقات الموردين.'
    ],
    directManagement: 'الرئيس التنفيذي للمجموعة (CEO)',
    importanceToBrands: 'تضمن حصول جميع العلامات على أفضل الأسعار والجودة بفضل القوة الشرائية المجمعة للمجموعة، وتمنع انقطاع المواد الأساسية للتشغيل.'
  }
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('services');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<JobDescription | null>(null);
  const [selectedDigitalJob, setSelectedDigitalJob] = useState<boolean>(false);
  const [selectedMiraModeJob, setSelectedMiraModeJob] = useState<boolean>(false);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorOutput, setAdvisorOutput] = useState('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [archive, setArchive] = useState<AdvisorRecord[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const pageContent = `
        الهيكل الإداري المشترك للعلامات التجارية
        نموذج تشغيلي مبتكر لرفع الكفاءة، توزيع تكاليف الموارد البشرية عالية الخبرة، وتحقيق تسارع النمو عبر جميع قطاعات الشركة العربية الأولى القابضة.
        الأهداف المحورية:
        - توزيع الرواتب بحسب مستوى ارتباط الوظيفة بكل علامة.
        - فصل الوظائف المشتركة عن الوظائف الحصرية لكل علامة.
        - تقدير الجهد وساعات الخدمة ونسب توزيعها.
        - إرساء سياسات التشغيل، خطوط الاتصال، والمسؤوليات الواضحة.
        الهيكل المشترك (المركز التشغيلي):
        1. إدارة الموارد البشرية
        2. الإدارة المالية
        3. إدارة التسويق
        4. إدارة خدمة العملاء
        5. العلاقات العامة
        6. إدارة الجودة والتطوير
        7. تقنية المعلومات
        8. إدارة المشتريات
      `;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `لخص الهيكل الإداري المشترك للشركة العربية الأولى القابضة في 3 نقاط قصيرة جداً بناءً على هذا النص:\n\n${pageContent}`,
          type: 'summarize'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSummary(data.text || 'تعذر التلخيص.');
    } catch (error) {
      console.error(error);
      setSummary('حدث خطأ أثناء التلخيص.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAdvisorSubmit = async () => {
    if (!advisorInput.trim()) return;
    setIsAdvisorLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: advisorInput,
          type: 'advisor'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const text = data.text || 'لم يتم توليد أي محتوى.';
      setAdvisorOutput(text);
      
      const newRecord: AdvisorRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        prompt: advisorInput,
        response: text
      };
      setArchive(prev => [newRecord, ...prev]);
    } catch (error: any) {
      console.error(error);
      setAdvisorOutput(`حدث خطأ أثناء التواصل مع المستشار الذكي: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!resultRef.current) return;
    try {
      // Add a small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await htmlToImage.toPng(resultRef.current, { 
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#f8fafc' // bg-slate-50
      });
      
      const link = document.createElement('a');
      link.download = `advisor-result-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download PNG:', err);
      alert('حدث خطأ أثناء تحميل الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    try {
      // Add a small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await htmlToImage.toPng(resultRef.current, { 
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#f8fafc' // bg-slate-50
      });
      
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`advisor-result-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('حدث خطأ أثناء تحميل ملف PDF. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeleteRecord = (id: string) => {
    setArchive(prev => prev.filter(item => item.id !== id));
    if (advisorOutput && archive.find(a => a.id === id)?.response === advisorOutput) {
      setAdvisorOutput('');
      setAdvisorInput('');
    }
  };

  const loadRecord = (record: AdvisorRecord) => {
    setAdvisorInput(record.prompt);
    setAdvisorOutput(record.response);
    // Scroll to top of advisor section smoothly
    document.getElementById('advisor')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load archive from local storage
  useEffect(() => {
    const saved = localStorage.getItem('advisorArchive');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdvisorRecord[];
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recent = parsed.filter(item => item.timestamp > thirtyDaysAgo);
        setArchive(recent);
        if (parsed.length !== recent.length) {
          localStorage.setItem('advisorArchive', JSON.stringify(recent));
        }
      } catch (e) {
        console.error("Failed to parse archive", e);
      }
    }
  }, []);

  // Save archive to local storage
  useEffect(() => {
    localStorage.setItem('advisorArchive', JSON.stringify(archive));
  }, [archive]);

  const tabs = [
    { id: 'services', label: 'قطاع الشركات الخدمية' },
    { id: 'ecommerce', label: 'قطاع المتاجر الإلكترونية' },
    { id: 'tech', label: 'قطاع التقنية والإتصالات' },
    { id: 'restaurants', label: 'قطاع المطاعم' },
  ];

  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-amber-500 selection:text-white" dir="rtl">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 bg-white/90 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-md py-0' : 'py-4 border-b border-gray-100'}`} id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center transform rotate-45 shadow-lg">
                <div className="w-8 h-8 border-2 border-white rounded-md transform -rotate-45 flex items-center justify-center">
                  <span className="text-white font-bold text-xl leading-none">A</span>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900 leading-tight">العربية الأولى <span className="text-slate-500 font-normal">القابضة</span></h1>
                <p className="text-[10px] text-amber-500 tracking-widest uppercase">The 4A Group</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 space-x-reverse items-center">
              <a href="#intro" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">المقدمة والأهداف</a>
              <a href="#structure" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">الهيكل المشترك</a>
              <a href="#governance" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">الحوكمة التشغيلية</a>
              <a href="#strategy" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">البعد الاستراتيجي</a>
              <a href="#production" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">الخطوط الإنتاجية</a>
              <a href="#advisor" className="text-sm font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1"><Sparkles className="w-4 h-4" /> المستشار الذكي</a>
              
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">{currentUser.displayName}</span>
                  <button onClick={logOut} className="text-sm text-red-600 hover:text-red-800 font-medium">تسجيل خروج</button>
                </div>
              ) : (
                <button onClick={signInWithGoogle} className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition">تسجيل الدخول</button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              {currentUser ? (
                <button onClick={logOut} className="text-sm text-red-600 font-medium">خروج</button>
              ) : (
                <button onClick={signInWithGoogle} className="text-sm text-slate-900 font-medium">دخول</button>
              )}
              <button className="text-slate-600 hover:text-slate-900 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <a href="#intro" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-md">المقدمة والأهداف</a>
            <a href="#structure" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-md">الهيكل المشترك</a>
            <a href="#governance" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-md">الحوكمة التشغيلية</a>
            <a href="#strategy" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-md">البعد الاستراتيجي</a>
            <a href="#production" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-md">الخطوط الإنتاجية</a>
            <a href="#advisor" className="block px-3 py-2 text-base font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md flex items-center gap-2"><Sparkles className="w-4 h-4" /> المستشار الذكي</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-slate-900 to-slate-800 pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-block py-1 px-3 rounded-full bg-white/10 text-amber-400 text-sm font-semibold mb-6 backdrop-blur-sm border border-white/20">
            وثيقة إدارية واستراتيجية
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            الهيكل الإداري المشترك <br /> للعلامات التجارية
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            نموذج تشغيلي مبتكر لرفع الكفاءة، توزيع تكاليف الموارد البشرية عالية الخبرة، وتحقيق تسارع النمو عبر جميع قطاعات الشركة العربية الأولى القابضة.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4">
            <a href="#intro" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:-translate-y-1">استكشف الهيكل</a>
            <a href="#production" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold py-3 px-8 rounded-lg backdrop-blur-sm transition duration-300">الخطوط الإنتاجية</a>
            <button onClick={handleSummarize} disabled={isSummarizing} className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 flex items-center gap-2">
              {isSummarizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              تلخيص سريع بالذكاء الاصطناعي
            </button>
          </motion.div>
          
          {summary && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-8 max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl text-right">
              <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2"><Sparkles size={18} /> ملخص الذكاء الاصطناعي:</h3>
              <div className="text-blue-100 text-sm leading-relaxed whitespace-pre-line">{summary}</div>
            </motion.div>
          )}
        </div>
        
        {/* Curvy bottom divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-12 lg:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.93,130.45,200.77,131.7,243.6,132.48,286.66,128.5,321.39,56.44Z" fill="#F8FAFC"></path>
          </svg>
        </div>
      </header>

      {/* Section: Intro & Objectives */}
      <section id="intro" className="py-20 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* New About Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 relative pb-4 inline-block">
                من نحن
                <span className="absolute bottom-0 right-0 w-full h-1.5 bg-amber-500 rounded-full"></span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                نحن في <strong>"العربية الأولى القابضة"</strong> لا ندير علامات تجارية منفصلة، بل نؤسس منظومة اقتصادية متكاملة ومستدامة. نعمل من خلال نموذج تشغيلي مركزي ذكي يعتمد على <strong>"الخدمات المشتركة"</strong>، مما يوحّد جهودنا الإنتاجية والإدارية لخدمة شبكة واسعة من الواجهات التسويقية والمشاريع التابعة لنا بكفاءة عالية.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                ترتكز قوتنا واستراتيجيتنا التوسعية على أربعة قطاعات حيوية متناغمة (The 4A's Ecosystem):
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              { 
                icon: '🏭', 
                titleAr: 'التصنيع المتقدم', 
                titleEn: 'dvanced Manufacturing', 
                desc: 'القاعدة الإنتاجية الصلبة التي تعتمد على أحدث التقنيات لتغذية مشاريعنا وعملائنا بأعلى معايير الجودة.',
                color: 'border-slate-900'
              },
              { 
                icon: '🤝', 
                titleAr: 'خدمات التحالف', 
                titleEn: 'lliance Services', 
                desc: 'الجناح الخدمي والهندسي المتخصص في تصميم وتنفيذ المشاريع، وتجهيز المساحات، والإنتاج الإعلامي المبتكر.',
                color: 'border-amber-500'
              },
              { 
                icon: '💻', 
                titleAr: 'المحور الرقمي', 
                titleEn: 'xis Digital', 
                desc: 'القلب التقني النابض للمجموعة، والذي يدير منصات التجارة الإلكترونية المتنوعة لضمان وصول منتجاتنا للعميل بسلاسة.',
                color: 'border-blue-500'
              },
              { 
                icon: '🍽️', 
                titleAr: 'أغذية القمة', 
                titleEn: 'pex Foods', 
                desc: 'قطاع الضيافة وصناعة الأغذية الذي يركز على تقديم علامات تجارية رائدة وتجارب استثنائية في عالم الكافيهات والمطاعم.',
                color: 'border-emerald-500'
              },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100 border-t-4 ${item.color}`}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2 flex-wrap">
                  <span>{item.titleAr}</span>
                  <span className="text-slate-500 font-normal text-lg" dir="ltr">(<span className="text-amber-500 font-bold">A</span>{item.titleEn})</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-24">
            <p className="text-xl text-slate-800 font-bold bg-amber-500/10 py-4 px-8 rounded-full inline-block border border-amber-500/20">
              هذا التكامل الاستراتيجي بين قطاعاتنا الأربعة يضمن لنا تسريع الإنجاز، التحكم الدقيق في التكاليف، وتحقيق هيمنة سوقية مستدامة.
            </p>
          </motion.div>

          {/* Strategic Direction */}
          <div className="mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 relative pb-4 inline-block">
                التوجه الاستراتيجي
                <span className="absolute bottom-0 right-0 w-full h-1.5 bg-amber-500 rounded-full"></span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                  <Star size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  رؤيتنا <span className="text-slate-400 font-normal text-lg">| Vision</span>
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg italic">
                  "أن نتبوأ مكانة الصدارة كقوة استثمارية إقليمية محركة للنمو، تقود منظومة اقتصادية مبتكرة تدعم التحول المستدام وتترك بصمة إيجابية عابرة للأجيال في كافة القطاعات التي ننشط بها".
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  رسالتنا <span className="text-slate-400 font-normal text-lg">| Mission</span>
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg italic">
                  "الالتزام بتطوير وإدارة أصولنا الاستثمارية وشركاتنا التابعة وفق أرفع المعايير المهنية العالمية. نسخر استراتيجياتنا المدروسة، وكفاءاتنا البشرية المتخصصة، وشراكاتنا الدولية لضمان تفوقنا في الأسواق وتحقيق تطلعات مساهمينا بمرونة واحترافية".
                </p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    قيمنا الجوهرية <span className="text-slate-400 font-normal text-xl">| Core Values</span>
                  </h3>
                  <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    تُعد قيمنا البوصلة التي توجه أعمالنا نحو المستقبل، وهي:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'الابتكار والجودة', desc: 'نسعى للتميز عبر تبني الحلول الإبداعية ومعايير الجودة الفائقة في كل تفاصيل أعمالنا.', icon: <Sparkles size={20} /> },
                    { title: 'التميز المؤسسي', desc: 'نتبنى الكفاءة والاحترافية كمنهج عمل أساسي لضمان الريادة.', icon: <Star size={20} /> },
                    { title: 'الشفافية والحوكمة', desc: 'نلتزم بأعلى معايير النزاهة والوضوح في الإدارة واتخاذ القرار.', icon: <ShieldCheck size={20} /> },
                    { title: 'المركزية حول العميل', desc: 'نضع تطلعات شركائنا وعملائنا في قلب استراتيجياتنا لضمان رضاهم المستدام.', icon: <CheckCircle2 size={20} /> },
                    { title: 'الشراكات الاستراتيجية', desc: 'نؤمن بقوة التكامل والتعاون لبناء علاقات طويلة الأمد مع المؤسسات المحلية والدولية.', icon: <Network size={20} /> },
                    { title: 'الاستدامة والمسؤولية', desc: 'نلتزم بتحقيق نمو اقتصادي مسؤول يحترم البيئة ويخدم المجتمع.', icon: <Briefcase size={20} /> },
                  ].map((val, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 bg-slate-700 text-amber-400 rounded-lg flex items-center justify-center mb-4">
                        {val.icon}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{val.title}</h4>
                      <p className="text-slate-300 leading-relaxed text-sm">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Original Shared Services Objectives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-16 border-t border-slate-200">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 relative pb-4">
                الرؤية والهدف الأساسي
                <span className="absolute bottom-0 right-0 w-20 h-1.5 bg-amber-500 rounded-full"></span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                يهدف هذا الإطار الإداري الموحد إلى اعتماد <strong>نموذج الخدمات المشتركة</strong> لرفع كفاءة التشغيل. يعالج هذا النموذج التحدي المالي المرتبط بتوظيف الكفاءات المتخصصة عبر ضمان التوزيع العادل للتكاليف، ما يتيح استقطاب خبرات أقوى دون تحميل أي علامة مصروفات تفوق قدراتها.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4">الأهداف المحورية:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start"><span className="text-emerald-500 ml-3">✓</span> <span className="text-slate-700">توزيع الرواتب بحسب مستوى ارتباط الوظيفة بكل علامة.</span></li>
                  <li className="flex items-start"><span className="text-emerald-500 ml-3">✓</span> <span className="text-slate-700">فصل الوظائف المشتركة عن الوظائف الحصرية لكل علامة.</span></li>
                  <li className="flex items-start"><span className="text-emerald-500 ml-3">✓</span> <span className="text-slate-700">تقدير الجهد وساعات الخدمة ونسب توزيعها.</span></li>
                  <li className="flex items-start"><span className="text-emerald-500 ml-3">✓</span> <span className="text-slate-700">إرساء سياسات التشغيل، خطوط الاتصال، والمسؤوليات الواضحة.</span></li>
                </ul>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'إدارة مركزية', desc: 'تصميم نموذج مركزي لإدارة الموارد البشرية عالية الكفاءة مع توزيع عادل للتكاليف.', color: 'border-t-slate-900' },
                { title: 'تسريع النمو', desc: 'تسريع الإنجاز ونمو المبيعات عبر توظيف الخبرات القوية التي تعمل لجميع العلامات.', color: 'border-t-amber-500' },
                { title: 'خفض التكاليف', desc: 'خفض التكاليف عبر مشاركة الموارد البشرية وتطبيق معايير تنفيذ موحدة وعالية الجودة.', color: 'border-t-emerald-500' },
                { title: 'حوكمة مالية', desc: 'تعزيز الحوكمة والوضوح المالي عبر نموذج توزيع التكلفة العادل والدقيق.', color: 'border-t-slate-500' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100 border-t-4 ${item.color}`}>
                  <h4 className="font-bold text-lg mb-2 text-slate-800">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: The Shared Structure */}
      <section id="structure" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">الهيكل المشترك (المركز التشغيلي)</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">ثماني إدارات محورية تشكل العقل المدبر للمجموعة، تقدم خدماتها لجميع العلامات التجارية بكفاءة عالية وتكلفة موزعة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'إدارة الموارد البشرية', desc: 'المزايا والتعويضات، ونظام الموظفين الموحد.' },
              { title: 'الإدارة المالية', desc: 'إدارة الحسابات الشاملة، ونظام حساب التكاليف الموزعة.' },
              { title: 'إدارة التسويق', desc: 'التصميم، الترويج، التصوير، استخدام الذكاء الاصطناعي، وخدمة عميل خارجي. (تتولى ميرا مود الأعمال الفنية وتعمل هوبو سبارك كمقدم خدمة بالباطن).' },
              { title: 'إدارة خدمة العملاء', desc: 'خدمة التسويق بالهاتف والشات، وخدمات ما بعد البيع.' },
              { title: 'العلاقات العامة', desc: 'العقود الحكومية والامتثال، العلاقات الحكومية، وعلاقات كبار العملاء.' },
              { title: 'إدارة الجودة والتطوير', desc: 'البحث وتطوير الأنظمة لرفع مستوى الكفاءة والإنتاجية.' },
              { title: 'تقنية المعلومات', desc: 'البرمجة، وكيل الذكاء الاصطناعي، التطوير المستمر، وخدمة عميل خارجي.' },
              { title: 'إدارة المشتريات', desc: 'مشتريات داخلية، مشتريات خارجية، إدارة الوكالات، وخدمة عميل خارجي.' },
            ].map((dept, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full">
                <div className="cursor-pointer flex-grow" onClick={() => setSelectedDepartment(departmentDetails[dept.title])}>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{dept.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{dept.desc}</p>
                  <div className="text-amber-500 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>عرض الوصف الوظيفي</span>
                    <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
                {dept.title === 'إدارة التسويق' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedMiraModeJob(true); }}
                      className="w-full text-right text-sm font-bold text-slate-700 hover:text-amber-600 bg-white border border-slate-200 hover:border-amber-500/50 rounded-lg px-4 py-3 transition-all duration-300 flex items-center justify-between group/btn shadow-sm hover:shadow"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-500" />
                        خدمات ميرا مود وهوبو سبارك
                      </span>
                      <svg className="w-4 h-4 transform rotate-180 text-slate-400 group-hover/btn:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                )}
                {dept.title === 'تقنية المعلومات' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDigitalJob(true); }}
                      className="w-full text-right text-sm font-bold text-slate-700 hover:text-amber-600 bg-white border border-slate-200 hover:border-amber-500/50 rounded-lg px-4 py-3 transition-all duration-300 flex items-center justify-between group/btn shadow-sm hover:shadow"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-500" />
                        مسؤول المنصات الرقمية وتقنية المعلومات
                      </span>
                      <svg className="w-4 h-4 transform rotate-180 text-slate-400 group-hover/btn:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Governance & Policies */}
      <section id="governance" className="py-20 bg-slate-50 relative border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/3">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">سياسة الحوكمة التشغيلية</h2>
              <p className="text-slate-600 mb-6">قواعد تنظيم استلام العمل وضمان الانضباط التام بين العلامات التجارية والإدارات المركزية.</p>
              <div className="hidden md:flex w-full h-64 bg-slate-800 rounded-2xl shadow-lg items-center justify-center p-6">
                <p className="text-white text-lg font-bold text-center leading-relaxed">"لا يُسمح بالعمل العشوائي، بل وفق حصص تشغيلية وبروتوكولات صارمة."</p>
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-6">
              {[
                { title: 'التكامل القائم على الحصص', desc: 'لا يتم تقديم الخدمات بشكل عشوائي، بل وفقاً لحصة تشغيلية محددة لكل علامة بناءً على حجم المشروع، الميزانية، والأهداف الربع سنوية، لضمان حصول كل علامة على حقها دون التأثير على غيرها.', color: 'border-r-slate-900' },
                { title: 'سياسات العمل والاجتماعات', desc: 'التخطيط الأسبوعي، مراجعة الأداء الشهري، والتتبع الرقمي.', color: 'border-r-amber-500' },
                { title: 'سياسة عدم التداخل', desc: 'للحفاظ على تركيز الكفاءات وجودة المخرجات، يُمنع التدخل المباشر من مدراء العلامات مع الموظفين التنفيذيين لتمرير مهام جانبية. يتم توجيه جميع الطلبات عبر مدير القسم المعتمد فقط.', color: 'border-r-emerald-500' },
                { title: 'بروتوكول الطوارئ', desc: 'يُستثنى من جدولة المهام حالات الطوارئ القصوى التي تعرّف حصراً بـ: توقف خدمة يؤثر مباشرة على الإيرادات، أزمة قانونية أو رقابية مفاجئة، مشكلة تمس سمعة العلامة التجارية بشكل فوري.', color: 'border-r-red-500' },
              ].map((policy, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`bg-white p-6 rounded-xl shadow-sm border-r-4 ${policy.color}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                    <h3 className="text-xl font-bold text-slate-800">{policy.title}</h3>
                  </div>
                  <p className="text-slate-600 mr-12">{policy.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Strategic Dimensions */}
      <section id="strategy" className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">البعد الاستراتيجي للمجموعة</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16">تطبيق هذا الهيكل يحقق ثلاثة مكاسب استراتيجية لا غنى عنها لنجاح وريادة الشركة القابضة.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'استقطاب الكوادر المتميزة', desc: 'يمكن للقابضة الآن توظيف قيادات برواتب مرتفعة لأن تكلفتهم تتوزع على جميع العلامات بنسب متفاوتة حسب الحجم، مما يمنح العلامات الصغيرة إمكانية الوصول لخبرات تفوق ميزانيتها.' },
              { title: 'العدالة في التوزيع المالي', desc: 'يمنع النموذج "الدعم الخفي"، حيث لا تتحمل العلامات الناجحة أعباء العلامات المتعثرة. كل علامة تدفع فاتورة ما تستهلكه فقط، مما يكشف الأداء الحقيقي لكل مشروع.' },
              { title: 'دقة مؤشرات الربحية', desc: 'لن يكون صافي ربح أي علامة تجارية رقماً تقديرياً، بل رقم دقيق وواضح بعد خصم التكاليف التشغيلية والإدارية الحقيقية التي صُرفت لدعمه (ROI دقيق).' },
            ].map((dim, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{dim.title}</h3>
                <p className="text-slate-600 leading-relaxed">{dim.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Production Lines */}
      <section id="production" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-bold tracking-wider uppercase mb-2 block">المنافسة الذاتية والهيمنة السوقية</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">"مصدر إنتاج واحد .. واجهات تسويقية متعددة"</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              لتعظيم العائد على الأصول (ROI) ورفع الطاقة الإنتاجية للمعامل والمستودعات المركزية، تعتمد المجموعة استراتيجية "توليد العلامات" من نفس خطوط الإنتاج. المصنع الرئيسي يلعب دور المورد الداخلي لمتاجر ومشاريع المجموعة المختلفة.
            </p>
          </div>

          <div className="mt-12">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center">
              {activeTab === 'services' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Gridia */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">جريديا لتنظيم الفعاليات (Gridia)</h3>
                    <div className="h-1 w-16 bg-amber-500 mx-auto mb-6"></div>
                    
                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                      شركة سعودية رائدة متخصصة في تخطيط وإدارة وتنظيم الفعاليات والمؤتمرات. تهدف الشركة إلى خلق تجارب استثنائية لا تُنسى من خلال دمج الإبداع المتميز مع أحدث التقنيات المتاحة في التنفيذ.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          خدمات شاملة
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          تشمل تنظيم المعارض والمؤتمرات، إدارة الفعاليات، الإعلان، الإنتاج، والخدمات اللوجستية.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-center mt-4">
                          <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-xs text-gray-300">مكائن طباعة وليزر و CNC</div>
                          <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-xs text-gray-300">تطريز - إضاءة - شاشات</div>
                          <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-xs text-gray-300">مجسمات فيبر جلاس</div>
                          <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-xs text-gray-300">إدارة حشود</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الإبداع والتصميم
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          متخصصون في التصميمات الثنائية والثلاثية الأبعاد (2D & 3D)، وتنفيذ الهويات والمطبوعات، وإنتاج الأفلام القصيرة.
                        </p>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          منهجية العمل
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          تتبع الشركة نهجاً متكاملاً يبدأ بفهم أهداف العميل، ثم التخطيط الدقيق، وصولاً إلى التنفيذ الاحترافي الذي يترك انطباعاً دائماً.
                        </p>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الجودة والتميز
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          الشركة حاصلة على شهادة الآيزو (ISO)، وتضع "الابتكار والشغف" كقيم أساسية في عملها.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <p className="text-amber-400 font-bold text-sm bg-amber-500/10 inline-block px-6 py-2 rounded-full border border-amber-500/20">
                        حاصلة على شهادة الآيزو (ISO) للمعايير العالمية
                      </p>
                      <p className="text-amber-400 font-bold text-sm bg-amber-500/10 inline-block px-6 py-2 rounded-full">
                        يغذي ويدعم المشاريع والفعاليات في كافة العلامات
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10 my-16 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-white/30 text-sm">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Ridia */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">ريديا للتصميم الداخلي (RIDIA Interior Design)</h3>
                    <div className="h-1 w-16 bg-amber-500 mx-auto mb-6"></div>
                    
                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                      شركة سعودية متخصصة في تقديم حلول متكاملة للتصميم والتنفيذ الداخلي، ومقرها الرئيسي في مدينة الرياض. تهدف الشركة إلى تحويل الأفكار إلى مساحات أنيقة وعملية ترفع من جودة حياة الإنسان وإنتاجيته.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الخدمات الرئيسية
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          تشمل التصميم الداخلي (مخططات وتوزيع مساحات)، التنفيذ الداخلي (أعمال التشطيبات)، التوريد والتأثيث، والاستشارات التصميمية والهندسية.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الجودة والاحترافية
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          الشركة حاصلة على شهادة الآيزو (ISO)، وتلتزم بأعلى معايير الجودة والشفافية في التعامل والأسعار.
                        </p>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          مجالات العمل
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          قدمت الشركة مشاريع متنوعة تشمل تصميم الفلل السكنية، المجالس (رجالية ونسائية)، غرف النوم، ومشاريع كبرى مثل مراكز سياحية متكاملة.
                        </p>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الرؤية
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          تسعى لتكون من الشركات الرائدة في المملكة من خلال دمج الذوق الرفيع بإمكانية التنفيذ الواقعية.
                        </p>
                      </div>
                    </div>

                    <p className="text-amber-400 font-bold text-lg bg-amber-500/10 inline-block px-6 py-2 rounded-full">
                      يخدم جميع العلامات بتصاميم فريدة بهوية بصرية راقية
                    </p>
                  </div>

                  <div className="w-full h-px bg-white/10 my-16 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-white/30 text-sm">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Hobo Spark */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">هوبو سبارك (Hoopoe Spark)</h3>
                    <div className="h-1 w-16 bg-amber-500 mx-auto mb-6"></div>
                    
                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                      شركة سعودية رائدة متخصصة في مجال التسويق والإعلام، ومقرها الرئيسي في مدينة الرياض. تهدف الشركة إلى إضاءة العلامات التجارية لعملائها وسرد قصص نجاحهم من خلال عدسة إبداعية مبتكرة.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الرؤية والرسالة
                        </h5>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                          <p><strong className="text-white">الرؤية:</strong> تطمح الشركة لتكون الشريك الأول في تقديم الخدمات التسويقية والإبداعية لشركائها.</p>
                          <p><strong className="text-white">الرسالة:</strong> وضع بصمة واضحة في نجاح التواجد الرقمي للشركاء وتحقيق أعلى عائد لهم عبر استغلال كافة الموارد البشرية والتقنية المتاحة.</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          القيم الأساسية
                        </h5>
                        <ul className="text-gray-300 text-sm leading-relaxed space-y-1 list-disc list-inside">
                          <li><strong className="text-white">الإبداع:</strong> الإيمان بأن القصة الملهمة تترك أثراً يدوم.</li>
                          <li><strong className="text-white">الالتزام:</strong> العمل وفق جداول زمنية دقيقة لضمان أرباح ومنافع العملاء.</li>
                          <li><strong className="text-white">الشمولية:</strong> استخدام كافة سبل التواصل المتاحة للوصول لمختلف فئات الجمهور.</li>
                          <li><strong className="text-white">الجودة:</strong> الاهتمام بكل منتج يعكس القيمة التنافسية للشركة.</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 md:col-span-2">
                        <h5 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          خدمات الشركة
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">الاستراتيجيات التسويقية</strong>
                            <span className="text-gray-400 text-xs">إعداد خطط مدروسة يشرف عليها متخصصون.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">الهوية البصرية</strong>
                            <span className="text-gray-400 text-xs">بناء وتعزيز العلامات التجارية بتواصل بصري.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">صناعة المحتوى</strong>
                            <span className="text-gray-400 text-xs">تقديم أفكار ومحتوى تسويقي جذاب.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">الإنتاج المرئي</strong>
                            <span className="text-gray-400 text-xs">ترويج المنتجات بأحدث التقنيات.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">إدارة التواصل الاجتماعي</strong>
                            <span className="text-gray-400 text-xs">إدارة الحسابات وتحليل البيانات.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">التسويق عبر المؤثرين</strong>
                            <span className="text-gray-400 text-xs">ربط العلامات التجارية بالجمهور المستهدف.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">تحسين محركات البحث (SEO)</strong>
                            <span className="text-gray-400 text-xs">تعزيز الظهور عبر الإنترنت.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">إدارة الفعاليات</strong>
                            <span className="text-gray-400 text-xs">التخطيط والتنفيذ للمعارض والمناسبات.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <p className="text-amber-400 font-bold text-sm bg-amber-500/10 inline-block px-6 py-2 rounded-full border border-amber-500/20">
                        حاصلة على شهادة الآيزو (ISO) للمعايير العالمية
                      </p>
                      <p className="text-amber-400 font-bold text-sm bg-amber-500/10 inline-block px-6 py-2 rounded-full">
                        يخدم جميع العلامات بكل خدمات التواجد الإعلامي الصحيح
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'ecommerce' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">قطاع المتاجر الإلكترونية</h3>
                  <div className="h-1 w-16 bg-blue-500 mx-auto mb-10"></div>
                  
                  {/* Gifts Section */}
                  <div className="mb-12">
                    <h4 className="text-xl font-bold text-amber-400 mb-6 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" /> متجر هدايا والمنتجات الترويجية
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-gray-300">
                      <div className="bg-white/5 p-4 rounded-xl text-center">هدايا دعائية مخصصة وعامة</div>
                      <div className="bg-white/5 p-4 rounded-xl text-center">منتجات خشبية وغيرها</div>
                      <div className="bg-white/5 p-4 rounded-xl text-center">منتجات طباعة وتغليف</div>
                      <div className="bg-white/5 p-4 rounded-xl text-center">اليونيفورم (الزي الموحد)</div>
                    </div>
                    <p className="text-amber-400 font-bold text-sm bg-amber-500/10 inline-block px-6 py-2 rounded-full">
                      خط إنتاج يغذي المبيعات للشركات B2B وعلاماتنا الداخلية
                    </p>
                  </div>

                  <div className="w-full h-px bg-white/10 my-10 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-white/30 text-sm">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Fashion Section */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-pink-400 mb-6 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" /> متاجر الأزياء الجاهزة المتنوعة
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 text-gray-300 text-sm">
                      <div className="bg-white/5 p-3 rounded-xl text-center">ملابس كاجول وكلاسيكي</div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">عبايات وحجابات كلاسيكي</div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">يونيفورم ستاندرد</div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">ملابس موسمية كلاسيك</div>
                      <div className="bg-white/5 p-3 rounded-xl col-span-2 md:col-span-1 text-center">ملابس المواليد والطباعة</div>
                    </div>
                    <p className="text-pink-400 font-bold text-sm bg-pink-500/10 inline-block px-6 py-2 rounded-full">
                      واجهات تسويقية متعددة تغذى من معمل أزياء مركزي
                    </p>
                  </div>
                  <div className="w-full h-px bg-white/10 my-10 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-white/30 text-sm">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Romax Section */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-yellow-500 mb-6 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" /> شركة روماكس (ROMAX)
                    </h4>
                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed text-center">
                      علامة تجارية سعودية رائدة متخصصة في حلول "هندسة الهواء" والتعطير الذكي، وتهدف إلى إعادة تعريف مفهوم الفخامة في المساحات المغلقة (المنازل، المكاتب، والفنادق).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          الهوية والرسالة
                        </h5>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                          <p><strong className="text-white">الشعار:</strong> "فخامة تتنفسها"</p>
                          <p><strong className="text-white">القيم الجوهرية:</strong> تركز على الفخامة، الأمان الصحي (عطور طبيعية وخالية من الكحول)، والذكاء التقني (استخدام تقنية النانو والتحكم عبر التطبيقات).</p>
                          <p><strong className="text-white">الهوية البصرية:</strong> تعتمد اللونين الأسود والذهبي مع شعار "التاج" لتعزيز قيمة البريستيج.</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          حلول ومنتجات روماكس
                        </h5>
                        <ul className="text-gray-300 text-sm leading-relaxed space-y-2 list-disc list-inside">
                          <li><strong className="text-white">جهاز "تاور" (Tower):</strong> للمساحات الكبيرة والفلل.</li>
                          <li><strong className="text-white">جهاز "هوم" (Home):</strong> للمنازل والشقق.</li>
                          <li><strong className="text-white">جهاز "ميني" (Mini):</strong> للسيارات، المكاتب، ودورات المياه.</li>
                          <li><strong className="text-white">الزيوت العطرية:</strong> تشكيلة فاخرة تشمل (العود الملكي، هوتيل فايبز، لافندر نقي، والحمضيات).</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 md:col-span-2">
                        <h5 className="text-yellow-500 font-bold mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          خارطة الطريق الاستراتيجية (2026 - 2030)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                          <div className="bg-black/20 p-4 rounded-lg border border-yellow-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
                            <strong className="text-yellow-400 text-lg block mb-1">2026</strong>
                            <span className="text-gray-300 text-xs">الانطلاقة القوية عبر المتجر الإلكتروني وخدمة العملاء والصيانة.</span>
                          </div>
                          <div className="bg-black/20 p-4 rounded-lg border border-yellow-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
                            <strong className="text-yellow-400 text-lg block mb-1">2027</strong>
                            <span className="text-gray-300 text-xs">التوسع في أجهزة السيارات وحلول الهوية العطرية للفنادق.</span>
                          </div>
                          <div className="bg-black/20 p-4 rounded-lg border border-yellow-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
                            <strong className="text-yellow-400 text-lg block mb-1">2028</strong>
                            <span className="text-gray-300 text-xs">دخول قطاع التجزئة (معطرات مفارش، زيوت تقليدية).</span>
                          </div>
                          <div className="bg-black/20 p-4 rounded-lg border border-yellow-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
                            <strong className="text-yellow-400 text-lg block mb-1">2029</strong>
                            <span className="text-gray-300 text-xs">التواجد الميداني عبر بوثات في المولات التجارية والمطارات الدولية.</span>
                          </div>
                          <div className="bg-black/20 p-4 rounded-lg border border-yellow-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
                            <strong className="text-yellow-400 text-lg block mb-1">2030</strong>
                            <span className="text-gray-300 text-xs">الريادة الإقليمية بافتتاح فروع في دول الخليج العربي.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'tech' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">قطاع التقنية والإتصالات</h3>
                  <div className="h-1 w-16 bg-cyan-500 mx-auto mb-10"></div>
                  
                  {/* PrimeTel Section */}
                  <div className="mb-12">
                    <h4 className="text-xl font-bold text-cyan-400 mb-6 flex items-center justify-center gap-2">
                      <Network className="w-5 h-5" /> شركة PrimeTel (برنتل)
                    </h4>
                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed text-center">
                      شركة سعودية متخصصة في تقديم الحلول المتكاملة في قطاع الاتصالات وتقنية المعلومات.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          عن الشركة والرؤية
                        </h5>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                          <p><strong className="text-white">الهوية:</strong> شركة سعودية رائدة في حلول تقنية المعلومات والاتصالات.</p>
                          <p><strong className="text-white">الالتزام:</strong> تلتزم الشركة بتقديم حلول متقدمة في مجالات التحول الرقمي، الذكاء الاصطناعي، وإنترنت الأشياء (IoT).</p>
                          <p><strong className="text-white">التوجه الاستراتيجي:</strong> تعمل الشركة وفق رؤية المملكة 2030 لدعم مختلف القطاعات من خلال حلول ذكية وموثوقة.</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          مجالات العمل والمشاريع
                        </h5>
                        <p className="text-gray-300 text-sm mb-3">تركز أعمال الشركة الميدانية على البنية التحتية للاتصالات:</p>
                        <ul className="text-gray-300 text-sm leading-relaxed space-y-2 list-disc list-inside">
                          <li><strong className="text-white">أبراج الاتصالات:</strong> تصميم وتركيب أبراج الاتصالات المعدنية الضخمة.</li>
                          <li><strong className="text-white">التجهيزات اللاسلكية:</strong> تركيب هوائيات وأجهزة إرسال واستقبال البيانات اللاسلكية على الأبراج.</li>
                          <li><strong className="text-white">تمديد الكابلات:</strong> أعمال تمديد كابلات الألياف البصرية أو التمديدات الأرضية لشبكات الاتصال.</li>
                          <li><strong className="text-white">الأعمال الإنشائية الميدانية:</strong> تشمل استخدام الرافعات الثقيلة (مثل رافعات SANY) والمعدات اللازمة لتجهيز مواقع الاتصالات.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10 my-10 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-white/30 text-sm">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  {/* AZI Section */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-indigo-400 mb-6 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" /> شركة Applications Zone Intelligence (AZI)
                    </h4>
                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed text-center">
                      شركة سعودية رائدة متخصصة في ابتكار وتطوير الحلول التقنية الذكية لدعم التحول الرقمي في القطاعين الحكومي والخاص.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-8">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                          عن الشركة والاعتمادات
                        </h5>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                          <p><strong className="text-white">التخصص:</strong> تركز الشركة على رفع كفاءة المؤسسات من خلال حلول متقدمة تُصمم خصيصاً لتلبية احتياجات الأعمال الحديثة.</p>
                          <p><strong className="text-white">الجودة والأمان:</strong> الشركة حاصلة على شهادات الأيزو (ISO) المعتمدة في أنظمة الإدارة، الجودة، وأمن المعلومات.</p>
                          <p><strong className="text-white">الرؤية:</strong> تهدف الشركة لتمكين العملاء من تحقيق نمو مستدام وكفاءة تشغيلية عالية عبر تقنيات مرنة وقابلة للتوسع.</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                          منهجية العمل في تطوير التطبيقات
                        </h5>
                        <p className="text-gray-300 text-sm mb-3">تتبع الشركة عملية منظمة تتكون من 6 خطوات أساسية:</p>
                        <ol className="text-gray-300 text-sm leading-relaxed space-y-1 list-decimal list-inside">
                          <li>تحديد الغرض من التطبيق.</li>
                          <li>تحديد الوظائف والمهام.</li>
                          <li>تخطيط سير العمل (Workflow).</li>
                          <li>إعداد النموذج الأولي (Prototype).</li>
                          <li>بدء عملية البناء والبرمجة.</li>
                          <li>الاختبار وإطلاق التطبيق.</li>
                        </ol>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 md:col-span-2">
                        <h5 className="text-indigo-400 font-bold mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                          الخدمات والحلول التقنية
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">تطوير البرمجيات</strong>
                            <span className="text-gray-400 text-xs">تطوير تطبيقات الجوال (iOS و Android) وتطوير تطبيقات الويب.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">حلول الذكاء الاصطناعي (AI)</strong>
                            <span className="text-gray-400 text-xs">بناء الشات بوت (Chatbots) والمساعدات الذكية.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">تحليل البيانات وذكاء الأعمال</strong>
                            <span className="text-gray-400 text-xs">توفير لوحات تحكم تحليلية (Analysing Dashboards).</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">تصميم واجهات وتجربة المستخدم</strong>
                            <span className="text-gray-400 text-xs">الاهتمام بتفاصيل التصميم لضمان أفضل تجربة للمستخدم.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">الأنظمة الإدارية والمحاسبية</strong>
                            <span className="text-gray-400 text-xs">تطوير الأنظمة التي تساعد في إدارة وحماية البيانات الرقمية.</span>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                            <strong className="text-white block mb-1">الدعم الفني</strong>
                            <span className="text-gray-400 text-xs">تقديم خدمات الصيانة والدعم والتطوير المستمر.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'restaurants' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">قطاع المطاعم والمقاهي</h3>
                  <div className="h-1 w-16 bg-red-500 mx-auto mb-10"></div>
                  
                  {/* Narista Section */}
                  <div className="mb-12">
                    <h4 className="text-xl font-bold text-amber-400 mb-6 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" /> نارستا (Narista)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          الهوية والفلسفة
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          علامة تجارية متخصصة في مجال القهوة والمشروبات المختصة. تتميز بهوية بصرية تجمع بين الفخامة والطبيعة، بشعار رأس الغزال ذو القرون الكبيرة. تعتمد لوحة ألوان دافئة (البني الموكا، الأحمر البرغندي، البيج العاجي).
                        </p>
                        <div className="mt-4 inline-block bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                          <span className="text-xs text-slate-400 block mb-1">الشعار اللفظي</span>
                          <span className="text-white font-bold tracking-wider">"اتبع ذوقك" (FOLLOW YOUR TASTE)</span>
                        </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          المنتجات والجودة
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          تقدم أنواعاً فاخرة من قهوة الأرابيكا بنسبة 98%، بالإضافة إلى مشروبات متنوعة مثل الكابتشينو، الشوكوتشينو، والشاي لاتيه.
                        </p>
                        <div className="inline-block bg-amber-900/30 px-4 py-2 rounded-lg border border-amber-500/30">
                          <span className="text-xs text-amber-500/80 block mb-1">شعار الجودة</span>
                          <span className="text-amber-400 font-bold tracking-wider">"حُمصت بعناية" (ROASTED WITH CARE)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10 my-10 relative">
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-white/30 text-sm">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Veneto Section */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-6 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" /> فينيتو (Veneto)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                          المفهوم والهوية
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          علامة تجارية مبتكرة تدمج بين الثقافة اليابانية والإيطالية (تحديداً نابولي). الشعار البصري يظهر شخصاً يقود قارب "الجندول" الشهير في البندقية. تعتمد ألواناً متباينة (البرتقالي، الأسود، الأبيض) مع أنماط هندسية عصرية.
                        </p>
                        <div className="inline-block bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                          <span className="text-xs text-slate-400 block mb-1">الفلسفة</span>
                          <span className="text-white font-bold">الطعام رحلة وقصة تُروى عبر النكهات</span>
                        </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h5 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                          المنتجات والتوجه
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          تبدأ الرحلة بتقديم المطبخ الياباني (مثل السوشي) الذي يتميز بالدقة ونقاء المكونات، مع تطلع مستقبلي مستوحى من تقاليد البيتزا النابولية الأصيلة.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                          <div className="bg-black/40 py-2 px-3 rounded-lg border border-white/5">
                            <span className="text-orange-400 text-xs font-bold block">الحاضر</span>
                            <span className="text-white text-sm">مأكولات يابانية (سوشي)</span>
                          </div>
                          <div className="bg-black/40 py-2 px-3 rounded-lg border border-white/5">
                            <span className="text-red-400 text-xs font-bold block">المستقبل</span>
                            <span className="text-white text-sm">بيتزا نابولية أصيلة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-red-400 font-bold text-lg bg-red-500/10 inline-block px-6 py-2 rounded-full mt-4">
                    قطاع التغذية - تجارب تذوق فريدة ونقاط تلاقي للثقافات
                  </p>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Smart Advisor Section */}
      <section id="advisor" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" />
              المستشار الذكي
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              مرجعك الشامل لعمل ملخصات، توليد أفكار ومحتوى، إعداد مقترحات ووصف وظيفي، والتحليلات السوقية والبحث عن المنافسين والفرص.
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="advisor-input" className="block text-sm font-bold text-slate-700">كيف يمكنني مساعدتك اليوم؟</label>
                {archive.length > 0 && (
                  <button 
                    onClick={() => setShowArchive(!showArchive)}
                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium"
                  >
                    <Clock className="w-4 h-4" />
                    الأرشيف ({archive.length})
                    {showArchive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <textarea
                id="advisor-input"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none bg-slate-50"
                placeholder="اكتب طلبك هنا... (مثال: اكتب وصف وظيفي لمدير تسويق، أو حلل لي سوق المقاهي المختصة في الرياض)"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => { setAdvisorInput(''); setAdvisorOutput(''); }}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                محادثة جديدة
              </button>
              <button
                onClick={handleAdvisorSubmit}
                disabled={isAdvisorLoading || !advisorInput.trim()}
                className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isAdvisorLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    اطلب الاستشارة
                  </>
                )}
              </button>
            </div>
            
            {/* Archive Section */}
            <AnimatePresence>
              {showArchive && archive.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      سجل الاستشارات (آخر 30 يوم)
                    </h4>
                    <div className="space-y-2">
                      {archive.map((record) => (
                        <div key={record.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 hover:border-amber-200 transition-colors group">
                          <button 
                            onClick={() => loadRecord(record)}
                            className="flex-1 text-right text-sm text-slate-600 truncate pr-2 hover:text-amber-600"
                          >
                            {record.prompt}
                          </button>
                          <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {new Date(record.timestamp).toLocaleDateString('ar-SA')}
                            </span>
                            <button 
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                              title="حذف من الأرشيف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {advisorOutput && (
              <div className="bg-slate-50 rounded-xl p-6 md:p-8 border border-slate-200 shadow-inner relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    رد المستشار الذكي:
                  </h4>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-amber-600 transition-colors"
                      title="تحميل كملف PDF"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button 
                      onClick={handleDownloadPNG}
                      className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-amber-600 transition-colors"
                      title="تحميل كصورة PNG"
                    >
                      <ImageIcon className="w-4 h-4" />
                      PNG
                    </button>
                  </div>
                </div>
                <div ref={resultRef} className="bg-slate-50 p-2 -m-2 rounded">
                  <div className="prose prose-slate prose-rtl max-w-none text-slate-700 leading-loose">
                    <Markdown>{advisorOutput}</Markdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center transform rotate-45">
              <div className="w-6 h-6 border border-white rounded-sm transform -rotate-45 flex items-center justify-center">
                <span className="text-white font-bold text-xs leading-none">A</span>
              </div>
            </div>
            <div>
              <span className="text-white font-bold text-lg block leading-none">العربية الأولى القابضة</span>
              <span className="text-xs tracking-widest uppercase">The 4A Group Ecosystem</span>
            </div>
          </div>
          <div className="text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لشركة العربية الأولى القابضة.
          </div>
        </div>
      </footer>

      {/* Job Description Modal */}
      <AnimatePresence>
        {selectedDepartment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedDepartment(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedDepartment.title}</h3>
                    <p className="text-sm text-slate-500">الوصف الوظيفي والمهام</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDepartment(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  
                  {selectedDepartment.description && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-900 text-sm leading-relaxed">
                      {selectedDepartment.description}
                    </div>
                  )}

                  {/* Responsibilities */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      المسؤوليات
                    </h4>
                    <ul className="space-y-3">
                      {selectedDepartment.responsibilities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                          <span className="text-slate-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Authorities */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                      <ShieldCheck size={18} className="text-blue-500" />
                      الصلاحيات
                    </h4>
                    <ul className="space-y-3">
                      {selectedDepartment.authorities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                          <span className="text-slate-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Tasks */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                      <Briefcase size={18} className="text-amber-500" />
                      المهام اليومية والدورية
                    </h4>
                    <ul className="space-y-3">
                      {selectedDepartment.tasks.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                          <span className="text-slate-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Direct Management & Importance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                        <Network size={18} className="text-slate-500" />
                        الإدارة المباشرة
                      </h4>
                      <p className="text-slate-600 font-medium">{selectedDepartment.directManagement}</p>
                    </div>
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                      <h4 className="flex items-center gap-2 font-bold text-amber-900 mb-3">
                        <Star size={18} className="text-amber-500" />
                        الأهمية للعلامات التجارية
                      </h4>
                      <p className="text-amber-800 text-sm leading-relaxed">{selectedDepartment.importanceToBrands}</p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital Platform Officer Job Description Modal */}
      <AnimatePresence>
        {selectedDigitalJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedDigitalJob(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">مسؤول المنصات الرقمية وتقنية المعلومات</h3>
                    <p className="text-sm text-slate-500">الشركة العربية الأولى للتجارة (AL-ARABIA AL-AOLA)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDigitalJob(false)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  
                  {/* General Objective */}
                  <section className="bg-amber-50/50 p-6 rounded-xl border border-amber-100/50">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-amber-900 mb-3">
                      <Star size={18} className="text-amber-500" />
                      الهدف العام من الوظيفة
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      قيادة التواجد الرقمي للشركة وتطوير هويتها على شبكة الإنترنت. يشمل ذلك إدارة المواقع الإلكترونية، تحسين الظهور على محركات البحث (SEO)، إدارة حسابات التواصل الاجتماعي، والإشراف التقني لضمان تجربة مستخدم سلسة تساهم في جذب العملاء وتحقيق الأهداف البيعية والتشغيلية للشركة.
                    </p>
                  </section>

                  {/* Responsibilities */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      المسؤوليات والمهام الرئيسية
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 1. Web Management */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</span>
                          الإدارة الفنية للموقع الإلكتروني
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">تطوير المحتوى:</strong> التحديث الدوري للمنتجات، الخدمات، والبيانات التعريفية للشركة لضمان دقة المعلومات.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">تحسين محركات البحث (SEO):</strong> العمل على رفع ترتيب الموقع في نتائج البحث من خلال الكلمات المفتاحية والروابط الخلفية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">الأداء والتقنية:</strong> مراقبة سرعة الموقع، إصلاح الأعطال التقنية، وضمان توافقه مع الهواتف الذكية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">تحليل البيانات:</strong> استخراج تقارير دورية حول سلوك الزوار باستخدام أدوات مثل (Google Analytics).</p>
                          </li>
                        </ul>
                      </div>

                      {/* 2. Google Business Profile */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                          إدارة الحضور الجغرافي
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">إدارة الفروع:</strong> تحديث بيانات الفروع على خرائط جوجل (الموقع، ساعات العمل، أرقام التواصل).</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">إدارة المحتوى المرئي:</strong> تحديث صور المعارض والمنتجات بشكل دوري لتعزيز الثقة.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">تحسين الظهور المحلي (Local SEO):</strong> استهداف الكلمات المفتاحية المرتبطة بالمناطق الجغرافية للفروع.</p>
                          </li>
                        </ul>
                      </div>

                      {/* 3. Social Media */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">3</span>
                          استراتيجية السوشيال ميديا
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">التخطيط:</strong> إعداد وتنفيذ الأجندة الشهرية للمحتوى (Content Calendar) بما يتوافق مع مواسم البيع والترندات.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">الإشراف الفني:</strong> التنسيق مع المصممين ومعدي الفيديو لضمان جودة المخرجات والتزامها بالهوية البصرية للشركة.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">إدارة الحسابات:</strong> النشر المجدول والمتابعة اللحظية لمنصات (Instagram, X, TikTok, LinkedIn).</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">التفاعل:</strong> الرد الذكي والمهني على استفسارات العملاء وتحويل الطلبات الجادة لفريق المبيعات.</p>
                          </li>
                        </ul>
                      </div>

                      {/* 4. Reputation Management */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">4</span>
                          إدارة السمعة الرقمية والتقييمات
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">رصد الآراء:</strong> المتابعة اليومية لتقييمات العملاء على Google Maps ومنصات التواصل.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">الرد الاستراتيجي:</strong> معالجة الشكاوى بمرونة واحترافية وتحفيز العملاء الراضين على كتابة تقييمات إيجابية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">التقارير:</strong> رفع تقرير شهري عن "مؤشر رضا العملاء الرقمي" واقتراح حلول للتحسين.</p>
                          </li>
                        </ul>
                      </div>

                      {/* 5. IT Support */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 md:col-span-2">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-sm">5</span>
                          الدعم التقني وتكنولوجيا المعلومات (IT Support)
                        </h5>
                        <ul className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">الأمن الرقمي:</strong> ضمان حماية الحسابات والموقع من الاختراقات وتأمين النسخ الاحتياطية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600"><strong className="text-slate-700">التطوير التقني:</strong> اقتراح أدوات وتقنيات جديدة تساهم في أتمتة العمل أو تحسين تجربة العميل.</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Qualifications */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                      <ShieldCheck size={18} className="text-blue-500" />
                      المؤهلات والمتطلبات الأساسية
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <strong className="text-slate-800 block mb-1">الخلفية التعليمية والخبرة</strong>
                          <p className="text-slate-600 text-sm">بكالوريوس في (تقنية المعلومات، التسويق الرقمي، أو نظم المعلومات الإدارية). خبرة عملية لا تقل عن 3 سنوات في إدارة المواقع والسوشيال ميديا.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                          <Network size={16} />
                        </div>
                        <div>
                          <strong className="text-slate-800 block mb-1">المهارات التقنية</strong>
                          <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                            <li>إجادة العمل على منصات إدارة المحتوى (مثل WordPress).</li>
                            <li>فهم عميق لأدوات Google (Console, Analytics, Business Profile).</li>
                            <li>قدرة على تحليل البيانات وصياغة التقارير الإدارية.</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                          <Star size={16} />
                        </div>
                        <div>
                          <strong className="text-slate-800 block mb-1">السمات الشخصية</strong>
                          <p className="text-slate-600 text-sm">الإبداع، سرعة البديهة في استغلال "الترند"، والقدرة على العمل تحت الضغط.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* KPIs */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                      <Star size={18} className="text-amber-500" />
                      المؤشرات الرئيسية للأداء (KPIs)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <span className="font-bold">1</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">نسبة النمو في عدد الزوار والمتابعين شهرياً.</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <span className="font-bold">2</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">ترتيب الموقع في الكلمات المفتاحية المستهدفة (SEO Ranking).</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <span className="font-bold">3</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">متوسط تقييم الفروع على خرائط جوجل (Star Rating).</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <span className="font-bold">4</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">سرعة الاستجابة للرسائل والتعليقات.</p>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mira Mode Job Description Modal */}
      <AnimatePresence>
        {selectedMiraModeJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedMiraModeJob(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">خدمات شركة ميرا مود وهوبو سبارك</h3>
                    <p className="text-sm text-slate-500">إدارة التسويق (الشركة العربية الأولى القابضة)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMiraModeJob(false)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  
                  {/* General Objective */}
                  <section className="bg-amber-50/50 p-6 rounded-xl border border-amber-100/50">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-amber-900 mb-3">
                      <Star size={18} className="text-amber-500" />
                      الهدف العام
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      تتولى شركة ميرا مود كافة الأعمال الفنية والتصميم والتصوير وإدارة السمعة وغيرها مما يخص إدارة التسويق للقابضة، بينما تعمل شركة هوبو سبارك تحت إدارة التسويق كمقدم خدمة بالباطن لتقديم الدعم والخدمات المساندة.
                    </p>
                  </section>

                  {/* Responsibilities */}
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      الخدمات والمهام الرئيسية
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 1. Artistic and Design */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</span>
                          الأعمال الفنية والتصميم (ميرا مود)
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">تصميم الهوية البصرية للعلامات التجارية والمواد الإعلانية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">إنتاج وتصميم الجرافيك للحملات التسويقية الرقمية والمطبوعة.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">تصميم واجهات المستخدم (UI/UX) للمنصات الرقمية.</p>
                          </li>
                        </ul>
                      </div>

                      {/* 2. Photography and Video */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                          التصوير والإنتاج المرئي (ميرا مود)
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">تصوير المنتجات والخدمات بجودة عالية لاستخدامها في الحملات.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">إنتاج وتصوير الفيديوهات الترويجية والتعريفية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">تغطية الفعاليات والمناسبات الخاصة بالشركة.</p>
                          </li>
                        </ul>
                      </div>

                      {/* 3. Reputation and Content */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">3</span>
                          إدارة السمعة والمحتوى (ميرا مود)
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">إدارة السمعة الرقمية للعلامات التجارية ومراقبة الانطباعات.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">كتابة المحتوى الإبداعي والتسويقي (Copywriting).</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">إدارة حسابات التواصل الاجتماعي والتفاعل مع الجمهور.</p>
                          </li>
                        </ul>
                      </div>

                      {/* 4. Support Services */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">4</span>
                          خدمات الدعم والمساندة (هوبو سبارك)
                        </h5>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">تقديم خدمات مساندة في تنفيذ الحملات التسويقية كمقدم خدمة بالباطن.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">المساعدة في إدارة العمليات التسويقية الميدانية واللوجستية.</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                            <p className="text-sm text-slate-600">تنفيذ المهام التقنية أو التشغيلية المحددة من قبل إدارة التسويق.</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
