'use client';

import { useState } from 'react';
import { useBoards } from '@/features/boards/hooks/useBoards';
import { BoardCard } from '@/features/boards/components/BoardCard';
import { CreateBoardModal } from '@/features/boards/components/CreateBoardModal';
import { Button } from '@/components/ui/Button';

export default function BoardsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: boards, isLoading, isError } = useBoards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
          <p className="text-sm text-gray-500 mt-1">
            Boards you own or are a member of
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ New Board</Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load boards. Please refresh.
        </div>
      )}

      {boards && boards.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No boards yet</p>
          <p className="text-sm mt-1">Create your first board to get started.</p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            Create a board
          </Button>
        </div>
      )}

      {boards && boards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
