import crypto from "crypto";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import FileShare from "../models/fileshareModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { createGetSignedUrl } from "../config/s3.js";
import { PLAN_FEATURES } from "../utils/planFeatures.js";

// Create Share Link
export const createShareLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresAt, password, maxDownloads, permission, accessType, email } = req.body;

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return res.status(400).json({ error: "Cannot share with a past expiration date" });
    }

    // Verify file ownership
    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) return res.status(404).json({ error: "File not found or unauthorized" });

    let receiverId = null;
    let receiverEmail = email || null;

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        receiverId = existingUser._id;
      } else {
        return res.status(404).json({ error: "User not found", emailNotFound: true });
      }
    }

    const shareToken = crypto.randomBytes(16).toString("hex");

    const userPlan = req.user?.plan?.toLowerCase() || 'free';
    const planLimits = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free;

    if (!planLimits.fileSharing) {
      return res.status(403).json({ error: "File sharing requires a premium plan." });
    }

    if (password && !planLimits.passwordProtectedSharing) {
      return res.status(403).json({ error: "Password protection requires Pro plan." });
    }

    if (planLimits.sharingExpiryDays !== null) {
      const maxExpiryDate = new Date();
      maxExpiryDate.setDate(maxExpiryDate.getDate() + planLimits.sharingExpiryDays);
      if (!expiresAt || new Date(expiresAt) > maxExpiryDate) {
        return res.status(403).json({ error: `Max expiry is ${planLimits.sharingExpiryDays} days on your current plan.` });
      }
    }

    if (planLimits.maxShareDownloads !== null) {
      if (!maxDownloads || maxDownloads > planLimits.maxShareDownloads) {
         return res.status(403).json({ error: `Max downloads limit is ${planLimits.maxShareDownloads} on your current plan.` });
      }
    }

    let hashedPassword = null;
    if (password && planLimits.passwordProtectedSharing) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const fileShare = await FileShare.create({
      fileId,
      ownerId: req.user._id,
      receiverId,
      receiverEmail,
      shareToken,
      accessType: accessType || "public",
      permission: permission || "view",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      password: hashedPassword,
      maxDownloads: maxDownloads || null,
    });

    if (receiverId) {
      const sender = await User.findById(req.user._id);
      await Notification.create({
        userId: receiverId,
        type: "FILE_SHARED",
        message: `${sender.name} shared a file with you`,
        senderId: sender._id,
        fileId: fileId,
        isRead: false,
        createdAt: new Date()
      });
      return res.status(201).json({
        message: "File shared successfully directly",
        fileShare,
        directShare: true
      });
    }

    res.status(201).json({
      message: "Share link created",
      shareUrl: `/s/${shareToken}`,
      shareToken,
      fileShare,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create share link" });
  }
};

