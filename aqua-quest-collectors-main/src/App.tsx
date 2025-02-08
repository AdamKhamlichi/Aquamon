
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Social from "./pages/Social";
import Chat from "./pages/Chat";
import Pokedex from "./pages/Pokedex";
import Challenges from "./pages/Challenges";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={session ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route
              path="/"
              element={session ? <Index /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/social"
              element={session ? <Social /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/chat"
              element={session ? <Chat /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/pokedex"
              element={session ? <Pokedex /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/challenges"
              element={session ? <Challenges /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
