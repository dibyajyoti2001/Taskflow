import type { AuthTokenDto, RegisterInput, LoginInput } from '@taskflow/shared';
import { apiClient } from '@/lib/axios';
import type { ApiSuccess } from '@taskflow/shared';

export async function registerUser(data: RegisterInput): Promise<AuthTokenDto> {
  const res = await apiClient.post<ApiSuccess<AuthTokenDto>>('/auth/register', data);
  return res.data.data;
}

export async function loginUser(data: LoginInput): Promise<AuthTokenDto> {
  const res = await apiClient.post<ApiSuccess<AuthTokenDto>>('/auth/login', data);
  return res.data.data;
}
