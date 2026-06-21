import { Schema, model, type Document, type Model, type Types } from "mongoose";
import type { BoardRole } from "@taskflow/shared";

export interface IBoardMember {
  userId: Types.ObjectId;
  role: BoardRole;
}

export interface IBoard extends Document {
  name: string;
  description: string;
  members: IBoardMember[];
  createdAt: Date;
  updatedAt: Date;
}

const boardMemberSchema = new Schema<IBoardMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "editor", "viewer"], required: true },
  },
  { _id: false },
);

const boardSchema = new Schema<IBoard>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    members: { type: [boardMemberSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as { _id?: unknown; id?: unknown };
        r.id = r._id;
        delete r._id;
      },
    },
  },
);

// Fast lookup: "which boards does user X belong to?"
boardSchema.index({ "members.userId": 1 });

export const BoardModel: Model<IBoard> = model<IBoard>("Board", boardSchema);
