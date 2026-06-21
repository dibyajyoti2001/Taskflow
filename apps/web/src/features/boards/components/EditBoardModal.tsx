'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateBoardSchema, type UpdateBoardInput, type BoardDto } from '@taskflow/shared';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateBoard } from '../hooks/useBoards';

interface EditBoardModalProps {
  board: Pick<BoardDto, 'id' | 'name' | 'description'>;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBoardModal({ board, isOpen, onClose }: EditBoardModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateBoardInput>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: { name: board.name, description: board.description },
  });

  useEffect(() => {
    reset({ name: board.name, description: board.description });
  }, [board.id, reset]);

  const { mutate, isPending } = useUpdateBoard(board.id);

  const onSubmit = (data: UpdateBoardInput) => {
    mutate(data, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit board">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="board-name"
          label="Board name"
          error={errors.name?.message ?? ''}
          {...register('name')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="board-description" className="text-sm font-medium text-gray-700">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="board-description"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            {...register('description')}
          />
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
