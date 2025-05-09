// moodify\src\app\dashboard\discover\layout.tsx



import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moodify - Dashboard',
  description: 'Discover and enjoy music based on your mood',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex">
      {children}
    </div>
  );
}
