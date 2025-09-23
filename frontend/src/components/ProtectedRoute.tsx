import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { SidebarInset } from './ui/sidebar';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/signin" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 min-w-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};