import jwt from "jsonwebtoken";
export function requireAuth(roles=[]) {
  return (req,res,next) => {
    try {
      const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
      if (!token) return res.status(401).json({error:"Authentication required"});
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-only-change-me");
      if (roles.length && !roles.includes(decoded.role)) return res.status(403).json({error:"Insufficient permissions"});
      req.user = decoded;
      next();
    } catch { res.status(401).json({error:"Invalid or expired token"}); }
  };
}
