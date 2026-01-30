import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import File from "../models/fileModel.js";
import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { getFileCategory } from "../utils/fileCategory.js";

export const uploadFile = async (req, res, next) => {
  // const filesCollection = await db.collection("files");
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const parentDirData = await Directory.findOne({
    _id: parentDirId,
    userId: req.user._id,
  }).lean();
  // console.log("this is from file controller", parentDirData)
  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  const filename = req.headers.filename || "untitled";
  const mimetype = req.headers["content-type"];
  // Parse filesize to integer safely
  const filesize = parseInt(req.headers.filesize, 10) || 0;

  // max file size limit is 100MB
  const MAX_LIMIT_MB = 100;
  const MAX_LIMIT_BYTES = MAX_LIMIT_MB * 1024 * 1024;

  if (filesize > MAX_LIMIT_BYTES) {
    console.log("File too large");
    res.header("Connection", "close");
    return res.status(413).end("");
  }

  // Check Storage Limit
  const user = await User.findById(req.user._id);
  if (user.usedStorageInBytes + filesize > user.maxStorageInBytes) {
    return res.status(403).json({ error: "Storage limit exceeded. Please buy more storage." });
  }

  const extension = path.extname(filename);
  const category = getFileCategory(filename, mimetype);

  const insertedFile = await File.create({
    extension,
    name: filename,
    parentDirId: parentDirData._id,
    userId: req.user._id,
    size: filesize,
    category
  });
  const fileId = insertedFile._id.toString();
  console.log("this is from file controller", insertedFile)
  const fullFileName = `${fileId}${extension}`;
  const filePath = `./storage/${fullFileName}`;

  const writeStream = createWriteStream(filePath);
  // req.pipe(writeStream);
  let totalFileSize = 0;
  let aborted = false;

  // Monitor data stream bit-by-bit
  req.on("data", async (chunk) => {
    if (aborted) return;
    totalFileSize += chunk.length;

    // Check if size exceeds declared header size OR global hard limit
    if (totalFileSize > filesize || totalFileSize > MAX_LIMIT_BYTES) {
      aborted = true;
      writeStream.close();

      // Cleanup partial upload
      try {
        await insertedFile.deleteOne();
        await rm(filePath);
      } catch (err) {
        console.error("Cleanup error:", err);
      }

      // Send 413 Response
      if (!res.headersSent) {
        return res.status(413).json({ error: "File too large or size mismatch" });
      }
      return; // Stop processing
    }
    writeStream.write(chunk);
  });

  req.on("end", async () => {
    if (aborted) return;
    let dirId = parentDirId
    while (dirId) {
      let parentDirData = await Directory.findById(dirId)
      parentDirData.size += +filesize; // conversion of string to int
      parentDirData.save();
      dirId = parentDirData.parentDirId
    }
    // Update User Storage Usage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        usedStorageInBytes: filesize,
        [`${category}Bytes`]: filesize
      }
    });

    return res.status(201).json({ message: "File Uploaded" });
  });

  req.on("error", async () => {
    await filesCollection.deleteOne({ _id: insertedFile.insertedId });
    return res.status(404).json({ message: "Could not Upload File" });
  });
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const db = req.db;
  const filesCollection = db.collection("files");
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // If "download" is requested, set the appropriate headers
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const db = req.db;
  const filesCollection = db.collection("files");
  /*  const fileData = await File.findOneAndUpdate({
     _id: id,
     userId: req.user._id,
   });
 
   // Check if file exists
   if (!fileData) {
     return res.status(404).json({ error: "File not found!" });
   } */

  try {
    const result = await File.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { name: req.body.newFilename } }
    );
    if (result == null) return res.status(404).json({ error: "file not found" })
    else return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

/* export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  // const db = req.db;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }
  let dirId = fileData.parentDirId;
  console.log("dirId :", dirId)
  while(dirId){
    let parentDirData = await Directory.findById(dirId);
    console.log(parentDirData.parentDirId)
    parentDirData.size = parentDirData.size - fileData.size
    dirId = parentDirData.parentDirId
    console.log(dirId)
  }
  try {
    await rm(`./storage/${id}${fileData.extension}`);
    await File.deleteOne({ _id: fileData._id });
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
 */

// the below code is given by gpt to solve the real life issues 
// 1. Race condition 2.partial failure -> that's why here we use transcations
export const deleteFile = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    const fileData = await File.findOne(
      { _id: id, userId: req.user._id },
      null,
      { session }
    );

    if (!fileData) {
      await session.abortTransaction();
      return res.status(404).json({ error: "File not found!" });
    }

    let dirId = fileData.parentDirId;
    const size = fileData.size;
    const category = fileData.category || 'other'; // Backward compatibility

    // 🔥 propagate size decrease to all parent folders
    while (dirId) {
      const dir = await Directory.findById(dirId, null, { session });

      await Directory.updateOne(
        { _id: dirId },
        { $inc: { size: -size } },
        { session }
      );

      dirId = dir.parentDirId;
    }

    // Update User Storage Usage (Decrease)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        usedStorageInBytes: -size,
        [`${category}Bytes`]: -size
      }
    }, { session });
    // delete DB record
    await File.deleteOne({ _id: id }, { session });
    // delete physical file
    await rm(`./storage/${id}${fileData.extension}`);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "File deleted successfully" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
