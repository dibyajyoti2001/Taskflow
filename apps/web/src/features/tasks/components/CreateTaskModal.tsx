"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTaskSchema,
  type CreateTaskInput,
  TASK_STATUSES,
} from "@taskflow/shared";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateTask } from "../hooks/useTasks";

interface CreateTaskModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({
  boardId,
  isOpen,
  onClose,
}: CreateTaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({ resolver: zodResolver(createTaskSchema) });

  const { mutate, isPending } = useCreateTask(boardId);

  const onSubmit = (data: CreateTaskInput) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create task">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="title"
          label="Task title"
          placeholder="e.g. Implement JWT auth"
          error={errors.title?.message ?? ""}
          {...register("title")}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Acceptance criteria, context..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            {...register("description")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Initial status
          </label>
          <select
            id="status"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("status")}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
