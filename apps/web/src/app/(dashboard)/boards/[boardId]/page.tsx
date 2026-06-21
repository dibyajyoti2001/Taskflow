'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBoard, useRemoveMember, useUpdateMemberRole } from '@/features/boards/hooks/useBoards';
import { AddMemberModal } from '@/features/boards/components/AddMemberModal';
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard';
import type { BoardRole } from '@taskflow/shared';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStoredUser } from '@/lib/auth';

const roleBadgeStyles: Record<BoardRole, string> = {
  owner: 'bg-purple-100 text-purple-700',
  editor: 'bg-yellow-100 text-yellow-700',
  viewer: 'bg-gray-100 text-gray-600',
};

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params['boardId'] as string;
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const { data: board, isLoading, isError } = useBoard(boardId);
  const { mutate: removeMember } = useRemoveMember(boardId);
  const { mutate: updateMemberRole } = useUpdateMemberRole(boardId);
  const currentUser = getStoredUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded-md animate-pulse w-64" />
        <div className="h-6 bg-gray-100 rounded-md animate-pulse w-96" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">Board not found or you don't have access.</p>
        <Link href="/boards" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          ← Back to boards
        </Link>
      </div>
    );
  }

  const isOwner = board.myRole === 'owner';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/boards" className="hover:text-brand-600">Boards</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{board.name}</span>
          </div>
          {board.description && (
            <p className="text-sm text-gray-500 max-w-prose">{board.description}</p>
          )}
        </div>
        <Badge variant={board.myRole} />
      </div>

      {/* Members Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Members ({board.members.length})
          </h2>
          {isOwner && (
            <Button size="sm" variant="secondary" onClick={() => setIsAddMemberOpen(true)}>
              + Add member
            </Button>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {board.members.map((member) => {
            const isSelf = member.userId === currentUser?.id;
            const canManage = isOwner && !isSelf;
            return (
              <div
                key={member.userId}
                className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-800 font-medium truncate">
                    {member.name}
                  </span>
                  {isSelf && (
                    <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                  )}
                </div>

                {canManage ? (
                  <div className="relative inline-flex items-center">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateMemberRole({
                          userId: member.userId,
                          data: { role: e.target.value as BoardRole },
                        })
                      }
                      className={[
                        'appearance-none cursor-pointer rounded-full pl-2.5 pr-6 py-0.5 text-xs font-medium',
                        'border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-400',
                        roleBadgeStyles[member.role],
                      ].join(' ')}
                    >
                      <option value="owner">Owner</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <span className="pointer-events-none absolute right-2 text-[10px] opacity-60">▾</span>
                  </div>
                ) : (
                  <Badge variant={member.role} />
                )}

                {canManage && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.name} from the board?`)) {
                        removeMember(member.userId);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 text-sm leading-none transition-colors"
                    aria-label={`Remove ${member.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard boardId={boardId} myRole={board.myRole} />

      <AddMemberModal
        boardId={boardId}
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </div>
  );
}
