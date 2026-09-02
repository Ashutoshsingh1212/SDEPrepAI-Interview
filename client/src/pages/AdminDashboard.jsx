import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Users,
  Briefcase,
  Clock,
  Award,
  CheckCircle2,
  Trash2,
  Search,
  RefreshCw,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Layers,
  Activity,
  Check,
  Calendar,
  Zap,
  Target,
  Menu,
  X
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://sdeprepai.onrender.com";
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("staff_token") || ""}`,
  },
});

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "0 mins";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins} mins`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminDashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    stats: {
      totalInterviews: 0,
      completedInterviews: 0,
      avgScore: 0,
      totalStaff: 0,
      totalStudents: 0,
      totalMinutesSpent: 0,
    },
    students: [],
    recruiters: [],
    recentInterviews: [],
    analytics: {
      scoreTrend: [],
      domainDistribution: [],
      readinessDistribution: [],
      radarSkills: [],
      aiIntelligence: "",
    },
  });

  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "students" | "recruiters" | "interviews"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  async function loadDashboardData() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/admin/dashboard`, auth());
      setData(res.data);
    } catch (e) {
      console.error("Admin dashboard error:", e);
      setError(e.response?.data?.error || "Could not load admin dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleClearHistory() {
    if (
      !window.confirm(
        "⚠️ Are you sure you want to delete ALL interview history across the platform? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${API}/api/v1/interviews/clear`, auth());
      loadDashboardData();
    } catch (e) {
      alert(e.response?.data?.error || "Could not clear interview history");
    }
  }

  async function handleDeleteInterview(id) {
    if (!window.confirm("Delete this specific interview record?")) return;
    try {
      await axios.delete(`${API}/api/v1/interview/${id}`, auth());
      loadDashboardData();
    } catch (e) {
      alert(e.response?.data?.error || "Could not delete interview");
    }
  }

  const students = data.students || [];
  const recruiters = data.recruiters || [];
  const interviews = data.recentInterviews || [];
  const stats = data.stats || {};
  const analytics = data.analytics || {};

  // Filter students
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term)
    );
  });

  // Filter recruiters
  const filteredRecruiters = recruiters.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term)
    );
  });

  // Filter interviews
  const filteredInterviews = interviews.filter((i) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (i.candidate_name || "").toLowerCase().includes(term) ||
      (i.candidate_email || "").toLowerCase().includes(term) ||
      (i.role || "").toLowerCase().includes(term);
    const matchesRole =
      filterRole === "all" ||
      (i.role || "").toLowerCase().includes(filterRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderNavContent = () => (
    <>
      {/* Brand Header */}
      <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid #1a2233", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #38bdf8)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", display: "block" }}>
              SDEPrepAI
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#818cf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Admin Portal
            </span>
          </div>
        </div>
        {mobileMenuOpen && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: "#182030", border: "1px solid #29354d", color: "#94a3b8", borderRadius: 8, width: 32, height: 32, display: "grid", placeItems: "center", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* User Info Profile Box */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a2233", background: "rgba(17, 22, 34, 0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #ef4444, #f59e0b)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              display: "grid",
              placeItems: "center",
              textTransform: "uppercase",
            }}
          >
            {user?.name ? user.name.charAt(0) : "A"}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {user?.name || "Administrator"}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {user?.email || "admin@sdeprepai.com"}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
          <ShieldCheck size={11} />
          Super Administrator
        </div>
      </div>

      {/* Navigation Items (Left-Most Side Menu) */}
      <nav style={{ flex: 1, padding: "18px 14px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px 6px" }}>
          Intelligence & Analytics
        </div>

        {/* 1. Analytics & Visualizations */}
        <button
          type="button"
          onClick={() => { setActiveTab("analytics"); setMobileMenuOpen(false); }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            border: activeTab === "analytics" ? "1px solid #818cf8" : "1px solid transparent",
            background: activeTab === "analytics" ? "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(56, 189, 248, 0.15))" : "transparent",
            color: activeTab === "analytics" ? "#fff" : "#94a3b8",
            fontWeight: 750,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={16} style={{ color: activeTab === "analytics" ? "#818cf8" : "#64748b" }} />
            <span>Analytics & Radar Charts</span>
          </div>
          <span
            style={{
              background: activeTab === "analytics" ? "#818cf8" : "#171d2b",
              color: activeTab === "analytics" ? "#0f172a" : "#818cf8",
              padding: "2px 7px",
              borderRadius: 8,
              fontSize: 10.5,
              fontWeight: 800,
            }}
          >
            LIVE
          </span>
        </button>

        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", padding: "14px 10px 6px" }}>
          Directories & Management
        </div>

        {/* 2. Students / Candidates */}
        <button
          type="button"
          onClick={() => { setActiveTab("students"); setMobileMenuOpen(false); }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            border: activeTab === "students" ? "1px solid #6366f1" : "1px solid transparent",
            background: activeTab === "students" ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.1))" : "transparent",
            color: activeTab === "students" ? "#fff" : "#94a3b8",
            fontWeight: 750,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={16} style={{ color: activeTab === "students" ? "#818cf8" : "#64748b" }} />
            <span>Students / Candidates</span>
          </div>
          <span
            style={{
              background: activeTab === "students" ? "#6366f1" : "#171d2b",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {students.length}
          </span>
        </button>

        {/* 3. Recruiters & Staff */}
        <button
          type="button"
          onClick={() => { setActiveTab("recruiters"); setMobileMenuOpen(false); }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            border: activeTab === "recruiters" ? "1px solid #38bdf8" : "1px solid transparent",
            background: activeTab === "recruiters" ? "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.1))" : "transparent",
            color: activeTab === "recruiters" ? "#fff" : "#94a3b8",
            fontWeight: 750,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Briefcase size={16} style={{ color: activeTab === "recruiters" ? "#38bdf8" : "#64748b" }} />
            <span>Recruiters & Staff</span>
          </div>
          <span
            style={{
              background: activeTab === "recruiters" ? "#38bdf8" : "#171d2b",
              color: activeTab === "recruiters" ? "#082f49" : "#94a3b8",
              padding: "2px 8px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {recruiters.length}
          </span>
        </button>

        {/* 4. All Interview Sessions */}
        <button
          type="button"
          onClick={() => { setActiveTab("interviews"); setMobileMenuOpen(false); }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            border: activeTab === "interviews" ? "1px solid #4ade80" : "1px solid transparent",
            background: activeTab === "interviews" ? "linear-gradient(135deg, rgba(74, 222, 128, 0.18), rgba(99, 102, 241, 0.1))" : "transparent",
            color: activeTab === "interviews" ? "#fff" : "#94a3b8",
            fontWeight: 750,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={16} style={{ color: activeTab === "interviews" ? "#4ade80" : "#64748b" }} />
            <span>All Interview Sessions</span>
          </div>
          <span
            style={{
              background: activeTab === "interviews" ? "#4ade80" : "#171d2b",
              color: activeTab === "interviews" ? "#052e16" : "#94a3b8",
              padding: "2px 8px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {interviews.length}
          </span>
        </button>
      </nav>

      {/* Sidebar Footer Controls */}
      <div style={{ padding: "16px 18px", borderTop: "1px solid #1a2233", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            Platform Online
          </span>
          <span>API v1.0</span>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            background: "#141926",
            border: "1px solid #28334a",
            color: "#c7d2fe",
            borderRadius: 10,
            padding: "9px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <RefreshCw size={13} className={loading ? "spin" : ""} />
          Sync Platform Data
        </button>

        <button
          type="button"
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            background: "#281216",
            border: "1px solid #572027",
            color: "#ff9ca5",
            borderRadius: 10,
            padding: "9px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", background: "#08090c", color: "#f4f5f7" }}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-nav-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Off-canvas Drawer */}
      <aside className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
        {renderNavContent()}
      </aside>

      {/* =========================================================
          DESKTOP LEFT-MOST SIDEBAR NAVIGATION
      ========================================================= */}
      <aside className="admin-sidebar">
        {renderNavContent()}
      </aside>

      {/* =========================================================
          MAIN RIGHT CONTENT AREA
      ========================================================= */}
      <main className="admin-main" style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {/* Main Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: "1px solid #1a2233",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 260 }}>
            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              className="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Admin Menu"
              title="Open Admin Menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#818cf8", fontWeight: 800, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                <ShieldCheck size={14} />
                ADMINISTRATIVE OVERSIGHT
              </div>
              <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 900, letterSpacing: "-0.03em" }}>
                {activeTab === "analytics" && "Platform Analytics & Competency Intelligence"}
                {activeTab === "students" && "Students & Candidates Directory"}
                {activeTab === "recruiters" && "Recruiters & Staff Directory"}
                {activeTab === "interviews" && "All Interview Sessions & History"}
              </h1>
              <p style={{ color: "#8f98aa", margin: 0, fontSize: 13 }}>
                Comprehensive performance analytics, skill matrix radar charts, student practice duration, and recruiter oversight.
              </p>
            </div>
          </div>

          {/* Search bar inside header */}
          {activeTab !== "analytics" && (
            <div style={{ position: "relative", minWidth: 260 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "9px 12px 9px 36px",
                  background: "#0f131c",
                  border: "1px solid #232c3f",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </header>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid #ef4444", color: "#fca5a5", padding: "14px 18px", borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* 6 Metric KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {/* Total Students */}
          <div
            onClick={() => setActiveTab("students")}
            style={{
              background: activeTab === "students" ? "#141b2c" : "#0e121a",
              border: `1px solid ${activeTab === "students" ? "#6366f1" : "#1f2638"}`,
              borderRadius: 14,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#818cf8", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>Students</span>
              <Users size={16} />
            </div>
            <strong style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{stats.totalStudents || 0}</strong>
            <div style={{ fontSize: 11.5, color: "#8f98aa", marginTop: 2 }}>Registered candidates</div>
          </div>

          {/* Total Recruiters */}
          <div
            onClick={() => setActiveTab("recruiters")}
            style={{
              background: activeTab === "recruiters" ? "#101d2c" : "#0e121a",
              border: `1px solid ${activeTab === "recruiters" ? "#38bdf8" : "#1f2638"}`,
              borderRadius: 14,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#38bdf8", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recruiters</span>
              <Briefcase size={16} />
            </div>
            <strong style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{stats.totalStaff || 0}</strong>
            <div style={{ fontSize: 11.5, color: "#8f98aa", marginTop: 2 }}>Staff & admins</div>
          </div>

          {/* Total Interviews */}
          <div
            onClick={() => setActiveTab("interviews")}
            style={{
              background: activeTab === "interviews" ? "#182218" : "#0e121a",
              border: `1px solid ${activeTab === "interviews" ? "#4ade80" : "#1f2638"}`,
              borderRadius: 14,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fbbf24", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>Interviews Created</span>
              <TrendingUp size={16} />
            </div>
            <strong style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{stats.totalInterviews || 0}</strong>
            <div style={{ fontSize: 11.5, color: "#8f98aa", marginTop: 2 }}>Planned / attempted</div>
          </div>

          {/* Completed */}
          <div style={{ background: "#0e121a", border: "1px solid #1f2638", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#4ade80", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>Completed</span>
              <CheckCircle2 size={16} />
            </div>
            <strong style={{ fontSize: 28, fontWeight: 900, color: "#4ade80" }}>{stats.completedInterviews || 0}</strong>
            <div style={{ fontSize: 11.5, color: "#8f98aa", marginTop: 2 }}>Evaluated rounds</div>
          </div>

          {/* Total Time Spent */}
          <div style={{ background: "#0e121a", border: "1px solid #1f2638", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#c084fc", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Time Spent</span>
              <Clock size={16} />
            </div>
            <strong style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
              {formatDuration(stats.totalMinutesSpent)}
            </strong>
            <div style={{ fontSize: 11.5, color: "#8f98aa", marginTop: 2 }}>Candidate practice time</div>
          </div>

          {/* Average Score */}
          <div style={{ background: "#0e121a", border: "1px solid #1f2638", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#f472b6", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>Average Score</span>
              <Award size={16} />
            </div>
            <strong style={{ fontSize: 28, fontWeight: 900, color: (stats.avgScore || 0) >= 6 ? "#4ade80" : "#facc15" }}>
              {stats.avgScore ? `${stats.avgScore}/10` : "—"}
            </strong>
            <div style={{ fontSize: 11.5, color: "#8f98aa", marginTop: 2 }}>Overall platform score</div>
          </div>
        </div>

        {/* =========================================================
            TAB 0: ANALYTICS & VISUALIZATIONS (RADAR, PIE, AREA CHARTS)
        ========================================================= */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* AI Platform Intelligence Summary Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.06))",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: 18,
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#1f274a",
                  color: "#818cf8",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  AI Platform Intelligence & Executive Summary
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: "1.6", color: "#e2e8f0" }}>
                  {analytics.aiIntelligence ||
                    "Platform performance is stable with healthy engagement across frontend and backend domains."}
                </p>
              </div>
            </div>

            {/* Row 1: Score Trend Timeline (Area Chart) + Candidate Readiness Breakdown (Pie Chart) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
              {/* Chart 1: Score Progression Area Chart */}
              <div
                style={{
                  background: "#0c0f16",
                  border: "1px solid #1e2535",
                  borderRadius: 18,
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>
                      📈 Score Trend Timeline
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8f98aa" }}>
                      Chronological progression across evaluated mock sessions
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", background: "#101d2c", padding: "3px 8px", borderRadius: 6 }}>
                    Area Curve
                  </span>
                </div>

                <div style={{ height: 260, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.scoreTrend || []}>
                      <defs>
                        <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f1422",
                          border: "1px solid #283552",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        name="Score (/10)"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreAreaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Candidate Readiness Breakdown (Pie/Donut Chart) */}
              <div
                style={{
                  background: "#0c0f16",
                  border: "1px solid #1e2535",
                  borderRadius: 18,
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>
                      🍩 Candidate Readiness Distribution
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8f98aa" }}>
                      Readiness tiers from evaluated candidate scorecards
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", background: "#10231c", padding: "3px 8px", borderRadius: 6 }}>
                    Donut Pie
                  </span>
                </div>

                <div style={{ height: 260, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.readinessDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {(analytics.readinessDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f1422",
                          border: "1px solid #283552",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Spider / Radar Chart (Multi-dimensional Competencies) + Domain Pie Chart */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
              {/* Chart 3: Spider / Radar Chart */}
              <div
                style={{
                  background: "#0c0f16",
                  border: "1px solid #1e2535",
                  borderRadius: 18,
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>
                      🕸️ Platform Competency Radar
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8f98aa" }}>
                      Multi-dimensional skill matrix vs Industry Target Benchmark
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#c084fc", background: "#20132e", padding: "3px 8px", borderRadius: 6 }}>
                    Spider Radar
                  </span>
                </div>

                <div style={{ height: 280, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analytics.radarSkills || []}>
                      <PolarGrid stroke="#222c42" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" fontSize={10} />
                      <Radar
                        name="Platform Average"
                        dataKey="score"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.4}
                      />
                      <Radar
                        name="Target Benchmark"
                        dataKey="benchmark"
                        stroke="#4ade80"
                        fill="#4ade80"
                        fillOpacity={0.2}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f1422",
                          border: "1px solid #283552",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Domain & Technology Distribution (Pie Chart) */}
              <div
                style={{
                  background: "#0c0f16",
                  border: "1px solid #1e2535",
                  borderRadius: 18,
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>
                      🥧 Domain & Technology Breakdown
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8f98aa" }}>
                      Interview practice volume categorized by engineering domain
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", background: "#261c10", padding: "3px 8px", borderRadius: 6 }}>
                    Domain Pie
                  </span>
                </div>

                <div style={{ height: 280, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.domainDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {(analytics.domainDistribution || []).map((entry, index) => (
                          <Cell key={`cell-dom-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f1422",
                          border: "1px solid #283552",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 1: STUDENTS / CANDIDATES DIRECTORY
        ========================================================= */}
        {activeTab === "students" && (
          <div style={{ background: "#0c0f16", border: "1px solid #1e2535", borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #1a2233", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Student & Candidate Categorization</h3>
                <p style={{ margin: "4px 0 0", color: "#8f98aa", fontSize: 12.5 }}>
                  Detailed breakdown of candidates with emails, total interviews given, time spent, and domain performance.
                </p>
              </div>
              <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 750, background: "#151b2a", padding: "4px 10px", borderRadius: 8, border: "1px solid #252f47" }}>
                {filteredStudents.length} Students Total
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#090c12", borderBottom: "1px solid #1a2233" }}>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Student Name</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Email Address</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Interviews Given</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Completed</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Time Spent</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Avg Score</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Target Domains</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Latest Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #141a27", transition: "background 0.15s ease" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 14,
                              display: "grid",
                              placeItems: "center",
                              textTransform: "uppercase",
                              flexShrink: 0,
                            }}
                          >
                            {st.name ? st.name.charAt(0) : "S"}
                          </div>
                          <div>
                            <strong style={{ fontSize: 14, color: "#fff", display: "block" }}>{st.name}</strong>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px", color: "#93c5fd", fontSize: 13, fontFamily: "monospace" }}>
                        {st.email}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "#141c2c",
                            color: "#93c5fd",
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 800,
                            border: "1px solid #243350",
                          }}
                        >
                          <TrendingUp size={12} />
                          {st.interviewsCount} {st.interviewsCount === 1 ? "interview" : "interviews"}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            color: st.completedCount > 0 ? "#4ade80" : "#94a3b8",
                            fontWeight: 750,
                            fontSize: 13,
                          }}
                        >
                          {st.completedCount} finished
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#c084fc",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          <Clock size={13} />
                          {formatDuration(st.timeSpentMinutes)}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        {st.avgScore !== null ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 800,
                              background:
                                st.avgScore >= 7
                                  ? "rgba(34,197,94,0.15)"
                                  : st.avgScore >= 5
                                  ? "rgba(234,179,8,0.15)"
                                  : "rgba(239,68,68,0.15)",
                              color:
                                st.avgScore >= 7
                                  ? "#4ade80"
                                  : st.avgScore >= 5
                                  ? "#facc15"
                                  : "#f87171",
                              border: `1px solid ${
                                st.avgScore >= 7
                                  ? "rgba(34,197,94,0.35)"
                                  : st.avgScore >= 5
                                  ? "rgba(234,179,8,0.35)"
                                  : "rgba(239,68,68,0.35)"
                              }`,
                            }}
                          >
                            {st.avgScore} / 10
                          </span>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: 13 }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 220 }}>
                          {st.roles.length > 0 ? (
                            st.roles.map((r, ri) => (
                              <span
                                key={ri}
                                style={{
                                  background: "#121824",
                                  border: "1px solid #232d40",
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  color: "#cbd5e1",
                                }}
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: "#64748b", fontSize: 12 }}>General</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px", color: "#8f98aa", fontSize: 12 }}>
                        <div>{formatDate(st.latestInterview)}</div>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                              st.latestStatus === "Done"
                                ? "#4ade80"
                                : st.latestStatus === "Live"
                                ? "#60a5fa"
                                : "#facc15",
                          }}
                        >
                          Status: {st.latestStatus || "Pre"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!filteredStudents.length && (
                    <tr>
                      <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#8f98aa" }}>
                        No students or candidate records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: RECRUITERS & STAFF DIRECTORY
        ========================================================= */}
        {activeTab === "recruiters" && (
          <div style={{ background: "#0c0f16", border: "1px solid #1e2535", borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #1a2233", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Recruiter & Staff Directory</h3>
                <p style={{ margin: "4px 0 0", color: "#8f98aa", fontSize: 12.5 }}>
                  Registered recruiters and administrators who configure, plan, and evaluate interview sessions.
                </p>
              </div>
              <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 750, background: "#101d2c", padding: "4px 10px", borderRadius: 8, border: "1px solid #1e3650" }}>
                {filteredRecruiters.length} Staff members
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#090c12", borderBottom: "1px solid #1a2233" }}>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Staff Name</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Email Address</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>System Role</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Interviews Planned / Managed</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Candidates Evaluated</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Joined Date</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecruiters.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #141a27" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background:
                                r.role === "admin"
                                  ? "linear-gradient(135deg, #ef4444, #f59e0b)"
                                  : "linear-gradient(135deg, #3b82f6, #6366f1)",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 14,
                              display: "grid",
                              placeItems: "center",
                              textTransform: "uppercase",
                            }}
                          >
                            {r.name ? r.name.charAt(0) : "R"}
                          </div>
                          <div>
                            <strong style={{ fontSize: 14, color: "#fff", display: "block" }}>{r.name}</strong>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px", color: "#93c5fd", fontSize: 13, fontFamily: "monospace" }}>
                        {r.email}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background:
                              r.role === "admin"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(59, 130, 246, 0.15)",
                            color: r.role === "admin" ? "#f87171" : "#60a5fa",
                            border: `1px solid ${
                              r.role === "admin"
                                ? "rgba(239, 68, 68, 0.35)"
                                : "rgba(59, 130, 246, 0.35)"
                            }`,
                          }}
                        >
                          {r.role === "admin" ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                          {r.role}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <strong style={{ color: "#f1f5f9", fontSize: 14 }}>{r.interviewsPlanned}</strong>
                        <span style={{ color: "#8f98aa", fontSize: 12 }}> sessions</span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ color: "#4ade80", fontWeight: 800, fontSize: 13 }}>
                          {r.candidatesEvaluated} completed
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px", color: "#8f98aa", fontSize: 12 }}>
                        {formatDate(r.created_at)}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "rgba(34, 197, 94, 0.15)",
                            color: "#4ade80",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!filteredRecruiters.length && (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#8f98aa" }}>
                        No recruiters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: ALL INTERVIEW SESSIONS
        ========================================================= */}
        {activeTab === "interviews" && (
          <div style={{ background: "#0c0f16", border: "1px solid #1e2535", borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #1a2233", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Live & Historical Interview Sessions</h3>
                <p style={{ margin: "4px 0 0", color: "#8f98aa", fontSize: 12.5 }}>
                  All AI-evaluated technical rounds, interview cards, candidate transcripts, and scores.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{
                    background: "#101624",
                    border: "1px solid #243048",
                    color: "#93c5fd",
                    padding: "7px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <option value="all">All Roles & Domains</option>
                  <option value="frontend">Frontend Developer</option>
                  <option value="python">Python Engineer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="java">Java & Spring Boot</option>
                </select>

                <button
                  type="button"
                  onClick={handleClearHistory}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid #572027",
                    background: "#281216",
                    color: "#ff9ca5",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={13} />
                  Clear All History
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#090c12", borderBottom: "1px solid #1a2233" }}>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Candidate</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Email</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Role / Domain</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Difficulty</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Score</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase" }}>Created</th>
                    <th style={{ padding: "14px 20px", color: "#8f98aa", fontSize: 11.5, fontWeight: 750, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #141a27" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <strong style={{ color: "#fff", fontSize: 14 }}>{r.candidate_name || "Candidate"}</strong>
                      </td>

                      <td style={{ padding: "16px 20px", color: "#93c5fd", fontSize: 13, fontFamily: "monospace" }}>
                        {r.candidate_email || "—"}
                      </td>

                      <td style={{ padding: "16px 20px", color: "#cbd5e1", fontSize: 13, fontWeight: 650 }}>
                        {r.role}
                      </td>

                      <td style={{ padding: "16px 20px", color: "#94a3b8", fontSize: 12 }}>
                        <span style={{ background: "#141c2c", padding: "3px 8px", borderRadius: 6, border: "1px solid #23314c" }}>
                          {r.difficulty || "Medium"}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        {r.score !== null && r.score !== undefined ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 800,
                              background:
                                r.score >= 7
                                  ? "rgba(34,197,94,0.15)"
                                  : r.score >= 5
                                  ? "rgba(234,179,8,0.15)"
                                  : "rgba(239,68,68,0.15)",
                              color:
                                r.score >= 7
                                  ? "#4ade80"
                                  : r.score >= 5
                                  ? "#facc15"
                                  : "#f87171",
                            }}
                          >
                            {r.score} / 10
                          </span>
                        ) : (
                          <span style={{ color: "#64748b" }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            background:
                              r.status === "Done"
                                ? "rgba(34,197,94,0.15)"
                                : r.status === "Live"
                                ? "rgba(59,130,246,0.15)"
                                : "rgba(234,179,8,0.15)",
                            color:
                              r.status === "Done"
                                ? "#4ade80"
                                : r.status === "Live"
                                ? "#60a5fa"
                                : "#facc15",
                            border: `1px solid ${
                              r.status === "Done"
                                ? "rgba(34,197,94,0.3)"
                                : r.status === "Live"
                                ? "rgba(59,130,246,0.3)"
                                : "rgba(234,179,8,0.3)"
                            }`,
                          }}
                        >
                          {r.status === "Done" ? "✓ Done" : r.status === "Live" ? "🔴 Live" : "⏳ Pre"}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px", color: "#8f98aa", fontSize: 12 }}>
                        {formatDate(r.created_at)}
                      </td>

                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteInterview(r.id)}
                          title="Delete this interview"
                          style={{
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "#f87171",
                            borderRadius: 8,
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!filteredInterviews.length && (
                    <tr>
                      <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#8f98aa" }}>
                        No interview sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
