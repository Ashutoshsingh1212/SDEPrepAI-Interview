import "../src/env.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db, { findUserByEmail, findUserById, upsertUser } from "../src/db.js";

const router = express.Router();
const secret = () => process.env.JWT_SECRET || "development-only-change-me";

function signUser(user) {
  return jwt.sign({ id:user.id, email:user.email, role:user.role }, secret(), { expiresIn:"7d" });
}

router.post("/register", async (req,res) => {
  try {
    const {name,email,password,role} = req.body || {};
    if (!name?.trim() || !email?.trim() || !password || role !== "recruiter") return res.status(400).json({error:"Name, email, password and recruiter role are required"});
    if (password.length < 8) return res.status(400).json({error:"Password must be at least 8 characters"});
    if (findUserByEmail(email.trim().toLowerCase())) return res.status(409).json({error:"Email already registered"});
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)").run(name.trim(),email.trim().toLowerCase(),passwordHash,"recruiter");
    const user = findUserById(result.lastInsertRowid);
    res.status(201).json({success:true,token:signUser(user),user});
  } catch (e) { console.error("REGISTER ERROR",e); res.status(500).json({error:"Registration failed"}); }
});

router.post("/login", async (req,res) => {
  try {
    const {email,password,role} = req.body || {};
    if (!email || !password || !["admin","recruiter"].includes(role)) return res.status(400).json({error:"Email, password and role are required"});
    const cleanEmail = email.trim().toLowerCase();
    let user = findUserByEmail(cleanEmail);

    // Instant fallback sync for admin credentials from process.env
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    if (role === "admin" && envAdminEmail && cleanEmail === envAdminEmail && password === envAdminPassword) {
      if (!user || user.role !== "admin") {
        const hash = await bcrypt.hash(envAdminPassword, 12);
        db.prepare(
          `INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,password_hash=excluded.password_hash,role='admin'`
        ).run(process.env.ADMIN_NAME || "Ashutosh Singh", envAdminEmail, hash, "admin");
        user = findUserByEmail(envAdminEmail);
      }
      return res.json({success:true,token:signUser(user),user:findUserById(user.id)});
    }

    if (!user) return res.status(401).json({error:"Invalid email or password"});
    if (role === "admin" && user.role !== "admin") return res.status(401).json({error:"Invalid email, password or role"});
    if (role === "recruiter" && user.role !== "recruiter" && user.role !== "admin") return res.status(401).json({error:"Invalid email, password or role"});

    const ok = await bcrypt.compare(password,user.password_hash || "");
    if (!ok) return res.status(401).json({error:"Invalid email or password"});
    res.json({success:true,token:signUser(user),user:findUserById(user.id)});
  } catch(e) { console.error("LOGIN ERROR",e); res.status(500).json({error:"Login failed"}); }
});

router.get("/me", (req,res) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({error:"Authentication required"});
    const decoded = jwt.verify(token,secret());
    const user = findUserById(decoded.id);
    if (!user) return res.status(401).json({error:"User not found"});
    res.json({success:true,user});
  } catch { res.status(401).json({error:"Invalid or expired token"}); }
});

router.post("/logout", (_,res) => res.json({success:true}));
export default router;
