'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMemberSchema, type AddMemberInput } from '@taskflow/shared';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAddMember } from '../hooks/useBoards';

interface AddMemberModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ boardId, isOpen, onClose }: AddMemberModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberInput>({ resolver: zodResolver(addMemberSchema) });

  const { mutate, isPending } = useAddMember(boardId);

  const onSubmit = (data: AddMemberInput) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="colleague@example.com"
          error={errors.email?.message ?? ''}
          {...register('email')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('role')}
          >
            <option value="editor">Editor — can create and update tasks</option>
            <option value="viewer">Viewer — read-only access</option>
          </select>
          {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            Add member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
