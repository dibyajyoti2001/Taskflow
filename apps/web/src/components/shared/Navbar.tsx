'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuth, getStoredUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    // Wipe the entire query cache so the next user never sees stale data
    // from the previous session when they log in on the same browser tab.
    queryClient.clear();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <Link href="/boards" className="text-lg font-bold text-brand-600 tracking-tight">
          TaskFlow
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-sm text-gray-600">
              {user.name}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
