'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BoardSummaryDto } from '@taskflow/shared';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDeleteBoard } from '../hooks/useBoards';
import { EditBoardModal } from './EditBoardModal';

interface BoardCardProps {
  board: BoardSummaryDto;
}

export function BoardCard({ board }: BoardCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { mutate: deleteBoard, isPending } = useDeleteBoard();
  const canEdit = board.myRole === 'owner' || board.myRole === 'editor';

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/boards/${board.id}`}
              className="text-base font-semibold text-gray-900 hover:text-brand-600 truncate block"
            >
              {board.name}
            </Link>
            {board.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{board.description}</p>
            )}
          </div>
          <Badge variant={board.myRole} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Updated {new Date(board.updatedAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="text-xs"
              >
                Edit
              </Button>
            )}
            {board.myRole === 'owner' && (
              <Button
                variant="ghost"
                size="sm"
                isLoading={isPending}
                onClick={() => {
                  if (confirm(`Delete board "${board.name}"?`)) {
                    deleteBoard(board.id);
                  }
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {canEdit && (
        <EditBoardModal
          board={board}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
