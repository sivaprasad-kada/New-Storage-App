import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import redisClient from "../config/redis.js";

export const globalSearch = async (req, res) => {
  try {
    const query = req.query.q || "";
    if (!query) {
      return res.json({ success: true, files: [] });
    }

    const cacheKey = `search:${req.user._id}:${query.toLowerCase()}`;
    
    // Check Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, files: JSON.parse(cachedData) });
    }

    // Query MongoDB
    const searchRegex = new RegExp(query, 'i');
    
    const [files, folders] = await Promise.all([
      File.find({
        userId: req.user._id,
        isUploading: false,
        $or: [
          { searchName: searchRegex },
          { name: searchRegex }
        ]
      })
      .select('_id name size category extension parentDirId createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
      
      Directory.find({
        userId: req.user._id,
        name: searchRegex,
        parentDirId: { $ne: null }
      })
      .select('_id name parentDirId createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
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

    const results = [...formattedFolders, ...formattedFiles].slice(0, 20);

    // Store in Redis (5 minutes)
    await redisClient.set(cacheKey, JSON.stringify(results), { EX: 300 });

    return res.json({ success: true, files: results });

  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};
