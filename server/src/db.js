import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "interviews.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

function addColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

db.exec(`
CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT DEFAULT '',
  role TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  duration INTEGER DEFAULT 45,
  github TEXT DEFAULT '',
  job_description TEXT DEFAULT '',
  questions TEXT DEFAULT '[]',
  transcript TEXT DEFAULT '[]',
  score INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'Pre'
);
CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','recruiter')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  activity_date TEXT NOT NULL,
  login_count INTEGER DEFAULT 0,
  interviews_started INTEGER DEFAULT 0,
  interviews_completed INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  coding_submissions INTEGER DEFAULT 0,
  practice_minutes INTEGER DEFAULT 0,
  total_activity_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_email, activity_date)
);
`);

// Migrate older builds that used password or did not have candidate_email or domain fields.
addColumn("interviews", "candidate_email", "TEXT DEFAULT ''");
addColumn("interviews", "domain", "TEXT DEFAULT ''");
addColumn("interviews", "coding_submission", "TEXT DEFAULT '{}'");
addColumn("interviews", "category_scores", "TEXT DEFAULT '{}'");
addColumn("interviews", "skill_scores", "TEXT DEFAULT '{}'");
addColumn("interviews", "readiness_level", "TEXT DEFAULT ''");
addColumn("interviews", "recommendations", "TEXT DEFAULT '[]'");
addColumn("users", "password_hash", "TEXT DEFAULT ''");
try {
  const old = db.prepare("SELECT name FROM pragma_table_info('users') WHERE name='password'").get();
  if (old) db.exec("UPDATE users SET password_hash = password WHERE (password_hash IS NULL OR password_hash='') AND password IS NOT NULL");
} catch {}

export function createInterview(data) {
  return db.prepare(`INSERT INTO interviews
    (id,created_at,candidate_name,candidate_email,role,difficulty,duration,github,job_description,questions,transcript,status,domain,coding_submission,category_scores,skill_scores,readiness_level,recommendations)
    VALUES (@id,@created_at,@candidate_name,@candidate_email,@role,@difficulty,@duration,@github,@job_description,@questions,@transcript,@status,@domain,@coding_submission,@category_scores,@skill_scores,@readiness_level,@recommendations)`)
    .run({
      candidate_email: "",
      domain: "",
      coding_submission: "{}",
      category_scores: "{}",
      skill_scores: "{}",
      readiness_level: "",
      recommendations: "[]",
      ...data
    });
}

export function updateInterview(id, data) {
  const allowed = new Set([
    "transcript",
    "score",
    "feedback",
    "status",
    "questions",
    "domain",
    "coding_submission",
    "category_scores",
    "skill_scores",
    "readiness_level",
    "recommendations"
  ]);
  const safe = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.has(k)));
  if (!Object.keys(safe).length) return { changes: 0 };
  const fields = Object.keys(safe).map((key) => `${key}=@${key}`).join(", ");
  return db.prepare(`UPDATE interviews SET ${fields} WHERE id=@id`).run({ ...safe, id });
}

export function getInterview(id) { return db.prepare("SELECT * FROM interviews WHERE id=?").get(id); }
export function listInterviews() { return db.prepare("SELECT * FROM interviews ORDER BY created_at DESC").all(); }
export function listCandidateInterviews(email) { return db.prepare("SELECT * FROM interviews WHERE lower(candidate_email)=lower(?) ORDER BY created_at DESC").all(email); }
export function clearAllInterviews() { return db.prepare("DELETE FROM interviews").run(); }

export function findUserByEmail(email) { return db.prepare("SELECT * FROM users WHERE lower(email)=lower(?)").get(email); }
export function findUserById(id) { return db.prepare("SELECT id,name,email,role,created_at FROM users WHERE id=?").get(id); }
export function createUser({ name, email, passwordHash, role }) {
  return db.prepare(`INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)`).run(name,email,passwordHash,role);
}
export function upsertUser({ name, email, passwordHash, role }) {
  return db.prepare(`INSERT INTO users(name,email,password_hash,role) VALUES(@name,@email,@passwordHash,@role)
    ON CONFLICT(email) DO UPDATE SET name=excluded.name,password_hash=excluded.password_hash,role=excluded.role`)
    .run({name,email,passwordHash,role});
}

