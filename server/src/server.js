import "./env.js";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Resend } from "resend";
import db, { createInterview, updateInterview, getInterview, listInterviews, clearAllInterviews, createCandidate, findUserByEmail, findUserById } from "./db.js";
import { generateQuestions, evaluateInterview } from "./ai.js";
import { getGithubSummary } from "./github.js";
import { requireAuth } from "./middleware.js";
import authRoutes from "../routes/authRoutes.js";
import resumeRoutes from "../routes/resume.js";

const app = express();
const port = Number(process.env.PORT || 3001);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://sdeprepai.netlify.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const jwtSecret = process.env.JWT_SECRET || "development-only-change-me";

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "4mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

// --- Resend Email Setup (Works 100% on Render over HTTPS Port 443) ---
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailSender = process.env.EMAIL_FROM || "AI Interviewer <onboarding@resend.dev>";

const emailConfigured = () => Boolean(resendApiKey);

async function sendMail({ to, subject, html }) {
  if (!emailConfigured()) {
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: emailSender,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("❌ Email API error:", error.message);
      return { sent: false, error: error.message };
    }
    return { sent: true, id: data?.id };
  } catch (e) {
    console.error("❌ Email sending failed:", e.message);
    return { sent: false, error: e.message };
  }
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function tokenFromReq(req) {
  return req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
}

function signCandidate(candidate) {
  return jwt.sign(
    { id: candidate.id, email: candidate.email, role: "candidate" },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

app.get("/api/health", (_, res) =>
  res.json({
    ok: true,
    emailConfigured: emailConfigured(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    database: true,
  })
);

// Candidate email OTP login
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ error: "Please enter a valid email" });
    const otp = String(crypto.randomInt(100000, 1000000));
    db.prepare(
      `INSERT INTO otp_codes(email,otp,expires_at,attempts) VALUES(?,?,?,0) ON CONFLICT(email) DO UPDATE SET otp=excluded.otp,expires_at=excluded.expires_at,attempts=0`
    ).run(email, otp, Date.now() + 5 * 60 * 1000);

    const mail = await sendMail({
      to: email,
      subject: "Your AI Interviewer OTP",
      html: `<div style="font-family:Arial;max-width:600px;margin:auto"><h2>AI Interviewer</h2><p>Your verification code is:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f4f4f4;text-align:center">${otp}</div><p>Valid for 5 minutes.</p></div>`,
    });

    if (!mail.sent) {
      db.prepare("DELETE FROM otp_codes WHERE email=?").run(email);
      return res.status(503).json({ error: "OTP email could not be sent", details: mail.error });
    }
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    console.error("OTP ERROR", e);
    res.status(500).json({ error: "Failed to send OTP", details: e.message });
  }
});

app.post("/api/auth/verify-otp", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").trim();
  const record = db.prepare("SELECT * FROM otp_codes WHERE email=?").get(email);
  if (!record) return res.status(400).json({ error: "OTP not found. Request a new code." });
  if (Date.now() > Number(record.expires_at)) {
    db.prepare("DELETE FROM otp_codes WHERE email=?").run(email);
    return res.status(400).json({ error: "OTP expired. Request a new code." });
  }
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
  db.prepare("DELETE FROM otp_codes WHERE email=?").run(email);
  const user = createCandidate(email);
  res.json({ success: true, token: signCandidate(user), user });
});

// Recruiter/admin creates an interview and sends invitation
async function createInterviewHandler(req, res) {
  try {
    const {
      candidateName,
      email,
      role,
      difficulty = "Medium",
      duration = 45,
      github = "",
      jobDescription = "",
      language = "en-IN",
    } = req.body || {};
    const normalizedEmail =
      req.user?.role === "candidate"
        ? String(req.user.email || "").trim().toLowerCase()
        : String(email || "").trim().toLowerCase();
    if (!candidateName?.trim()) return res.status(400).json({ error: "Candidate name is required" });
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail))
      return res.status(400).json({ error: "Valid candidate email is required" });
    if (!role?.trim()) return res.status(400).json({ error: "Interview role is required" });
    const githubData = await getGithubSummary(github || "");
    const questions = await generateQuestions({
      role,
      difficulty,
      jobDescription,
      githubSummary: githubData.summary,
      language,
    });
    const id = crypto.randomUUID();
    createInterview({
      id,
      created_at: new Date().toISOString(),
      candidate_name: candidateName.trim(),
      candidate_email: normalizedEmail,
      role: role.trim(),
      difficulty,
      duration: Number(duration) || 45,
      github: github || "",
      job_description: jobDescription || "",
      questions: JSON.stringify(questions),
      transcript: "[]",
      status: "Pre",
    });
