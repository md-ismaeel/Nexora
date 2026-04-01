import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";
import type { IUser, IUserMethods, IUserPreferences } from "@/types/models";

// Types
type UserModelType = Model<IUser, Record<string, never>, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

// Constants
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const DEFAULT_PREFERENCES: IUserPreferences = {
  theme: "dark",
  language: "en",
  notifications: {
    email: true,
    push: true,
    mentions: true,
    directMessages: true,
  },
};

// Schema
const userSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "email";
      },
      minlength: 8,
      select: false,
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      minlength: 2,
      maxlength: 32,
    },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      minlength: 10,
      maxlength: 15,
    },
    avatar: {
      type: String,
      default: DEFAULT_AVATAR,
    },
    avatarPublicId: {
      type: String,
      default: null,
      select: false,
    },
    avatarKey: {
      type: String,
      default: null,
      select: false,
    },
    provider: {
      type: String,
      enum: ["email", "google", "github", "facebook"],
      required: true,
    },
    providerId: {
      type: String,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "away", "dnd"],
      default: "offline",
    },
    customStatus: {
      type: String,
      maxlength: 128,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
      default: "",
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    servers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Server",
      },
    ],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      type: {
        theme: {
          type: String,
          enum: ["light", "dark", "auto"],
          default: "dark",
        },
        language: {
          type: String,
          default: "en",
        },
        notifications: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          mentions: { type: Boolean, default: true },
          directMessages: { type: Boolean, default: true },
        },
      },
      default: () => ({ ...DEFAULT_PREFERENCES }),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ status: 1 });
userSchema.index({ lastSeen: -1 });
userSchema.index({ createdAt: -1 });

// Virtual
userSchema.virtual("displayName").get(function (this: IUser) {
  return this.username ?? this.name;
});

// Methods
userSchema.methods.isOnline = function (this: IUser) {
  return this.status === "online";
};

// JSON transform
userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.password;
    delete ret.avatarPublicId;
    delete ret.avatarKey;
    return ret;
  },
});

// Prevent model overwrite in dev (important with nodemon)
const UserModel = mongoose.model<IUser, UserModelType>("User", userSchema);
export { UserModel };