export function findCandidateByEmail(email) { return db.prepare("SELECT * FROM candidates WHERE lower(email)=lower(?)").get(email); }
export function createCandidate(email) { db.prepare("INSERT OR IGNORE INTO candidates(email) VALUES(?)").run(email); return findCandidateByEmail(email); }

// ==========================================
// USER ACTIVITY & STREAK TRACKING
// ==========================================

export function recordUserActivity(userEmail, {
  logins = 0,
  started = 0,
  completed = 0,
  questions = 0,
  coding = 0,
  minutes = 0,
  date = null,
} = {}) {
  if (!userEmail) return;
  const email = String(userEmail).trim().toLowerCase();
  const activityDate = date || new Date().toISOString().slice(0, 10);
  const score = (logins * 1) + (started * 1) + (questions * 1) + (coding * 2) + (completed * 3);

  db.prepare(`
    INSERT INTO user_activity (
      user_email, activity_date, login_count, interviews_started, interviews_completed,
      questions_answered, coding_submissions, practice_minutes, total_activity_score, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_email, activity_date) DO UPDATE SET
      login_count = login_count + excluded.login_count,
      interviews_started = interviews_started + excluded.interviews_started,
      interviews_completed = interviews_completed + excluded.interviews_completed,
      questions_answered = questions_answered + excluded.questions_answered,
      coding_submissions = coding_submissions + excluded.coding_submissions,
      practice_minutes = practice_minutes + excluded.practice_minutes,
      total_activity_score = total_activity_score + excluded.total_activity_score,
      updated_at = datetime('now')
  `).run(
    email,
    activityDate,
    logins,
    started,
    completed,
    questions,
    coding,
    minutes,
    score
  );
}

export function syncHistoricalActivityForUser(userEmail) {
  if (!userEmail) return;
  const email = String(userEmail).trim().toLowerCase();
  const interviews = db.prepare("SELECT * FROM interviews WHERE lower(candidate_email)=lower(?)").all(email);

  for (const item of interviews) {
    if (!item.created_at) continue;
    const date = item.created_at.slice(0, 10);
    const duration = Number(item.duration) || 30;
    const isCompleted = item.status === "Done" || (item.score !== null && item.score !== undefined);
    
    let questionCount = 0;
    try {
      const q = JSON.parse(item.questions || "[]");
      questionCount = Array.isArray(q) ? q.length : 0;
    } catch {}

    let codingCount = 0;
    try {
      const c = JSON.parse(item.coding_submission || "{}");
      if (c && (c.code || c.approach)) codingCount = 1;
    } catch {}

    const score = 1 + (isCompleted ? 3 : 0) + (questionCount > 0 ? 2 : 0) + (codingCount > 0 ? 2 : 0);

    db.prepare(`
      INSERT INTO user_activity (
        user_email, activity_date, login_count, interviews_started, interviews_completed,
        questions_answered, coding_submissions, practice_minutes, total_activity_score, updated_at
      ) VALUES (?, ?, 1, 1, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_email, activity_date) DO UPDATE SET
        interviews_started = MAX(interviews_started, 1),
        interviews_completed = MAX(interviews_completed, excluded.interviews_completed),
        questions_answered = MAX(questions_answered, excluded.questions_answered),
        coding_submissions = MAX(coding_submissions, excluded.coding_submissions),
        practice_minutes = practice_minutes + excluded.practice_minutes,
        total_activity_score = MAX(total_activity_score, excluded.total_activity_score)
    `).run(
      email,
      date,
      isCompleted ? 1 : 0,
      questionCount,
      codingCount,
      isCompleted ? duration : 15,
      score
    );
  }
}

