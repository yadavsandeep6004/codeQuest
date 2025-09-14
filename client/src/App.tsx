import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Problems from "@/pages/problems";
import CodeEditor from "@/pages/code-editor";
import MCQ from "@/pages/mcq";
import Submissions from "@/pages/submissions";
import Admin from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login}/>
      <Route path="/" component={Dashboard}/>
      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/problems" component={Problems}/>
      <Route path="/problems/:id" component={CodeEditor}/>
      <Route path="/mcq" component={MCQ}/>
      <Route path="/mcq/:id" component={MCQ}/>
      <Route path="/submissions" component={Submissions}/>
      <Route path="/admin" component={Admin}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="codequest-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
