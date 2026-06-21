'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTaskSchema, type UpdateTaskInput, type TaskDto } from '@taskflow/shared';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateTask } from '../hooks/useTasks';

interface EditTaskModalProps {
  boardId: string;
  task: TaskDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ boardId, task, isOpen, onClose }: EditTaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
    },
  });

  // Keep form in sync if a different task is opened
  useEffect(() => {
    reset({ title: task.title, description: task.description, status: task.status });
  }, [task.id, reset]);

  const { mutate, isPending } = useUpdateTask(boardId);

  const onSubmit = (data: UpdateTaskInput) => {
    mutate(
      { taskId: task.id, data },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit task">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="edit-title"
          label="Title"
          error={errors.title?.message ?? ''}
          {...register('title')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="edit-description"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            {...register('description')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-status" className="text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="edit-status"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('status')}
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
          <Button type="submit" isLoading={isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
