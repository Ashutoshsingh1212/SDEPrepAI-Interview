import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain,
  Sparkles,
  BarChart3,
  Target,
  Flame,
  ArrowUpRight,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { API_BASE_URL } from "../config";

const API = import.meta.env.VITE_API_URL || API_BASE_URL || "http://localhost:3001";

function CustomTrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="analytics-tooltip">
        <div className="tooltip-header">
          <strong>{data.role || "Interview"}</strong>
          <span className="tooltip-tag">{data.difficulty || "Medium"}</span>
        </div>
        <div className="tooltip-score">
          Score: <span>{data.score}/100</span>
        </div>
        <div className="tooltip-date">{data.date}</div>
      </div>
    );
  }
  return null;
}

function CustomDistTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="analytics-tooltip">
        <div className="tooltip-header">
          <strong>{data.range}</strong>
        </div>
        <div className="tooltip-count">
          Interviews: <span>{data.count}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function Analytics({ candidateEmail, onStartPractice, onExplore }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("candidate_token");
      const res = await axios.get(`${API}/api/v1/analytics`, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.error || "Failed to load analytics data");
      }
    } catch (err) {
      console.error("Fetch analytics error:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Could not load analytics. Please ensure you are logged in.";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const metrics = data?.metrics || {
    totalAttempted: 0,
    completedCount: 0,
    totalMinutesSpent: 0,
    averageScore: 0,
    highestScore: 0,
    latestScore: null,
    scoreImprovement: 0,
  };

  const scoreTrend = data?.scoreTrend || [];
  const scoreDistribution = data?.scoreDistribution || [];
  const rolePerformance = data?.rolePerformance || [];
  const topStrengths = data?.topStrengths || [];
  const repeatedWeaknesses = data?.repeatedWeaknesses || [];
  const improvementRecommendations = data?.improvementRecommendations || [];
  const recentHistory = data?.recentHistory || [];
  const smartSummary = data?.smartSummary || "";

  // Readiness Tier
  const readinessTier = useMemo(() => {
    if (metrics.completedCount === 0) return { label: "New Candidate", color: "#8d96a8", bg: "#171b24" };
    if (metrics.averageScore >= 85) return { label: "Senior SDE Ready", color: "#4ade80", bg: "#062e1c" };
    if (metrics.averageScore >= 70) return { label: "Interview Proficient", color: "#60a5fa", bg: "#0e2a47" };
    if (metrics.averageScore >= 50) return { label: "Intermediate Growth", color: "#facc15", bg: "#382d06" };
    return { label: "Foundations Focus", color: "#f87171", bg: "#3c1115" };
  }, [metrics]);

  const distColors = ["#4ade80", "#60a5fa", "#facc15", "#f87171"];

  if (loading) {
    return (
      <div className="analytics-loading-container">
        <div className="analytics-spinner" />
        <h3>Loading Candidate Intelligence...</h3>
        <p className="muted">Aggregating interview logs, scores, and AI evaluations</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error-container">
        <AlertCircle size={42} className="analytics-error-icon" />
        <h2>Unable to Load Analytics</h2>
        <p className="muted">{error}</p>
        <button className="primary-btn" onClick={fetchAnalytics}>
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <div className="analytics-tag">
            <Activity size={14} /> CANDIDATE PERFORMANCE ENGINE
          </div>
          <h1>Candidate Analytics Dashboard</h1>
          <p className="muted">
            Real-time intelligence based on your verified mock interviews and AI evaluator feedback.
          </p>
        </div>

        <div className="analytics-header-actions">
          <div
            className="readiness-pill"
            style={{ color: readinessTier.color, backgroundColor: readinessTier.bg }}
          >
            <ShieldCheck size={16} />
            <span>{readinessTier.label}</span>
          </div>

          <button
            className="secondary-btn icon-btn-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh Analytics"
          >
            <RotateCcw size={16} className={refreshing ? "spin-icon" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* SMART PERFORMANCE SUMMARY BANNER */}
      <section className="analytics-smart-summary-card">
        <div className="smart-summary-icon-wrap">
          <Sparkles size={26} />
        </div>
        <div className="smart-summary-content">
          <div className="smart-summary-title-row">
            <span className="eyebrow">AI PERFORMANCE SUMMARY</span>
            <span className="smart-summary-timestamp">
              Live database sync • {metrics.completedCount} completed sessions
            </span>
          </div>
          <h3>{smartSummary}</h3>
        </div>
      </section>

      {/* 6 TOP KPI STAT CARDS */}
      <div className="analytics-stats-grid">
        {/* Card 1: Total Attempted */}
        <div className="analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Attempted</span>
            <div className="stat-card-icon" style={{ background: "#202849", color: "#8d9cff" }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-card-value">{metrics.totalAttempted}</div>
          <div className="stat-card-subtext">
            <span>{metrics.completedCount} finished</span>
            <span className="bullet-sep">•</span>
            <span>{metrics.totalAttempted - metrics.completedCount} in progress</span>
          </div>
        </div>

        {/* Card 2: Completed Interviews */}
        <div className="analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed Sessions</span>
            <div className="stat-card-icon" style={{ background: "#062e1c", color: "#4ade80" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-card-value">{metrics.completedCount}</div>
          <div className="stat-card-subtext">
            <span>
              {metrics.totalAttempted > 0
                ? `${Math.round((metrics.completedCount / metrics.totalAttempted) * 100)}% completion rate`
                : "No attempts yet"}
            </span>
          </div>
        </div>

        {/* Card 3: Total Minutes Spent */}
        <div className="analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Time in Interviews</span>
            <div className="stat-card-icon" style={{ background: "#2d1f45", color: "#c084fc" }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-card-value">
            {metrics.totalMinutesSpent} <span className="stat-card-unit">mins</span>
          </div>
          <div className="stat-card-subtext">
            <span>
              {metrics.totalMinutesSpent >= 60
                ? `${(metrics.totalMinutesSpent / 60).toFixed(1)} hours of live practice`
                : "Live technical speaking time"}
            </span>
          </div>
        </div>

        {/* Card 4: Average Score */}
        <div className="analytics-stat-card highlight-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Average Score</span>
            <div className="stat-card-icon" style={{ background: "#1e3a8a", color: "#60a5fa" }}>
              <Target size={18} />
            </div>
          </div>
          <div className="stat-card-value">
            {metrics.averageScore}
            <span className="stat-card-max">/100</span>
          </div>
          <div className="stat-card-subtext">
            <span>Across all completed tracks</span>
          </div>
        </div>

        {/* Card 5: Highest & Latest Score */}
        <div className="analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Best & Latest</span>
            <div className="stat-card-icon" style={{ background: "#382d06", color: "#facc15" }}>
              <Award size={18} />
            </div>
          </div>
          <div className="stat-card-value">
            {metrics.highestScore}
            <span className="stat-card-max">/100</span>
          </div>
          <div className="stat-card-subtext">
            <span>Latest session: {metrics.latestScore != null ? `${metrics.latestScore}/100` : "N/A"}</span>
          </div>
        </div>

        {/* Card 6: Score Improvement Trend */}
        <div className="analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Score Improvement</span>
            <div
              className="stat-card-icon"
              style={{
                background: metrics.scoreImprovement >= 0 ? "#062e1c" : "#3c1115",
                color: metrics.scoreImprovement >= 0 ? "#4ade80" : "#f87171",
              }}
            >
              {metrics.scoreImprovement >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>
          <div
            className="stat-card-value"
            style={{
              color: metrics.scoreImprovement > 0 ? "#4ade80" : metrics.scoreImprovement < 0 ? "#f87171" : "#f4f5f7",
            }}
          >
            {metrics.scoreImprovement > 0
              ? `+${metrics.scoreImprovement}`
              : metrics.scoreImprovement}
            <span className="stat-card-unit"> pts</span>
          </div>
          <div className="stat-card-subtext">
            <span>
              {metrics.completedCount >= 2
                ? "First vs latest completed interview"
                : "Complete ≥2 sessions for trend"}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="analytics-charts-grid">
        {/* Score Progression Trend Chart */}
        <div className="analytics-card chart-card">
          <div className="card-header">
            <div>
              <h2>Score Trend Graph</h2>
              <p className="muted">Chronological progression across your practice sessions</p>
            </div>
            <span className="chart-badge">
              <Activity size={14} /> Chronological Timeline
            </span>
          </div>

          {scoreTrend.length === 0 ? (
            <div className="analytics-empty-chart">
              <BarChart3 size={36} className="empty-icon" />
              <h4>No score progression yet</h4>
              <p className="muted">Complete an interview session to generate your score curve.</p>
              {onStartPractice && (
                <button className="secondary-btn" onClick={onStartPractice} style={{ marginTop: 12 }}>
                  Start Practice Interview
                </button>
              )}
            </div>
          ) : (
            <div className="chart-container" style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7788ff" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#7788ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242936" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#66708a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#242936" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#66708a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#242936" }}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8d9cff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    activeDot={{ r: 6, fill: "#fff", stroke: "#7788ff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Score Distribution Chart */}
        <div className="analytics-card chart-card">
          <div className="card-header">
            <div>
              <h2>Score Distribution</h2>
              <p className="muted">Performance frequency across standard skill tiers</p>
            </div>
            <span className="chart-badge">
              <Zap size={14} /> Proficiency Bands
            </span>
          </div>

          {metrics.completedCount === 0 ? (
            <div className="analytics-empty-chart">
              <BarChart3 size={36} className="empty-icon" />
              <h4>No distribution data</h4>
              <p className="muted">Complete interviews to see how your scores cluster across performance tiers.</p>
            </div>
          ) : (
            <div className="chart-container" style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242936" vertical={false} />
                  <XAxis
                    dataKey="range"
                    stroke="#66708a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#242936" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#66708a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#242936" }}
                  />
                  <Tooltip content={<CustomDistTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={distColors[index % distColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ROLE-WISE PERFORMANCE & RECENT INTELLIGENCE */}
      <div className="analytics-dual-grid">
        {/* Role-Wise Breakdown */}
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <h2>Role-Wise Performance</h2>
              <p className="muted">Your competency scores categorized by target job role</p>
            </div>
          </div>

          {rolePerformance.length === 0 ? (
            <div className="analytics-empty-state-inner">
              <BookOpen size={30} className="muted" />
              <p className="muted">No role performance logged yet.</p>
            </div>
          ) : (
            <div className="role-performance-list">
              {rolePerformance.map((item) => (
                <div className="role-performance-item" key={item.role}>
                  <div className="role-item-header">
                    <div>
                      <strong className="role-item-title">{item.role}</strong>
                      <span className="role-item-meta">
                        {item.completed} of {item.total} completed
                      </span>
                    </div>
                    <div className="role-item-scores">
                      <div className="role-score-badge">
                        <span className="role-score-label">Avg</span>
                        <strong className="role-score-val">{item.avgScore}/100</strong>
                      </div>
                      <div className="role-score-badge best">
                        <span className="role-score-label">Best</span>
                        <strong className="role-score-val">{item.bestScore}/100</strong>
                      </div>
                    </div>
                  </div>

                  <div className="role-progress-bar-bg">
                    <div
                      className="role-progress-bar-fill"
                      style={{
                        width: `${Math.min(100, item.avgScore)}%`,
                        backgroundColor:
                          item.avgScore >= 80 ? "#4ade80" : item.avgScore >= 60 ? "#60a5fa" : "#facc15",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Action Plan Recommendations */}
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <h2>AI Recommendations</h2>
              <p className="muted">Actionable suggestions generated by the evaluator</p>
            </div>
            <span className="chart-badge" style={{ background: "#252d50", color: "#aeb8ff" }}>
              <Brain size={14} /> Action Plan
            </span>
          </div>

          {improvementRecommendations.length === 0 ? (
            <div className="analytics-empty-state-inner">
              <Sparkles size={30} className="muted" />
              <p className="muted">
                Complete a practice interview to generate personalized AI improvement recommendations.
              </p>
            </div>
          ) : (
            <div className="recommendations-list">
              {improvementRecommendations.map((rec, idx) => (
                <div className="recommendation-item" key={idx}>
                  <div className="recommendation-num">{idx + 1}</div>
                  <div className="recommendation-text">
                    <p>{rec.text}</p>
                    {rec.count > 1 && (
                      <span className="occurrence-badge">
                        Noted in {rec.count} sessions
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI STRENGTHS & WEAKNESSES MATRIX */}
      <div className="analytics-dual-grid">
        {/* Top Strengths */}
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <h2 className="text-success-header">
                <CheckCircle2 size={20} className="text-success" /> Top Strengths
              </h2>
              <p className="muted">Key positive traits highlighted by the AI evaluation system</p>
            </div>
          </div>

          {topStrengths.length === 0 ? (
            <div className="analytics-empty-state-inner">
              <p className="muted">No evaluated strengths recorded yet. Complete an interview to analyze.</p>
            </div>
          ) : (
            <div className="feedback-chip-group">
              {topStrengths.map((item, idx) => (
                <div className="feedback-chip strength-chip" key={idx}>
                  <div className="chip-content">
                    <span className="chip-dot strength-dot" />
                    <span className="chip-text">{item.text}</span>
                  </div>
                  {item.count > 1 && <span className="chip-count">×{item.count}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repeated Weaknesses */}
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <h2 className="text-warning-header">
                <AlertCircle size={20} className="text-warning" /> Repeated Weaknesses & Gaps
              </h2>
              <p className="muted">Recurring friction points identified across your transcripts</p>
            </div>
          </div>

          {repeatedWeaknesses.length === 0 ? (
            <div className="analytics-empty-state-inner">
              <p className="muted">No recurring weaknesses found. Keep up the high standard!</p>
            </div>
          ) : (
            <div className="feedback-chip-group">
              {repeatedWeaknesses.map((item, idx) => (
                <div className="feedback-chip weakness-chip" key={idx}>
                  <div className="chip-content">
                    <span className="chip-dot weakness-dot" />
                    <span className="chip-text">{item.text}</span>
                  </div>
                  {item.count > 1 && <span className="chip-count weakness-count">×{item.count}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT INTERVIEW HISTORY TABLE */}
      <div className="analytics-card">
        <div className="card-header">
          <div>
            <h2>Recent Interview History</h2>
            <p className="muted">Detailed log of your latest practice sessions and AI scorecards</p>
          </div>
          {onStartPractice && (
            <button className="primary-btn" onClick={onStartPractice}>
              <Flame size={16} /> New Interview
            </button>
          )}
        </div>

        {recentHistory.length === 0 ? (
          <div className="analytics-empty-state-inner">
            <BookOpen size={32} className="muted" />
            <p className="muted">No interview history recorded for {candidateEmail || "your account"}.</p>
            {onExplore && (
              <button className="secondary-btn" onClick={onExplore} style={{ marginTop: 12 }}>
                Explore Interview Tracks
              </button>
            )}
          </div>
        ) : (
          <div className="analytics-table-wrapper">
            <table className="analytics-history-table">
              <thead>
                <tr>
                  <th>Target Role</th>
                  <th>Difficulty</th>
                  <th>Date Attempted</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>AI Score</th>
                  <th>Evaluator Summary</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((item) => {
                  const hasScore = item.score !== null && item.score !== undefined;
                  const scoreVal = Number(item.score) || 0;
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.role}</strong>
                      </td>
                      <td>
                        <span className="table-difficulty-badge">{item.difficulty}</span>
                      </td>
                      <td className="muted">{dateStr}</td>
                      <td className="muted">{item.duration} mins</td>
                      <td>
                        <span
                          className={`table-status-pill ${
                            item.status === "Done"
                              ? "status-done"
                              : item.status === "Live"
                              ? "status-live"
                              : "status-pre"
                          }`}
                        >
                          {item.status === "Done" ? "Completed" : item.status || "Pre"}
                        </span>
                      </td>
                      <td>
                        {hasScore ? (
                          <div
                            className={`table-score-badge ${
                              scoreVal >= 80
                                ? "score-high"
                                : scoreVal >= 60
                                ? "score-mid"
                                : "score-low"
                            }`}
                          >
                            <strong>{scoreVal}</strong>/100
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="table-summary-cell">
                        {item.summary ? (
                          <span title={item.summary}>
                            {item.summary.length > 80
                              ? item.summary.slice(0, 80) + "..."
                              : item.summary}
                          </span>
                        ) : (
                          <span className="muted">Evaluation pending or in-progress</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
