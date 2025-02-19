import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import NodeTypes from "@/pages/node-types";
import { ThemeProvider } from "./lib/theme-provider";
import { Button } from "./components/ui/button";
import { Settings as SettingsIcon, Library } from "lucide-react";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/node-types" component={NodeTypes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NavButtons() {
  const [_, setLocation] = useLocation();

  return (
    <div className="absolute right-12 top-4 z-50 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setLocation("/node-types")}
      >
        <Library className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setLocation("/settings")}
      >
        <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          <NavButtons />
          <Router />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
