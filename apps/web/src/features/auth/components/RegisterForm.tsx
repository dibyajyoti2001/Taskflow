'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@taskflow/shared';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister, extractApiError } from '../hooks/useAuth';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const { mutate, isPending, isError, error } = useRegister();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>

      {isError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {extractApiError(error)}
        </div>
      )}

      <Input
        id="name"
        label="Full name"
        placeholder="Alice Smith"
        error={errors.name?.message ?? ''}
        {...register('name')}
      />
      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="alice@example.com"
        error={errors.email?.message ?? ''}
        {...register('email')}
      />
      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        error={errors.password?.message ?? ''}
        {...register('password')}
      />

      <Button type="submit" isLoading={isPending} className="w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
