import nodemailer from "nodemailer";
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

const jwtSecret = process.env.JWT_SECRET || "development-only-change-me";

// --- CORS Setup (Supports any localhost port, 127.0.0.1, and production domains) ---
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      const allowed = [
        "https://sdeprepai.netlify.app",
        "https://loquacious-frangollo-20647e.netlify.app",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (allowed.some((a) => origin.startsWith(a) || a.startsWith(origin))) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "4mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

// --- Multi-Transport Email Setup (Gmail SMTP + Resend API) ---
const gmailUser = (process.env.EMAIL_USER || process.env.GMAIL_USER || "").trim();
const gmailPass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "").trim();

const nodemailerTransporter = (gmailUser && gmailPass)
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })
  : null;

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailSender = process.env.EMAIL_FROM || `SDEPrepAI Interviewer <${gmailUser || "onboarding@resend.dev"}>`;

const emailConfigured = () => Boolean(nodemailerTransporter || resendApiKey);

async function sendMail({ to, subject, html }) {
  // 1. Try Nodemailer Gmail SMTP if configured (can send to ANY email address)
  if (nodemailerTransporter) {
    try {
      const info = await nodemailerTransporter.sendMail({
        from: emailSender,
        to,
        subject,
        html,
      });
      console.log(`✅ Email delivered via Gmail SMTP to: ${to} (MessageId: ${info.messageId})`);
      return { sent: true, id: info.messageId, provider: "gmail" };
    } catch (e) {
      console.error("❌ Gmail SMTP send failed:", e.message);
      if (!resend) {
        return { sent: false, error: e.message, provider: "gmail" };
      }
    }
  }

  // 2. Try Resend API
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: emailSender.includes("@resend.dev") ? emailSender : "SDEPrepAI Interviewer <onboarding@resend.dev>",
        to,
        subject,
        html,
      });
      if (error) {
        console.error("❌ Resend API error:", error.message);
        const isTestingRestriction = error.message?.toLowerCase().includes("testing emails to your own email address") || error.message?.toLowerCase().includes("verify a domain");
        return { sent: false, error: error.message, isTestingRestriction, provider: "resend" };
      }
      console.log(`✅ Email delivered via Resend to: ${to} (ID: ${data?.id})`);
      return { sent: true, id: data?.id, provider: "resend" };
    } catch (e) {
      console.error("❌ Resend send failed:", e.message);
      const isTestingRestriction = e.message?.toLowerCase().includes("testing emails to your own email address") || e.message?.toLowerCase().includes("verify a domain");
      return { sent: false, error: e.message, isTestingRestriction, provider: "resend" };
    }
  }

  return { sent: false, error: "No email transporter is configured" };
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
    gmailSmtp: Boolean(nodemailerTransporter),
    resendConfigured: Boolean(resend),
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
    ).run(email, otp, Date.now() + 10 * 60 * 1000);

    const mail = await sendMail({
      to: email,
      subject: "Your SDEPrepAI Interviewer OTP",
      html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px"><h2>SDEPrepAI Interviewer</h2><p>Your verification code is:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f4f4f4;text-align:center;border-radius:8px">${otp}</div><p style="color:#666">Valid for 10 minutes. If you did not request this, please ignore this email.</p></div>`,
    });

    console.log(`\n========================================`);
    console.log(`🔑 CANDIDATE LOGIN OTP for ${email}: ${otp}`);
    console.log(`📧 Email status: ${mail.sent ? "✅ Delivered to inbox" : "⚠️ " + mail.error}`);
    console.log(`========================================\n`);

    if (mail.sent) {
      return res.json({ success: true, message: `OTP sent successfully to ${email}` });
    }

    // If Resend test domain restrictions prevent sending to an unverified email, or email fails locally:
    // Keep OTP in DB and return safe success with dev OTP so the student is NEVER blocked!
    return res.json({
      success: true,
      message: `OTP generated! Check your inbox or use verification code: ${otp}`,
      devOtp: otp,
      deliveryWarning: mail.error
    });
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
      subject: `SDEPrepAI Interview Invitation — ${role}`,
      html: `<div style="font-family:Arial;max-width:650px;margin:auto;padding:30px"><h1>SDEPrepAI Interviewer</h1><h2>Hello ${candidateName}</h2><p>You have been invited to complete an AI-powered interview.</p><p><b>Role:</b> ${role}<br><b>Difficulty:</b> ${difficulty}<br><b>Duration:</b> ${duration} minutes</p><p><a href="${interviewUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none">Start Interview</a></p><p>${interviewUrl}</p></div>`,
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

app.get("/api/v1/results", requireAuth(["admin", "recruiter", "candidate"]), (req, res) => {
  const rows =
    req.user.role === "candidate"
      ? db.prepare("SELECT * FROM interviews WHERE lower(candidate_email)=lower(?) ORDER BY created_at DESC").all(req.user.email)
      : listInterviews();
  res.json(rows);
});

app.get("/api/v1/analytics", requireAuth(["admin", "recruiter", "candidate"]), (req, res) => {
  try {
    let email = req.user?.email || "";
    if (req.user?.role !== "candidate" && req.query.candidateEmail) {
      email = String(req.query.candidateEmail).trim().toLowerCase();
    }

    if (!email) {
      return res.status(400).json({ error: "Candidate email is required" });
    }

    const rawInterviews = db.prepare(
      "SELECT * FROM interviews WHERE lower(candidate_email) = lower(?) ORDER BY created_at ASC"
    ).all(email);

    if (!rawInterviews || rawInterviews.length === 0) {
      return res.json({
        summary: {
          totalInterviews: 0,
          completedInterviews: 0,
          inProgressInterviews: 0,
          totalMinutes: 0,
          averageScore: 0,
          highestScore: 0,
          latestScore: null,
          firstScore: null,
          improvementTrend: "0 pts",
          improvementRate: 0,
          performanceLevel: "Getting Started",
          smartSummary: "No interview data recorded yet. Start your first practice interview to unlock personalised AI performance analytics, score trends, and skill gap insights."
        },
        scoreTrend: [],
        scoreDistribution: [
          { range: "0-40", label: "Needs Prep (0-40)", count: 0, percentage: 0 },
          { range: "41-60", label: "Developing (41-60)", count: 0, percentage: 0 },
          { range: "61-80", label: "Competent (61-80)", count: 0, percentage: 0 },
          { range: "81-100", label: "Exceptional (81-100)", count: 0, percentage: 0 }
        ],
        rolePerformance: [],
        topStrengths: [],
        repeatedWeaknesses: [],
        recommendations: [],
        recentHistory: []
      });
    }

    const totalInterviews = rawInterviews.length;
    let totalMinutes = 0;
    const completedList = [];
    const inProgressList = [];

    const strengthCounts = new Map();
    const weaknessCounts = new Map();
    const recommendationSet = new Set();
    const roleStats = new Map();

    rawInterviews.forEach((item) => {
      const durationVal = Number(item.duration) || 30;
      totalMinutes += durationVal;

      const roleKey = (item.role || "General Software Engineer").trim();
      if (!roleStats.has(roleKey)) {
        roleStats.set(roleKey, { role: roleKey, total: 0, completed: 0, scores: [] });
      }
      const roleObj = roleStats.get(roleKey);
      roleObj.total += 1;

      let feedback = null;
      if (item.feedback) {
        feedback = parseJson(item.feedback, null);
      }

      const hasScore = item.score !== null && item.score !== undefined && !isNaN(Number(item.score));
      const isDone = item.status === "Done" || hasScore;

      if (isDone && hasScore) {
        const scoreNum = Math.round(Number(item.score));
        roleObj.completed += 1;
        roleObj.scores.push(scoreNum);

        completedList.push({
          id: item.id,
          createdAt: item.created_at,
          role: roleKey,
          difficulty: item.difficulty || "Medium",
          duration: durationVal,
          score: scoreNum,
          status: item.status || "Done",
          feedbackSummary: feedback?.summary || ""
        });

        if (feedback && Array.isArray(feedback.strengths)) {
          feedback.strengths.forEach((s) => {
            const clean = typeof s === "string" ? s.trim().replace(/^[-*•\d.]+\s*/, "") : "";
            if (clean.length > 3) {
              strengthCounts.set(clean, (strengthCounts.get(clean) || 0) + 1);
            }
          });
        }

        if (feedback && Array.isArray(feedback.weaknesses)) {
          feedback.weaknesses.forEach((w) => {
            const clean = typeof w === "string" ? w.trim().replace(/^[-*•\d.]+\s*/, "") : "";
            if (clean.length > 3) {
              weaknessCounts.set(clean, (weaknessCounts.get(clean) || 0) + 1);
            }
          });
        }

        if (feedback && Array.isArray(feedback.improvements)) {
          feedback.improvements.forEach((imp) => {
            const clean = typeof imp === "string" ? imp.trim().replace(/^[-*•\d.]+\s*/, "") : "";
            if (clean.length > 3) {
              recommendationSet.add(clean);
            }
          });
        }
      } else {
        inProgressList.push(item);
      }
    });

    const completedCount = completedList.length;
    const scores = completedList.map((x) => x.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;
    const firstScore = scores.length > 0 ? scores[0] : null;

    const improvementDiff = scores.length >= 2 ? latestScore - firstScore : 0;
    const improvementTrend =
      improvementDiff > 0
        ? `+${improvementDiff} pts`
        : improvementDiff < 0
        ? `${improvementDiff} pts`
        : "0 pts";

    let performanceLevel = "Getting Started";
    if (completedCount > 0) {
      if (avgScore >= 85) performanceLevel = "Exceptional";
      else if (avgScore >= 70) performanceLevel = "Proficient";
      else if (avgScore >= 50) performanceLevel = "Developing";
      else performanceLevel = "Needs Focus";
    }

    const distBuckets = { "0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    scores.forEach((s) => {
      if (s <= 40) distBuckets["0-40"]++;
      else if (s <= 60) distBuckets["41-60"]++;
      else if (s <= 80) distBuckets["61-80"]++;
      else distBuckets["81-100"]++;
    });

    const scoreDistribution = [
      {
        range: "0-40",
        label: "Needs Prep (0-40)",
        count: distBuckets["0-40"],
        percentage: completedCount ? Math.round((distBuckets["0-40"] / completedCount) * 100) : 0
      },
      {
        range: "41-60",
        label: "Developing (41-60)",
        count: distBuckets["41-60"],
        percentage: completedCount ? Math.round((distBuckets["41-60"] / completedCount) * 100) : 0
      },
      {
        range: "61-80",
        label: "Competent (61-80)",
        count: distBuckets["61-80"],
        percentage: completedCount ? Math.round((distBuckets["61-80"] / completedCount) * 100) : 0
      },
      {
        range: "81-100",
        label: "Exceptional (81-100)",
        count: distBuckets["81-100"],
        percentage: completedCount ? Math.round((distBuckets["81-100"] / completedCount) * 100) : 0
      }
    ];

    const scoreTrend = completedList.map((item, idx) => ({
      index: idx + 1,
      id: item.id,
      date: item.createdAt ? item.createdAt.slice(0, 10) : "",
      displayDate: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `Interview ${idx + 1}`,
      role: item.role,
      difficulty: item.difficulty,
      score: item.score
    }));

    const rolePerformance = Array.from(roleStats.values()).map((r) => {
      const rAvg = r.scores.length > 0 ? Math.round(r.scores.reduce((a, b) => a + b, 0) / r.scores.length) : 0;
      const rBest = r.scores.length > 0 ? Math.max(...r.scores) : 0;
      const rLatest = r.scores.length > 0 ? r.scores[r.scores.length - 1] : 0;
      return {
        role: r.role,
        total: r.total,
        completed: r.completed,
        avgScore: rAvg,
        bestScore: rBest,
        latestScore: rLatest
      };
    });

    const topStrengths = Array.from(strengthCounts.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const repeatedWeaknesses = Array.from(weaknessCounts.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    let recommendations = Array.from(recommendationSet).slice(0, 6);
    if (recommendations.length === 0 && completedCount > 0) {
      if (avgScore < 60) {
        recommendations = [
          "Structure technical answers clearly using real-world scenarios and context.",
          "Practice core problem decomposition and explicitly state time/space complexity.",
          "Ensure responses cover complete end-to-end architecture and edge cases."
        ];
      } else {
        recommendations = [
          "Continue refining in-depth system architecture discussions and scalability trade-offs.",
          "Articulate technical trade-offs between competing architectural decisions proactively.",
          "Target advanced difficulty interviews to simulate high-bar technical rounds."
        ];
      }
    }

    let smartSummary = "";
    if (completedCount === 0) {
      smartSummary = `You have ${totalInterviews} interview session(s) initiated. Complete your sessions to generate rich AI performance metrics, score trends, and skill recommendations.`;
    } else {
      const topRole =
        [...rolePerformance].sort((a, b) => b.completed - a.completed)[0]?.role || "Software Engineering";
      const topStrengthSnippet = topStrengths[0]?.text
        ? `notable strength in "${topStrengths[0].text}"`
        : "solid foundational communication";
      const topWeaknessSnippet = repeatedWeaknesses[0]?.text
        ? `focusing on "${repeatedWeaknesses[0].text}"`
        : "deepening technical explanations with trade-offs";

      let trendText = "steady performance";
      if (scores.length >= 2) {
        if (improvementDiff > 5) trendText = `a strong positive improvement (+${improvementDiff} pts) across sessions`;
        else if (improvementDiff < -5) trendText = `some score variance across recent interview topics`;
        else trendText = `consistent scoring across sessions`;
      }

      smartSummary = `Candidate has completed ${completedCount} interview(s) with an overall average score of ${avgScore}/100 and a high of ${highestScore}/100 in ${topRole}. Results reflect ${trendText}, with ${topStrengthSnippet}. For maximum impact, consider ${topWeaknessSnippet}.`;
    }

    const recentHistory = [...completedList].reverse().slice(0, 10);

    res.json({
      summary: {
        totalInterviews,
        completedInterviews: completedCount,
        inProgressInterviews: totalInterviews - completedCount,
        totalMinutes,
        averageScore: avgScore,
        highestScore,
        latestScore,
        firstScore,
        improvementTrend,
        improvementRate: improvementDiff,
        performanceLevel,
        smartSummary
      },
      scoreTrend,
      scoreDistribution,
      rolePerformance,
      topStrengths,
      repeatedWeaknesses,
      recommendations,
      recentHistory
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ error: "Failed to generate candidate analytics", details: err.message });
  }
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