// ES modules
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const raw = req.headers.authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub || payload.id; // set by your login
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
