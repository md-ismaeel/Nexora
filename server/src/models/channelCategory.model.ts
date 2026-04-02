import mongoose, { Schema, type Model } from "mongoose";
import type { IChannelCategory } from "@/types/models";

const channelCategorySchema = new Schema<IChannelCategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [1, "Category name must be at least 1 character"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    server: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: [true, "Server ID is required"],
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

channelCategorySchema.index({ server: 1, position: 1 });

export const ChannelCategoryModel: Model<IChannelCategory> =
  (mongoose.models["ChannelCategory"] as Model<IChannelCategory>) ??
  mongoose.model<IChannelCategory>("ChannelCategory", channelCategorySchema);