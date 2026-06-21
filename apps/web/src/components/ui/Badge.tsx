import type { TaskStatus, BoardRole } from '@taskflow/shared';

type BadgeVariant = TaskStatus | BoardRole | 'default';

const variantStyles: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  owner: 'bg-purple-100 text-purple-700',
  editor: 'bg-yellow-100 text-yellow-700',
  viewer: 'bg-gray-100 text-gray-600',
  default: 'bg-gray-100 text-gray-700',
};

const labels: Record<string, string> = {
  in_progress: 'In Progress',
  todo: 'Todo',
  done: 'Done',
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

export function Badge({ variant = 'default' }: { variant?: string }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        variantStyles[variant] ?? variantStyles['default'],
      ].join(' ')}
    >
      {labels[variant] ?? variant}
    </span>
  );
}
