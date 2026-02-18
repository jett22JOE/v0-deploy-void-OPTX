import { DOJOSidebar } from '@/components/DOJOSidebar';

export default function AugmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <DOJOSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
