import { Toaster } from "sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import LoginForm from "./components/LoginForm";
import Signupform from "./components/auth/Signupform";
import Signinform from "./components/auth/Signinform";
import { Loader2 } from "lucide-react";
import Homepage from "./pages/Homepage";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import RoomPage from "./pages/RoomPage";
import ProjectPage from "./pages/ProjectPage";

export default function App() {
  const { user, loading, initAuthListener } = useAuthStore();
  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  return (
    <>
      <Toaster richColors />
      {loading ? (
        <center className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </center>
      ) : (
        <Router>
          <Routes>
            <Route path="/test" element={<LoginForm />} />
            <Route path="/auth/signup" element={<Signupform />} />
            <Route path="/auth/signin" element={<Signinform />} />
            <Route
              path="/"
              element={
                user ? (
                  <>
                    <SidebarProvider>
                      <AppSidebar />
                      <SidebarInset className="flex-1 min-w-0">
                        <Homepage />
                      </SidebarInset>
                    </SidebarProvider>
                  </>
                ) : (
                  <Navigate to={"/auth/signin"} />
                )
              }
            />
            <Route
              path="rooms/:roomId"
              element={
                user ? (
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="flex-1 min-w-0">
                      <RoomPage />
                    </SidebarInset>
                  </SidebarProvider>
                ) : (
                  <Navigate to={"/auth/signin"} />
                )
              }
            />
            <Route
              path="projects/:projectId"
              element={
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <ProjectPage />
                  </SidebarInset>
                </SidebarProvider>
              }
            />
          </Routes>
        </Router>
      )}
    </>
  );
}