const frontendBase = process.env.CLIENT_URL || "https://loquacious-frangollo-20647e.netlify.app";
const interviewUrl = `${frontendBase}/?interview=${encodeURIComponent(id)}`;
    const mail = await sendMail({
      to: normalizedEmail,
      subject: `AI Interview Invitation — ${role}`,
      html: `<div style="font-family:Arial;max-width:650px;margin:auto;padding:30px"><h1>AI Interviewer</h1><h2>Hello ${candidateName}</h2><p>You have been invited to complete an AI-powered interview.</p><p><b>Role:</b> ${role}<br><b>Difficulty:</b> ${difficulty}<br><b>Duration:</b> ${duration} minutes</p><p><a href="${interviewUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none">Start Interview</a></p><p>${interviewUrl}</p></div>`,
    });
    console.log(
      mail.sent
        ? `✅ Invitation sent to ${normalizedEmail}`
        : `⚠️ Interview created but email not sent: ${mail.error}`
    );
    res.json({
      success: true,
      id,
      email: normalizedEmail,
      emailSent: mail.sent,
      emailError: mail.sent ? null : mail.error,
      interviewUrl,
      github: githubData,
      questions,
    });
  } catch (e) {
    console.error("CREATE INTERVIEW ERROR", e);
    res.status(500).json({ success: false, error: "Could not create interview", details: e.message });
  }
}

app.post("/api/v1/pre-interview", requireAuth(["admin", "recruiter"]), createInterviewHandler);
app.post("/api/v1/practice-interview", requireAuth(["candidate"]), createInterviewHandler);

function canAccessInterview(req, x) {
  return req.user.role !== "candidate" || x.candidate_email?.toLowerCase() === req.user.email?.toLowerCase();
}

app.get("/api/v1/interview/:id", requireAuth(["candidate", "admin", "recruiter"]), (req, res) => {
  const x = getInterview(req.params.id);
  if (!x) return res.status(404).json({ error: "Interview not found" });
  if (!canAccessInterview(req, x)) return res.status(403).json({ error: "You do not have access to this interview" });
  res.json({
    ...x,
    questions: parseJson(x.questions, []),
    transcript: parseJson(x.transcript, []),
    feedback: parseJson(x.feedback, null),
  });
});

app.post("/api/v1/session/user/response/:id", requireAuth(["candidate"]), (req, res) => {
  const x = getInterview(req.params.id);
  if (!x) return res.status(404).json({ error: "Interview not found" });
  if (!canAccessInterview(req, x)) return res.status(403).json({ error: "Access denied" });
  const transcript = parseJson(x.transcript, []);
  transcript.push({ type: "User", content: String(req.body?.message || ""), createdAt: new Date().toISOString() });
  updateInterview(x.id, { transcript: JSON.stringify(transcript), status: "Live" });
  res.json({ success: true });
});

app.post("/api/v1/session/assistant/response/:id", requireAuth(["candidate"]), (req, res) => {
  const x = getInterview(req.params.id);
  if (!x) return res.status(404).json({ error: "Interview not found" });
  if (!canAccessInterview(req, x)) return res.status(403).json({ error: "Access denied" });
  const transcript = parseJson(x.transcript, []);
  transcript.push({ type: "Assistant", content: String(req.body?.message || ""), createdAt: new Date().toISOString() });
  updateInterview(x.id, { transcript: JSON.stringify(transcript), status: "Live" });
  res.json({ success: true });
});

app.post("/api/v1/finish/:id", requireAuth(["candidate"]), async (req, res) => {
  try {
    const x = getInterview(req.params.id);
    if (!x) return res.status(404).json({ error: "Interview not found" });
    if (!canAccessInterview(req, x)) return res.status(403).json({ error: "Access denied" });
    const result = await evaluateInterview({ role: x.role, transcript: parseJson(x.transcript, []) });
    updateInterview(x.id, { score: result.score, feedback: JSON.stringify(result), status: "Done" });
    res.json(result);
  } catch (e) {
    console.error("FINISH ERROR", e);
    res.status(500).json({ error: "Failed to finish interview" });
  }
});

