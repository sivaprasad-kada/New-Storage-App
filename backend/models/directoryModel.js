import { model, Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Directory",
    },
    size : {
      type : Number,
      default : 0
    }
  },

  {
    versionKey: false,
    timestamps: true,
  },
  {
    strict: "throw",
  }
);

const Directory = model("Directory", directorySchema);

export default Directory;