// Access Shared File (Public Route)
export const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.query;

    const fileShare = await FileShare.findOne({ shareToken: token }).populate("fileId");
    if (!fileShare) return res.status(404).json({ error: "Invalid share link" });

    if (fileShare.isRevoked) return res.status(403).json({ error: "Link revoked" });
    if (fileShare.expiresAt && new Date() > fileShare.expiresAt)
      return res.status(403).json({ error: "Link expired" });
    if (fileShare.maxDownloads && fileShare.downloadCount >= fileShare.maxDownloads)
      return res.status(403).json({ error: "Max downloads reached" });

    // If it's a direct share, verify user authentication
    if (fileShare.receiverId) {
      const tokenCookie = req.signedCookies.token;
      if (!tokenCookie) return res.status(401).json({ error: "Authentication required to access this file" });
      
      const Session = (await import("../models/sessionModel.js")).default;
      const session = await Session.findById(tokenCookie);
      if (!session) return res.status(401).json({ error: "Invalid session" });
      
      if (session.userId.toString() !== fileShare.receiverId.toString() && session.userId.toString() !== fileShare.ownerId.toString()) {
        return res.status(403).json({ error: "Unauthorized access to direct share" });
      }
    }

    // Send metadata so frontend knows a password is required
    if (fileShare.password) {
      if (!password) {
        return res.status(401).json({
          error: "Password required",
          requiresPassword: true,
          file: {
             name: fileShare.fileId ? fileShare.fileId.name : "Unknown",
          }
        });
      }
      const isMatch = await bcrypt.compare(password, fileShare.password);
      if (!isMatch) return res.status(401).json({ error: "Invalid password" });
    }

    const file = fileShare.fileId;
    if (!file) return res.status(404).json({ error: "File no longer exists" });

    const download = req.query.action === "download";
    if (download && fileShare.permission === "view") {
        return res.status(403).json({ error: "Permission denied. View only access." });
    }

    const fileUrl = await createGetSignedUrl({
      key: `${file._id}${file.extension}`,
      download,
      filename: file.name,
    });

    res.json({
      fileUrl,
      file: {
        _id: file._id,
        name: file.name,
        size: file.size,
        extension: file.extension,
        category: file.category,
      },
      share: {
        permission: fileShare.permission,
        token: fileShare.shareToken
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to access shared file" });
  }
};

// Track Download
export const downloadSharedFile = async (req, res) => {
  try {
    const { token } = req.params;
    const fileShare = await FileShare.findOne({ shareToken: token });
    if (!fileShare) return res.status(404).json({ error: "Share not found" });

    if (fileShare.maxDownloads && fileShare.downloadCount >= fileShare.maxDownloads) {
      return res.status(403).json({ error: "Max downloads exceeded" });
    }

    fileShare.downloadCount += 1;
    await fileShare.save();

    res.json({ message: "Download tracked", downloadCount: fileShare.downloadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to track download" });
  }
};

// Revoke Share Link
export const revokeShareLink = async (req, res) => {
  try {
    const { token } = req.params;
    const fileShare = await FileShare.findOneAndUpdate(
      { shareToken: token, ownerId: req.user._id },
      { isRevoked: true },
      { new: true }
    );
    if (!fileShare) return res.status(404).json({ error: "Share not found or unauthorized" });

    res.json({ message: "Link revoked", fileShare });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to revoke link" });
  }
};

// List My Shares
export const listMyShares = async (req, res) => {
  try {
    const shares = await FileShare.find({
      ownerId: req.user._id,
      removedByOwner: { $ne: true }
    })
      .populate("fileId", "name size extension")
      .populate("receiverId", "name email")
      .lean();
    res.json({ shares });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list shares" });
  }
};

// List Shared With Me
export const listSharedWithMe = async (req, res) => {
  try {
    const shares = await FileShare.find({
      receiverId: req.user._id,
      isRevoked: { $ne: true },
      removedByReceiver: { $ne: true }
    })
      .populate("ownerId", "name email")
      .populate("fileId", "name size extension category")
      .lean();
    res.json({ shares });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list shares" });
  }
};

// Delete Share Link
export const deleteShare = async (req, res) => {
  try {
    const { token } = req.params;
    const fileShare = await FileShare.findOne({ shareToken: token });
    if (!fileShare) return res.status(404).json({ error: "Share not found" });

    if (fileShare.ownerId.toString() !== req.user._id.toString()) {
      if (fileShare.receiverId?.toString() === req.user._id.toString()) {
        // receiver is allowed to delete/reject the share
      } else {
        return res.status(403).json({ error: "Unauthorized to delete this share" });
      }
    }

    await FileShare.deleteOne({ _id: fileShare._id });
    res.json({ message: "Share deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete share" });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const resend = new Resend("re_L6DfoHXJ_AnG7PFijdb7R3MujbhkwvyuL");
    const signupLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth`;
    await resend.emails.send({
      from: "Storage App <otp@sivaprasadkada.tech>",
      to: email,
      subject: "You've been invited to access a file",
      html: `You have been invited to access a file. Please <a href="${signupLink}">signup</a> to view it.`
    });

    res.json({ message: "Invitation sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send invitation" });
  }
};

// Remove from "Shared With Me" (receiver soft-removes from their view)
export const removeFromSharedWithMe = async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = await FileShare.findById(shareId);
    if (!share) return res.status(404).json({ error: "Share not found" });

    if (share.receiverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    share.removedByReceiver = true;
    await share.save();

    res.json({ message: "Removed from your shared list" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove share" });
  }
};

// Remove from "Shared By Me" (owner soft-removes from their view)
export const removeFromSharedByMe = async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = await FileShare.findById(shareId);
    if (!share) return res.status(404).json({ error: "Share not found" });

    if (share.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    share.removedByOwner = true;
    await share.save();

    res.json({ message: "Removed from your shared list" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove share" });
  }
};

// Rename a shared file (only owner or user with edit permission)
export const renameSharedFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newFilename } = req.body;

    if (!newFilename || !newFilename.trim()) {
      return res.status(400).json({ error: "New filename is required" });
    }

    // Check if user is the owner
    let file = await File.findOne({ _id: fileId, userId: req.user._id });

    if (!file) {
      // Check if user has edit permission via share
      const share = await FileShare.findOne({
        fileId,
        receiverId: req.user._id,
        isRevoked: false
      });

      if (!share) return res.status(404).json({ error: "File not found or not shared with you" });
      if (share.permission !== "edit") {
        return res.status(403).json({ error: "You only have view permission" });
      }

      file = await File.findById(fileId);
      if (!file) return res.status(404).json({ error: "File no longer exists" });
    }

    file.name = newFilename.trim();
    await file.save();

    res.json({ message: "File renamed successfully", name: file.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename file" });
  }
};

// Download a shared file (generate signed URL with access validation)
export const downloadSharedFileById = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if user is the owner
    let file = await File.findOne({ _id: fileId, userId: req.user._id }).lean();
    let permission = "edit"; // owner has full access

    if (!file) {
      // Check if file is shared with the user
      const share = await FileShare.findOne({
        fileId,
        receiverId: req.user._id,
        isRevoked: false
      });

      if (!share) return res.status(404).json({ error: "File not found or not shared with you" });
      permission = share.permission;
      file = await File.findById(fileId).lean();
      if (!file) return res.status(404).json({ error: "File no longer exists" });
    }

    const fileUrl = await createGetSignedUrl({
      key: `${file._id}${file.extension}`,
      download: true,
      filename: file.name,
    });

    res.json({ fileUrl, file: { _id: file._id, name: file.name, size: file.size, extension: file.extension } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
};