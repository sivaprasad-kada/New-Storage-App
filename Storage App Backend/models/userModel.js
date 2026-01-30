import mongoose from "mongoose";
import bcrypt from "bcrypt"
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    minlength: 1,
    required: true,
    trim: true, // removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // ensures no duplicate emails
    lowercase: true, // stores all emails in lowercase
  },
  password: {
    type: String,
    select: false, // exclude from queries by default for security
  },
  rootDirId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  picture: {
    type: String,
    default:
      "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg",
  },
  role: {
    type: String,
    enum: ["Admin", "Manager", "User"],
    default: "User",
  },
  maxStorageInBytes: {
    type: Number,
    default: 500 * 1024 * 1024, // 500MB default
  },
  usedStorageInBytes: {
    type: Number,
    default: 0,
  },
  imageBytes: { type: Number, default: 0 },
  videoBytes: { type: Number, default: 0 },
  audioBytes: { type: Number, default: 0 },
  documentBytes: { type: Number, default: 0 },
  otherBytes: { type: Number, default: 0 },
}, {
  strict: true,
  versionKey: false,
  timestamps: false, // ✅ adds createdAt & updatedAt
});
userSchema.pre("save", async function (next) {
  /*  if (!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password, 12);
   next(); */
  if (!this.isModified("password")) return next();

  // Only hash if password actually exists
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

/* userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}; */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Google user, no password
  console.log("This password from the useSchema", this.password);
  return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model("Users", userSchema);
export default User;