export function getUserActivityStats(userEmail, targetYear = new Date().getFullYear()) {
  if (!userEmail) {
    return {
      year: targetYear,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPracticeMinutes: 0,
      availableYears: [targetYear],
      activity: [],
    };
  }

  const email = String(userEmail).trim().toLowerCase();
  syncHistoricalActivityForUser(email);

  const allRows = db.prepare(
    "SELECT * FROM user_activity WHERE lower(user_email)=lower(?) ORDER BY activity_date ASC"
  ).all(email);

  const availableYearsSet = new Set();
  availableYearsSet.add(Number(targetYear));
  availableYearsSet.add(new Date().getFullYear());
  allRows.forEach(r => {
    if (r.activity_date) {
      const y = parseInt(r.activity_date.slice(0, 4), 10);
      if (!isNaN(y)) availableYearsSet.add(y);
    }
  });
  const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

  // Active dates for streak calculation
  const activeDateStrings = allRows
    .filter(r => (r.total_activity_score > 0 || r.login_count > 0 || r.interviews_started > 0 || r.questions_answered > 0 || r.coding_submissions > 0 || r.interviews_completed > 0))
    .map(r => r.activity_date);

  const activeDatesSet = new Set(activeDateStrings);

  // Current Streak Calculation
  let currentStreak = 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yesterdayStr = yest.toISOString().slice(0, 10);

  let checkDate = null;
  if (activeDatesSet.has(todayStr)) {
    checkDate = new Date();
  } else if (activeDatesSet.has(yesterdayStr)) {
    checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
  }

  if (checkDate) {
    while (true) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (activeDatesSet.has(dStr)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest Streak Calculation
  let longestStreak = 0;
  if (activeDateStrings.length > 0) {
    let currentRun = 0;
    let prevDate = null;

    for (const dStr of activeDateStrings) {
      const cur = new Date(dStr);
      if (!prevDate) {
        currentRun = 1;
      } else {
        const diffDays = Math.round((cur.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun += 1;
        } else if (diffDays > 1) {
          currentRun = 1;
        }
      }
      if (currentRun > longestStreak) longestStreak = currentRun;
      prevDate = cur;
    }
  }
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  // Filter for requested target year
  const yearStr = String(targetYear);
  const yearRows = allRows.filter(r => r.activity_date.startsWith(yearStr));

  let totalPracticeMinutes = 0;
  let activeDays = 0;
  const activityMap = new Map();

  yearRows.forEach(r => {
    totalPracticeMinutes += r.practice_minutes || 0;
    const score = r.total_activity_score || 0;
    if (score > 0 || r.login_count > 0 || r.interviews_started > 0) {
      activeDays += 1;
    }

    let level = 0;
    if (score >= 8 || r.interviews_completed >= 2 || r.questions_answered >= 6) {
      level = 4;
    } else if (score >= 5 || r.interviews_completed >= 1 || r.coding_submissions >= 1 || r.questions_answered >= 3) {
      level = 3;
    } else if (score >= 2 || r.interviews_started >= 1 || r.questions_answered >= 1) {
      level = 2;
    } else if (score >= 1 || r.login_count >= 1) {
      level = 1;
    }

    activityMap.set(r.activity_date, {
      date: r.activity_date,
      level,
      loginCount: r.login_count || 0,
      interviewsStarted: r.interviews_started || 0,
      interviewsCompleted: r.interviews_completed || 0,
      questionsAnswered: r.questions_answered || 0,
      codingSubmissions: r.coding_submissions || 0,
      practiceMinutes: r.practice_minutes || 0,
      totalActivityScore: score,
    });
  });

  return {
    year: Number(targetYear),
    activeDays,
    currentStreak,
    longestStreak,
    totalPracticeMinutes,
    availableYears,
    activity: Array.from(activityMap.values()),
  };
}

export default db;
