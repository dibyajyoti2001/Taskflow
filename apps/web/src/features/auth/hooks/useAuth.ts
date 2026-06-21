'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { storeAuth } from '@/lib/auth';
import { loginUser, registerUser } from '../api/auth.api';
import type { RegisterInput, LoginInput } from '@taskflow/shared';
import axios from 'axios';

function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: { message?: string } })?.error?.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: (result) => {
      storeAuth(result.token, result.user);
      router.push('/boards');
    },
  });
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (result) => {
      storeAuth(result.token, result.user);
      router.push('/boards');
    },
  });
}

export { extractApiError };
