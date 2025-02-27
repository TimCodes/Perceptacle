import { Switch, Route } from "wouter";
import { queryClient } from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import NodeTypes from "@/pages/node-types";
import { ThemeProvider } from "./utils/theme-provider";

import Navbar from "@/components/navbar";

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

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Router />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
