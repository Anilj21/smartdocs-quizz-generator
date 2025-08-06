import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import QuizViewer from "@/pages/quiz-viewer";
import QuizLibrary from "@/pages/quiz-library";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quiz/:id" component={QuizViewer} />
      <Route path="/library" component={QuizLibrary} />
      <Route path="/settings" component={() => <div className="p-8">Settings page coming soon</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-slate-50">
            <Navigation />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
