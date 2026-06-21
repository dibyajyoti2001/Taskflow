'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@taskflow/shared';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin, extractApiError } from '../hooks/useAuth';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending, isError, error } = useLogin();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">Sign in to TaskFlow</h2>

      {isError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {extractApiError(error)}
        </div>
      )}

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
        placeholder="Your password"
        error={errors.password?.message ?? ''}
        {...register('password')}
      />

      <Button type="submit" isLoading={isPending} className="w-full">
        Sign in
      </Button>

      <p className="text-center text-sm text-gray-500">
        No account yet?{' '}
        <Link href="/register" className="text-brand-600 hover:underline font-medium">
          Create one
        </Link>
      </p>
    </form>
  );
}
