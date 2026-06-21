'use client';

import { useState } from 'react';
import type { TaskDto, TaskStatus, BoardRole } from '@taskflow/shared';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { EditTaskModal } from './EditTaskModal';

interface TaskCardProps {
  task: TaskDto;
  boardId: string;
  myRole: BoardRole;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
};

const NEXT_LABEL: Record<TaskStatus, string | null> = {
  todo: 'Start',
  in_progress: 'Complete',
  done: null,
};

export function TaskCard({ task, boardId, myRole }: TaskCardProps) {
  const canModify = myRole === 'owner' || myRole === 'editor';
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(boardId);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(boardId);

  const nextStatus = NEXT_STATUS[task.status];
  const nextLabel = NEXT_LABEL[task.status];

  return (
    <>
      <div className="bg-white rounded-md border border-gray-200 p-3 shadow-sm space-y-2 group">
        <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>

        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
        )}

        {task.assigneeName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-[10px]">
              {task.assigneeName.charAt(0).toUpperCase()}
            </span>
            {task.assigneeName}
          </div>
        )}

        {canModify && (
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            {/* Advance button — hover-only, hidden for done tasks */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              {nextStatus && nextLabel ? (
                <Button
                  size="sm"
                  variant="ghost"
                  isLoading={isUpdating}
                  onClick={() => updateTask({ taskId: task.id, data: { status: nextStatus } })}
                  className="text-xs"
                >
                  {nextLabel} →
                </Button>
              ) : null}
            </span>

            <div className="flex items-center gap-1">
              {/* Edit hidden for done tasks — completed tasks are locked */}
              {task.status !== 'done' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditOpen(true)}
                  className="text-xs"
                >
                  Edit
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                isLoading={isDeleting}
                onClick={() => {
                  if (confirm('Delete this task?')) deleteTask(task.id);
                }}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {canModify && (
        <EditTaskModal
          boardId={boardId}
          task={task}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
