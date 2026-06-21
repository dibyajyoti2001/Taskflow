import { Schema, model, type Document, type Model, type Types } from "mongoose";
import type { TaskStatus } from "@taskflow/shared";

export interface ITask extends Document {
  boardId: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: Types.ObjectId | null;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

// The primary query pattern: tasks for a board, optionally filtered by status
taskSchema.index({ boardId: 1, status: 1 });
taskSchema.index({ boardId: 1, createdAt: -1 });

export const TaskModel: Model<ITask> = model<ITask>("Task", taskSchema);
