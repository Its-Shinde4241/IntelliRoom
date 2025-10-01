import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Signupform from "./components/auth/Signupform";
import Signinform from "./components/auth/Signinform";
import Homepage from "./pages/Homepage";
import RoomPage from "./pages/RoomPage";
import ProjectPage from "./pages/ProjectPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import FilePage from "./pages/FilePage";
import ProjectFilesPage from "./pages/ProjectFilesPage";
import AccountPage from "./pages/AccountPage";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  const { loading, initAuthListener } = useAuthStore();

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  if (loading) {
    return (

      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

        <div className="h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster richColors />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/signup" element={<Signupform />} />
          <Route path="/auth/signin" element={<Signinform />} />
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId/file/:fileId"
            element={
              <ProtectedRoute>
                <FilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId/file/:fileId"
            element={
              <ProtectedRoute>
                <FilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId/:fileType"
            element={
              <ProtectedRoute>
                <ProjectFilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}