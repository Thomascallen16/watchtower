import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import WatchtowerLanding from "./pages/WatchtowerLanding";
import Onboarding from "./pages/Onboarding";
import WatchtowerApp from "./pages/WatchtowerApp";
import SupplyChain from "./pages/SupplyChain";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={WatchtowerLanding} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/app/supply-chain"} component={SupplyChain} />
      <Route path={"/app/:rest*"} component={WatchtowerApp} />
      <Route path={"/app"} component={WatchtowerApp} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider><Toaster /><Router /></TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
