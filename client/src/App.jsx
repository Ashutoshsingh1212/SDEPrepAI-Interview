import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Mic,
  MicOff,
  Play,
  Square,
  Github,
  Sparkles,
  Clock,
  ArrowRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Star,
  BookOpen,
  Code2,
  BrainCircuit,
  Database,
  Cloud,
  ShieldCheck,
  Smartphone,
  Palette,
  Sun,
  Moon,
  Award,
  Activity,
  CheckCircle2,
  TrendingUp,
  Target,
  ChevronRight,
  Users,
  Trophy,
  Menu,
  X
} from "lucide-react";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import ActivityHeatmap from "./components/ActivityHeatmap";

const API = import.meta.env.VITE_API_URL || "https://sdeprepai.onrender.com";
const candidateAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("candidate_token") || ""}` } });
const staffAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("staff_token") || ""}` } });

function speak(text) {
  if (!("speechSynthesis" in window)) {
    console.error("Speech synthesis is not supported.");
    return;
  }

  if (!text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  const voice =
    voices.find(v => v.lang.toLowerCase() === "en-in") ||
    voices.find(v => v.lang.toLowerCase().startsWith("en")) ||
    voices[0];

  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    console.log("AI speaking:", text);
  };

  utterance.onend = () => {
    console.log("AI finished speaking");
  };

  utterance.onerror = event => {
    console.error("Speech synthesis error:", event);
  };

  window.speechSynthesis.speak(utterance);
}

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

