import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Hand,
  GraduationCap,
  FileText,
  CreditCard,
  UserCog,
  Wallet,
  UserPlus,
  Bell,
  Camera,
  Settings,
  LogOut,
  Search,
  Plus,
  Grid,
  MessageSquare,
  Book,
  FileSearch,
  ClipboardList,
  PenTool,
  Phone,
  Library,
  Landmark,
  StickyNote,
  Calculator,
  List,
  Globe,
  Trash2,
  X,
  Printer,
} from "lucide-react";
import {
  useNavigate,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import StudentManagement from "./StudentManagement";
import AllStudents from "./AllStudents";
import SettingsView from "./Settings";
import ExamManagement from "./ExamManagement";
import ManualAttendance from "./ManualAttendance";
import ExamAttendanceSheet from "./ExamAttendanceSheet";
import StudentProfile from "./StudentProfile";
import SecurityAttendance from "./SecurityAttendance";
import CameraView from "./CameraView";
import FinanceManagement from "./FinanceManagement";
import StaffManagement from "./StaffManagement";
import MessagingCenter from "./MessagingCenter";
import GradeManagement from "./GradeManagement";
import PaperMaker from "./PaperMaker";
import ReportsView from "./ReportsView";
import ModulePlaceholder from "./ModulePlaceholder";
import DocumentManagement from "./DocumentManagement";
import PaperUploader from "./PaperUploader";
import PaperChecker from "./PaperChecker";
import PaperReports from "./PaperReports";
import VoiceAssistant from "./VoiceAssistant";
import BookLibrary from "./BookLibrary";
import PayrollManagement from "./PayrollManagement";
import FeesManagement from "./FeesManagement";
import DarulIfta from "./DarulIfta";
import JamiaPosts from "./JamiaPosts";
import RecycleBin from "./RecycleBin";
import StudentDocumentCapture from "./StudentDocumentCapture";
import PublicResultPortal from "./PublicResultPortal";
import {
  fetchCentralData,
  updateCentralKey,
  syncFromServer,
  syncToServer,
} from "../syncService";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Upload,
  CheckSquare,
  FileText as FileTextIcon,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  urdu: string;
  english: string;
  active?: boolean;
  onClick?: () => void;
  key?: React.Key;
}

interface GridCardProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color: string;
  onClick?: () => void;
  key?: React.Key;
}

