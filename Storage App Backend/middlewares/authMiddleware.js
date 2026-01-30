import sessionSchema from "../models/sessionModel.js";
import User from "../models/userModel.js";
export default async function checkAuth(req, res, next) {
  const token = req.signedCookies.token;
  // console.log("token from auth",token);
  // console.log("token is ",token)
  if (!token) {
    res.clearCookie("token")
    return res.status(401).json({ error: "Not logged!" });
  }
  try {
    // decode
  /*   const decoded = JSON.parse(Buffer.from(token, "base64url").toString());
    const { id, expiry } = decoded;
    const now = Math.round(Date.now() / 1000);

    if (now > expiry) {
      res.clearCookie("token");
      return res.status(401).json({ error: "Session expired!" });
    } */
    const session = await sessionSchema.findById(token);
    if(!session) return res.clearCookie("token")
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
