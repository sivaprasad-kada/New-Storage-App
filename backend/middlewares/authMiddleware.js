import sessionSchema from "../models/sessionModel.js";
import User from "../models/userModel.js";
export default async function checkAuth(req, res, next) {
  const token = req.signedCookies.token;
  // console.log("token from auth",token);
  // console.log("token is ",token)
  if (!token) {
    res.clearCookie("token", {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    return res.status(401).json({ error: "Not logged!" });
  }
  try {
    const session = await sessionSchema.findById(token);
    if (!session) {
      res.clearCookie("token", {
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
      return res.status(401).json({ error: "Invalid session!" });
    }
    const user = await User.findById(session.userId);
    if (!user) return res.status(401).json({ error: "User not found!" });
    req.user = user;
    next();
  } catch (err) {
    console.log("Cookie decode error:", err);
    return res.status(401).json({ error: "Invalid session data!" });
  }
}

export const checkNotRegularUser = (req, res, next) => {
  if (req.user.role !== "User") return next();
  res.status(403).json({ error: "You can not access users" });
};
