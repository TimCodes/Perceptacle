import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { theme } from "./lib/theme";
import { ThemeProvider } from "./lib/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <div className="relative">
            <div className="absolute right-4 top-4 z-50">
              <ThemeToggle />
            </div>
            <Router />
          </div>
        </QueryClientProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
}

export default App;