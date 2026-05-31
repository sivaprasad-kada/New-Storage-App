import mongoose from "mongoose";

const fileShareSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: true,
        index: true
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
        index: true
    },

    receiverEmail: {
        type: String,
        default: null
    },

    shareToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    accessType: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },

    permission: {
        type: String,
        enum: ["view", "edit"],
        default: "view"
    },

    expiresAt: {
        type: Date,
        default: null
    },

    password: {
        type: String, // hashed password
        default: null
    },

    maxDownloads: {
        type: Number,
        default: null
    },

    downloadCount: {
        type: Number,
        default: 0
    },

    isRevoked: {
        type: Boolean,
        default: false,
        index: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    removedByReceiver: {
        type: Boolean,
        default: false
    },

    removedByOwner: {
        type: Boolean,
        default: false
    }
});

// TTL index for auto-delete expired links
fileShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("FileShare", fileShareSchema);