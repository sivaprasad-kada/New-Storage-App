import "../config/mongoose.js";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import sessionSchema from "../models/sessionModel.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import axios from "axios"
export const register = async (req, res, next) => {
  const { ObjectId } = mongoose.Types;
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  // const hasedpassword = await bcrypt.hash(password, 10);
  // console.log(hasedpassword);
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message: "Try logging in or use a different email.",
    });
  }

  const session = await mongoose.startSession();
  let committed = false; // <<< FIX ADDED HERE
  try {
    session.startTransaction();

    const rootDirId = new ObjectId();
    const userId = new ObjectId();

    console.log("rootDirId", rootDirId);
    console.log("userId", userId);

    // Directory must be an array when passing session
    await Directory.create(
      [
        {
          _id: rootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
        },
      ],
      { session }
    );

    // User must be an array when passing session
    await User.create(
      [
        {
          _id: userId,
          name,
          email,
          password: password, // Pass plain password, model handles hashing
          rootDirId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    committed = true;  // <<< ONLY WORKS IF declared above
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    if (!committed) {
      await session.abortTransaction();
    }
    console.error(err);
    next(err);
  } finally {
    session.endSession();
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  const user = await User.findOne({ email }).select("+password");
  console.log("this is from login route", user.password)
  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(isPasswordValid)
  if (!isPasswordValid) {
    return res.status(404).json({ error: "Invalid Credentials from password" });
  }
  const allSessions = await sessionSchema.find({ userId: user.id });

  if (allSessions.length >= 2) {
    await allSessions[0].deleteOne();
  }
  const session = await sessionSchema.create({ userId: user._id });

  res.cookie("token", session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60
  });
  res.json({ message: "logged in" });
};
export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    maxStorageInBytes: req.user.maxStorageInBytes,
    usedStorageInBytes: req.user.usedStorageInBytes,
    imageBytes: req.user.imageBytes || 0,
    videoBytes: req.user.videoBytes || 0,
    audioBytes: req.user.audioBytes || 0,
    documentBytes: req.user.documentBytes || 0,
    otherBytes: req.user.otherBytes || 0,
    picture: req.user.picture,
  });
};
export const logout = async (req, res) => {
  console.log("logout route is triggered")
  const { token } = req.signedCookies;
  await sessionSchema.findByIdAndDelete(token);
  res.clearCookie("token");
  res.status(204).end();
};
export const logoutAll = async (req, res) => {
  const { token } = req.signedCookies;
  const session = await sessionSchema.findById(token);
  await sessionSchema.deleteMany({ userId: session.userId });
  res.status(204).end();
};
export const googleLogin = async (req, res, next) => {
  const { ObjectId } = mongoose.Types;
  let userData;

  try {
    if (req.body.type === 'access_token') {
      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${req.body.token}` }
      });
      userData = userInfoResponse.data;
    } else {
      userData = await verifyIdToken(req.body.token);
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid Google Token" });
  }

  const { name, email, picture, sub } = userData;
  const user = await User.findOne({ email });
  let committed = false;
  if (!user) {
    const mongooseSession = await mongoose.startSession();
    try {
      mongooseSession.startTransaction();
      const rootDirId = new ObjectId();
      const userId = new ObjectId();
      // Directory must be an array when passing mongooseSession
      await Directory.create(
        [
          {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
          },
        ],
        { mongooseSession }
      );

      // User must be an array when passing mongooseSession
      await User.create(
        [
          {
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
          },
        ],
        { mongooseSession }
      );
      await mongooseSession.commitTransaction();
      committed = true;
      const session = await sessionSchema.create({ userId: user._id });
      res.cookie("token", session.id, {
        httpOnly: true,
        signed: true,
        maxAge: 60 * 1000 * 10,
      });
      res.status(201).json({ message: "User Registered" });
    } catch (err) {
      if (!committed) await mongooseSession.abortTransaction();
      console.error(err);
      next(err);
    } finally {
      mongooseSession.endSession();
    }

  }
  else {
    const user = await User.findOne({ email }).select("+password");
    const allSessions = await sessionSchema.find({ userId: user.id });
    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne();
      res.status(200).json("User already Exists")
    }
    const session = await sessionSchema.create({ userId: user._id });
    res.cookie("token", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 10
    });
    res.json({ message: "logged in" });
  }
}
export const getAllUsers = async (req, res) => {
  const allUsers = await User.find().lean();
  const allSessions = await sessionSchema.find().lean();
  const allSessionsUserId = allSessions.map(({ userId }) => userId.toString());
  const allSessionsUserIdSet = new Set(allSessionsUserId);
  /* In the above code we use set datastrcutrue for performance optimization bacause sessions may duplicates
  because 1 user as more than 1 sessio */
  const transformedUsers = allUsers.map(({ _id, name, email }) => ({
    id: _id,
    name,
    email,
    isLoggedIn: allSessionsUserIdSet.has(_id.toString()),
  }));
  res.status(200).json(transformedUsers);
};
export const logoutById = async (req, res, next) => {
  // console.log(req.params.userId)
  try {
    await sessionSchema.deleteMany({ userId: req.params.userId });
    return res.status(204).json("logged the user");
  } catch (err) {
    next(err);
  }
};
export const DeleteUser = async (req, res, next) => {
  console.log(req.params.userId)
  try {
    await User.findByIdAndDelete({ _id: req.params.userId });
    return res.status(204).json("User Deleted successfully");
  } catch (err) {
    next(err);
  }
};
export const gitHubCallback = async (req, res) => {
  try {
    console.log("GitHub callback hit");

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code not found" });

    // 1️⃣ Exchange code → access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: "Ov23lih57kAGvNVuYKTJ",
        client_secret: "38037e80b304933958ef06fe775918706bc8c6ef",
        code
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken)
      return res.status(400).json({ error: "Access token not received" });

    // 2️⃣ Get GitHub profile
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // 3️⃣ Get email (requires scope=user:email)
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const primaryEmail = emailResponse.data.find(e => e.primary)?.email;
    if (!primaryEmail)
      return res.status(400).json({ error: "GitHub email not found" });

    const username =
      userResponse.data.name || userResponse.data.login;
    const email = primaryEmail;
    const avatar = userResponse.data.avatar_url;

    // 4️⃣ Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Register new user with transaction
      const { ObjectId } = mongoose.Types;
      const mongooseSession = await mongoose.startSession();
      try {
        mongooseSession.startTransaction();

        const rootDirId = new ObjectId();
        const userId = new ObjectId();

        await Directory.create(
          [
            {
              _id: rootDirId,
              name: `root-${email}`,
              parentDirId: null,
              userId
            }
          ],
          { session: mongooseSession }
        );

        const [createdUser] = await User.create(
          [
            {
              _id: userId,
              name: username,
              email,
              rootDirId,
              picture: avatar
            }
          ],
          { session: mongooseSession }
        );

        await mongooseSession.commitTransaction();
        mongooseSession.endSession();

        const session = await sessionSchema.create({
          userId: createdUser._id
        });

        res.cookie("token", session.id, {
          httpOnly: true,
          signed: true,
          maxAge: 60 * 60 * 1000
        });

        return res.status(201).json({
          message: "User registered",
          user: {
            username,
            email,
            avatar
          }
        });
      } catch (err) {
        await mongooseSession.abortTransaction();
        mongooseSession.endSession();
        throw err;
      }
    }

    // 5️⃣ Existing user login
    const allSessions = await sessionSchema.find({ userId: user._id });

    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne();
    }

    const session = await sessionSchema.create({
      userId: user._id
    });

    res.cookie("token", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 60 * 1000
    });

    return res.status(202).json({
      message: "Logged in",
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errorMessages = Object.values(err.errors).map(e => e.message);
      console.error("Mongoose Validation Error:", errorMessages);
      return res.status(400).json({ error: "Validation Failed", details: errorMessages });
    }
    console.error("GitHub OAuth error:", err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
