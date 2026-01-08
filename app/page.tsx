'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Redirect to dashboard based on role
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        switch (user.role) {
          case 'TEACHER':
            router.push('/teacher');
            break;
          case 'STUDENT':
            router.push('/student');
            break;
          default:
            router.push('/login');
        }
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Chekin-out</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
