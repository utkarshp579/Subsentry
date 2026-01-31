'use client';

import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '../components/DashboardLayout';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <DashboardLayout title="Profile" subtitle="Account details">
        <div className="py-16 text-center text-gray-400">Loading profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" subtitle="Account details">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
          <div className="flex items-center gap-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? 'User avatar'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1f1f1f]" />
            )}
            <div>
              <div className="text-xl font-semibold text-white">
                {user?.fullName ?? 'SubSentry User'}
              </div>
              <div className="text-sm text-gray-400">
                {user?.primaryEmailAddress?.emailAddress ?? 'No email on file'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Account Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div className="text-xs text-gray-500">User ID</div>
              <div className="mt-1">{user?.id ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Joined</div>
              <div className="mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Last Active</div>
              <div className="mt-1">
                {user?.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleString()
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Username</div>
              <div className="mt-1">{user?.username ?? '-'}</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