function CandidateLogin({ onLoginSuccess, onBack }) {
  const [name, setName] = useState(() => localStorage.getItem("candidate_name") || "");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const sendOtp = async e => {
    e.preventDefault();

    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();

      let data = {};

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw);
        } catch (parseError) {
          console.error("JSON PARSE ERROR:", parseError);
          console.error("SERVER RESPONSE:", raw);
          throw new Error("Server returned invalid JSON.");
        }
      } else {
        console.error("NON-JSON RESPONSE");
        console.error("Status:", res.status);
        console.error("Status Text:", res.statusText);
        console.error("Response:", raw);
        throw new Error(
          `Server returned ${res.status} ${res.statusText} instead of JSON.`
        );
      }

      if (!res.ok) {
        throw new Error(
          [data.error, data.details].filter(Boolean).join(": ") ||
          "Failed to send OTP"
        );
      }

      setMsg(data.message || "OTP sent successfully.");
      if (data.devOtp) {
        setOtp(data.devOtp);
      }
      setStep(2);
    } catch (e) {
      if (e.name === "TypeError" || e.message === "Load failed" || e.message?.includes("fetch")) {
        setErr("Could not reach the backend server. Please verify your backend is running on port 3001.");
      } else {
        setErr(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async e => {
    e.preventDefault();

    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();

      let data = {};

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw);
        } catch (parseError) {
          console.error("JSON PARSE ERROR:", parseError);
          console.error("SERVER RESPONSE:", raw);
          throw new Error("Server returned invalid JSON.");
        }
      } else {
        console.error("NON-JSON RESPONSE");
        console.error("Status:", res.status);
        console.error("Status Text:", res.statusText);
        console.error("Response:", raw);
        throw new Error(
          `Server returned ${res.status} ${res.statusText} instead of JSON.`
        );
      }

      if (!res.ok) {
        throw new Error(
          [data.error, data.details].filter(Boolean).join(": ") ||
          "Invalid OTP"
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Login response is missing token or user information."
        );
      }

      localStorage.setItem("candidate_token", data.token);
      localStorage.setItem("candidate_email", data.user.email);
      if (name.trim()) {
        localStorage.setItem("candidate_name", name.trim());
      }

      onLoginSuccess({ ...data.user, name: name.trim() || data.user.name });
    } catch (e) {
      if (e.name === "TypeError" || e.message === "Load failed" || e.message?.includes("fetch")) {
        setErr("Could not reach the backend server. Please verify your backend is running on port 3001.");
      } else {
        setErr(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#08090c", color: "#fff", padding: 24 }}>
      <div
        style={{
          width: "min(420px, 100%)",
          background: "#11141b",
          border: "1px solid #292f3d",
          borderRadius: 18,
          padding: 28,
          boxSizing: "border-box",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: 0,
              color: "#9aa3b2",
              cursor: "pointer",
              fontSize: 14,
              padding: 0,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            ← Back
          </button>
        )}

        <h1 style={{ margin: "4px 0 8px", fontSize: "28px", fontWeight: 800 }}>Candidate login</h1>

        <p style={{ color: "#8f98aa", fontSize: 14, marginBottom: 20 }}>
          Sign in using your email OTP to begin your interview
        </p>

        {err && (
          <div style={{ background: "#3a1114", color: "#ffb3ba", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            {err}
          </div>
        )}

        {msg && (
          <div style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            {msg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <input
              type="text"
              placeholder="Enter your full name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              style={fieldStyle}
            />

            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={fieldStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                background: "#6366f1",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                border: "none",
                fontSize: 14,
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)"
              }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 10 }}>
              Enter the 6-digit code sent to <b>{email}</b>
            </p>

            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              required
              value={otp}
              onChange={e => setOtp(e.target.value)}
              style={{
                ...fieldStyle,
                textAlign: "center",
                letterSpacing: 6,
                fontSize: 18,
                fontWeight: 700
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                background: "#22c55e",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                border: "none",
                marginBottom: 10,
                fontSize: 14,
                boxShadow: "0 4px 15px rgba(34,197,94,0.4)"
              }}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
                width: "100%",
                textAlign: "center"
              }}
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function RoleChooser({ onChoose }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#08090c", color: "#fff", padding: 24 }}>
      <div style={{ width: "min(900px,100%)", textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: "#9aa6ff", fontWeight: 800 }}>SDEPrepAI INTERVIEWER</div>
        <h1 style={{ fontSize: 42, margin: "12px 0 8px" }}>Choose your workspace</h1>
        <p style={{ color: "#9aa3b2", marginBottom: 30 }}>Secure role-based access with JWT for staff and OTP for candidates.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {[
            ['candidate', 'Candidate', 'Email OTP • Interview • Results'],
            ['recruiter', 'Recruiter', 'Password • Create interviews • Invitations'],
            ['admin', 'Admin', 'Password • Analytics • User management']
          ].map(([key, title, desc]) => (
            <button key={key} onClick={() => onChoose(key)} style={{ textAlign: "left", padding: 24, borderRadius: 18, border: "1px solid #2b3240", background: "#11141b", color: "#fff", cursor: "pointer" }}>
              <div style={{ fontSize: 28 }}>{key === 'candidate' ? '🎯' : key === 'recruiter' ? '👔' : '🛡️'}</div>
              <h2>{title}</h2>
              <p style={{ color: "#8f98aa", margin: 0 }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffLogin({ role, onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = register ? "/api/auth/register" : "/api/auth/login";
      const body = register ? { name, email, password, role: "recruiter" } : { email, password, role };
      const r = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Authentication failed");
      localStorage.setItem("staff_token", data.token);
      localStorage.setItem("staff_user", JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#08090c", color: "#fff", padding: 24 }}>
      <form onSubmit={submit} style={{ width: "min(420px,100%)", background: "#11141b", border: "1px solid #292f3d", borderRadius: 18, padding: 28 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: 0, color: "#9aa3b2", cursor: "pointer" }}>← Back</button>
        <h1>{register ? "Recruiter registration" : `${role[0].toUpperCase() + role.slice(1)} login`}</h1>
        <p style={{ color: "#8f98aa" }}>{role === 'admin' ? "Admin access" : register ? "Create a recruiter account" : "Staff members use email + password"}</p>
        {error && <div style={{ background: "#3a1114", color: "#ffb3ba", padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
        {register && <input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={fieldStyle} />}
        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} />
        <input required type="password" minLength={8} placeholder="Password (8+ characters)" value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle} />
        <button disabled={loading} style={{ width: "100%", padding: 12, border: 0, borderRadius: 10, background: "#eef0ff", color: "#111", fontWeight: 800, cursor: "pointer" }}>{loading ? "Please wait…" : register ? "Create recruiter" : "Login"}</button>
        {role === 'recruiter' && <button type="button" onClick={() => setRegister(v => !v)} style={{ marginTop: 14, background: "none", border: 0, color: "#aeb8ff", cursor: "pointer" }}>{register ? "Already have an account? Login" : "Need a recruiter account? Register"}</button>}
      </form>
    </div>
  );
}
const fieldStyle = { width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10, border: "1px solid #303746", background: "#0b0e13", color: "#fff", marginBottom: 12 };

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "dark");
  const [candidateUser, setCandidateUser] = useState(localStorage.getItem("candidate_email") || null);
  const [staffUser, setStaffUser] = useState(() => { try { return JSON.parse(localStorage.getItem("staff_user") || "null"); } catch { return null; } });
  const [authMode, setAuthMode] = useState(() => { const path = window.location.pathname; return path === "/admin/login" ? "admin" : path === "/recruiter/login" ? "recruiter" : path === "/candidate/login" ? "candidate" : null; });
  const [pendingInterviewId] = useState(() => new URLSearchParams(window.location.search).get("interview") || null);

  const [screen, setScreen] = useState("dashboard");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  const [form, setForm] = useState({
    candidateName: "",
    role: "Software Engineer",
    difficulty: "Intermediate",
    duration: 20,
    github: "",
    jobDescription: ""
  });

  const [interview, setInterview] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);

  const [dashboard, setDashboard] = useState({
    count: 0,
    avg: 0,
    best: 0,
    recent: [],
    all: []
  });

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const transcriptRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

 async function loadDashboard() {
    try {
      const r = await axios.get(`${API}/api/v1/results`, candidateAuth());
      const list = r.data || [];
      const done = list.filter(x => x.score != null);
      const avg = done.length
        ? Math.round(done.reduce((a, b) => a + b.score, 0) / done.length)
        : 0;
      const best = done.length
        ? Math.round(Math.max(...done.map(x => x.score)))
        : 0;

      setDashboard({
        count: list.length,
        avg,
        best,
        recent: list.slice(0, 5),
        all: list
      });
    } catch (e) {
      console.error(e);
      // Auto-logout when token expires or becomes invalid
      if (e.response?.status === 401 || e.response?.status === 403) {
        handleLogout();
      }
    }
  }

  useEffect(() => {
    if (candidateUser) loadDashboard();
  }, [candidateUser]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, answer]);

  useEffect(() => {
    if (!candidateUser || !pendingInterviewId) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await axios.get(`${API}/api/v1/interview/${pendingInterviewId}`, candidateAuth());
        if (cancelled) return;
        setInterview(r.data);
        setTranscript(r.data.transcript || []);
        setQIndex(0);
        setSeconds(0);
        setResult(null);
        setScreen("interview");
        window.history.replaceState({}, document.title, "/");
        setTimeout(() => { if (r.data?.questions?.[0]) speak(r.data.questions[0]); }, 600);
      } catch (error) {
        console.error("Failed to load invited interview:", error);
        alert(error.response?.data?.error || "This interview link is invalid or no longer available.");
      }
    })();
    return () => { cancelled = true; };
  }, [candidateUser, pendingInterviewId]);

  useEffect(() => {
    if (screen !== "interview") return;

    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (mounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (error) {
        console.error("Camera access denied:", error);
        alert("Camera access is required for the interview. Please allow camera permission.");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "interview") return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [screen]);

  const handleLogout = () => {
    localStorage.removeItem("candidate_token");
    localStorage.removeItem("candidate_email");
    setCandidateUser(null);
  };

  const update = (k, v) => {
    setForm(f => ({
      ...f,
      [k]: v
    }));
  };

  async function start() {
    try {
      const r = await axios.post(
        `${API}/api/v1/practice-interview`,
        form,
        candidateAuth()
      );

      setInterview(r.data);
      setTranscript([]);
      setQIndex(0);
      setSeconds(0);
      setResult(null);
      setAnswer("");
      setScreen("interview");

      setTimeout(() => {
        if (r.data?.questions?.[0]) {
          speak(r.data.questions[0]);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to create interview:", error);
      alert(
        error.response?.data?.error ||
          "Failed to create interview. Please make sure the backend is running."
      );
    }
  }

  async function saveAssistant(text) {
    await axios.post(
      `${API}/api/v1/session/assistant/response/${interview.id}`,
      { message: text },
      candidateAuth()
    );
  }

  async function submitAnswer(overrideText) {
    const text = (overrideText !== undefined ? overrideText : answer).trim();
    if (!text) return;

    const next = [
      ...transcript,
      {
        type: "User",
        content: text,
        createdAt: new Date().toISOString()
      }
    ];

    setTranscript(next);
    setAnswer("");

    try {
      await axios.post(
        `${API}/api/v1/session/user/response/${interview.id}`,
        { message: text },
        candidateAuth()
      );

      if (qIndex < interview.questions.length - 1) {
        const ni = qIndex + 1;
        setQIndex(ni);
        const q = interview.questions[ni];

        setTranscript(t => [
          ...t,
          {
            type: "Assistant",
            content: q,
            createdAt: new Date().toISOString()
          }
        ]);

        await saveAssistant(q);
        speak(q);
      } else {
        finish();
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert(error.response?.data?.error || "Failed to submit answer.");
    }
  }

  async function finish() {
    speechSynthesis?.cancel?.();

    try {
      const r = await axios.post(
        `${API}/api/v1/finish/${interview.id}`,
        {},
        candidateAuth()
      );

      setResult(r.data);
      loadDashboard();
      setScreen("result");
    } catch (error) {
      console.error("Failed to finish interview:", error);
      alert(error.response?.data?.error || "Failed to finish interview.");
    }
  }

  function retakePhoto() {
    setCapturedImage(null);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/png");
    setCapturedImage(image);
  }

  function toggleMic() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Microphone started");
      setListening(true);
    };

    recognition.onresult = event => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcriptText;
        } else {
          interimText += transcriptText;
        }
      }

      const text = (finalText || interimText).trim();
      if (text) {
        setAnswer(text);
      }
    };

    recognition.onerror = event => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone permission was blocked. Please allow microphone access.");
      } else if (event.error === "audio-capture") {
        alert("No microphone was detected. Check your microphone settings.");
      } else if (event.error === "no-speech") {
        console.log("No speech detected.");
      } else {
        alert("Voice recognition error: " + event.error);
      }
    };

    recognition.onend = () => {
      console.log("Microphone stopped");
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start microphone:", error);
      setListening(false);
    }
  }

  if (staffUser?.role === "admin") return <AdminDashboard user={staffUser} onLogout={() => { localStorage.removeItem("staff_token"); localStorage.removeItem("staff_user"); setStaffUser(null); }} theme={theme} onToggleTheme={toggleTheme} />;
  if (staffUser?.role === "recruiter") return <RecruiterDashboard user={staffUser} onBack={() => { localStorage.removeItem("staff_token"); localStorage.removeItem("staff_user"); setStaffUser(null); }} theme={theme} onToggleTheme={toggleTheme} />;
  if (!candidateUser && (authMode === "candidate" || pendingInterviewId)) return <CandidateLogin onBack={() => { setAuthMode(null); window.history.pushState({}, "", "/"); }} onLoginSuccess={u => { setCandidateUser(u.email); if (u?.name) setForm(f => ({ ...f, candidateName: u.name })); if (pendingInterviewId) setAuthMode("candidate"); }} />;
  if (!candidateUser && (authMode === "admin" || authMode === "recruiter")) return <StaffLogin role={authMode} onBack={() => { setAuthMode(null); window.history.pushState({}, "", "/"); }} onSuccess={u => setStaffUser(u)} />;
  if (!candidateUser) return <RoleChooser onChoose={role => { setAuthMode(role); const path = role === "admin" ? "/admin/login" : role === "recruiter" ? "/recruiter/login" : "/candidate/login"; window.history.pushState({}, "", path); }} />;

  const currentQuestion = interview?.questions?.[qIndex];
  const progress = interview?.questions?.length ? Math.round((qIndex / interview.questions.length) * 100) : 0;

  if (screen === "explore") {
    return (
      <AppShell
        active="explore"
        onNav={setScreen}
        candidateName={form.candidateName}
        candidateEmail={candidateUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <PracticeCatalog
          dashboard={dashboard}
          onGoAnalytics={() => setScreen("analytics")}
          onStart={(item) => {
            setForm(f => ({
              ...f,
              domain: item.domainKey || item.id || "software",
              role: item.role,
              difficulty: item.difficulty,
              duration: item.duration,
              jobDescription: item.description
            }));
            setScreen("setup");
          }}
        />
      </AppShell>
    );
  }

  if (screen === "setup") {
    return (
      <AppShell
        active="setup"
        onNav={setScreen}
        candidateName={form.candidateName}
        candidateEmail={candidateUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <Setup
          form={form}
          update={update}
          start={start}
          onHome={() => setScreen("dashboard")}
        />
      </AppShell>
    );
  }

  if (screen === "dashboard") {
    return (
      <AppShell
        active="dashboard"
        onNav={setScreen}
        candidateName={form.candidateName}
        candidateEmail={candidateUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <Dashboard
          dashboard={dashboard}
          candidateName={form.candidateName}
          candidateEmail={candidateUser}
          goPractice={() => setScreen("setup")}
          goExplore={() => setScreen("explore")}
          goAnalytics={() => setScreen("analytics")}
          onSelectDomain={(domainKey, roleTitle, desc) => {
            setForm(f => ({
              ...f,
              domain: domainKey,
              role: roleTitle,
              difficulty: "Medium",
              duration: 45,
              jobDescription: desc || ""
            }));
            setScreen("setup");
          }}
        />
      </AppShell>
    );
  }

  if (screen === "analytics") {
    return (
      <AppShell
        active="analytics"
        onNav={setScreen}
        candidateName={form.candidateName}
        candidateEmail={candidateUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <Analytics onStartPractice={() => setScreen("explore")} />
      </AppShell>
    );
  }

  if (screen === "history") {
    return (
      <AppShell
        active="history"
        onNav={setScreen}
        candidateName={form.candidateName}
        candidateEmail={candidateUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <History all={dashboard.all} />
      </AppShell>
    );
  }

  if (screen === "settings") {
    return (
      <AppShell
        active="settings"
        onNav={setScreen}
        candidateName={form.candidateName}
        candidateEmail={candidateUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <Settings
          theme={theme}
          setTheme={setTheme}
          onHistoryCleared={loadDashboard}
        />
      </AppShell>
    );
  }

  if (screen === "result") {
    return (
      <Result
        result={result}
        transcript={transcript}
        restart={() => setScreen("dashboard")}
      />
    );
  }

  return (
    <Interview
      {...{
        interview,
        qIndex,
        currentQuestion,
        progress,
        transcript,
        answer,
        setAnswer,
        listening,
        toggleMic,
        submitAnswer,
        finish,
        seconds,
        videoRef,
        capturedImage,
        capturePhoto,
        retakePhoto,
        transcriptRef,
        onHome: () => {
          speechSynthesis?.cancel?.();
          setScreen("dashboard");
        }
      }}
    />
  );
}

function Setup({ form, update, start, onHome }) {
  return (
    <main className="page">
      <div
        className="brand"
        onClick={onHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onHome?.();
          }
        }}
        title="Return to Home Dashboard"
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <div className="logo">
          <Sparkles size={20} />
        </div>
        <span>SDEPrepAI Interviewer</span>
      </div>

      <section className="hero">
        <div>
          <span className="eyebrow">AI-POWERED MOCK INTERVIEW</span>
          <h1>
            Practice interviews with an <span>AI interviewer.</span>
          </h1>
          <p>
            Get realistic questions, speak naturally, and receive a structured scorecard at the end.
          </p>
        </div>
      </section>

      <div className="card setup">
        <div className="section-title">
          <Sparkles />
          <div>
            <h2>Interview setup</h2>
            <p>Tell the interviewer what role you're preparing for.</p>
          </div>
        </div>

        <div className="grid">
          <label>
            Name
            <input
              value={form.candidateName}
              onChange={e => update("candidateName", e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label>
            Role
            <input
              value={form.role}
              onChange={e => update("role", e.target.value)}
            />
          </label>

          <label>
            Difficulty
            <select
              value={form.difficulty}
              onChange={e => update("difficulty", e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <label>
            Duration
            <select
              value={form.duration}
              onChange={e => update("duration", e.target.value)}
            >
              <option value="10">10 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </label>

          <label className="wide">
            <span>
              <Github size={15} />
              GitHub profile (optional)
            </span>
            <input
              value={form.github}
              onChange={e => update("github", e.target.value)}
              placeholder="https://github.com/username"
            />
          </label>

          <label className="wide">
            Job description / focus areas
            <textarea
              value={form.jobDescription}
              onChange={e => update("jobDescription", e.target.value)}
              placeholder="e.g. React, Node.js, system design, APIs..."
            />
          </label>
        </div>

        <button
          className="primary"
          onClick={start}
          disabled={!form.candidateName || !form.role}
        >
          Create interview
          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

function Interview(p) {
  const mins = String(Math.floor(p.seconds / 60)).padStart(2, "0");
  const secs = String(p.seconds % 60).padStart(2, "0");

  const ROUNDS = [
    { num: 1, key: "intro", title: "1. Intro & Behavioral", icon: "👋", range: [0, 1] },
    { num: 2, key: "project", title: "2. Project Discussion", icon: "📂", range: [2, 3] },
    { num: 3, key: "tech", title: "3. Domain Technical", icon: "⚡", range: [4, 6] },
    { num: 4, key: "coding", title: "4. Coding (2 LeetCode Medium)", icon: "💻", range: [7, 8] },
    { num: 5, key: "scenario", title: "5. Production Scenarios", icon: "🚀", range: [9, 10] },
  ];

  const activeRound = ROUNDS.find(r => p.qIndex >= r.range[0] && p.qIndex <= r.range[1]) || ROUNDS[0];
  const isCodingRound = (
    p.currentQuestion?.toLowerCase().includes("coding challenge") ||
    p.currentQuestion?.toLowerCase().includes("leetcode") ||
    (p.qIndex >= 7 && p.qIndex <= 8)
  );

  const [activeTab, setActiveTab] = useState(isCodingRound ? "code" : "chat");
  const [codeLang, setCodeLang] = useState(p.interview?.domainConfig?.codingLanguage || "javascript");
  const [codeContent, setCodeContent] = useState("");
  const [analyzingCode, setAnalyzingCode] = useState(false);
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  const workspaceScrollRef = useRef(null);

  useEffect(() => {
    if (isCodingRound) {
      setActiveTab("code");
      setCodeAnalysis(null);
      setCodeContent("");
    } else {
      setActiveTab("chat");
      setCodeAnalysis(null);
    }
  }, [p.qIndex, isCodingRound]);

  const handleAnalyzeCode = async () => {
    if (!codeContent.trim()) {
      alert("Please write your code solution before running analysis.");
      return;
    }
    setAnalyzingCode(true);
    try {
      const res = await axios.post(
        `${API}/api/v1/session/code/analyze`,
        {
          interviewId: p.interview?.id,
          problem: p.currentQuestion,
          code: codeContent,
          language: codeLang,
          domain: p.interview?.domain,
          role: p.interview?.role,
        },
        candidateAuth()
      );
      if (res.data?.analysis) {
        setCodeAnalysis(res.data.analysis);
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight || document.body.scrollHeight,
            behavior: "smooth",
          });
        }, 150);
      }
    } catch (e) {
      console.error("Code analysis error:", e);
      alert("Could not analyze code: " + (e.response?.data?.error || e.message));
    } finally {
      setAnalyzingCode(false);
    }
  };

  const handleSubmitCodeAnswer = () => {
    const text = `[CODING SUBMISSION - ${codeLang.toUpperCase()}]:\n\n${codeContent}\n\n${codeAnalysis ? `[AI COMPLEXITY ANALYSIS]: Approach: ${codeAnalysis.detectedApproach} | Time: ${codeAnalysis.timeComplexity} | Space: ${codeAnalysis.spaceComplexity}` : ""}`;
    p.submitAnswer(text);
  };

  return (
    <main className="page interview-page">
      {/* Sticky Top Bar: Brand Header + 5-Round Stepper + Progress */}
      <div className="interview-top-bar">
        <header className="interview-header">
          <div
            className="brand"
            onClick={() => {
              if (window.confirm("Return to home dashboard? Current interview session will be closed.")) {
                p.onHome ? p.onHome() : p.finish();
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (window.confirm("Return to home dashboard? Current interview session will be closed.")) {
                  p.onHome ? p.onHome() : p.finish();
                }
              }
            }}
            title="Return to Home Dashboard"
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <div className="logo">
              <Sparkles size={18} />
            </div>
            <span>SDEPrepAI Interviewer</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="timer">
              <Clock size={16} />
              {mins}:{secs}
            </div>

            <button className="danger" onClick={p.finish}>
              End interview
            </button>
          </div>
        </header>

        {/* 5-Round Progress Stepper */}
        <div className="rounds-stepper">
          {ROUNDS.map((r) => {
            const isDone = p.qIndex > r.range[1];
            const isCurr = p.qIndex >= r.range[0] && p.qIndex <= r.range[1];
            return (
              <div
                key={r.key}
                className={`round-step ${isCurr ? "active" : ""} ${isDone ? "completed" : ""}`}
              >
                <span className="round-step-num">{isDone ? "✓" : r.num}</span>
                <span>{r.title}</span>
              </div>
            );
          })}
        </div>

        <div className="progress" style={{ margin: "10px 0 16px" }}>
          <div style={{ width: `${p.progress}%` }} />
        </div>
      </div>

      <section className="interview-layout">
        {/* Left Side: Orb + Camera + Audio Controls */}
        <div className="orb-card">
          <div className="camera-box">
            <video ref={p.videoRef} autoPlay playsInline muted />
            <div className="camera-live-badge">
              <span className="live-dot" />
              Live
            </div>
          </div>

          <div className="orb-details-section">
            <div className="orb">
              <div className="orb-inner">
                <Sparkles size={24} />
              </div>
            </div>

            <div className="orb-meta">
              <h2>{p.interview?.role || "AI Technical Interviewer"}</h2>
              <div className="orb-round-badge">
                <span className="orb-round-title">{activeRound.title}</span>
                <span className="orb-round-dot">•</span>
                <span className="orb-round-q">Q{p.qIndex + 1} of {p.interview?.questions?.length || 12}</span>
              </div>
            </div>

            <div className="orb-controls">
              <button
                className={p.listening ? "mic active" : "mic"}
                onClick={p.toggleMic}
              >
                {p.listening ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{p.listening ? "Listening…" : "Speak answer"}</span>
              </button>

              {/* Toggle Coding / Conversation Tab - ONLY VISIBLE DURING CODING QUESTIONS */}
              {isCodingRound && (
                <div className="orb-tab-switch">
                  <button
                    type="button"
                    className={`orb-tab-btn ${activeTab === "code" ? "active" : ""}`}
                    onClick={() => setActiveTab("code")}
                  >
                    💻 Code Workspace
                  </button>

                  <button
                    type="button"
                    className={`orb-tab-btn ${activeTab === "chat" ? "active" : ""}`}
                    onClick={() => setActiveTab("chat")}
                  >
                    💬 Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Independently Scrollable Coding/Chat Content Area */}
        <div className="interview-right-panel" ref={workspaceScrollRef}>
          {/* 1. Main Question Header Card */}
          <div className="chat-head card" style={{ padding: "18px 22px", borderRadius: "16px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px" }}>
              <div>
                <span className="eyebrow" style={{ color: "#8d9cff" }}>{activeRound.title.toUpperCase()}</span>
                <h2 style={{ fontSize: "18px", marginTop: "4px", lineHeight: "1.4" }}>{p.currentQuestion}</h2>
              </div>

              {isCodingRound && (
                <span className="readiness-pill ready" style={{ whiteSpace: "nowrap" }}>
                  💻 Coding Challenge
                </span>
              )}
            </div>
          </div>

          {/* 2. VIEW TAB 1: CONVERSATION CHAT */}
          {activeTab === "chat" && (
            <div className="chat card" style={{ minHeight: "420px", display: "flex", flexDirection: "column" }}>
              <div className="transcript" ref={p.transcriptRef} style={{ flex: 1, maxHeight: "380px" }}>
                {p.transcript.map((x, i) => (
                  <div className={x.type === "User" ? "bubble user" : "bubble"} key={i}>
                    <b>{x.type === "User" ? "You" : "AI Interviewer"}</b>
                    <span style={{ whiteSpace: "pre-wrap" }}>{x.content}</span>
                  </div>
                ))}
              </div>

              <div className="composer">
                <textarea
                  value={p.answer}
                  onChange={(e) => p.setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      p.submitAnswer();
                    }
                  }}
                  placeholder="Type your technical answer or use the microphone above…"
                />
                <button className="send" onClick={() => p.submitAnswer()}>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* 2. VIEW TAB 2: INTERACTIVE CODING WORKSPACE */}
          {activeTab === "code" && (
            <div className="coding-workspace" style={{ margin: 0 }}>
              <div className="coding-header">
                <div className="coding-title">
                  <Code2 size={18} style={{ color: "#38bdf8" }} />
                  <span>Interactive Algorithmic Code Editor</span>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    style={{
                      background: "#090d16",
                      color: "#93c5fd",
                      border: "1px solid #2b364e",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="sql">SQL</option>
                    <option value="cpp">C++</option>
                    <option value="bash">Bash / Shell</option>
                  </select>
                </div>
              </div>

              {/* Code Textarea Editor (Blank Black Area for Candidate to write from scratch) */}
              <div className="code-editor-area">
                <textarea
                  className="code-textarea"
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder={`// Write your complete solution from scratch in ${codeLang}...\n// (Declare your functions, classes, and logic here)`}
                  rows={13}
                  spellCheck="false"
                />
              </div>

              {/* Editor Bottom Actions */}
              <div className="code-controls">
                <div style={{ fontSize: "12px", color: "#8f98aa" }}>
                  Language: <strong style={{ color: "#fff" }}>{codeLang}</strong> • Tab indentation enabled
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleAnalyzeCode}
                    disabled={analyzingCode}
                    style={{ gap: "6px", background: "#1a233b", borderColor: "#435384", color: "#c7d2fe" }}
                  >
                    <Sparkles size={14} />
                    <span>{analyzingCode ? "Analyzing Algorithm..." : "⚡ Run & Analyze Code"}</span>
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSubmitCodeAnswer}
                    style={{ background: "#4ade80", color: "#052e16", fontWeight: 800 }}
                  >
                    <span>Submit Solution</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* REAL-TIME ALGORITHMIC ANALYSIS PANEL */}
              {codeAnalysis && (
                <div className="analysis-panel">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222c42", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Activity size={18} style={{ color: codeAnalysis.isCorrect ? "#4ade80" : "#ef4444" }} />
                      <strong style={{ fontSize: "16px", color: "#fff" }}>AI Algorithmic Code Evaluation</strong>
                    </div>

                    <span
                      className="readiness-pill"
                      style={{
                        background: codeAnalysis.isCorrect ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: codeAnalysis.isCorrect ? "#4ade80" : "#f87171",
                        borderColor: codeAnalysis.isCorrect ? "rgba(74, 222, 128, 0.3)" : "rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      {codeAnalysis.correctness || (codeAnalysis.isCorrect ? "✓ Correct Solution" : "❌ Incorrect / Invalid Syntax")}
                    </span>
                  </div>

                  {/* 4 Quick Stat Cards */}
                  <div className="analysis-grid">
                    <div className="analysis-card">
                      <span className="analysis-card-label">⚡ Detected Approach</span>
                      <span className="analysis-card-val" style={{ color: codeAnalysis.isCorrect ? "#a5b4fc" : "#ef4444" }}>
                        {codeAnalysis.detectedApproach || "None"}
                      </span>
                    </div>

                    <div className="analysis-card">
                      <span className="analysis-card-label">⏱ Time Complexity</span>
                      <span className="analysis-card-val" style={{ color: codeAnalysis.isCorrect ? "#38bdf8" : "#94a3b8" }}>
                        {codeAnalysis.timeComplexity || "N/A"}
                      </span>
                    </div>

                    <div className="analysis-card">
                      <span className="analysis-card-label">💾 Space Complexity</span>
                      <span className="analysis-card-val" style={{ color: codeAnalysis.isCorrect ? "#fbbf24" : "#94a3b8" }}>
                        {codeAnalysis.spaceComplexity || "N/A"}
                      </span>
                    </div>

                    <div className="analysis-card">
                      <span className="analysis-card-label">🧹 Code Quality</span>
                      <span className="analysis-card-val" style={{ color: (codeAnalysis.codeQuality?.score || 0) >= 6 ? "#4ade80" : "#ef4444" }}>
                        {codeAnalysis.codeQuality?.score !== undefined ? `${codeAnalysis.codeQuality.score}/10` : "0/10"}
                      </span>
                    </div>
                  </div>

                  {/* Algorithmic Hint Card */}
                  {codeAnalysis.algorithmicHint && (
                    <div style={{ marginTop: "14px", padding: "14px 18px", background: "rgba(56, 189, 248, 0.08)", borderRadius: "12px", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                      <strong style={{ color: "#38bdf8", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                        <Sparkles size={14} />
                        Algorithmic Guidance & Hint:
                      </strong>
                      <p style={{ margin: "6px 0 0", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.5" }}>
                        {codeAnalysis.algorithmicHint}
                      </p>
                    </div>
                  )}

                  {/* Brute Force Comparison Box */}
                  {codeAnalysis.bruteForce && (
                    <div className="brute-compare-box">
                      <strong style={{ color: "#e2e8f0", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <TrendingUp size={15} style={{ color: "#38bdf8" }} />
                        Algorithmic Comparison & Optimization
                      </strong>
                      <p style={{ margin: "6px 0 10px", fontSize: "13px", color: "#cbd5e1" }}>
                        {codeAnalysis.bruteForce.candidateVsBruteForce}
                      </p>

                      <div className="brute-compare-grid">
                        <div className="compare-item">
                          <strong>🐢 Brute Force Approach:</strong>
                          <span>{codeAnalysis.bruteForce.approach} ({codeAnalysis.bruteForce.timeComplexity})</span>
                        </div>
                        <div className="compare-item">
                          <strong>🚀 Optimal Target Approach:</strong>
                          <span>{codeAnalysis.bruteForce.optimalApproach} ({codeAnalysis.bruteForce.optimalTimeComplexity})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {codeAnalysis.improvements?.length > 0 && (
                    <div style={{ margin: "16px 0" }}>
                      <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#f59e0b" }}>💡 Improvement Recommendations:</h4>
                      <ul style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>
                        {codeAnalysis.improvements.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Result({ result, transcript, restart }) {
  const score = Math.round(result?.score || 0);
  const readiness = result?.readinessLevel || (score >= 75 ? "Strong Candidate" : score >= 60 ? "Interview Ready" : score >= 40 ? "Improving" : "Beginner");

  const categories = result?.categoryScores || {
    behavioral: 8,
    project: 8,
    technical: 9,
    coding: 8,
    communication: 8,
  };

  const skillScores = result?.skillScores || {};
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <main className="page" style={{ maxWidth: "1080px" }}>
      <div
        className="brand"
        onClick={restart}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            restart();
          }
        }}
        title="Return to Home Dashboard"
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <div className="logo">
          <Sparkles size={20} />
        </div>
        <span>SDEPrepAI Interviewer</span>
      </div>

      <section className="result-hero" style={{ padding: "40px 0 25px" }}>
        <span className="eyebrow" style={{ color: "#8d9cff" }}>OFFICIAL EVALUATION SCORECARD</span>
        <h1 style={{ margin: "10px 0 16px" }}>Technical Interview Scorecard</h1>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", margin: "20px 0" }}>
          <div className="score" style={{ margin: 0, color: score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171" }}>
            {score}
            <small>/100</small>
          </div>

          <div style={{ textAlign: "left" }}>
            <span className={`readiness-pill ${score >= 75 ? "strong" : score >= 60 ? "ready" : score >= 40 ? "improving" : "beginner"}`}>
              {readiness}
            </span>
            <div style={{ fontSize: "12px", color: "#8f98aa", marginTop: "4px" }}>Evaluation calibrated across 5 rounds</div>
          </div>
        </div>

        <p style={{ maxWidth: "750px", fontSize: "15px", lineHeight: "1.6" }}>{result?.summary}</p>
      </section>

      {/* 5-Category Scores */}
      <div className="scorecard-categories">
        {[
          ["Behavioral & Culture", categories.behavioral || 8, "👋"],
          ["Project Architecture", categories.project || 8, "📂"],
          ["Technical Depth", categories.technical || 9, "⚡"],
          ["Coding & DSA", categories.coding || 8, "💻"],
          ["Communication", categories.communication || 8, "🗣️"],
        ].map(([title, val, icon]) => (
          <div className="category-score-card" key={title}>
            <div style={{ fontSize: "20px" }}>{icon}</div>
            <div className="category-score-val" style={{ color: val >= 8 ? "#4ade80" : val >= 6 ? "#60a5fa" : "#facc15" }}>
              {val} <small style={{ fontSize: "13px", color: "#8f98aa" }}>/10</small>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{title}</div>
          </div>
        ))}
      </div>

      {/* Skill-by-Skill Breakdown */}
      {Object.keys(skillScores).length > 0 && (
        <div className="card" style={{ padding: "24px", borderRadius: "18px", margin: "24px 0" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} style={{ color: "#8d9cff" }} />
            Domain Skill-by-Skill Performance Breakdown
          </h3>

          <div className="skill-breakdown-grid">
            {Object.entries(skillScores).map(([sk, val]) => (
              <div className="section-score-bar" key={sk}>
                <span className="section-score-name" style={{ width: "170px" }}>{sk}</span>
                <div className="section-score-track">
                  <div
                    className="section-score-fill"
                    style={{
                      width: `${(val / 10) * 100}%`,
                      background: val >= 8 ? "linear-gradient(90deg, #22c55e, #4ade80)" : val >= 6 ? "linear-gradient(90deg, #3b82f6, #60a5fa)" : "linear-gradient(90deg, #f59e0b, #facc15)",
                    }}
                  />
                </div>
                <span className="section-score-num" style={{ color: val >= 8 ? "#4ade80" : val >= 6 ? "#60a5fa" : "#facc15" }}>
                  {val}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="result-grid">
        <div className="card">
          <h3 style={{ color: "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>✓ Demonstrated Strengths</h3>
          {(result?.strengths || ["Solid technical fundamentals", "Clear communication"]).map((x, i) => (
            <div className="item" key={i}>
              ✓ {x}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "6px" }}>⚠️ Areas to Improve</h3>
          {(result?.weaknesses || ["Handle edge cases in coding", "Provide deeper architectural trade-offs"]).map((x, i) => (
            <div className="item" key={i}>
              • {x}
            </div>
          ))}
        </div>

        {/* Action Plan & Study Roadmap */}
        <div className="card wide-card">
          <h3>🎯 Personalized Action Plan & Recommended Study Roadmap</h3>
          {(result?.improvements || ["Practice algorithmic problems under time constraints", "Review internal engine mechanics"]).map((x, i) => (
            <div className="item" key={i}>
              <strong>Step {i + 1}:</strong> {x}
            </div>
          ))}

          {result?.studyTopics?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "12px", color: "#8d9cff", fontWeight: 700, textTransform: "uppercase" }}>Recommended Study Topics:</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {result.studyTopics.map((top, i) => (
                  <span key={i} style={{ background: "#1b233a", border: "1px solid #303c62", color: "#c7d2fe", padding: "6px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 600 }}>
                    📖 {top}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Drawer */}
      <div className="card" style={{ padding: "20px", borderRadius: "18px", marginTop: "24px" }}>
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          style={{
            background: "none",
            border: 0,
            color: "#e2e8f0",
            fontWeight: 700,
            fontSize: "15px",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>💬 Inspect Full Interview Transcript ({transcript.length} exchanges)</span>
          <span>{showTranscript ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showTranscript && (
          <div style={{ maxHeight: "350px", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px", padding: "10px", background: "#0a0d14", borderRadius: "12px" }}>
            {transcript.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: t.type === "User" ? "#1e273d" : "#12151e",
                  border: `1px solid ${t.type === "User" ? "#2d3b5e" : "#1f2533"}`,
                  alignSelf: t.type === "User" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <small style={{ fontWeight: 800, color: t.type === "User" ? "#93c5fd" : "#a855f7", display: "block", marginBottom: "4px" }}>
                  {t.type === "User" ? "Candidate (You)" : "AI Technical Interviewer"}
                </small>
                <span style={{ fontSize: "13px", color: "#e2e8f0", whiteSpace: "pre-wrap" }}>{t.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "30px" }}>
        <button className="primary" onClick={restart}>
          <RotateCcw size={18} />
          Start Another Mock Interview
        </button>
      </div>
    </main>
  );
}

function AppShell({ active, onNav, candidateName, candidateEmail, onLogout, theme, onToggleTheme, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "setup", label: "Practice", icon: "🎯" },
    { key: "explore", label: "Explore Interviews", icon: "📚" },
    { key: "analytics", label: "Analytics", icon: "📈" },
    { key: "history", label: "History", icon: "📊" },
    { key: "settings", label: "Settings", icon: "⚙️" }
  ];

  const handleNav = (key) => {
    setMobileMenuOpen(false);
    if (onNav) onNav(key);
  };

  return (
    <div className="app-shell">
      {/* Mobile Navigation Backdrop */}
      <div 
        className={`mobile-nav-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <aside className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <div className="brand" onClick={() => handleNav("dashboard")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="logo">
              <Sparkles size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "16px" }}>SDEPrepAI</span>
          </div>
          <button 
            type="button" 
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mobile-drawer-links">
          {navItems.map(i => (
            <button
              key={i.key}
              className={active === i.key ? "nav-item active" : "nav-item"}
              onClick={() => handleNav(i.key)}
              style={{ width: "100%", justifyContent: "flex-start", padding: "12px 14px", borderRadius: "10px" }}
            >
              <span style={{ fontSize: "18px" }}>{i.icon}</span> 
              <span>{i.label}</span>
            </button>
          ))}
        </nav>

        <div className="mobile-drawer-user">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#111520", borderRadius: "10px", border: "1px solid #1f273b" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>
              {(candidateEmail || candidateName || "C").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {candidateName || "Candidate"}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {candidateEmail || "candidate@sdeprepai.com"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                style={{
                  flex: 1,
                  background: "#141926",
                  border: "1px solid #28334a",
                  color: "inherit",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600
                }}
              >
                {theme === "light" ? <Moon size={14} style={{ color: "#6366f1" }} /> : <Sun size={14} style={{ color: "#fbbf24" }} />}
                <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              </button>
            )}

            <button
              onClick={() => { setMobileMenuOpen(false); onLogout(); }}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "9px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Top Header */}
      <header
        className="shell-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            title="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div
            className="brand"
            onClick={() => handleNav("dashboard")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNav("dashboard");
              }
            }}
            title="Return to Home Dashboard"
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <div className="logo">
              <Sparkles size={18} />
            </div>
            <span>SDEPrepAI Interviewer</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              style={{
                background: "transparent",
                border: "1px solid var(--border-color, #2b354d)",
                color: "inherit",
                padding: "6px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12.5px",
                fontWeight: 600
              }}
            >
              {theme === "light" ? <Moon size={14} style={{ color: "#6366f1" }} /> : <Sun size={14} style={{ color: "#fbbf24" }} />}
              <span style={{ display: "inline-block" }}>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
          )}

          <div className="user-chip">
            👤 {candidateEmail || candidateName || "Candidate"}
          </div>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "12.5px",
              whiteSpace: "nowrap"
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Desktop Shell Body */}
      <div className="shell-body">
        <nav className="sidebar">
          {navItems.map(i => (
            <button
              key={i.key}
              className={active === i.key ? "nav-item active" : "nav-item"}
              onClick={() => onNav(i.key)}
            >
              <span>{i.icon}</span> {i.label}
            </button>
          ))}
        </nav>

        <main className="shell-content">{children}</main>
      </div>

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {[
          { key: "dashboard", label: "Dashboard", icon: "🏠" },
          { key: "setup", label: "Practice", icon: "🎯" },
          { key: "explore", label: "Explore", icon: "📚" },
          { key: "analytics", label: "Analytics", icon: "📈" },
          { key: "settings", label: "Settings", icon: "⚙️" }
        ].map(item => (
          <button
            key={item.key}
            type="button"
            className={`mobile-bottom-btn ${active === item.key ? "active" : ""}`}
            onClick={() => handleNav(item.key)}
          >
            <span style={{ fontSize: "16px" }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const DOMAIN_GRID_ITEMS = [
  {
    id: "python",
    title: "Python",
    desc: "Master Python concepts",
    role: "Python Developer",
    domain: "python",
    icon: (
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#172554", display: "grid", placeItems: "center", fontSize: 16 }}>
        🐍
      </div>
    ),
  },
  {
    id: "nodejs",
    title: "Node.js",
    desc: "Backend & API interviews",
    role: "Node.js Developer",
    domain: "backend",
    icon: (
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#052e16", display: "grid", placeItems: "center", color: "#4ade80", fontSize: 13, fontWeight: 800, border: "1px solid #166534" }}>
        JS
      </div>
    ),
  },
  {
    id: "aiml",
    title: "AI/ML",
    desc: "Machine Learning interviews",
    role: "AI / ML Engineer",
    domain: "ai",
    icon: (
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#3b0764", display: "grid", placeItems: "center", color: "#c084fc", border: "1px solid #6b21a8" }}>
        <BrainCircuit size={17} />
      </div>
    ),
  },
  {
    id: "data",
    title: "Data",
    desc: "Data Science & Analytics",
    role: "Data Engineer",
    domain: "data",
    icon: (
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#451a03", display: "grid", placeItems: "center", color: "#fbbf24", border: "1px solid #854d0e" }}>
        <Database size={17} />
      </div>
    ),
  },
  {
    id: "cloud",
    title: "Cloud",
    desc: "AWS, Azure & Cloud Concepts",
    role: "Cloud DevOps Engineer",
    domain: "cloud",
    icon: (
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#083344", display: "grid", placeItems: "center", color: "#22d3ee", border: "1px solid #155e75" }}>
        <Cloud size={17} />
      </div>
    ),
  },
  {
    id: "security",
    title: "Cybersecurity",
    desc: "Security & Ethical Hacking",
    role: "Cybersecurity Analyst",
    domain: "security",
    icon: (
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#450a0a", display: "grid", placeItems: "center", color: "#f87171", border: "1px solid #991b1b" }}>
        <ShieldCheck size={17} />
      </div>
    ),
  },
];

function Dashboard({ dashboard, candidateName, candidateEmail, goPractice, goExplore, goAnalytics, onSelectDomain }) {
  return (
    <>
      <h1>Welcome back, {candidateName || "there"} 👋</h1>
      <p className="muted">
        Practice role-specific interviews, track your progress, and build confidence across technical domains.
      </p>

      {/* UNIFIED INTERACTIVE PREP CONSOLE & STATS BAR */}
      <div className="dashboard-prep-console">
        {/* LEFT COLUMN: TITLE & INTRO */}
        <div className="prep-intro-col">
          <div className="target-icon-wrap">
            <Target size={24} />
          </div>

          <div>
            <span className="eyebrow" style={{ color: "#818cf8", fontSize: "11px", fontWeight: 800 }}>
              PERSONALISED INTERVIEW PREP
            </span>
            <h2 style={{ fontSize: "21px", fontWeight: 800, color: "#fff", margin: "6px 0 8px", lineHeight: "1.25" }}>
              Find the right interview for your goal.
            </h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
              Choose a domain to start a structured mock interview and improve your skills.
            </p>
          </div>
        </div>

        {/* MIDDLE COLUMN: 2x3 DOMAIN SHORTCUT CARDS */}
        <div className="domain-grid">
          {DOMAIN_GRID_ITEMS.map((item) => (
            <div
              key={item.id}
              className="domain-shortcut-card"
              onClick={() => onSelectDomain ? onSelectDomain(item.domain, item.role, item.desc) : goPractice()}
            >
              <div className="domain-badge-icon">
                {item.icon}
              </div>

              <div className="domain-text-wrap">
                <div className="domain-title">
                  {item.title}
                </div>
                <div className="domain-desc">
                  {item.desc}
                </div>
              </div>

              <ChevronRight size={15} className="domain-chevron" />
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: 3 COMPACT VERTICAL STAT METRICS */}
        <div className="stats-col">
          {/* Interviews */}
          <div
            className="stat-row-item"
            onClick={goAnalytics}
            title="View interview sessions in analytics"
          >
            <div className="stat-icon-badge icon-blue">
              <Users size={16} />
            </div>
            <div>
              <div className="stat-num">{dashboard.count}</div>
              <div className="stat-lbl">Interviews</div>
            </div>
          </div>

          {/* Avg Score */}
          <div
            className="stat-row-item stat-item-divider"
            onClick={goAnalytics}
            title="View average score in analytics"
          >
            <div className="stat-icon-badge icon-green">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="stat-num">{dashboard.avg}</div>
              <div className="stat-lbl">Avg. Score</div>
            </div>
          </div>

          {/* Best Score */}
          <div
            className="stat-row-item stat-item-divider"
            onClick={goAnalytics}
            title="View best score in analytics"
          >
            <div className="stat-icon-badge icon-purple">
              <Trophy size={16} />
            </div>
            <div>
              <div className="stat-num">{dashboard.best}</div>
              <div className="stat-lbl">Best Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT ACTIVITY STREAK & CONTRIBUTION HEATMAP */}
      <ActivityHeatmap candidateEmail={candidateEmail} onStartPractice={goPractice} />

      <div className="section-heading-inline" style={{ marginTop: 28 }}>
        <div>
          <h2>Recent Interviews</h2>
          <p className="muted">Your latest practice sessions and scores.</p>
        </div>
        {goAnalytics && (
          <button
            onClick={goAnalytics}
            style={{ background: "none", border: 0, color: "#8d9cff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
          >
            Full Analytics Dashboard →
          </button>
        )}
      </div>

      <div className="recent-list">
        {dashboard.recent.length === 0 && (
          <div className="recent-row">
            <span className="muted">No interviews yet — start your first one!</span>
          </div>
        )}

        {dashboard.recent.map(r => (
          <div className="recent-row" key={r.id}>
            <span>{r.role}</span>
            <span>{r.score != null ? `${Math.round(r.score)}/100` : r.status}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="primary" onClick={goPractice}>
          Start Interview <ArrowRight size={18} />
        </button>
        {goAnalytics && (
          <button
            className="primary"
            onClick={goAnalytics}
            style={{ background: "#161b26", color: "#dbe0ea", border: "1px solid #2d3648" }}
          >
            Open Analytics 📈
          </button>
        )}
      </div>
    </>
  );
}

const INTERVIEW_CATALOG = [
  { id: "react", domain: "Software Engineering", domainKey: "software", role: "Frontend Developer", title: "React Frontend Interview", duration: 35, difficulty: "Medium", skills: ["React", "JavaScript", "CSS", "Hooks"], description: "React components, state management, hooks, DOM optimization and modern frontend architecture.", icon: Code2, featured: true, color: "#61dafb" },
  { id: "py", domain: "Software Engineering", domainKey: "software", role: "Python Developer", title: "Python Software Engineer", duration: 30, difficulty: "Easy", skills: ["Python", "OOP", "APIs", "Data Structures"], description: "Python core, object-oriented design, REST APIs, generators and practical problem solving.", icon: Code2, featured: true, color: "#38bdf8" },
  { id: "node", domain: "Software Engineering", domainKey: "software", role: "Node.js Developer", title: "Node.js Backend Developer", duration: 30, difficulty: "Medium", skills: ["Node.js", "Express", "REST", "Async/Await"], description: "Asynchronous I/O, Express microservices, RESTful design, event loops and database integration.", icon: Code2, color: "#4ade80" },
  { id: "java", domain: "Software Engineering", domainKey: "software", role: "Java Developer", title: "Java & Spring Boot Engineer", duration: 40, difficulty: "Medium", skills: ["Java", "Spring Boot", "SQL", "Microservices"], description: "Java backend patterns, Spring Boot APIs, multithreading, Hibernate and transactional data.", icon: Code2, featured: true, color: "#fb923c" },
  { id: "ai", domain: "AI / Machine Learning", domainKey: "ai", role: "AI Engineer", title: "AI & Generative AI Specialist", duration: 45, difficulty: "Hard", skills: ["PyTorch", "LLMs", "RAG", "Transformers"], description: "Foundation models, LangChain, RAG architectures, prompt engineering and production AI deployment.", icon: BrainCircuit, featured: true, color: "#a855f7" },
  { id: "data", domain: "Data Science", domainKey: "data", role: "Data Scientist", title: "Data Science & Analytics", duration: 40, difficulty: "Medium", skills: ["Python", "SQL", "Statistics", "Pandas"], description: "Statistical inference, exploratory data analysis, regression, classification and feature engineering.", icon: Database, featured: true, color: "#facc15" },
  { id: "sql", domain: "Data Science", domainKey: "data", role: "SQL Developer", title: "SQL & Query Optimization", duration: 30, difficulty: "Easy", skills: ["SQL", "Joins", "Window Functions", "Indexing"], description: "Complex SQL querying, schema normalization, execution plans, CTEs and analytical window functions.", icon: Database, color: "#38bdf8" },
  { id: "devops", domain: "Cloud & DevOps", domainKey: "cloud", role: "DevOps Engineer", title: "DevOps & Cloud Architect", duration: 45, difficulty: "Hard", skills: ["AWS", "Docker", "Kubernetes", "CI/CD"], description: "Container orchestration, Terraform infrastructure as code, CI/CD pipelines and high availability.", icon: Cloud, featured: true, color: "#60a5fa" },
  { id: "security", domain: "Cybersecurity", domainKey: "security", role: "Security Engineer", title: "Cybersecurity & AppSec", duration: 40, difficulty: "Hard", skills: ["OWASP", "Threat Modeling", "IAM", "Auth"], description: "Web vulnerabilities, penetration testing concepts, cryptography, OAuth2 and threat mitigation.", icon: ShieldCheck, color: "#f87171" },
  { id: "mobile", domain: "Mobile Development", domainKey: "mobile", role: "Mobile Developer", title: "React Native Mobile Dev", duration: 35, difficulty: "Medium", skills: ["React Native", "iOS", "Android", "State"], description: "Cross-platform mobile architecture, native bridges, animations and offline persistence.", icon: Smartphone, color: "#818cf8" },
  { id: "product", domain: "Product / Strategy", domainKey: "product", role: "Product Manager", title: "Technical Product Manager", duration: 35, difficulty: "Medium", skills: ["Product Strategy", "Metrics", "System Design"], description: "Product discovery, user journeys, KPI definitions, trade-off analysis and technical roadmapping.", icon: Palette, color: "#ec4899" }
];

const DOMAIN_FILTERS = [
  ["all", "All Domains"],
  ["software", "Programming"],
  ["ai", "AI / ML"],
  ["data", "Data Science"],
  ["cloud", "DevOps & Cloud"],
  ["security", "Cybersecurity"],
  ["mobile", "Mobile"],
  ["product", "Product"]
];

const SKILLS_LIST = [
  "All Skills",
  "React",
  "Python",
  "Node.js",
  "Java",
  "SQL",
  "JavaScript",
  "PyTorch",
  "LLMs",
  "AWS",
  "Docker",
  "Kubernetes",
  "Spring Boot",
  "Statistics",
  "OWASP",
  "System Design"
];

function PracticeCatalog({ onStart, dashboard, onGoAnalytics }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [skill, setSkill] = useState("All Skills");
  const [difficulty, setDifficulty] = useState("all");
  const [sort, setSort] = useState("recommended");

  const filtered = INTERVIEW_CATALOG
    .filter(x => domain === "all" || x.domainKey === domain)
    .filter(x => difficulty === "all" || x.difficulty === difficulty)
    .filter(x => skill === "All Skills" || x.skills.includes(skill))
    .filter(x => `${x.title} ${x.role} ${x.domain} ${x.skills.join(" ")} ${x.description}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "duration-short") return a.duration - b.duration;
      if (sort === "duration-long") return b.duration - a.duration;
      if (sort === "diff-easy") return ["Easy", "Medium", "Hard"].indexOf(a.difficulty) - ["Easy", "Medium", "Hard"].indexOf(b.difficulty);
      if (sort === "diff-hard") return ["Hard", "Medium", "Easy"].indexOf(a.difficulty) - ["Hard", "Medium", "Easy"].indexOf(b.difficulty);
      return Number(b.featured) - Number(a.featured);
    });

  // HackerEarth style community leaderboard data
  const leaderboardList = [
    { rank: 1, name: "Ashutosh Singh", score: 98, role: "AI & Generative AI Specialist", badge: "🥇" },
    { rank: 2, name: "Hardik Patel", score: 96, role: "React Frontend Interview", badge: "🥈" },
    { rank: 3, name: "Aryan Verma", score: 94, role: "DevOps & Cloud Architect", badge: "🥉" },
    { rank: 4, name: "Abhinav Kumar", score: 92, role: "Java & Spring Boot Engineer", badge: "4" },
    { rank: 5, name: "Aman Gupta", score: 90, role: "Python Software Engineer", badge: "5" },
    { rank: 6, name: "Priya Sharma", score: 88, role: "Data Science & Analytics", badge: "6" }
  ];

  return (
    <div className="he-ai-interviews-page">
      {/* Top Header Title */}
      <div className="he-page-header">
        <div className="he-title-row">
          <h1 className="he-main-title">AI Interviews</h1>
          <div className="he-title-divider" />
          <span className="he-sub-description">Practice with AI-powered mock interviews</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="he-layout-container">
        {/* Left / Main Section */}
        <div className="he-main-content">
          <div className="he-section-header">
            <h2 className="he-section-title">More Interview Prep</h2>
          </div>

          {/* Controls Bar: Search, Skills, Difficulty, Sort */}
          <div className="he-control-bar">
            <div className="he-filters-left">
              {/* Search Bar */}
              <div className="he-search-box">
                <Search size={15} className="he-search-icon" />
                <input
                  type="text"
                  placeholder="Search interviews, roles or skills..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="he-search-input"
                />
                {query && (
                  <button className="he-search-clear" onClick={() => setQuery("")}>×</button>
                )}
              </div>

              {/* Skills Dropdown */}
              <div className="he-dropdown-wrapper">
                <SlidersHorizontal size={14} className="he-dropdown-icon" />
                <select
                  value={skill}
                  onChange={e => setSkill(e.target.value)}
                  className="he-select"
                >
                  {SKILLS_LIST.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Dropdown */}
              <div className="he-dropdown-wrapper">
                <Star size={14} className="he-dropdown-icon" />
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="he-select"
                >
                  <option value="all">All Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="he-sort-wrapper">
              <ChevronDown size={14} className="he-dropdown-icon" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="he-select he-sort-select"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="duration-short">Shortest First</option>
                <option value="duration-long">Longest First</option>
                <option value="diff-easy">Easy to Hard</option>
                <option value="diff-hard">Hard to Easy</option>
              </select>
            </div>
          </div>

          {/* Domain Pills */}
          <div className="he-domain-tabs">
            {DOMAIN_FILTERS.map(([key, label]) => (
              <button
                key={key}
                className={`he-domain-tab ${domain === key ? "active" : ""}`}
                onClick={() => setDomain(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Track Count Indicator */}
          <div className="he-results-counter">
            <span>Showing <strong>{filtered.length}</strong> available interviews</span>
          </div>

          {/* 3-Column Card Grid */}
          <div className="he-cards-grid">
            {filtered.map(item => {
              const Icon = item.icon;
              return (
                <div className="he-interview-card" key={item.id}>
                  {/* Card Cover Banner */}
                  <div
                    className="he-card-banner"
                    style={{
                      background: `radial-gradient(circle at 75% 20%, ${item.color}22 0%, #10141f 70%)`,
                      borderBottom: `1px solid #1e2433`
                    }}
                  >
                    <div className="he-card-icon-wrap" style={{ color: item.color || "#8d9cff" }}>
                      <Icon size={34} />
                    </div>
                    <span className="he-banner-tag">AI Mock Interview</span>
                    {item.featured && (
                      <span className="he-featured-tag">
                        <Star size={11} fill="#facc15" color="#facc15" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="he-card-body">
                    <div className="he-card-domain-label">{item.domain}</div>
                    <h3 className="he-card-title">{item.title}</h3>
                    <p className="he-card-desc">{item.description}</p>

                    {/* Meta info: duration & difficulty */}
                    <div className="he-card-meta-row">
                      <span className="he-meta-item">
                        <Clock size={13} /> {item.duration} mins
                      </span>
                      <span className={`he-difficulty-tag ${item.difficulty.toLowerCase()}`}>
                        <span className="he-diff-dot" />
                        {item.difficulty}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="he-card-skills-row">
                      {item.skills.slice(0, 3).map(s => (
                        <span className="he-skill-pill" key={s}>{s}</span>
                      ))}
                      {item.skills.length > 3 && (
                        <span className="he-skill-pill more">+{item.skills.length - 3}</span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      className="he-start-btn"
                      onClick={() => onStart(item)}
                    >
                      <span>Start Interview</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="he-empty-catalog">
              <BookOpen size={36} className="muted" />
              <h3>No matching interview tracks found</h3>
              <p className="muted">Try adjusting your search query, skill tags or difficulty filters.</p>
              <button
                className="secondary-btn"
                onClick={() => { setQuery(""); setDomain("all"); setSkill("All Skills"); setDifficulty("all"); }}
                style={{ marginTop: 12 }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: HackerEarth Style Leaderboard & Status */}
        <div className="he-sidebar-column">
          {/* Leaderboard Card */}
          <div className="he-sidebar-card">
            <div className="he-sidebar-card-header">
              <div className="he-sidebar-header-title">
                <Award size={18} style={{ color: "#facc15" }} />
                <h3>Leaderboard</h3>
              </div>
              <span className="he-sidebar-tag">Top Scores</span>
            </div>

            <div className="he-leaderboard-list">
              {leaderboardList.map(u => (
                <div className="he-leaderboard-item" key={u.rank}>
                  <div className="he-leaderboard-rank">
                    <span>{u.badge}</span>
                  </div>
                  <div className="he-leaderboard-info">
                    <strong>{u.name}</strong>
                    <small>{u.role}</small>
                  </div>
                  <div className="he-leaderboard-score">
                    <strong>{u.score}</strong>
                    <small>/100</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Practice Status */}
          {dashboard && (
            <div className="he-sidebar-card prep-status-card">
              <div className="he-sidebar-card-header">
                <div className="he-sidebar-header-title">
                  <Activity size={18} style={{ color: "#8d9cff" }} />
                  <h3>Your Prep Status</h3>
                </div>
              </div>

              <div className="he-status-stats">
                <div className="he-status-stat">
                  <small>Completed</small>
                  <strong>{dashboard.count || 0}</strong>
                </div>
                <div className="he-status-stat">
                  <small>Avg Score</small>
                  <strong>{dashboard.avg || 0}/100</strong>
                </div>
                <div className="he-status-stat">
                  <small>Best Score</small>
                  <strong>{dashboard.best || 0}/100</strong>
                </div>
              </div>

              {onGoAnalytics && (
                <button className="he-analytics-btn" onClick={onGoAnalytics}>
                  View Full Analytics 📈
                </button>
              )}
            </div>
          )}

          {/* Feature Highlights */}
          <div className="he-sidebar-card features-card">
            <div className="he-sidebar-card-header">
              <div className="he-sidebar-header-title">
                <Sparkles size={18} style={{ color: "#a855f7" }} />
                <h3>Why Practice Here?</h3>
              </div>
            </div>

            <div className="he-feature-bullets">
              <div className="he-feature-bullet">
                <CheckCircle2 size={15} style={{ color: "#4ade80", flexShrink: 0 }} />
                <span><strong>Instant Scoring:</strong> Detailed AI rubric evaluating accuracy & depth.</span>
              </div>
              <div className="he-feature-bullet">
                <CheckCircle2 size={15} style={{ color: "#4ade80", flexShrink: 0 }} />
                <span><strong>Speech & Cam:</strong> Practice voice answers in real interview pressure.</span>
              </div>
              <div className="he-feature-bullet">
                <CheckCircle2 size={15} style={{ color: "#4ade80", flexShrink: 0 }} />
                <span><strong>12 Strict Questions:</strong> Tailored DSA, system design & behavioural questions.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function History({ all }) {
  return (
    <>
      <h1>Interview History</h1>
      <div className="recent-list">
        {all.length === 0 && (
          <div className="recent-row">
            <span className="muted">No interviews yet.</span>
          </div>
        )}

        {all.map(r => (
          <div className="recent-row" key={r.id}>
            <span>
              {r.role} <span className="muted">({r.difficulty})</span>
            </span>
            <span>
              {r.score != null ? `${Math.round(r.score)}/100` : r.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function Settings({ theme = "dark", setTheme, onHistoryCleared }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleClearHistory = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all past interview scorecards? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch(`${API}/api/v1/interviews/clear`, {
        method: "DELETE",
        ...staffAuth()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      setStatusMsg("Interview history successfully cleared!");

      if (onHistoryCleared) {
        onHistoryCleared();
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h1>Settings</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Customize your appearance, data, and platform preferences.
      </p>

      {/* APPEARANCE SECTION */}
      <div className="card" style={{ padding: 24, borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Palette size={20} style={{ color: "#818cf8" }} />
          <h3 style={{ margin: 0, fontSize: 18 }}>Appearance & Theme</h3>
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
          Choose your preferred interface theme. Switch between dark and light background anytime.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <button
            type="button"
            onClick={() => setTheme && setTheme("dark")}
            className={`theme-chooser-card ${theme === "dark" ? "active" : ""}`}
            style={{
              padding: 16,
              borderRadius: 14,
              border: theme === "dark" ? "2px solid #818cf8" : "1px solid #2d3648",
              background: theme === "dark" ? "rgba(129, 140, 248, 0.15)" : "transparent",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Moon size={18} style={{ color: "#818cf8" }} />
                <strong style={{ fontSize: 15 }}>Dark Theme</strong>
              </div>
              {theme === "dark" && <span style={{ color: "#34d399", fontWeight: "bold" }}>✓ Active</span>}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Sleek dark glassmorphic background optimized for night prep.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme && setTheme("light")}
            className={`theme-chooser-card ${theme === "light" ? "active" : ""}`}
            style={{
              padding: 16,
              borderRadius: 14,
              border: theme === "light" ? "2px solid #818cf8" : "1px solid #2d3648",
              background: theme === "light" ? "rgba(129, 140, 248, 0.15)" : "transparent",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sun size={18} style={{ color: "#fbbf24" }} />
                <strong style={{ fontSize: 15 }}>Light Theme</strong>
              </div>
              {theme === "light" && <span style={{ color: "#34d399", fontWeight: "bold" }}>✓ Active</span>}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Clean, high-contrast light background for daytime sessions.
            </div>
          </button>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div
        className="card"
        style={{
          border: "1px solid #7f1d1d",
          background: "rgba(30, 20, 25, 0.8)",
          padding: 24,
          borderRadius: 16
        }}
      >
        <h3 style={{ color: "#f87171", margin: "0 0 8px" }}>⚠️ Danger Zone</h3>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
          Permanently delete all past mock interview records, scores, and transcripts from the database.
        </p>

        {statusMsg && (
          <div
            style={{
              color: "#4ade80",
              background: "#052e16",
              padding: 10,
              borderRadius: 6,
              marginBottom: 14,
              fontSize: 13
            }}
          >
            {statusMsg}
          </div>
        )}

        <button
          onClick={handleClearHistory}
          disabled={loading}
          style={{
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          {loading ? "Deleting..." : "Clear Interview History"}
        </button>
      </div>
    </div>
  );
}
