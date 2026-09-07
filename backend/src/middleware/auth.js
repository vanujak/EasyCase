import { getAuth, clerkClient } from "@clerk/express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Authenticate request with Clerk (or fallback JWT) and resolve/create MongoDB User.
 * Populates req.userId (MongoDB ObjectId) and req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const auth = getAuth(req);
    const clerkId = auth?.userId;

    if (clerkId) {
      let user = await User.findOne({ clerkId });

      if (!user) {
        // Fetch user info from Clerk to initialize MongoDB record
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          const email =
            clerkUser.emailAddresses?.find(
              (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            "";
          const name =
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
            clerkUser.username ||
            "";

          user = await User.create({
            clerkId,
            email,
            name,
            onboardingCompleted: false,
          });
        } catch (fetchErr) {
          console.error("Failed to fetch Clerk user details:", fetchErr);
          // Fallback minimal record
          user = await User.create({
            clerkId,
            email: `${clerkId}@clerk.placeholder`,
            name: "",
            onboardingCompleted: false,
          });
        }
      }

      req.userId = user._id;
      req.user = user;
      return next();
    }

    // Fallback: Check for legacy JWT token
    const raw = req.headers.authorization || "";
    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

    if (token && process.env.JWT_SECRET) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const legacyId = payload.sub || payload.id;
        const legacyUser = await User.findById(legacyId);
        if (legacyUser) {
          req.userId = legacyUser._id;
          req.user = legacyUser;
          return next();
        }
      } catch {
        // Legacy verify failed, proceed to unauthorized
      }
    }

    return res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Internal authentication error" });
  }
}

export default requireAuth;