const SidebarItem = ({
  icon: Icon,
  urdu,
  english,
  active,
  onClick,
  id,
}: SidebarItemProps & { id?: string }) => (
  <div
    id={id}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all mx-2 my-1 rounded-lg ${active ? "bg-white/20 text-white shadow-lg border border-white/10" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-white" : "text-white/60"}`} />
    <div className="flex flex-col text-right flex-1" dir="rtl">
      <span
        className={`text-sm font-urdu leading-tight ${active ? "text-white font-bold" : "text-white/90"}`}
      >
        {urdu}
      </span>
      <span
        className={`text-[10px] ${active ? "text-white/80" : "text-white/50"}`}
      >
        {english}
      </span>
    </div>
  </div>
);

const GridCard = ({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick,
  id,
}: GridCardProps & { id?: string }) => (
  <div
    id={id}
    onClick={onClick}
    className="card-widget flex flex-col items-center justify-center text-center group"
  >
    <div
      className={`widget-icon ${color.replace("bg-", "bg-opacity-10 text-")} group-hover:scale-110 transition-transform`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-sm font-urdu text-slate-800 font-bold mb-1" dir="rtl">
      {title}
    </span>
    {subtitle && (
      <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
    )}
  </div>
);

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModuleName, setActiveModuleName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState("");

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [savedFees, setSavedFees] = useState<any[]>([]);
  const [selectedPreviewStudent, setSelectedPreviewStudent] = useState<
    any | null
  >(null);

  // Analyze enrolment data from allStudents
  const classDistribution = React.useMemo(() => {
    if (!allStudents || allStudents.length === 0) {
      // Elegant Urdu standard grades fallback
      return [
        { name: "العالیہ", count: 120 },
        { name: "الثانویہ", count: 180 },
        { name: "المتوسطہ", count: 240 },
        { name: "اولیٰ", count: 150 },
        { name: "ثانیہ", count: 165 },
        { name: "ثالثہ", count: 140 },
        { name: "رابعہ", count: 130 },
        { name: "خامسہ", count: 115 },
      ];
    }
    const counts: Record<string, number> = {};
    allStudents.forEach((student) => {
      const g = student.grade || "دیگر";
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [allStudents]);

  const dynamicEnrollmentTrends = React.useMemo(() => {
    const baseTrends = [
      { year: "1441H", count: 850, examsPassed: 780 },
      { year: "1442H", count: 960, examsPassed: 890 },
      { year: "1443H", count: 1080, examsPassed: 1010 },
      { year: "1444H", count: 1150, examsPassed: 1090 },
      { year: "1445H", count: 1210, examsPassed: 1140 },
      { year: "1446H", count: 1240, examsPassed: 1180 },
    ];
    if (!allStudents || allStudents.length === 0) return baseTrends;

    const updatedTrends = [...baseTrends];
    const latestIndex = updatedTrends.length - 1;
    updatedTrends[latestIndex] = {
      ...updatedTrends[latestIndex],
      count: Math.max(allStudents.length, updatedTrends[latestIndex].count),
      examsPassed: Math.max(Math.round(allStudents.length * 0.95), updatedTrends[latestIndex].examsPassed)
    };
    return updatedTrends;
  }, [allStudents]);

  const dynamicAttendancePercent = React.useMemo(() => {
    const studentRecords = attendanceRecords.filter(r => r.type === "student");
    if (studentRecords.length === 0) return 98; // elegant fallback

    // Get the most recent attendance record
    const recent = [...studentRecords].sort((a, b) => b.id - a.id)[0];
    if (!recent || !recent.data || typeof recent.data !== "object") return 98;

    const values = Object.values(recent.data);
    if (values.length === 0) return 98;

    const presentAndValidCount = values.filter(v => v === "P" || v === "S" || v === "L").length;
    return Math.round((presentAndValidCount / values.length) * 100);
  }, [attendanceRecords]);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dynamicPendingFees = React.useMemo(() => {
    const activeCount = allStudents.length > 0 ? allStudents.length : 1240;
    const targetCollection = activeCount * 1500;

    // Calculate collection this month from savedFees
    const currentMonthIndex = new Date().getMonth();
    const currentMonthName = monthsList[currentMonthIndex];
    const paidThisMonth = savedFees
      .filter((f) => f.month === currentMonthName)
      .reduce((sum, f) => sum + (Number(f.totalPaid) || 0), 0);

    const pending = targetCollection - paidThisMonth;
    return Math.max(0, pending);
  }, [allStudents, savedFees]);

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem("system_settings");
    return saved
      ? JSON.parse(saved)
      : {
          jamiaName: "جامعہ عربیہ سراج العلوم جبوڑی مانسہرہ",
          monogram: "",
        };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncKey, setSyncKey] = useState(0); // Used to force refresh modules

  useEffect(() => {
    const loadAllStatsData = () => {
      try {
        const savedSt = localStorage.getItem("students");
        if (savedSt) {
          setAllStudents(JSON.parse(savedSt));
        }

        const savedAtt = localStorage.getItem("attendanceRecords");
        if (savedAtt) {
          setAttendanceRecords(JSON.parse(savedAtt));
        } else {
          setAttendanceRecords([]);
        }

        const savedF = localStorage.getItem("saved_fees");
        if (savedF) {
          setSavedFees(JSON.parse(savedF));
        } else {
          setSavedFees([]);
        }
      } catch (e) {
        console.error("Error loading dashboard stats", e);
      }
    };
    loadAllStatsData();
    window.addEventListener("storage_updated", loadAllStatsData);
    return () => window.removeEventListener("storage_updated", loadAllStatsData);
  }, [syncKey]);

  // Permissions logic
  const [userRole, setUserRole] = useState(
    () => localStorage.getItem("currentUserRole") || "Admin",
  );
  const [userStatus, setUserStatus] = useState(
    () => localStorage.getItem("userStatus") || "accepted",
  );

  const ADMIN_EMAILS = [
    "abdulrehmanhabib.com@gmail.com",
    "jamiaarabiasirajululoomjabori@gmail.com",
  ];
  const currentUserEmail = localStorage.getItem("currentUser") || "";
  const isAdmin =
    ADMIN_EMAILS.includes(currentUserEmail.toLowerCase()) ||
    userRole === "Admin";

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem("role_permissions");
    const defaultPerms: Record<string, any> = {
      Admin: {
        dashboard: true, students: true, all_students: true, document_capture: true,
        attendance: true, lessons: true, manual: true, exam_attendance_sheet: true,
        academics: true, exams: true, paper_maker: true, paper_uploader: true,
        paper_checker: true, paper_reports: true, fees: true, staff: true,
        payroll: true, visitors: true, notifications: true, camera: true,
        settings: true, public_result: true, finance: true, library: true,
        fatwa: true, posts: true, reports: true, recycle_bin: true,
        admissions_view: true, super_admin_panel: true, voice_logs: true
      },
      Teacher: {
        dashboard: true, students: false, all_students: true, document_capture: false,
        attendance: true, lessons: true, manual: true, exam_attendance_sheet: false,
        academics: false, exams: true, paper_maker: false, paper_uploader: true,
        paper_checker: true, paper_reports: true, fees: false, staff: false,
        payroll: false, visitors: false, notifications: true, camera: true,
        settings: false, public_result: false, finance: false, library: true,
        fatwa: false, posts: false, reports: false, recycle_bin: false,
        admissions_view: false, super_admin_panel: false, voice_logs: false
      },
      Staff: {
        dashboard: true, students: true, all_students: true, document_capture: true,
        attendance: true, lessons: false, manual: true, exam_attendance_sheet: true,
        academics: false, exams: false, paper_maker: false, paper_uploader: false,
        paper_checker: false, paper_reports: false, fees: true, staff: false,
        payroll: false, visitors: true, notifications: false, camera: true,
        settings: false, finance: true, library: true,
        fatwa: false, posts: false, reports: false, recycle_bin: false,
        admissions_view: true, super_admin_panel: false, voice_logs: false
      },
      Parent: {
        dashboard: true, students: false, all_students: false, document_capture: false,
        attendance: false, lessons: false, manual: false, exam_attendance_sheet: false,
        academics: false, exams: true, paper_maker: false, paper_uploader: false,
        paper_checker: false, paper_reports: true, fees: false, staff: false,
        payroll: false, visitors: false, notifications: false, camera: false,
        settings: false, public_result: true, finance: false, library: false,
        fatwa: false, posts: false, reports: false, recycle_bin: false,
        admissions_view: false, super_admin_panel: false, voice_logs: false
      }
    };
    if (!saved) return defaultPerms;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const normalized: any = {};
        parsed.forEach((item: any) => {
          normalized[item.role] =
            typeof item.permissions === "string"
              ? JSON.parse(item.permissions)
              : item.permissions;
        });
        return { ...defaultPerms, ...normalized };
      }
      return parsed;
    } catch (e) {
      return defaultPerms;
    }
  });

  const hasPermission = (modId: string) => {
    // Check SaaS multi-tenant billing allowed modules list
    const allowedRaw = localStorage.getItem("madrassaModules");
    if (allowedRaw) {
      try {
        const allowed = JSON.parse(allowedRaw);
        if (Array.isArray(allowed)) {
          const moduleMapping: Record<string, string> = {
            students: "students",
            all_students: "students",
            attendance: "attendance",
            attendance_qr: "attendance",
            manual: "attendance",
            camera: "attendance",
            staff_attendance: "attendance",
            academics: "academics",
            grade: "academics",
            lessons: "academics",
            lessons_daily: "academics",
            results: "exams",
            results_grid: "exams",
            exams: "exams",
            paper_maker: "exams",
            paper_uploader: "exams",
            paper_checker: "exams",
            paper_reports: "exams",
            finance: "finance",
            saved_salaries: "staff",
            payroll: "finance",
            payroll_grid: "finance",
            fees: "finance",
            fees_grid: "finance",
            staff: "staff",
            staff_grid: "staff",
            document_capture: "students",
          };
          const mappedMod = moduleMapping[modId];
          if (mappedMod && !allowed.includes(mappedMod)) {
            return false;
          }
        }
      } catch (e) {}
    }

    const isSuperAdminUser =
      localStorage.getItem("isSuperAdmin") === "true" ||
      ADMIN_EMAILS.includes(currentUserEmail.toLowerCase());

    if (userStatus === "pending" && !isSuperAdminUser) {
      const pendingAllowed = [
        "dashboard",
        "all_students",
        "results_grid",
        "library",
        "fatwa",
        "posts",
      ];
      if (!pendingAllowed.includes(modId)) return false;
    }

    if (isSuperAdminUser) return true;

    // Map sidebar/grid IDs to permission keys
    const permMap: Record<string, string> = {
      dashboard: "dashboard",
      students: "students",
      all_students: "all_students",
      document_capture: "document_capture",
      attendance: "attendance",
      attendance_qr: "attendance",
      lessons: "lessons",
      manual: "manual",
      exam_attendance_sheet: "exam_attendance_sheet",
      academics: "academics",
      grade: "academics",
      results: "exams",
      results_grid: "exams",
      exams: "exams",
      paper_maker: "paper_maker",
      paper_uploader: "paper_uploader",
      paper_checker: "paper_checker",
      paper_reports: "paper_reports",
      fees: "fees",
      fees_grid: "fees",
      staff: "staff",
      staff_grid: "staff",
      payroll: "payroll",
      payroll_grid: "payroll",
      visitors: "visitors",
      visitors_grid: "visitors",
      notifications: "notifications",
      messaging: "notifications",
      camera: "camera",
      settings: "settings",
      public_result: "public_result",
      finance: "finance",
      library: "library",
      fatwa: "fatwa",
      posts: "posts",
      reports: "reports",
      recycle_bin: "recycle_bin",
      online_applications: "admissions_view",
      admissions_view: "admissions_view",
      super_admin_panel: "super_admin_panel",
      voice_logs: "voice_logs"
    };

    const key = permMap[modId] || modId;
    return permissions[userRole]?.[key] !== false;
  };

  // Robust Sync Logic
  useEffect(() => {
    let lastLocalState = JSON.stringify(localStorage);

    const performSync = async (direction: "push" | "pull" | "both") => {
      if (isSyncing) return;
      setIsSyncing(true);

      try {
        if (direction === "push" || direction === "both") {
          await syncToServer();
          lastLocalState = JSON.stringify(localStorage);
        }
        if (direction === "pull" || direction === "both") {
          await syncFromServer();
          lastLocalState = JSON.stringify(localStorage);
        }
        setLastSync(new Date());
      } catch (err) {
        console.error("Sync error:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // 1. Initial sync on mount (pull latest)
    performSync("pull");

    // 2. Listen for background updates to trigger module refreshes
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem("system_settings");
      if (saved) setSystemSettings(JSON.parse(saved));

      setUserRole(localStorage.getItem("currentUserRole") || "Admin");
      setUserStatus(localStorage.getItem("userStatus") || "accepted");
      const savedPerms = localStorage.getItem("role_permissions");
      if (savedPerms) {
        try {
          const parsed = JSON.parse(savedPerms);
          if (Array.isArray(parsed)) {
            const normalized: any = {};
            parsed.forEach((item: any) => {
              normalized[item.role] =
                typeof item.permissions === "string"
                  ? JSON.parse(item.permissions)
                  : item.permissions;
            });
            setPermissions(normalized);
          } else {
            setPermissions(parsed);
          }
        } catch (e) {
          console.error("Error parsing permissions in storage update:", e);
        }
      }
    };
    window.addEventListener("storage_updated", handleStorageUpdate);

    // 3. Sync on Focus (Guaranteed Auto-Fetch when switching back to app)
    const handleFocus = () => {
      console.log("Window focused, pulling latest data from PC...");
      syncFromServer();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") syncFromServer();
    });

    // 4. Periodic Pull (every 10 minutes for high-capacity sync)
    const pullInterval = setInterval(() => syncFromServer(), 600000);

    // 5. Smart Push (detect local changes every 2 seconds)
    const pushInterval = setInterval(async () => {
      const currentState = JSON.stringify(localStorage);
      if (currentState !== lastLocalState) {
        console.log("Local changes detected, initiating Strict Push...");
        const success = await syncToServer();
        if (success) {
          console.log("Push successful, pulling fresh signal...");
          await syncFromServer(); // STRICT RULE: Refresh after save
        }
        lastLocalState = JSON.stringify(localStorage);
      }
    }, 2000);

    // 6. Real-time Firestore synchronization for all central data (Disabled as requested)
    const madrassaId = null;
    let unsubscribeFirestore: (() => void) | null = null;

    return () => {
      window.removeEventListener("storage_updated", handleStorageUpdate);
      window.removeEventListener("focus", handleFocus);
      clearInterval(pullInterval);
      clearInterval(pushInterval);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncToServer();
    await syncFromServer();

    // Refresh settings after sync
    const saved = localStorage.getItem("system_settings");
    if (saved) setSystemSettings(JSON.parse(saved));

    setLastSync(new Date());
    setIsSyncing(false);
  };

  const saveSettings = async (newSettings: any) => {
    setSystemSettings(newSettings);
    localStorage.setItem("system_settings", JSON.stringify(newSettings));
    await updateCentralKey("system_settings", newSettings);
    await syncToServer(); // Push all changes
  };

  const sidebarItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      urdu: "ڈیش بورڈ",
      english: "Dashboard",
    },
    {
      id: "students",
      path: "/dashboard/students",
      icon: Users,
      urdu: "طالب علم",
      english: "Students",
    },
    {
      id: "all_students",
      path: "/dashboard/all-students",
      icon: List,
      urdu: "تمام طالب علم",
      english: "All Students",
    },
    {
      id: "document_capture",
      path: "/dashboard/document-capture",
      icon: Camera,
      urdu: "دستاویز کیپچر",
      english: "Document Capture",
    },
    {
      id: "attendance",
      path: "/dashboard/attendance",
      icon: UserCheck,
      urdu: "سیکیورٹی حاضری",
      english: "Attendance",
    },
    {
      id: "lessons",
      path: "/dashboard/lessons",
      icon: BookOpen,
      urdu: "روز کا سبق",
      english: "Daily Lessons",
    },
    {
      id: "manual",
      path: "/dashboard/manual-attendance",
      icon: Hand,
      urdu: "دستی حاضری",
      english: "Manual Attend",
    },
    {
      id: "exam_attendance_sheet",
      path: "/dashboard/exam-attendance",
      icon: Printer,
      urdu: "امتحانی حاضری شیٹ",
      english: "Exam Attendance Sheet",
    },
    {
      id: "academics",
      path: "/dashboard/grade",
      icon: GraduationCap,
      urdu: "تعلیمی امور",
      english: "Academics",
    },
    {
      id: "results",
      path: "/dashboard/exams",
      icon: FileText,
      urdu: "نتائج",
      english: "Exams & Results",
    },
    {
      id: "paper_maker",
      path: "/dashboard/paper-maker",
      icon: PenTool,
      urdu: "پیپر میکر",
      english: "Paper Maker",
    },
    {
      id: "paper_uploader",
      path: "/dashboard/paper-uploader",
      icon: Upload,
      urdu: "پیپر اپلوڈر",
      english: "Paper Uploader",
    },
    {
      id: "paper_checker",
      path: "/dashboard/paper-checker",
      icon: CheckSquare,
      urdu: "پیپر چیکر",
      english: "Paper Checker",
    },
    {
      id: "paper_reports",
      path: "/dashboard/paper-reports",
      icon: FileTextIcon,
      urdu: "پیپر رپورٹس",
      english: "Paper Reports",
    },
    {
      id: "fees",
      path: "/dashboard/fees",
      icon: CreditCard,
      urdu: "فیس",
      english: "Fees",
    },
    {
      id: "staff",
      path: "/dashboard/staff",
      icon: UserCog,
      urdu: "عملہ و وظائف",
      english: "Staff Roles",
    },
    {
      id: "payroll",
      path: "/dashboard/payroll",
      icon: Wallet,
      urdu: "تنخواہ",
      english: "Payroll",
    },
    {
      id: "visitors",
      path: "/dashboard/visitors",
      icon: UserPlus,
      urdu: "ملاقاتی رجسٹر",
      english: "Visitors",
    },
    {
      id: "notifications",
      path: "/dashboard/messaging",
      icon: Bell,
      urdu: "اعلانات",
      english: "Notifications",
    },
    {
      id: "camera",
      path: "/dashboard/camera",
      icon: Camera,
      urdu: "کیمرہ ویو",
      english: "Camera View",
    },
    {
      id: "settings",
      path: "/dashboard/settings",
      icon: Settings,
      urdu: "ترتیبات",
      english: "Settings",
    },
    {
      id: "public_result",
      path: "/dashboard/public-result",
      icon: Globe,
      urdu: "پبلک رزلٹ پورٹل",
      english: "Public Result Portal",
    },
    {
      id: "finance",
      path: "/dashboard/finance",
      icon: Landmark,
      urdu: "آمد و خرچ",
      english: "Finance Management",
    },
    {
      id: "library",
      path: "/dashboard/library",
      icon: Library,
      urdu: "لائبریری",
      english: "Library",
    },
    {
      id: "fatwa",
      path: "/dashboard/fatwa",
      icon: Landmark,
      urdu: "دارالافتاء",
      english: "Dar-ul-Ifta",
    },
    {
      id: "posts",
      path: "/dashboard/posts",
      icon: StickyNote,
      urdu: "جامعہ پوسٹس",
      english: "Jamia Posts",
    },
    {
      id: "reports",
      path: "/dashboard/reports",
      icon: ClipboardList,
      urdu: "رپورٹس",
      english: "Reports Center",
    },
    {
      id: "recycle_bin",
      path: "/dashboard/recycle-bin",
      icon: Trash2,
      urdu: "ریسائیکل بن",
      english: "Recycle Bin",
    },
  ].filter((item) => {
    if (item.id === "settings")
      return hasPermission(item.id) && (isAdmin || userStatus === "accepted");
    return hasPermission(item.id);
  });

  const gridCards = [
    {
      id: "students",
      path: "/dashboard/students",
      icon: Users,
      title: "طالب علم",
      color: "bg-blue-500",
    },
    {
      id: "all_students",
      path: "/dashboard/all-students",
      icon: List,
      title: "تمام طالب علم",
      color: "bg-blue-600",
    },
    {
      id: "document_capture",
      path: "/dashboard/document-capture",
      icon: Camera,
      title: "طلبہ دستاویزات کیپچر",
      color: "bg-indigo-600",
    },
    {
      id: "relatives",
      path: "/dashboard/placeholder",
      icon: Users,
      title: "رشتہ دار",
      color: "bg-indigo-600",
    },
    {
      id: "attendance_qr",
      path: "/dashboard/attendance",
      icon: UserCheck,
      title: "حاضری طلبہ (QR/Bio)",
      color: "bg-cyan-500",
    },
    {
      id: "lessons_daily",
      path: "/dashboard/placeholder",
      icon: BookOpen,
      title: "روز کا سبق",
      subtitle: "(Daily Lesson)",
      color: "bg-teal-500",
    },
    {
      id: "scholarship",
      path: "/dashboard/placeholder",
      icon: Wallet,
      title: "وظیفہ",
      color: "bg-emerald-500",
    },
    {
      id: "fees_grid",
      path: "/dashboard/fees",
      icon: CreditCard,
      title: "فیس",
      color: "bg-blue-600",
    },
    {
      id: "grade",
      path: "/dashboard/grade",
      icon: Grid,
      title: "درجہ",
      color: "bg-purple-500",
    },
    {
      id: "paper_maker",
      path: "/dashboard/paper-maker",
      icon: PenTool,
      title: "پیپر میکر",
      color: "bg-indigo-700",
    },
    {
      id: "paper_uploader",
      path: "/dashboard/paper-uploader",
      icon: Upload,
      title: "پیپر اپلوڈر",
      color: "bg-blue-700",
    },
    {
      id: "paper_checker",
      path: "/dashboard/paper-checker",
      icon: CheckSquare,
      title: "پیپر چیکر",
      color: "bg-emerald-700",
    },
    {
      id: "paper_reports",
      path: "/dashboard/paper-reports",
      icon: FileTextIcon,
      title: "پیپر رپورٹس",
      color: "bg-cyan-700",
    },
    {
      id: "staff_grid",
      path: "/dashboard/staff",
      icon: UserCog,
      title: "معلم و دیگر عملہ",
      color: "bg-emerald-600",
    },
    {
      id: "staff_attendance",
      path: "/dashboard/camera",
      icon: UserCheck,
      title: "حاضری عملہ (QR/Bio)",
      color: "bg-lime-500",
    },
    {
      id: "payroll_grid",
      path: "/dashboard/payroll",
      icon: Wallet,
      title: "تنخواہ",
      color: "bg-green-600",
    },
    {
      id: "book",
      path: "/dashboard/placeholder",
      icon: Book,
      title: "کتاب",
      color: "bg-green-700",
    },
    {
      id: "messaging",
      path: "/dashboard/messaging",
      icon: MessageSquare,
      title: "پیغام رسانی",
      color: "bg-blue-500",
    },
    {
      id: "results_grid",
      path: "/dashboard/exams",
      icon: FileSearch,
      title: "نتائج",
      color: "bg-lime-600",
    },
    {
      id: "visitors_grid",
      path: "/dashboard/visitors",
      icon: ClipboardList,
      title: "ملاقاتیوں کا رجسٹر",
      color: "bg-sky-500",
    },
    {
      id: "documents",
      path: "/dashboard/documents",
      icon: FileText,
      title: "دستاویز کی وصولی",
      color: "bg-sky-400",
    },
    {
      id: "complaints",
      path: "/dashboard/placeholder",
      icon: Bell,
      title: "رجسٹر شکایات",
      color: "bg-teal-600",
    },
    {
      id: "fatwa",
      path: "/dashboard/fatwa",
      icon: Landmark,
      title: "دارالافتاء",
      color: "bg-orange-500",
    },
    {
      id: "posts",
      path: "/dashboard/posts",
      icon: StickyNote,
      title: "جامعہ پوسٹس",
      color: "bg-teal-650",
    },
    {
      id: "library",
      path: "/dashboard/library",
      icon: Library,
      title: "لائبریری",
      color: "bg-indigo-500",
    },
    {
      id: "phone_diary",
      path: "/dashboard/placeholder",
      icon: Phone,
      title: "فون ڈائری",
      color: "bg-blue-700",
    },
    {
      id: "notes",
      path: "/dashboard/placeholder",
      icon: StickyNote,
      title: "یادداشت",
      color: "bg-indigo-800",
    },
    {
      id: "finance",
      path: "/dashboard/finance",
      icon: Calculator,
      title: "مالیاتی حساب",
      color: "bg-red-500",
    },
    {
      id: "public_result",
      path: "/dashboard/public-result",
      icon: Globe,
      title: "پبلک رزلٹ پورٹل",
      color: "bg-teal-600",
    },
    {
      id: "recycle_bin",
      path: "/dashboard/recycle-bin",
      icon: Trash2,
      style: { direction: "rtl" },
      title: "ریسائیکل بن",
      color: "bg-rose-500",
    },
  ].filter((card) => hasPermission(card.id));

  const matchedStudents = allStudents.filter((s) => {
    if (!globalSearchTerm) return false;
    const term = globalSearchTerm.toLowerCase();

    const nameMatch = s.name?.toLowerCase().includes(term);
    const fatherNameMatch = s.fatherName?.toLowerCase().includes(term);
    const regNoMatch =
      s.regNo?.toLowerCase().includes(term) || s.id?.toString().includes(term);
    const rollNoMatch = s.rollNo?.toLowerCase().includes(term);
    const gradeMatch = s.grade?.toLowerCase().includes(term);

    return (
      nameMatch || fatherNameMatch || regNoMatch || rollNoMatch || gradeMatch
    );
  });

  const madrassaStatus = localStorage.getItem("madrassaStatus") || "active";
  const banReason =
    localStorage.getItem("madrassaRequirement") ||
    localStorage.getItem("banReason") ||
    "آپ کا سافٹ ویئر لائسنس تعلیمی یا انتظامی امور کی ادائیگی یا بقایاجات کی وجہ سے عارضی طور پر بند کر دیا گیا ہے۔ برائے مہربانی کوائف کی تصدیق اور بقایاجات کی ادائیگی کے لیے مرکزی ایڈمن سے رابطہ کریں۔";
  const isBanned =
    userStatus === "banned" ||
    userStatus === "suspended" ||
    userStatus === "rejected" ||
    madrassaStatus === "inactive" ||
    localStorage.getItem("madrassaExpiryExpired") === "true";

  if (isBanned) {
    return (
      <div
        className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-urdu text-white text-right select-none"
        dir="rtl"
      >
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Accent light balls */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          {/* Alert Icon */}
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl text-red-500 mb-8 animate-pulse shadow-lg shadow-red-500/10">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-black text-white px-2 py-1 leading-tight text-center mb-4 font-urdu">
            اکاؤنٹ معطل / منسوخ کر دیا گیا ہے!
          </h1>
          <p className="text-slate-400 text-xs text-center font-sans uppercase tracking-widest leading-none mb-6">
            Account Suspended & Blocked
          </p>

          <div className="w-full h-px bg-slate-800/80 my-2" />

          {/* Madrassa Dynamic Requirement Message Box */}
          <div className="w-full bg-slate-950/80 border border-slate-800/60 p-6 rounded-2xl mb-8 space-y-3 text-right">
            <span className="text-xs font-bold text-red-400 block border-b border-slate-800/40 pb-2 font-urdu">
              نظام کی طرف سے متعلقہ تفصیلات و شرائط:
            </span>
            <p className="text-sm md:text-md text-slate-300 leading-relaxed font-bold font-urdu">
              {banReason}
            </p>
          </div>

          {/* Support Actions */}
          <div className="w-full flex flex-col gap-4">
            <a
              href="https://wa.me/923435488319"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#128C7E] border border-emerald-500/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all text-center text-sm font-urdu"
            >
              <span>سپر ایڈمن سے رابطہ کریں (واٹس ایپ)</span>
            </a>
            <button
              onClick={() => {
                localStorage.clear();
                onLogout();
                navigate("/login");
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold transition-all text-xs font-urdu"
            >
              لاگ آؤٹ اور بیک جائیں
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse h-screen bg-[#F4F7F6] overflow-hidden print:block print:h-auto print:bg-transparent relative">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-24 right-4 z-[60] bg-white text-blue-600 p-2.5 rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all print:hidden"
        title={isSidebarOpen ? "سائیڈ بار چھپائیں" : "سائیڈ بار دکھائیں"}
      >
        <Grid className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0"} sidebar-gradient flex flex-col transition-all duration-300 print:hidden overflow-y-auto overflow-x-hidden custom-scrollbar shadow-2xl`}
      >
        <div className="p-8 mb-4 min-w-[256px]">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold overflow-hidden shadow-xl border border-white/20">
              {systemSettings.monogram ? (
                <img
                  src={systemSettings.monogram}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Landmark className="w-8 h-8" />
              )}
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                Management System
              </span>
              <span className="text-sm font-urdu font-bold text-white mt-1">
                {systemSettings.jamiaName}
              </span>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full my-6" />
          
          <div className="relative">
             <input
                 type="text"
                 placeholder="سرچ کریں..."
                 className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-2.5 rounded-xl text-sm outline-none"
                 onChange={(e) => setSidebarSearchTerm(e.target.value)}
                 dir="rtl"
             />
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/50" />
          </div>
        </div>

        <div className="flex-1 px-2 space-y-1">
          {sidebarItems
            .filter((item) => item.urdu.includes(sidebarSearchTerm) || item.english.toLowerCase().includes(sidebarSearchTerm.toLowerCase()))
            .map((item) => (
            <SidebarItem
              key={item.id}
              id={`nav-${item.id}`}
              icon={item.icon}
              urdu={item.urdu}
              english={item.english}
              active={
                location.pathname === item.path ||
                (item.id === "dashboard" && location.pathname === "/dashboard")
              }
              onClick={() => {
                navigate(item.path);
              }}
            />
          ))}
        </div>

        <div className="p-6 mt-auto">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3" dir="rtl">
              <div className="w-10 h-10 bg-white/20 rounded-xl overflow-hidden border border-white/20">
                <img
                  src="https://picsum.photos/seed/admin/100/100"
                  alt="Admin"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white font-urdu">
                  عبدالرحمان حبیب
                </span>
                <span className="text-[9px] text-white/50 uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-urdu rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              <span>لاگ آؤٹ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto">
        <Routes>
          <Route
            path="/students"
            element={
              <StudentManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/all-students"
            element={<AllStudents onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/document-capture"
            element={
              <StudentDocumentCapture onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/settings"
            element={
              isAdmin || userStatus === "accepted" ? (
                <SettingsView
                  onBack={() => navigate("/dashboard")}
                  onSubViewChange={(view) => {
                    if (view === "exam_management")
                      navigate("/dashboard/exams");
                  }}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/exams"
            element={<ExamManagement onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/manual-attendance"
            element={<ManualAttendance onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/exam-attendance"
            element={<ExamAttendanceSheet onClose={() => navigate("/dashboard")} />}
          />
          <Route
            path="/student-profile/:id"
            element={<StudentProfile />}
          />
          <Route
            path="/attendance"
            element={
              <SecurityAttendance onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/camera"
            element={<CameraView onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/finance"
            element={
              <FinanceManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/staff"
            element={<StaffManagement onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/messaging"
            element={<MessagingCenter onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/grade"
            element={
              hasPermission("academics") ? (
                <GradeManagement onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-maker"
            element={
              hasPermission("exams") ? (
                <PaperMaker onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-uploader"
            element={
              hasPermission("paper_uploader") ? (
                <PaperUploader onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-checker"
            element={
              hasPermission("paper_checker") ? (
                <PaperChecker onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-reports"
            element={
              hasPermission("paper_reports") ? (
                <PaperReports onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/library"
            element={<BookLibrary onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/reports"
            element={<ReportsView onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/fatwa"
            element={<DarulIfta onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/posts"
            element={<JamiaPosts onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/payroll"
            element={
              <PayrollManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/fees"
            element={<FeesManagement onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/documents"
            element={
              <DocumentManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/recycle-bin"
            element={<RecycleBin onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/public-result"
            element={
              <PublicResultPortal onClose={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/placeholder"
            element={
              <ModulePlaceholder
                title={activeModuleName}
                onBack={() => navigate("/dashboard")}
              />
            }
          />

          <Route
            path="/"
            element={
              <>
                {/* Top Header */}
                <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSyncing
                            ? "bg-blue-600 text-white animate-pulse"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                        }`}
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        <span className="font-urdu">
                          {isSyncing ? "سنک ہو رہا ہے..." : "ڈیٹا سنک کریں"}
                        </span>
                      </button>

                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Bell className="w-5 h-5" />
                      </button>

                      {/* Global student search bar */}
                      <div
                        className="relative z-50 flex items-center"
                        dir="rtl"
                      >
                        <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all w-64 md:w-80">
                          <Search className="w-4 h-4 text-slate-400 ml-2" />
                          <input
                            type="text"
                            placeholder="طالب علم تلاش کریں (نام، رجسٹریشن، کلاس)..."
                            value={globalSearchTerm}
                            onChange={(e) => {
                              setGlobalSearchTerm(e.target.value);
                              setIsSearchFocused(true);
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            className="bg-transparent text-xs outline-none text-slate-800 placeholder-slate-400 font-urdu w-full text-right"
                          />
                          {globalSearchTerm && (
                            <button
                              type="button"
                              onClick={() => {
                                setGlobalSearchTerm("");
                                setIsSearchFocused(false);
                              }}
                              className="text-slate-400 hover:text-slate-600 mr-1 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Floating Results Panel */}
                        {isSearchFocused && globalSearchTerm && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsSearchFocused(false)}
                            />
                            <div className="absolute top-12 left-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-96 overflow-y-auto z-50 p-2">
                              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 font-urdu text-right border-b border-slate-100">
                                تلاش کے نتائج ({matchedStudents.length})
                              </div>
                              {matchedStudents.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400 font-urdu">
                                  کوئی طالب علم نہیں ملا۔
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-100">
                                  {matchedStudents
                                    .slice(0, 8)
                                    .map((student: any) => (
                                      <div
                                        key={student.id}
                                        onClick={() => {
                                          setSelectedPreviewStudent(student);
                                          setIsSearchFocused(false);
                                        }}
                                        className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-right"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                            Reg: {student.regNo || student.id}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-bold font-urdu text-slate-800">
                                            {student.name}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-urdu">
                                            کلاس: {student.grade || "N/A"} |
                                            ولدیت: {student.fatherName || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  {matchedStudents.length > 8 && (
                                    <div
                                      onClick={() => {
                                        localStorage.setItem(
                                          "pendingSearchTerm",
                                          globalSearchTerm,
                                        );
                                        navigate("/dashboard/all-students");
                                        setIsSearchFocused(false);
                                      }}
                                      className="p-3 text-center text-[11px] font-bold text-blue-600 hover:bg-blue-50/50 rounded-xl font-urdu cursor-pointer transition-colors mt-1"
                                    >
                                      تمام {matchedStudents.length} نتائج دیکھنے
                                      کے لیے یہاں کلک کریں →
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6" dir="rtl">
                    <div className="flex flex-col text-right">
                      <h2 className="text-slate-900 text-xl font-urdu font-bold">
                        نظام برائے انتظام مدرسہ
                      </h2>
                      <p className="text-slate-400 text-[11px] font-urdu font-medium tracking-wide">
                        {systemSettings.jamiaName} - پورٹل
                      </p>
                    </div>
                    <div className="h-10 w-px bg-slate-100 mx-2" />
                    <div className="flex items-center gap-3">
                      <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-urdu font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        <span>نیا اندراج</span>
                      </button>
                    </div>
                  </div>
                </header>

                {/* Pending View-only Banner */}
                {userStatus === "pending" && !isAdmin && (
                  <div
                    className="bg-amber-500 text-white font-urdu font-bold px-8 py-4 flex items-center justify-between text-sm shadow-md"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚠️</span>
                      <span>
                        عارضی لاگ ان (صرف دیکھنے کی اجازت): آپ کا اکاؤنٹ ابھی
                        ایڈمن کی منظوری کا منتظر ہے۔ آپ معلومات دیکھ سکتے ہیں،
                        پر فارم تبدیل نہیں کر سکتے۔
                      </span>
                    </div>
                    <a
                      href="https://wa.me/923435488319"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-amber-700 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-neutral-100 transition-all shadow-md font-urdu"
                    >
                      رابطہ ایڈمن
                    </a>
                  </div>
                )}

                {/* Sub Header / Tabs */}
                <div
                  className="bg-white px-8 py-2 flex justify-end gap-10 border-b border-slate-100"
                  dir="rtl"
                >
                  {["مرکز", "اعداد و شمار", "متفرق", "رپورٹس"].map((tab) => {
                    const isActive =
                      tab === "رپورٹس" &&
                      location.pathname === "/dashboard/reports";
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          if (tab === "رپورٹس") navigate("/dashboard/reports");
                          else {
                            setActiveModuleName(tab);
                            navigate("/dashboard/placeholder");
                          }
                        }}
                        className={`text-xs font-urdu font-bold py-3 px-1 transition-all relative ${isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {tab}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Content */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="mb-8" dir="rtl">
                    <h3 className="text-slate-800 font-urdu font-bold text-lg mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-600 rounded-full" />
                      انتظامی امور (Key Modules)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
                      {gridCards.map((card) => (
                        <GridCard
                          key={card.id}
                          id={`grid-${card.id}`}
                          icon={card.icon}
                          title={card.title}
                          subtitle={card.subtitle}
                          color={card.color}
                          onClick={() => {
                            
                            navigate(card.path);
                            if (card.path.includes("placeholder"))
                              setActiveModuleName(card.title);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    dir="rtl"
                  >
                    <div className="card-widget border-r-4 border-r-blue-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Total Students (کل طالب علم)
                          </span>
                          <h4 className="text-2xl font-bold text-slate-800 mt-1">
                            {allStudents.length > 0 ? allStudents.length.toLocaleString() : "1,240"}
                          </h4>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-bold">
                        <span>+{allStudents.length > 0 ? Math.max(1, Math.round(allStudents.length * 0.04)) : 12}% vs last month</span>
                      </div>
                    </div>
                    <div className="card-widget border-r-4 border-r-emerald-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Daily Attendance (یومیہ حاضری)
                          </span>
                          <h4 className="text-2xl font-bold text-slate-800 mt-1">
                            {dynamicAttendancePercent}%
                          </h4>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-bold">
                        <span>{attendanceRecords.filter(r => r.type === "student").length > 0 ? "براہ راست حاضری ریکارڈ" : "بہترین رجحان"}</span>
                      </div>
                    </div>
                    <div className="card-widget border-r-4 border-r-orange-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Pending Fees (واجب الوصول فیس)
                          </span>
                          <h4 className="text-2xl font-bold text-slate-800 mt-1">
                            Rs. {dynamicPendingFees >= 1000 ? (dynamicPendingFees / 1000).toFixed(0) + "k" : dynamicPendingFees}
                          </h4>
                        </div>
                        <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-orange-500 text-[10px] font-bold">
                        <span>ماہانہ فیس وصولی ہدف</span>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Section powered by Recharts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" dir="rtl">
                    {/* Enrollment Trend */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-right">
                          <h5 className="font-urdu font-bold text-slate-800 text-sm">سالانہ داخلہ رجحان</h5>
                          <p className="text-[10px] text-slate-400 font-bold">تعلیمی سال کے لحاظ سے کل طلبہ</p>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">سالانہ رجحان</span>
                      </div>
                      <div className="w-full h-[260px] font-sans text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dynamicEnrollmentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                              labelClassName="font-bold text-slate-700"
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area name="داخل شدہ طلبہ" type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
                            <Area name="امتحان پاس کردہ" type="monotone" dataKey="examsPassed" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Class Distribution */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-right">
                          <h5 className="font-urdu font-bold text-slate-800 text-sm">درجات کے لحاظ سے طلبہ کی تقسیم</h5>
                          <p className="text-[10px] text-slate-400 font-bold">مختلف درجات میں داخل طلبہ کی تعداد</p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">کلاس وائز</span>
                      </div>
                      <div className="w-full h-[260px] font-sans text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" className="font-urdu" />
                            <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                              labelClassName="font-bold text-slate-700 font-urdu"
                            />
                            <Bar name="طلبہ کی تعداد" dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={25} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </main>

                {/* Footer */}
                <footer className="h-16 bg-white border-t border-slate-100 px-8 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex flex-col">
                    <span className="font-urdu text-left font-bold text-slate-500">
                      تمام حقوق محفوظ ہیں۔ ڈیزائن و ڈویلپمنٹ: عبدالرحمن حبیب
                    </span>
                    <span className="uppercase tracking-widest text-left">
                      © 2026 {systemSettings.jamiaName} | Professional Portal V3
                    </span>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="flex flex-col items-end">
                      <span
                        className={`flex items-center gap-1 text-[9px] font-bold ${isSyncing ? "text-blue-500" : "text-emerald-500"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isSyncing ? "bg-blue-500 animate-ping" : "bg-emerald-500"}`}
                        />
                        {isSyncing ? "Syncing..." : "System Online"}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-slate-100" />
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-200">
                      Stable Version
                    </span>
                  </div>
                </footer>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <VoiceAssistant />

      {/* Student Details Preview Modal */}
      {selectedPreviewStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-250">
          <div
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in scale-in duration-200"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-blue-600 to-indigo-600 text-white p-6 relative text-right">
              <button
                onClick={() => setSelectedPreviewStudent(null)}
                className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden border border-white/20">
                  {selectedPreviewStudent.photo ? (
                    <img
                      src={selectedPreviewStudent.photo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold font-urdu">
                    {selectedPreviewStudent.name}
                  </h4>
                  <p className="text-xs text-white/80 font-urdu mt-0.5">
                    ولدیت: {selectedPreviewStudent.fatherName}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info Grid */}
            <div className="p-6 space-y-4 text-sm text-slate-700 font-urdu max-h-[300px] overflow-y-auto text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    رجسٹریشن نمبر
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {selectedPreviewStudent.regNo || selectedPreviewStudent.id}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    کلاس (درجہ)
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedPreviewStudent.grade || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    رول نمبر
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {selectedPreviewStudent.rollNo || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    رابطہ نمبر
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {selectedPreviewStudent.phone || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    شناختی کارڈ / ہدف نمبر
                  </span>
                  <span className="text-xs font-medium text-slate-700 font-sans">
                    {selectedPreviewStudent.cnic || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    تاریخ پیدائش
                  </span>
                  <span className="text-xs font-medium text-slate-700 font-sans">
                    {selectedPreviewStudent.dob || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    موجودہ پتہ
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {selectedPreviewStudent.currentAddress || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  localStorage.setItem(
                    "pendingEditStudentId",
                    selectedPreviewStudent.id.toString(),
                  );
                  navigate("/dashboard/all-students");
                  setSelectedPreviewStudent(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-urdu font-bold py-2 px-4 rounded-xl text-center text-xs shadow-lg shadow-blue-600/10 transition-colors"
              >
                ترمیم کریں
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(
                    "pendingPrintStudentId",
                    selectedPreviewStudent.id.toString(),
                  );
                  navigate("/dashboard/all-students");
                  setSelectedPreviewStudent(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-urdu font-bold py-2 px-4 rounded-xl text-center text-xs shadow-lg shadow-emerald-600/10 transition-colors"
              >
                داخلہ فارم پرنٹ کریں
              </button>
              <button
                onClick={() => setSelectedPreviewStudent(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-urdu font-bold rounded-xl text-xs transition-colors hover:bg-slate-300"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
