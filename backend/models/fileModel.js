import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    searchName: {
      type: String,
    },
    extension: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
    size: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'other'],
      default: 'other'
    },
    isUploading: {
      type: Boolean,
      default: false
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  }
);

fileSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.searchName = this.name.toLowerCase();
  }
  next();
});

fileSchema.index({ userId: 1, parentDirId: 1, searchName: 1 });
fileSchema.index({ userId: 1, searchName: 1 });

const File = model("File", fileSchema);
export default File;
