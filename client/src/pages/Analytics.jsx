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
  Cell
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://sdeprepai.onrender.com";
const candidateAuth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("candidate_token") || ""}` }
});

export default function Analytics({ onStartPractice }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/v1/analytics`, candidateAuth());
      setData(res.data);
    } catch (err) {
      console.error("Failed to load candidate analytics:", err);
      setError(
        err.response?.data?.error ||
        "Could not load analytics. Please ensure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return "0 min";
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hours === 0) return `${remainder} mins`;
    if (remainder === 0) return `${hours} hrs`;
    return `${hours}h ${remainder}m`;
  };

  const getScoreBadge = (score) => {
    if (score == null) return { label: "N/A", bg: "#1f293d", text: "#94a3b8" };
    if (score >= 85) return { label: "Exceptional", bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
    if (score >= 70) return { label: "Proficient", bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
    if (score >= 50) return { label: "Developing", bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
    return { label: "Needs Prep", bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading-state">
          <div className="loading-spinner"></div>
          <h2>Analysing your interview data...</h2>
          <p className="muted">Aggregating scores, AI evaluation highlights, and skill trends.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error-banner">
          <AlertCircle size={24} />
          <div>
            <h3>Error Loading Analytics</h3>
            <p>{error}</p>
          </div>
          <button className="secondary-btn" onClick={fetchAnalytics}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    summary = {},
    scoreTrend = [],
    scoreDistribution = [],
    readinessDistribution = [],
    domainDistribution = [],
    radarSkills = [],
    rolePerformance = [],
    topStrengths = [],
    repeatedWeaknesses = [],
    recommendations = [],
    recentHistory = []
  } = data || {};

  const hasInterviews = summary.totalInterviews > 0;
  const hasCompleted = summary.completedInterviews > 0;

  // Fallback fallback readiness distribution if not populated
  const readinessPieData = readinessDistribution.length > 0 ? readinessDistribution : [
    { name: "Needs Prep (0-40)", value: summary.completedInterviews || 1, color: "#ef4444" }
  ];

  // Fallback radar skills if not populated
  const candidateRadarData = radarSkills.length > 0 ? radarSkills : [
    { subject: "Coding & Algorithms", score: Math.min(100, Math.max(30, Math.round((summary.averageScore || 50) * 0.95))), benchmark: 80, fullMark: 100 },
    { subject: "System Architecture", score: Math.min(100, Math.max(30, Math.round((summary.averageScore || 50) * 0.90))), benchmark: 75, fullMark: 100 },
    { subject: "Problem Solving", score: Math.min(100, Math.max(35, Math.round((summary.averageScore || 50) * 1.05))), benchmark: 85, fullMark: 100 },
    { subject: "Communication", score: Math.min(100, Math.max(40, Math.round((summary.averageScore || 50) * 1.10))), benchmark: 80, fullMark: 100 },
    { subject: "Domain Knowledge", score: Math.min(100, Math.max(35, Math.round(summary.averageScore || 50))), benchmark: 78, fullMark: 100 },
    { subject: "Edge Cases & Tests", score: Math.min(100, Math.max(30, Math.round((summary.averageScore || 50) * 0.85))), benchmark: 72, fullMark: 100 },
  ];

  return (
    <div className="analytics-page">
      {/* HEADER SECTION */}
      <header className="analytics-header">
        <div>
          <div className="analytics-eyebrow">
            <Sparkles size={13} />
            <span>CANDIDATE INTELLIGENCE & PERFORMANCE ANALYTICS</span>
          </div>
          <h1>Candidate Analytics Dashboard</h1>
          <p className="muted">
            Personalised performance insights, score progression, and AI feedback breakdown from real interviews.
          </p>
        </div>

        <div className="analytics-header-actions">
          <button className="secondary-btn refresh-btn" onClick={fetchAnalytics} title="Refresh data">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          {onStartPractice && (
            <button className="primary-btn" onClick={onStartPractice}>
              <span>Practice New Role</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </header>

      {/* EMPTY STATE */}
      {!hasInterviews ? (
        <div className="analytics-empty-card">
          <div className="empty-icon-wrap">
            <BarChart3 size={48} />
          </div>
          <h2>No Interview Data Yet</h2>
          <p>
            You haven't completed any mock interviews yet. Start your first practice session to generate real-time AI performance metrics, score trends, and skill recommendations.
          </p>
          {onStartPractice && (
            <button className="primary-btn empty-action" onClick={onStartPractice}>
              Start First Practice Interview <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* KEY METRICS KPI GRID */}
          <div className="analytics-kpi-grid">
            {/* KPI 1: Total Attempted */}
            <div className="kpi-card">
              <div className="kpi-icon-row">
                <span className="kpi-label">Total Attempted</span>
                <div className="kpi-icon kpi-blue">
                  <Layers size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <strong className="kpi-number">{summary.totalInterviews}</strong>
                <span className="kpi-subtext">Mock Sessions</span>
              </div>
              <div className="kpi-footer">
                <span className="kpi-hint">
                  {summary.inProgressInterviews > 0
                    ? `${summary.inProgressInterviews} in progress`
                    : "All tracked"}
                </span>
              </div>
            </div>

            {/* KPI 2: Completed Interviews */}
            <div className="kpi-card">
              <div className="kpi-icon-row">
                <span className="kpi-label">Completed</span>
                <div className="kpi-icon kpi-green">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <strong className="kpi-number">{summary.completedInterviews}</strong>
                <span className="kpi-subtext">Evaluated</span>
              </div>
              <div className="kpi-footer">
                <div className="kpi-progress-bar">
                  <div
                    className="kpi-progress-fill"
                    style={{
                      width: `${summary.totalInterviews ? Math.round((summary.completedInterviews / summary.totalInterviews) * 100) : 0}%`
                    }}
                  />
                </div>
                <span className="kpi-hint">
                  {summary.totalInterviews
                    ? `${Math.round((summary.completedInterviews / summary.totalInterviews) * 100)}% completion rate`
                    : "0%"}
                </span>
              </div>
            </div>

            {/* KPI 3: Total Minutes Spent */}
            <div className="kpi-card">
              <div className="kpi-icon-row">
                <span className="kpi-label">Time Invested</span>
                <div className="kpi-icon kpi-purple">
                  <Clock size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <strong className="kpi-number">{formatMinutes(summary.totalMinutes)}</strong>
              </div>
              <div className="kpi-footer">
                <span className="kpi-hint">Practice duration</span>
              </div>
            </div>

            {/* KPI 4: Average Score */}
            <div className="kpi-card">
              <div className="kpi-icon-row">
                <span className="kpi-label">Average Score</span>
                <div className="kpi-icon kpi-indigo">
                  <Target size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <strong className="kpi-number">{summary.averageScore}</strong>
                <span className="kpi-max">/100</span>
              </div>
              <div className="kpi-footer">
                <span
                  className="kpi-level-pill"
                  style={{
                    backgroundColor: getScoreBadge(summary.averageScore).bg,
                    color: getScoreBadge(summary.averageScore).text,
                    borderColor: getScoreBadge(summary.averageScore).border
                  }}
                >
                  {summary.performanceLevel || "Getting Started"}
                </span>
              </div>
            </div>

            {/* KPI 5: Highest & Latest Score */}
            <div className="kpi-card">
              <div className="kpi-icon-row">
                <span className="kpi-label">Peak & Latest</span>
                <div className="kpi-icon kpi-amber">
                  <Award size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <strong className="kpi-number">{summary.highestScore}</strong>
                <span className="kpi-max">/100 best</span>
              </div>
              <div className="kpi-footer">
                <span className="kpi-hint">
                  Latest: {summary.latestScore != null ? `${summary.latestScore}/100` : "—"}
                </span>
              </div>
            </div>

            {/* KPI 6: Improvement Trend */}
            <div className="kpi-card">
              <div className="kpi-icon-row">
                <span className="kpi-label">Score Progression</span>
                <div className="kpi-icon kpi-emerald">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <strong
                  className="kpi-number"
                  style={{
                    color:
                      summary.improvementRate > 0
                        ? "#34d399"
                        : summary.improvementRate < 0
                        ? "#f87171"
                        : "#f4f5f7"
                  }}
                >
                  {summary.improvementTrend || "0 pts"}
                </strong>
              </div>
              <div className="kpi-footer">
                <span className="kpi-hint">From first interview</span>
              </div>
            </div>
          </div>

          {/* SMART AI PERFORMANCE SUMMARY BANNER */}
          <div className="smart-summary-card">
            <div className="smart-summary-badge">
              <Zap size={15} />
              <span>AI Performance Intelligence</span>
            </div>
            <p className="smart-summary-text">{summary.smartSummary}</p>
          </div>

          {/* CHARTS ROW 1: Score Trend Timeline (Area) + Readiness Breakdown (Pie/Donut) */}
          <div className="analytics-charts-grid">
            {/* Chart 1: Score Trend Timeline */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>📈 Score Trend Timeline</h3>
                  <p className="muted">Progression across completed interview rounds</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#818cf8", background: "#171d2b", padding: "3px 8px", borderRadius: 6 }}>
                  Area Curve
                </span>
              </div>

              {!hasCompleted || scoreTrend.length === 0 ? (
                <div className="chart-empty-state">
                  <p className="muted">Complete at least one interview to view your score trend graph.</p>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
                      <XAxis
                        dataKey="displayDate"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "#242c3d" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "#242c3d" }}
                        ticks={[0, 25, 50, 75, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            return (
                              <div className="chart-custom-tooltip">
                                <div className="tooltip-title">{p.role}</div>
                                <div className="tooltip-meta">
                                  <span>{p.difficulty}</span> • <span>{p.displayDate}</span>
                                </div>
                                <div className="tooltip-score">
                                  Score: <strong>{p.score}/100</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                        dot={{ r: 4, fill: "#818cf8", stroke: "#0f172a", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#fff", stroke: "#818cf8", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Candidate Readiness Breakdown (Donut/Pie Chart - replacing BarChart) */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>🍩 Performance Tier Breakdown</h3>
                  <p className="muted">Distribution across score readiness brackets</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", background: "#10231c", padding: "3px 8px", borderRadius: 6 }}>
                  Donut Pie
                </span>
              </div>

              {!hasCompleted ? (
                <div className="chart-empty-state">
                  <p className="muted">No completed interviews to display score brackets.</p>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={readinessPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {readinessPieData.map((entry, index) => (
                          <Cell key={`cell-cand-pie-${index}`} fill={entry.color} />
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
              )}
            </div>
          </div>

          {/* ROLE-WISE PERFORMANCE */}
          {rolePerformance.length > 0 && (
            <div className="analytics-section-card" style={{ marginTop: 24 }}>
              <div className="section-card-header">
                <Target size={20} className="header-icon-indigo" />
                <div>
                  <h3>Role-Wise Performance Breakdown</h3>
                  <p className="muted">Evaluation metrics grouped by technical domain</p>
                </div>
              </div>

              <div className="role-performance-grid">
                {rolePerformance.map((roleItem) => {
                  const badge = getScoreBadge(roleItem.avgScore);
                  return (
                    <div className="role-perf-card" key={roleItem.role}>
                      <div className="role-perf-top">
                        <div>
                          <h4>{roleItem.role}</h4>
                          <span className="role-perf-count">
                            {roleItem.completed} completed / {roleItem.total} attempted
                          </span>
                        </div>
                        <span
                          className="role-badge"
                          style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="role-perf-scores">
                        <div className="role-score-item">
                          <small>Avg Score</small>
                          <strong>{roleItem.avgScore}/100</strong>
                        </div>
                        <div className="role-score-item">
                          <small>Best Score</small>
                          <strong>{roleItem.bestScore}/100</strong>
                        </div>
                        <div className="role-score-item">
                          <small>Latest Score</small>
                          <strong>{roleItem.latestScore ? `${roleItem.latestScore}/100` : "—"}</strong>
                        </div>
                      </div>

                      <div className="role-progress-wrap">
                        <div className="role-progress-track">
                          <div
                            className="role-progress-bar"
                            style={{
                              width: `${Math.max(roleItem.avgScore, 4)}%`,
                              backgroundColor: badge.text
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHARTS ROW 2: Spider / Radar Chart (Multi-dimensional Competencies) + Domain Pie Chart */}
          <div className="analytics-charts-grid" style={{ marginTop: 24 }}>
            {/* Chart 3: Spider / Radar Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>🕸️ Multi-Dimensional Competency Matrix</h3>
                  <p className="muted">Your evaluated skill levels vs Target Benchmark (out of 100)</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", background: "#101d2c", padding: "3px 8px", borderRadius: 6 }}>
                  Spider Radar
                </span>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={candidateRadarData}>
                    <PolarGrid stroke="#222c42" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                    <Radar
                      name="Your Score"
                      dataKey="score"
                      stroke="#818cf8"
                      fill="#818cf8"
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

            {/* Chart 4: Domain & Technology Practice Breakdown (Pie Chart) */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>🥧 Domain Practice Volume</h3>
                  <p className="muted">Interview practice allocation across engineering roles</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", background: "#261c10", padding: "3px 8px", borderRadius: 6 }}>
                  Domain Pie
                </span>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={domainDistribution.length > 0 ? domainDistribution : [{ name: "General SDE", value: 1, color: "#818cf8" }]}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {(domainDistribution.length > 0 ? domainDistribution : [{ name: "General SDE", value: 1, color: "#818cf8" }]).map((entry, index) => (
                        <Cell key={`cell-cand-dom-${index}`} fill={entry.color} />
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

          {/* AI FEEDBACK INTELLIGENCE (STRENGTHS & WEAKNESSES) */}
          <div className="feedback-intelligence-grid">
            {/* Top Strengths */}
            <div className="feedback-card strengths-card">
              <div className="feedback-card-header">
                <div className="feedback-icon-wrap strength-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3>Top Strengths from AI Feedback</h3>
                  <p className="muted">Key technical competencies validated in evaluations</p>
                </div>
              </div>

              {topStrengths.length === 0 ? (
                <p className="muted empty-feedback-text">
                  Complete interview evaluations to identify your recurring strengths.
                </p>
              ) : (
                <div className="feedback-item-list">
                  {topStrengths.map((item, index) => (
                    <div className="feedback-item strength-row" key={index}>
                      <span className="feedback-bullet-check">✓</span>
                      <div className="feedback-item-content">
                        <p>{item.text}</p>
                        {item.count > 1 && (
                          <span className="occurrence-badge">Observed in {item.count} interviews</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repeated Weaknesses */}
            <div className="feedback-card weaknesses-card">
              <div className="feedback-card-header">
                <div className="feedback-icon-wrap weakness-icon">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3>Repeated Focus Areas & Gaps</h3>
                  <p className="muted">Areas where AI evaluations flagged recurring gaps</p>
                </div>
              </div>

              {repeatedWeaknesses.length === 0 ? (
                <p className="muted empty-feedback-text">
                  No recurring weaknesses identified yet. Keep practicing to discover growth points.
                </p>
              ) : (
                <div className="feedback-item-list">
                  {repeatedWeaknesses.map((item, index) => (
                    <div className="feedback-item weakness-row" key={index}>
                      <span className="feedback-bullet-alert">!</span>
                      <div className="feedback-item-content">
                        <p>{item.text}</p>
                        {item.count > 1 && (
                          <span className="occurrence-badge alert">Flagged in {item.count} sessions</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTIONABLE RECOMMENDATIONS */}
          {recommendations.length > 0 && (
            <div className="analytics-section-card recommendations-card">
              <div className="section-card-header">
                <BookOpen size={20} className="header-icon-emerald" />
                <div>
                  <h3>Actionable Recommendations & Study Plan</h3>
                  <p className="muted">Targeted next steps compiled from real interview evaluations</p>
                </div>
              </div>

              <div className="recommendations-grid">
                {recommendations.map((rec, index) => (
                  <div className="recommendation-item" key={index}>
                    <div className="rec-number">{index + 1}</div>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT INTERVIEW HISTORY TABLE */}
          <div className="analytics-section-card">
            <div className="section-card-header">
              <Calendar size={20} className="header-icon-blue" />
              <div>
                <h3>Recent Interview History</h3>
                <p className="muted">Recent session scorecard details and summaries</p>
              </div>
            </div>

            {recentHistory.length === 0 ? (
              <p className="muted empty-table-text">No completed interview records available.</p>
            ) : (
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Role</th>
                      <th>Level</th>
                      <th>Duration</th>
                      <th>Score</th>
                      <th>AI Feedback Summary</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentHistory.map((item) => {
                      const badge = getScoreBadge(item.score);
                      return (
                        <tr key={item.id}>
                          <td className="table-date">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="table-role">
                            <strong>{item.role}</strong>
                          </td>
                          <td>
                            <span className="difficulty-pill">{item.difficulty}</span>
                          </td>
                          <td className="table-duration">{item.duration}m</td>
                          <td>
                            <span
                              className="score-badge-table"
                              style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
                            >
                              {item.score != null ? `${item.score}/100` : item.status}
                            </span>
                          </td>
                          <td className="table-summary">
                            <span className="summary-truncate" title={item.feedbackSummary}>
                              {item.feedbackSummary || "Evaluation completed."}
                            </span>
                          </td>
                          <td>
                            <button
                              className="table-detail-btn"
                              onClick={() => setSelectedHistoryItem(item)}
                              title="View details"
                            >
                              Details <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* FEEDBACK MODAL */}
      {selectedHistoryItem && (
        <div className="modal-backdrop" onClick={() => setSelectedHistoryItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="analytics-eyebrow">INTERVIEW SCORECARD</span>
                <h2>{selectedHistoryItem.role}</h2>
                <p className="muted">
                  {selectedHistoryItem.difficulty} Difficulty • {selectedHistoryItem.duration} Minutes
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedHistoryItem(null)}>
                ✕
              </button>
            </div>

            <div className="modal-score-banner">
              <div>
                <span className="modal-score-label">Final Evaluation Score</span>
                <strong className="modal-score-val">{selectedHistoryItem.score}/100</strong>
              </div>
              <span
                className="kpi-level-pill"
                style={{
                  backgroundColor: getScoreBadge(selectedHistoryItem.score).bg,
                  color: getScoreBadge(selectedHistoryItem.score).text,
                  borderColor: getScoreBadge(selectedHistoryItem.score).border
                }}
              >
                {getScoreBadge(selectedHistoryItem.score).label}
              </span>
            </div>

            <div className="modal-body">
              <h3>AI Summary</h3>
              <p className="modal-summary-text">
                {selectedHistoryItem.feedbackSummary || "Detailed evaluation recorded for this session."}
              </p>
            </div>

            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setSelectedHistoryItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
