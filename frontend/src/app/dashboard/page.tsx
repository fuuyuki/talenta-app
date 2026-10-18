'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Check if token exists
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    // 2. Test the protected backend route (we'll build this route next!)
    fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => console.log("Protected data from NestJS:", data))
    .catch(err => console.error(err));

  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard, {user.email}</h1>
      <p className="text-gray-600">Role: {user.role}</p>

      <button
        onClick={() => { localStorage.clear(); router.push('/login'); }}
        className="mt-8 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
