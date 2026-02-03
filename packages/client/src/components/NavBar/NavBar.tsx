import { Button } from "@/components/ui/button";


import { Settings as SettingsIcon } from "lucide-react";
import { useLocation } from "wouter";
import SynapseLogo from "@/assets/SynapseLogo.png";

export default function NavBar() {
  const [location, setLocation] = useLocation();
  return (
    <nav className="bg-stone-900 border-b">
      <div className="flex justify-between h-16 ml-10">
        <div className="flex ">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")} className="flex items-center gap-2">
              <img src={SynapseLogo} alt="Synapse Logo" className="h-8 w-8" />
            
            </Button>
            <Button variant={location === "/dashboard" ? "secondary" : "ghost"} onClick={() => setLocation("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">


          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/settings")}
            >
              <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
