import { rm } from "fs/promises";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import { updateDirectoriesSize } from "./fileController.js";
import { deleteS3Files } from "../config/s3.js";
import redisClient from "../config/redis.js";

export const getDirectory = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId.toString();

  // 1. Check Cache
  const cacheKey = `directory:${_id}`;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }
  } catch (err) {
    console.error("Redis Get Error:", err);
  }

  const directoryData = await Directory.findOne({
    _id,
    userId: req.user._id,
  }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await File.find({ parentDirId: directoryData._id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();

  let breadcrumbs = [];
  let currentDir = directoryData;
  while (currentDir && currentDir.parentDirId) {
    const parent = await Directory.findOne({ _id: currentDir.parentDirId, userId: req.user._id }).lean();
    if (!parent) break;
    breadcrumbs.unshift({ id: parent._id, name: parent.name });
    currentDir = parent;
  }
  breadcrumbs.push({ id: directoryData._id, name: directoryData.name });

  const responseData = {
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
    breadcrumbs,
  };

  // 2. Set Cache
  try {
    // Cache for 1 hour, or until invalidated
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
  } catch (err) {
    console.error("Redis Set Error:", err);
  }

  return res.status(200).json(responseData);
};

export const createDirectory = async (req, res, next) => {
  const user = req.user;

  const parentDirId = req.params.parentDirId || user.rootDirId.toString();
  const dirname = req.headers.dirname || "New Folder";
  try {
    const parentDir = await Directory.findOne({
      _id: parentDirId,
    }).lean();

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    await Directory.create({
      name: dirname,
      parentDirId,
      userId: user._id,
    });

    // Invalidate Parent Directory Cache
    await redisClient.del(`directory:${parentDirId}`);

    return res.status(201).json({ message: "Directory Created!" });
  } catch (err) {
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else {
      next(err);
    }
  }
};

export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;
  try {
    await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      { name: newDirName }
    );

    // Invalidate Parent Directory Cache (Need to fetch parent first to be precise, or assuming we have it?)
    // Actually the directory itself is changed (name), so we should invalidate:
    // 1. The directory listing of its parent (because name changed there)
    // 2. The directory's own listing (if we cache metadata like name in the response)

    // We didn't fetch the directory to get parentId here in the original code. 
    // Optimization: findOne before updating or just invalidate if we can.
    // Let's do a quick find to get parentId.
    const dir = await Directory.findById(id);
    if (dir) {
      await redisClient.del(`directory:${dir.parentDirId}`);
      await redisClient.del(`directory:${id}`);
    }

    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const directoryData = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    }).lean();

    if (!directoryData) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    async function getDirectoryContents(id) {
      let files = await File.find({ parentDirId: id })
        .select("extension size category")
        .lean();
      let directories = await Directory.find({ parentDirId: id })
        .select("_id")
        .lean();

      for (const { _id } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(_id);

        files = [...files, ...childFiles];
        directories = [...directories, ...childDirectories];
      }

      return { files, directories };
    }

    const { files, directories } = await getDirectoryContents(id);

    // Prepare S3 keys for deletion
    const keys = files.map(({ _id, extension }) => ({
      Key: `${_id}${extension}`,
    }));

    // If there are files to delete from S3
    if (keys.length > 0) {
      try {
        await deleteS3Files(keys);
      } catch (e) {
        console.error("S3 Deletion Error:", e);
        // Proceed to delete DB stats anyway to avoid inconsistency?
      }
    }

    // Delete Files from DB
    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });

    // Delete Directories from DB
    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] },
    });

    // Update parent directory size
    await updateDirectoriesSize(directoryData.parentDirId, -directoryData.size);

    // Invalidate Parent Directory Cache
    await redisClient.del(`directory:${directoryData.parentDirId}`);
    // Also invalidate the deleted directory's cache (just in case)
    await redisClient.del(`directory:${id}`);

    // Calculate Storage Stats to decrease
    let totalSize = 0;
    const categoryStats = {
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      other: 0,
    };

    files.forEach((file) => {
      totalSize += file.size || 0;
      const cat = file.category || 'other';
      if (categoryStats[cat] !== undefined) {
        categoryStats[cat] += file.size || 0;
      } else {
        categoryStats['other'] += file.size || 0;
      }
    });

    // Update User Storage Usage
    const updateQuery = {
      $inc: {
        usedStorageInBytes: -totalSize,
      }
    };
    for (const [cat, size] of Object.entries(categoryStats)) {
      if (size > 0) {
        updateQuery.$inc[`${cat}Bytes`] = -size;
      }
    }

    if (totalSize > 0) {
      await User.findByIdAndUpdate(req.user._id, updateQuery);
    }

  } catch (err) {
    next(err);
  }
  return res.json({ message: "Files deleted successfully" });
};