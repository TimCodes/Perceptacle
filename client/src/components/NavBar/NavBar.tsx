import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Library } from "lucide-react";
import { useLocation } from "wouter";

export default function NavBar() {
  const [_, setLocation] = useLocation();
  return (
    <nav className="bg-stone-900 border-b">
      <div className="flex justify-between h-16 ml-10">
        <div className="flex ">
          <div className="flex-shrink-0 flex items-center">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              GitHub Manager
            </Button>
          </div>
        </div>

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
      </div>
    </nav>
  );
}
