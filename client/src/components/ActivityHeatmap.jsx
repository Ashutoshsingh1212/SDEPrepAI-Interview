import React, { useState, useEffect, useMemo, useRef } from "react";
import { Flame, Trophy, Calendar, Clock, ChevronDown, Sparkles } from "lucide-react";
import { API } from "../config";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEVEL_COLORS = [
  { level: 0, bg: "#141a29", border: "#1f273b", label: "No activity" },
  { level: 1, bg: "#312e81", border: "#4338ca", label: "Light activity (1 action)" },
  { level: 2, bg: "#4f46e5", border: "#6366f1", label: "Medium activity (2-3 actions)" },
  { level: 3, bg: "#818cf8", border: "#a5b4fc", label: "High activity (4-5 actions)" },
  { level: 4, bg: "#22c55e", border: "#4ade80", label: "Peak activity (6+ actions)" },
];

export default function ActivityHeatmap({ candidateEmail, onStartPractice }) {
  const currentSystemYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentSystemYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    dayData: null,
    dateStr: "",
  });

  const heatmapRef = useRef(null);

  // Fetch activity stats whenever candidateEmail or selectedYear changes
  useEffect(() => {
    let isMounted = true;
    async function fetchActivity() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("candidate_token") || localStorage.getItem("staff_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `${API}/api/v1/user/activity?year=${selectedYear}${candidateEmail ? `&email=${encodeURIComponent(candidateEmail)}` : ""}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error("Failed to load activity statistics");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Activity load error:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchActivity();
    return () => {
      isMounted = false;
    };
  }, [candidateEmail, selectedYear]);

  // Build the Map for fast date lookup: 'YYYY-MM-DD' -> Day Activity Object
  const activityMap = useMemo(() => {
    const map = new Map();
    if (data?.activity) {
      for (const item of data.activity) {
        map.set(item.date, item);
      }
    }
    return map;
  }, [data]);

  // Generate 52 or 53 weeks grid for selectedYear
  const { weeks, monthLabels } = useMemo(() => {
    const year = Number(selectedYear);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Find the first Sunday on or before Jan 1
    const startDate = new Date(startOfYear);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Find the last Saturday on or after Dec 31
    const endDate = new Date(endOfYear);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const calculatedWeeks = [];
    let currentWeek = [];
    const labels = [];
    let currentMonth = -1;

    const pointer = new Date(startDate);
    let weekIndex = 0;

    while (pointer <= endDate) {
      const yearStr = pointer.getFullYear();
      const monthStr = String(pointer.getMonth() + 1).padStart(2, "0");
      const dateNumStr = String(pointer.getDate()).padStart(2, "0");
      const dateKey = `${yearStr}-${monthStr}-${dateNumStr}`;

      const isCurrentYear = pointer.getFullYear() === year;
      const dayData = isCurrentYear ? activityMap.get(dateKey) || null : null;

      // Track month labels at the start of a month in a week
      if (pointer.getDay() === 0) {
        const firstDayOfMonth = pointer.getMonth();
        if (firstDayOfMonth !== currentMonth && pointer.getFullYear() === year) {
          labels.push({ weekIndex, month: MONTH_NAMES[firstDayOfMonth] });
          currentMonth = firstDayOfMonth;
        }
      }

      currentWeek.push({
        date: dateKey,
        dateObj: new Date(pointer),
        dayOfWeek: pointer.getDay(),
        isCurrentYear,
        dayData,
        level: dayData ? dayData.level : 0,
      });

      if (currentWeek.length === 7) {
        calculatedWeeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      pointer.setDate(pointer.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      calculatedWeeks.push(currentWeek);
    }

    return { weeks: calculatedWeeks, monthLabels: labels };
  }, [selectedYear, activityMap]);

  // Format practice time into "Xh Ym"
  const formattedPracticeTime = useMemo(() => {
    const totalMinutes = data?.totalPracticeMinutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0 && mins === 0) return "0m";
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  }, [data]);

  // Motivational message
  const motivationalMessage = useMemo(() => {
    const activeDays = data?.activeDays || 0;
    const streak = data?.currentStreak || 0;
    if (activeDays === 0) {
      return "No activity recorded yet for this year. Start practicing today to begin your streak! 🔥";
    }
    if (streak >= 7) {
      return "🔥 Exceptional dedication! You are building top-tier consistency for technical interviews.";
    }
    if (streak >= 3) {
      return "⚡ Great consistency! Keep practicing daily to maintain your momentum.";
    }
    if (activeDays >= 10) {
      return "💪 Solid preparation track! Complete an interview session today to extend your streak.";
    }
    return "Consistency is key to mastering technical interviews. Keep pushing every day!";
  }, [data]);

  // Format Date for Tooltip: "September 1, 2026"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const handleMouseEnterCell = (e, cell) => {
    if (!cell.isCurrentYear) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = heatmapRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setTooltip({
      visible: true,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 10,
      dayData: cell.dayData,
      dateStr: cell.date,
    });
  };

  const handleMouseLeaveCell = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const availableYears = data?.availableYears || [currentSystemYear];

  return (
    <div
      ref={heatmapRef}
      style={{
        position: "relative",
        background: "#11141b",
        border: "1px solid #232a3b",
        borderRadius: "18px",
        padding: "24px",
        marginTop: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        color: "#fff",
      }}
    >
      {/* CARD HEADER & STATS BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#f8fafc" }}>
              <span style={{ color: "#f59e0b" }}>🔥</span> {data?.activeDays || 0} Active Days in {selectedYear}
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#818cf8",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                padding: "3px 10px",
                borderRadius: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Activity Streak
            </span>
          </div>

          <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={15} style={{ color: "#fbbf24" }} />
            {motivationalMessage}
          </p>
        </div>

        {/* YEAR SELECTOR */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#181e2b",
              border: "1px solid #334155",
              borderRadius: "10px",
              padding: "6px 14px",
              color: "#e2e8f0",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <Calendar size={14} style={{ color: "#818cf8" }} />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                outline: "none",
                cursor: "pointer",
                paddingRight: "4px"
              }}
            >
              {availableYears.map(y => (
                <option key={y} value={y} style={{ background: "#11141b", color: "#fff" }}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ color: "#94a3b8" }} />
          </div>
        </div>
      </div>

      {/* KPI PILLS ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {/* Current Streak */}
        <div
          style={{
            background: "linear-gradient(135deg, #181d2a 0%, #131722 100%)",
            border: "1px solid #28334a",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.15)",
              display: "grid",
              placeItems: "center",
              color: "#f59e0b",
            }}
          >
            <Flame size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
              Current Streak
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>
              {data?.currentStreak || 0} <span style={{ fontSize: "13px", fontWeight: "500", color: "#cbd5e1" }}>Days</span>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div
          style={{
            background: "linear-gradient(135deg, #181d2a 0%, #131722 100%)",
            border: "1px solid #28334a",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              display: "grid",
              placeItems: "center",
              color: "#10b981",
            }}
          >
            <Trophy size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
              Longest Streak
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>
              {data?.longestStreak || 0} <span style={{ fontSize: "13px", fontWeight: "500", color: "#cbd5e1" }}>Days</span>
            </div>
          </div>
        </div>

        {/* Active Days */}
        <div
          style={{
            background: "linear-gradient(135deg, #181d2a 0%, #131722 100%)",
            border: "1px solid #28334a",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.15)",
              display: "grid",
              placeItems: "center",
              color: "#818cf8",
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
              Active Days
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>
              {data?.activeDays || 0} <span style={{ fontSize: "13px", fontWeight: "500", color: "#cbd5e1" }}>in {selectedYear}</span>
            </div>
          </div>
        </div>

        {/* Total Practice Time */}
        <div
          style={{
            background: "linear-gradient(135deg, #181d2a 0%, #131722 100%)",
            border: "1px solid #28334a",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.15)",
              display: "grid",
              placeItems: "center",
              color: "#38bdf8",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
              Practice Time
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>
              {formattedPracticeTime}
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP SCROLLABLE CONTAINER */}
      <div
        style={{
          overflowX: "auto",
          paddingBottom: "12px",
          scrollbarWidth: "thin",
          scrollbarColor: "#2a3449 transparent",
        }}
      >
        <div style={{ minWidth: "780px", display: "inline-block" }}>
          {/* MONTH HEADERS */}
          <div style={{ display: "flex", marginLeft: "34px", marginBottom: "6px", height: "18px", position: "relative" }}>
            {monthLabels.map((lbl, i) => (
              <span
                key={`m-${i}`}
                style={{
                  position: "absolute",
                  left: `${lbl.weekIndex * 15}px`,
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                }}
              >
                {lbl.month}
              </span>
            ))}
          </div>

          {/* MAIN HEATMAP GRID (7 ROWS x WEEKS COLUMNS) */}
          <div style={{ display: "flex", gap: "3px" }}>
            {/* DAY OF WEEK LABELS */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: "repeat(7, 12px)",
                gap: "3px",
                marginRight: "6px",
                userSelect: "none",
              }}
            >
              {DAY_LABELS.map((d, i) => (
                <span
                  key={d}
                  style={{
                    fontSize: "9px",
                    fontWeight: "600",
                    color: i % 2 === 1 ? "#64748b" : "transparent",
                    lineHeight: "12px",
                    textAlign: "right",
                    width: "24px",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* WEEKS COLUMNS */}
            {weeks.map((week, wIdx) => (
              <div
                key={`week-${wIdx}`}
                style={{
                  display: "grid",
                  gridTemplateRows: "repeat(7, 12px)",
                  gap: "3px",
                }}
              >
                {week.map((cell, dIdx) => {
                  const levelCfg = LEVEL_COLORS[cell.level] || LEVEL_COLORS[0];
                  const isCellActive = cell.isCurrentYear && cell.level > 0;

                  return (
                    <div
                      key={`day-${wIdx}-${dIdx}`}
                      onMouseEnter={(e) => handleMouseEnterCell(e, cell)}
                      onMouseLeave={handleMouseLeaveCell}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "2px",
                        background: cell.isCurrentYear ? levelCfg.bg : "transparent",
                        border: cell.isCurrentYear ? `1px solid ${levelCfg.border}` : "none",
                        cursor: cell.isCurrentYear ? "pointer" : "default",
                        transition: "transform 0.1s ease, box-shadow 0.1s ease",
                        boxShadow: isCellActive ? `0 0 6px ${levelCfg.border}44` : "none",
                      }}
                      onMouseOver={(e) => {
                        if (cell.isCurrentYear) {
                          e.currentTarget.style.transform = "scale(1.25)";
                          e.currentTarget.style.zIndex = "10";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (cell.isCurrentYear) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.zIndex = "1";
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HEATMAP FOOTER & LEGEND */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid #1e2638",
          fontSize: "12px",
          color: "#94a3b8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>💡 <b>Pro Tip:</b> Completing daily mock rounds and coding problems advances your streak and interview readiness.</span>
        </div>

        {/* INTENSITY LEGEND */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Less</span>
          {LEVEL_COLORS.map((cfg) => (
            <div
              key={cfg.level}
              title={cfg.label}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* INTERACTIVE FLOATING TOOLTIP */}
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -100%)",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
            pointerEvents: "none",
            zIndex: 100,
            minWidth: "190px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "700", color: "#f8fafc", marginBottom: "6px", borderBottom: "1px solid #21262d", paddingBottom: "4px" }}>
            {formatDisplayDate(tooltip.dateStr)}
          </div>

          {tooltip.dayData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", color: "#cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Login:</span>
                <strong style={{ color: "#818cf8" }}>{tooltip.dayData.loginCount || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Questions Answered:</span>
                <strong style={{ color: "#38bdf8" }}>{tooltip.dayData.questionsAnswered || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Coding Problems:</span>
                <strong style={{ color: "#fbbf24" }}>{tooltip.dayData.codingSubmissions || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Interviews Completed:</span>
                <strong style={{ color: "#4ade80" }}>{tooltip.dayData.interviewsCompleted || 0}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                  paddingTop: "4px",
                  borderTop: "1px solid #21262d",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                <span>Total Activity:</span>
                <span style={{ color: "#22c55e" }}>{tooltip.dayData.totalActivityScore || 0}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: "#64748b", fontStyle: "italic" }}>
              No activity recorded on this day
            </div>
          )}
        </div>
      )}
    </div>
  );
}