app.get("/api/v1/analytics", requireAuth(["candidate", "admin", "recruiter"]), (req, res) => {
  try {
    const candidateEmail = String(req.user?.email || "").trim().toLowerCase();
    if (!candidateEmail) {
      return res.status(400).json({ error: "Candidate email is missing from authentication token" });
    }

    // Fetch all interviews for the logged-in candidate ordered chronologically
    const rows = db.prepare(
      "SELECT * FROM interviews WHERE lower(candidate_email) = lower(?) ORDER BY created_at ASC"
    ).all(candidateEmail);

    const totalAttempted = rows.length;
    const completedRows = rows.filter(
      (r) => r.score !== null && r.score !== undefined && (r.status === "Done" || Number(r.score) > 0)
    );
    const completedCount = completedRows.length;

    // Calculate total minutes spent
    let totalMinutesSpent = 0;
    for (const r of rows) {
      const transcript = parseJson(r.transcript, []);
      if (Array.isArray(transcript) && transcript.length >= 2) {
        const start = new Date(transcript[0].createdAt || r.created_at).getTime();
        const end = new Date(transcript[transcript.length - 1].createdAt).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          totalMinutesSpent += Math.round((end - start) / 60000);
          continue;
        }
      }
      if (r.score !== null && r.score !== undefined) {
        totalMinutesSpent += Number(r.duration) || 45;
      }
    }

    // Scores calculation
    const scores = completedRows.map((r) => Number(r.score) || 0);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;

    // Score improvement trend (+/- pts)
    let scoreImprovement = 0;
    if (scores.length >= 2) {
      scoreImprovement = Math.round(scores[scores.length - 1] - scores[0]);
    }

    // Score trend graph timeline
    const scoreTrend = completedRows.map((r, index) => ({
      index: index + 1,
      id: r.id,
      role: r.role,
      difficulty: r.difficulty || "Medium",
      score: Number(r.score) || 0,
      date: r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `Session ${index + 1}`
    }));

    // Score distribution buckets
    const distributionMap = {
      "90-100 (Expert)": 0,
      "75-89 (Proficient)": 0,
      "50-74 (Competent)": 0,
      "< 50 (Needs Practice)": 0,
    };
    for (const s of scores) {
      if (s >= 90) distributionMap["90-100 (Expert)"]++;
      else if (s >= 75) distributionMap["75-89 (Proficient)"]++;
      else if (s >= 50) distributionMap["50-74 (Competent)"]++;
      else distributionMap["< 50 (Needs Practice)"]++;
    }
    const scoreDistribution = Object.entries(distributionMap).map(([range, count]) => ({
      range,
      count,
    }));

    // Role-wise performance breakdown
    const roleStatsMap = {};
    for (const r of rows) {
      const roleName = r.role || "General";
      if (!roleStatsMap[roleName]) {
        roleStatsMap[roleName] = { role: roleName, total: 0, completed: 0, scores: [] };
      }
      roleStatsMap[roleName].total++;
      if (r.score !== null && r.score !== undefined) {
        roleStatsMap[roleName].completed++;
        roleStatsMap[roleName].scores.push(Number(r.score) || 0);
      }
    }
    const rolePerformance = Object.values(roleStatsMap).map((item) => ({
      role: item.role,
      total: item.total,
      completed: item.completed,
      avgScore:
        item.scores.length > 0
          ? Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length)
          : 0,
      bestScore: item.scores.length > 0 ? Math.max(...item.scores) : 0,
      latestScore: item.scores.length > 0 ? item.scores[item.scores.length - 1] : 0,
    }));

    // Aggregate AI feedback (Strengths, Weaknesses, Improvements)
    const strengthsCount = {};
    const weaknessesCount = {};
    const improvementsCount = {};

    for (const r of completedRows) {
      const fb = parseJson(r.feedback, null);
      if (fb && typeof fb === "object") {
        if (Array.isArray(fb.strengths)) {
          for (const s of fb.strengths) {
            const clean = String(s).trim();
            if (clean) strengthsCount[clean] = (strengthsCount[clean] || 0) + 1;
          }
        }
        if (Array.isArray(fb.weaknesses)) {
          for (const w of fb.weaknesses) {
            const clean = String(w).trim();
            if (clean) weaknessesCount[clean] = (weaknessesCount[clean] || 0) + 1;
          }
        }
        if (Array.isArray(fb.improvements)) {
          for (const imp of fb.improvements) {
            const clean = String(imp).trim();
            if (clean) improvementsCount[clean] = (improvementsCount[clean] || 0) + 1;
          }
        }
      }
    }

    const topStrengths = Object.entries(strengthsCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const repeatedWeaknesses = Object.entries(weaknessesCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const improvementRecommendations = Object.entries(improvementsCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Recent interview history (most recent first)
    const recentHistory = [...rows].reverse().slice(0, 10).map((r) => {
      const fb = parseJson(r.feedback, null);
      return {
        id: r.id,
        role: r.role,
        difficulty: r.difficulty || "Medium",
        duration: r.duration || 45,
        score: r.score,
        status: r.status,
        createdAt: r.created_at,
        summary: fb?.summary || null,
      };
    });

    // Generate Smart Performance Summary based on real data
    let smartSummary =
      "Complete your first practice interview to unlock deep AI analytics, performance trends, and role readiness scoring.";
    if (completedCount > 0) {
      if (completedCount === 1) {
        smartSummary = `You completed your initial interview for "${completedRows[0].role}" with a score of ${averageScore}/100. Complete additional interviews across various difficulty levels to build consistent trend analysis.`;
      } else if (scoreImprovement > 0) {
        smartSummary = `Your performance is trending positively with a +${scoreImprovement} point score improvement across ${completedCount} completed sessions. Your average score stands at ${averageScore}/100 with a peak score of ${highestScore}/100.`;
      } else if (scoreImprovement < 0) {
        smartSummary = `You have completed ${completedCount} interviews with an average score of ${averageScore}/100. Recent harder sessions caused a slight dip (${scoreImprovement} pts). Focus on the AI recommendations below to strengthen consistency.`;
      } else {
        smartSummary = `You have maintained steady performance across ${completedCount} completed interviews with an average score of ${averageScore}/100 and a high of ${highestScore}/100.`;
      }
    }

    res.json({
      success: true,
      candidateEmail,
      metrics: {
        totalAttempted,
        completedCount,
        totalMinutesSpent,
        averageScore,
        highestScore,
        latestScore,
        scoreImprovement,
      },
      scoreTrend,
      scoreDistribution,
      rolePerformance,
      topStrengths,
      repeatedWeaknesses,
      improvementRecommendations,
      recentHistory,
      smartSummary,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ error: "Failed to generate analytics", details: err.message });
  }
});

app.get("/api/v1/results", requireAuth(["admin", "recruiter", "candidate"]), (req, res) => {
  const rows =
    req.user.role === "candidate"
      ? db.prepare("SELECT * FROM interviews WHERE lower(candidate_email)=lower(?) ORDER BY created_at DESC").all(req.user.email)
      : listInterviews();
  res.json(rows);
});

app.get("/api/admin/stats", requireAuth(["admin"]), (_, res) => {
  const total = db.prepare("SELECT COUNT(*) c FROM interviews").get().c;
  const completed = db.prepare("SELECT COUNT(*) c FROM interviews WHERE status='Done'").get().c;
  const avg = db.prepare("SELECT COALESCE(ROUND(AVG(score)),0) avg FROM interviews WHERE score IS NOT NULL").get().avg;
  const users = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  res.json({ total, completed, avg, users });
});

app.delete("/api/v1/interviews/clear", requireAuth(["admin"]), (_, res) => {
  clearAllInterviews();
  res.json({ success: true, message: "History cleared" });
});

async function seedUsers() {
  for (const [name, email, password, role] of [
    [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, "admin"],
    [process.env.RECRUITER_NAME, process.env.RECRUITER_EMAIL, process.env.RECRUITER_PASSWORD, "recruiter"],
  ]) {
    if (!email || !password) continue;
    const hash = await bcrypt.hash(password, 12);
    db.prepare(
      `INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,password_hash=excluded.password_hash,role=excluded.role`
    ).run(name || role, email.trim().toLowerCase(), hash, role);
  }
}
await seedUsers();

app.listen(port, "0.0.0.0", () => {
  console.log("========================================");
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📧 Email API: ${emailConfigured() ? "CONFIGURED (Resend)" : "NOT CONFIGURED"}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? "CONFIGURED" : "NOT CONFIGURED"}`);
  console.log("========================================");
});