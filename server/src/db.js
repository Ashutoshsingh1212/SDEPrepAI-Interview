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
`);

// Migrate older builds that used password or did not have candidate_email.
addColumn("interviews", "candidate_email", "TEXT DEFAULT ''");
addColumn("users", "password_hash", "TEXT DEFAULT ''");
try {
  const old = db.prepare("SELECT name FROM pragma_table_info('users') WHERE name='password'").get();
  if (old) db.exec("UPDATE users SET password_hash = password WHERE (password_hash IS NULL OR password_hash='') AND password IS NOT NULL");
} catch {}

export function createInterview(data) {
  return db.prepare(`INSERT INTO interviews
    (id,created_at,candidate_name,candidate_email,role,difficulty,duration,github,job_description,questions,transcript,status)
    VALUES (@id,@created_at,@candidate_name,@candidate_email,@role,@difficulty,@duration,@github,@job_description,@questions,@transcript,@status)`)
    .run({ candidate_email: "", ...data });
}

export function updateInterview(id, data) {
  const allowed = new Set(["transcript","score","feedback","status","questions"]);
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

export default db;
