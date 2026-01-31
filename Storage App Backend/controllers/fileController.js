import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import {
  createGetSignedUrl,
  createUploadSignedUrl,
  deleteS3File,
  getS3FileMetaData,
} from "../config/s3.js";
import { getFileCategory } from "../utils/fileCategory.js";

// Helper to update directory sizes recursively
export async function updateDirectoriesSize(parentId, deltaSize) {
  while (parentId) {
    const dir = await Directory.findById(parentId);
    if (!dir) break;
    dir.size += deltaSize;
    await dir.save();
    parentId = dir.parentDirId;
  }
}

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // Handle download or preview via presigned URL
  try {
    const download = req.query.action === "download";
    const fileUrl = await createGetSignedUrl({
      key: `${id}${fileData.extension}`,
      download,
      filename: fileData.name,
    });

    // Redirect the client to the S3 URL
    return res.redirect(fileUrl);
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return res.status(500).json({ error: "Could not generate file access URL" });
  }
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;

  try {
    const file = await File.findOne({
      _id: id,
      userId: req.user._id,
    });

    // Check if file exists
    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }

    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;

  try {
    const file = await File.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }

    // Delete from S3 first (or DB first, depending on preference; reference deletes DB first but keys off file info)
    // Reference deleted S3 using file.id+extension
    const key = `${file.id}${file.extension}`;
    await deleteS3File(key);

    // Delete from DB
    await file.deleteOne();

    // Update Directory Sizes
    await updateDirectoriesSize(file.parentDirId, -file.size);

    // Update User Storage Usage
    const category = file.category || 'other';
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        usedStorageInBytes: -file.size,
        [`${category}Bytes`]: -file.size // decrease category usage
      }
    });

    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const uploadInitiate = async (req, res) => {
  const parentDirId = req.body.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.body.name || "untitled";
    const filesize = parseInt(req.body.size, 10) || 0;
    const contentType = req.body.contentType || "application/octet-stream";

    const user = await User.findById(req.user._id);

    // Check Storage Limit
    if (user.usedStorageInBytes + filesize > user.maxStorageInBytes) {
      return res.status(403).json({ error: "Storage limit exceeded. Please buy more storage." });
    }

    const extension = path.extname(filename);
    const category = getFileCategory(filename, contentType);

    const insertedFile = await File.create({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      isUploading: true,
      category,
    });

    const uploadSignedUrl = await createUploadSignedUrl({
      key: `${insertedFile.id}${extension}`,
      contentType: contentType,
    });

    res.json({ uploadSignedUrl, fileId: insertedFile.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to initiate upload" });
  }
};

export const uploadComplete = async (req, res, next) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: "fileId is required" });
  }

  try {
    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) {
      return res.status(404).json({ error: "File not found in our records" });
    }

    const key = `${file.id}${file.extension}`;
    const fileData = await getS3FileMetaData(key);

    // Verify size matches what was promised (optional strictness)
    // Checking ContentLength from S3 HeadObject
    if (fileData.ContentLength != file.size) {
      // If mismatched, maybe we should update the DB to real size? 
      // Or reject? Reference implementation deleted the file.
      // Let's be strict for now as per reference.
      console.warn(`Size mismatch: DB says ${file.size}, S3 says ${fileData.ContentLength}`);
      await deleteS3File(key);
      await file.deleteOne();
      return res.status(400).json({ error: "Uploaded file size does not match declared size." });
    }

    file.isUploading = false;
    await file.save();

    await updateDirectoriesSize(file.parentDirId, file.size);

    // Update User Storage Usage
    const category = file.category || 'other';
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        usedStorageInBytes: file.size,
        [`${category}Bytes`]: file.size
      }
    });

    res.json({ message: "Upload completed" });
  } catch (err) {
    console.error("Upload complete error:", err);
    // If we can't verify, we might want to cleanup?
    // But maybe it's just a transient error.
    // For now, return error.
    return res.status(500).json({ error: "Could not verify upload completion." });
  }
};
