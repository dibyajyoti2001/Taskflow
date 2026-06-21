'use client';

import { useState } from 'react';
import type { BoardRole, TaskStatus, KanbanDto, TaskDto } from '@taskflow/shared';
import { TASK_STATUSES } from '@taskflow/shared';
import { useKanban, useFilteredTasks } from '../hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { CreateTaskModal } from './CreateTaskModal';
import { Button } from '@/components/ui/Button';

interface KanbanBoardProps {
  boardId: string;
  myRole: BoardRole;
}

const COLUMN_META: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

function isKanban(data: KanbanDto | TaskDto[] | undefined): data is KanbanDto {
  return !!data && !Array.isArray(data) && 'todo' in data;
}

export function KanbanBoard({ boardId, myRole }: KanbanBoardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);

  const { data, isLoading, isError } = useKanban(boardId);
  const kanban = isKanban(data) ? data : undefined;

  const canModify = myRole === 'owner' || myRole === 'editor';

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {COLUMN_META.map((col) => (
          <div key={col.status} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Failed to load tasks. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
          <button
            onClick={() => setStatusFilter(undefined)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              !statusFilter
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            All
          </button>
          {COLUMN_META.map(({ status, label }) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {canModify && (
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            + Add Task
          </Button>
        )}
      </div>

      {/* Kanban Columns */}
      {!statusFilter && kanban && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMN_META.map(({ status, label }) => (
            <KanbanColumn
              key={status}
              status={status}
              title={label}
              tasks={kanban[status]}
              boardId={boardId}
              myRole={myRole}
            />
          ))}
        </div>
      )}

      {/* Filtered single-column view */}
      {statusFilter && (
        <FilteredView boardId={boardId} status={statusFilter} myRole={myRole} />
      )}

      <CreateTaskModal
        boardId={boardId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

function FilteredView({
  boardId,
  status,
  myRole,
}: {
  boardId: string;
  status: TaskStatus;
  myRole: BoardRole;
}) {
  const { tasks = [], isLoading } = useFilteredTasks(boardId, status);
  const meta = COLUMN_META.find((c) => c.status === status)!;

  if (isLoading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <KanbanColumn
      status={status}
      title={meta.label}
      tasks={tasks}
      boardId={boardId}
      myRole={myRole}
    />
  );
}
