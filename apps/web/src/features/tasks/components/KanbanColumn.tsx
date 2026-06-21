import type { TaskDto, TaskStatus, BoardRole } from '@taskflow/shared';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: TaskDto[];
  boardId: string;
  myRole: BoardRole;
}

const columnStyles: Record<TaskStatus, string> = {
  todo: 'border-t-gray-400',
  in_progress: 'border-t-blue-400',
  done: 'border-t-green-400',
};

export function KanbanColumn({ title, tasks, status, boardId, myRole }: KanbanColumnProps) {
  return (
    <div
      className={[
        'flex flex-col gap-3 bg-gray-50 rounded-lg border border-gray-200 border-t-4 p-4 min-h-[400px]',
        columnStyles[status],
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} boardId={boardId} myRole={myRole} />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
