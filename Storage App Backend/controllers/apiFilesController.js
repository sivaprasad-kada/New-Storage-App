import File from "../models/fileModel.js";
import Directory from "../models/directoryModel.js";

export const getFolderFiles = async (req, res) => {
  const { folderId } = req.params;
  const targetFolderId = (folderId === "undefined" || !folderId) ? req.user.rootDirId : folderId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  try {
    const [files, folders] = await Promise.all([
      File.find({ userId: req.user._id, parentDirId: targetFolderId, isUploading: false })
        .select('_id name size category extension parentDirId createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Directory.find({ userId: req.user._id, parentDirId: targetFolderId })
        .select('_id name parentDirId createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);
    
    const formattedFiles = files.map(f => ({
      _id: f._id,
      name: f.name,
      size: f.size || 0,
      type: f.category || f.extension || 'file',
      folderId: f.parentDirId,
      createdAt: f.createdAt
    }));

    const formattedFolders = folders.map(d => ({
      _id: d._id,
      name: d.name,
      size: 0,
      type: 'folder',
      folderId: d.parentDirId,
      createdAt: d.createdAt
    }));

    res.json({ success: true, files: [...formattedFolders, ...formattedFiles] });
  } catch (error) {
    console.error("Folder files error:", error);
    res.status(500).json({ error: "Could not fetch folder files" });
  }
};
