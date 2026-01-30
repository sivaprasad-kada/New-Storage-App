import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  }
);

const File = model("File", fileSchema);
export default File;
