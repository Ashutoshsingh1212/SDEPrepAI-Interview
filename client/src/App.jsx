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
  CheckCircle2
} from "lucide-react";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";

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

function CandidateLogin({ onLoginSuccess }) {
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

      onLoginSuccess(data.user);
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
    <div
      style={{
        maxWidth: 380,
        margin: "80px auto",
        padding: 24,
        background: "#1e293b",
        color: "#fff",
        borderRadius: 12,
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}
    >
      <h2 style={{ marginBottom: 8 }}>Candidate Login</h2>

      <p
        style={{
          color: "#94a3b8",
          fontSize: 14,
          marginBottom: 20
        }}
      >
        Sign in using your email OTP to begin your interview
      </p>

      {err && (
        <div
          style={{
            color: "#f87171",
            background: "#450a0a",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13
          }}
        >
          {err}
        </div>
      )}

      {msg && (
        <div
          style={{
            color: "#4ade80",
            background: "#052e16",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13
          }}
        >
          {msg}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={sendOtp}>
          <input
            type="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#fff",
              marginBottom: 14,
              boxSizing: "border-box"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              background: "#6366f1",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              border: "none"
            }}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <p
            style={{
              fontSize: 13,
              color: "#cbd5e1",
              marginBottom: 10
            }}
          >
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
              width: "100%",
              padding: 10,
              textAlign: "center",
              letterSpacing: 6,
              fontSize: 18,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#fff",
              marginBottom: 14,
              boxSizing: "border-box"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              background: "#22c55e",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              marginBottom: 8
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
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Change Email
          </button>
        </form>
      )}
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

  async function submitAnswer() {
    const text = answer.trim();
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

  if (staffUser?.role === "admin") return <AdminDashboard user={staffUser} onLogout={() => { localStorage.removeItem("staff_token"); localStorage.removeItem("staff_user"); setStaffUser(null); }} />;
  if (staffUser?.role === "recruiter") return <RecruiterDashboard onBack={() => { localStorage.removeItem("staff_token"); localStorage.removeItem("staff_user"); setStaffUser(null); }} />;
  if (!candidateUser && (authMode === "candidate" || pendingInterviewId)) return <CandidateLogin onLoginSuccess={u => { setCandidateUser(u.email); if (pendingInterviewId) setAuthMode("candidate"); }} />;
  if (!candidateUser && (authMode === "admin" || authMode === "recruiter")) return <StaffLogin role={authMode} onBack={() => setAuthMode(null)} onSuccess={u => setStaffUser(u)} />;
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
          goPractice={() => setScreen("setup")}
          goExplore={() => setScreen("explore")}
          goAnalytics={() => setScreen("analytics")}
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
        transcriptRef
      }}
    />
  );
}

