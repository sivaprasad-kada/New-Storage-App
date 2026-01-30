import { rm } from "fs/promises";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import mongoose from "mongoose";
export const getDirectory = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId.toString();
  const directoryData = await Directory.findOne({ _id }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await File.find({ parentDirId: directoryData._id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();
  const responseData = {
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  };
  // console.log(`Debug GetDirectory ${directoryData.name}:`, responseData.files[0]);
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
      userId: user._id,
      parentDirId
    });
    return res.status(201).json({ message: "Directory Created!" });
  } catch (err) {
    console.log("this error from : ", err);
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else {
      next(err);
    }
  }
};
// below code is use for versioning error it take 30 minutes to debug.
/* export const createDirectory = async(req,res,next) =>{
    try {
    console.log("=== Debug Start ===");
    console.log("req.headers:", req.headers);
    console.log("req.user._id:", req.user._id);
    console.log("Type of req.user._id:", typeof req.user._id);

    // Convert to ObjectId explicitly (important)
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const newDir = {
      name: req.headers.dirname,
      userId: userId,
      parentDirId: req.body.parentDirId || null,
    };

    console.log("Document to insert:", newDir);

    const created = await Directory.create(newDir);
    console.log("Inserted Successfully:", created);

    res.status(201).json(created);
  } catch (err) {
    console.log("=== Mongo Validation Error ===");
    console.error(JSON.stringify(err, null, 2));
    res.status(500).json({ error: err.message });
  }
} */
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
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};
/* MY THINKING IS IN CRUD LEVEL BUT I SHOULD THINK WHENEVER I MAKE DB REQUSTS OR ANY MODIFICATION
IN DATABASE LEVEL I SHOULD THINK IN REAL WORLD CASE NOT TAST-CASE I SHOULD USE TRANSACTION CONCEPT WHENEVER
IT NEEDED */
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
    let dirId = directoryData.parentDirId
    while(dirId){
    console.log("dir Id from directory route",dirId)
    let parentDirData = await Directory.findById(dirId)
     parentDirData.size-= directoryData.size; 
     parentDirData.save();
     dirId = parentDirData.parentDirId
    }
    async function getDirectoryContents(id) {
      let files = await File.find({ parentDirId: id })
        .select("extension")
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

    for (const { _id, extension } of files) {
      await rm(`./storage/${_id.toString()}${extension}`);
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });

    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] },
    });
  } catch (err) {
    next(err);
  }
  return res.json({ message: "Files deleted successfully" });
};
/* export const deleteDirectory = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    // 1️⃣ Fetch directory (we need size + parent)
    const directory = await Directory.findOne(
      { _id: id, userId: req.user._id },
      null,
      { session }
    );

    if (!directory) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Directory not found" });
    }

    const deletedSize = directory.size;

    // 2️⃣ Propagate size change to all parents (SAFE)
    let parentId = directory.parentDirId;

    while (parentId) {
      const parent = await Directory.findById(parentId, null, { session });

      await Directory.updateOne(
        { _id: parentId },
        { $inc: { size: -deletedSize } },
        { session }
      );

      parentId = parent.parentDirId;
    }

    // 3️⃣ Get ALL sub-directories in one query
    const allDirs = await Directory.find(
      { path: { $regex: `^${directory.path}` } },
      "_id",
      { session }
    );

    const dirIds = allDirs.map(d => d._id);

    // 4️⃣ Get ALL files inside those directories
    const files = await File.find(
      { parentDirId: { $in: dirIds } },
      "_id extension",
      { session }
    );

    // 5️⃣ Delete physical files
    for (const file of files) {
      await rm(`./storage/${file._id}${file.extension}`, { force: true });
    }

    // 6️⃣ Delete DB records
    await File.deleteMany(
      { parentDirId: { $in: dirIds } },
      { session }
    );

    await Directory.deleteMany(
      { _id: { $in: dirIds } },
      { session }
    );

    // 7️⃣ Commit — ALL OR NOTHING
    await session.commitTransaction();
    session.endSession();

    return res.json({ message: "Directory deleted successfully" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}; */