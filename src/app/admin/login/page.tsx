'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?redirect=/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider animate-pulse">
        Redirecting to unified authentication...
      </div>
    </div>
  );
}
