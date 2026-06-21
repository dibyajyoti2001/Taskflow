import type { BoardRole } from '../constants/index';
import { ROLE_HIERARCHY } from '../constants/index';

export function hasMinimumRole(
  userRole: BoardRole,
  requiredRole: BoardRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