function Setup({ form, update, start }) {
  return (
    <main className="page">
      <div className="brand">
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

  return (
    <main className="page interview-page">
      <header>
        <div className="brand">
          <div className="logo">
            <Sparkles size={18} />
          </div>
          <span>SDEPrepAI Interviewer</span>
        </div>

        <div className="timer">
          <Clock size={16} />
          {mins}:{secs}
        </div>

        <button className="danger" onClick={p.finish}>
          End interview
        </button>
      </header>

      <div className="progress">
        <div style={{ width: `${p.progress}%` }} />
      </div>

      <section className="interview-layout">
        <div className="orb-card">
          <div className="camera-box">
            {!p.capturedImage ? (
              <>
                <video ref={p.videoRef} autoPlay playsInline muted />
                <div className="camera-label">🔴 Camera • Live</div>
                <button className="capture-btn" onClick={p.capturePhoto}>
                  📷 Capture
                </button>
              </>
            ) : (
              <>
                <img src={p.capturedImage} alt="Captured" className="captured-image" />
                <div className="camera-label">✓ Photo Captured</div>
                <button className="capture-btn" onClick={p.retakePhoto}>
                  🔄 Retake
                </button>
              </>
            )}
          </div>

          <div className="orb">
            <div className="orb-inner">
              <Sparkles size={38} />
            </div>
          </div>

          <h2>SDEPrepAI Interviewer</h2>
          <p>Question {p.qIndex + 1} of {p.interview?.questions?.length || 12}</p>

          <button
            className={p.listening ? "mic active" : "mic"}
            onClick={p.toggleMic}
          >
            {p.listening ? <MicOff /> : <Mic />}
            {p.listening ? "Listening…" : "Speak answer"}
          </button>
        </div>

        <div className="chat card">
          <div className="chat-head">
            <div>
              <span className="eyebrow">LIVE INTERVIEW</span>
              <h2>{p.currentQuestion}</h2>
            </div>
          </div>

          <div className="transcript" ref={p.transcriptRef}>
            {p.transcript.map((x, i) => (
              <div className={x.type === "User" ? "bubble user" : "bubble"} key={i}>
                <b>{x.type === "User" ? "You" : "AI"}</b>
                <span>{x.content}</span>
              </div>
            ))}
          </div>

          <div className="composer">
            <textarea
              value={p.answer}
              onChange={e => p.setAnswer(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  p.submitAnswer();
                }
              }}
              placeholder="Type your answer or use the microphone…"
            />
            <button className="send" onClick={p.submitAnswer}>
              <ArrowRight />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Result({ result, transcript, restart }) {
  return (
    <main className="page">
      <div className="brand">
        <div className="logo">
          <Sparkles size={20} />
        </div>
        <span>SDEPrepAI Interviewer</span>
      </div>

      <section className="result-hero">
        <span className="eyebrow">INTERVIEW COMPLETE</span>
        <h1>Your interview scorecard</h1>
        <div className="score">
          {Math.round(result?.score || 0)}
          <small>/100</small>
        </div>
        <p>{result?.summary}</p>
      </section>

      <div className="result-grid">
        <div className="card">
          <h3>Strengths</h3>
          {(result?.strengths || []).map((x, i) => (
            <div className="item" key={i}>
              ✓ {x}
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Areas to improve</h3>
          {(result?.weaknesses || []).map((x, i) => (
            <div className="item" key={i}>
              • {x}
            </div>
          ))}
        </div>

        <div className="card wide-card">
          <h3>Action plan</h3>
          {(result?.improvements || []).map((x, i) => (
            <div className="item" key={i}>
              {i + 1}. {x}
            </div>
          ))}
        </div>
      </div>

      <button className="primary" onClick={restart}>
        <RotateCcw size={18} />
        Start another interview
      </button>
    </main>
  );
}

function AppShell({ active, onNav, candidateName, candidateEmail, onLogout, theme, onToggleTheme, children }) {
  const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "setup", label: "Practice", icon: "🎯" },
  { key: "explore", label: "Explore Interviews", icon: "📚" },
  { key: "analytics", label: "Analytics", icon: "📈" },
  { key: "history", label: "History", icon: "📊" },
  { key: "settings", label: "Settings", icon: "⚙️" },
  { key: "recruiter", label: "Recruiter", icon: "📅" }
];

  return (
    <div className="app-shell">
      <header
        className="shell-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div className="brand">
          <div className="logo">
            <Sparkles size={18} />
          </div>
          <span>SDEPrepAI Interviewer</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              style={{
                background: "transparent",
                border: "1px solid var(--border-color, #2b354d)",
                color: "inherit",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600
              }}
            >
              {theme === "light" ? <Moon size={15} style={{ color: "#6366f1" }} /> : <Sun size={15} style={{ color: "#fbbf24" }} />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
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
              fontSize: "13px"
            }}
          >
            Logout
          </button>
        </div>
      </header>

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
    </div>
  );
}

function Dashboard({ dashboard, candidateName, goPractice, goExplore, goAnalytics }) {
  return (
    <>
      <h1>Welcome back, {candidateName || "there"} 👋</h1>
      <p className="muted">
        Practice role-specific interviews, track your progress, and build confidence across technical domains.
      </p>

      <div className="candidate-hero">
        <div>
          <span className="eyebrow">PERSONALISED INTERVIEW PREP</span>
          <h2>Find the right interview for your goal.</h2>
          <p>Choose a domain such as Python, Node.js, AI/ML, Data, Cloud or Cybersecurity and start a structured mock interview.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="primary" onClick={goExplore}>
            Explore domains <ArrowRight size={18} />
          </button>
          {goAnalytics && (
            <button
              className="primary"
              onClick={goAnalytics}
              style={{ background: "#242c4d", color: "#aeb8ff", border: "1px solid #4a568b" }}
            >
              View Analytics 📈
            </button>
          )}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={goAnalytics}>
          <span className="stat-label">Interviews ↗</span>
          <span className="stat-value">{dashboard.count}</span>
        </div>
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={goAnalytics}>
          <span className="stat-label">Avg Score ↗</span>
          <span className="stat-value">{dashboard.avg}</span>
        </div>
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={goAnalytics}>
          <span className="stat-label">Best ↗</span>
          <span className="stat-value">{dashboard.best}</span>
        </div>
      </div>

      <div className="section-heading-inline">
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
