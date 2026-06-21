import { Schema, model, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as { _id?: unknown; id?: unknown; passwordHash?: unknown };
        r.id = r._id;
        delete r._id;
        delete r.passwordHash;
      },
    },
  },
);

userSchema.index({ email: 1 });

export const UserModel: Model<IUser> = model<IUser>("User", userSchema);
