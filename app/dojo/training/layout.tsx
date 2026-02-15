import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DOJOSidebar } from '@/components/DOJOSidebar';

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DOJOSidebar />
      <SidebarInset className="overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
