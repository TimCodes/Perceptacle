import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiagramStore } from "@/utils/diagram-store";
import { Settings as SettingsIcon, Library } from "lucide-react";
import { useLocation } from "wouter";

export default function NavBar() {
  const [location, setLocation] = useLocation();
  return (
    <nav className="bg-stone-900 border-b">
      <div className="flex justify-between h-16 ml-10">
        <div className="flex ">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              GitHub Manager(S)
            </Button>
            <Button variant={location === "/dashboard" ? "secondary" : "ghost"} onClick={() => setLocation("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Team Filter */}
          <div className="w-[200px]">
            <Select
              value={useDiagramStore((state) => state.ownerFilter) || "all"}
              onValueChange={(val) => useDiagramStore.getState().setOwnerFilter(val === "all" ? null : val)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="Platform">Platform</SelectItem>
                <SelectItem value="Checkout">Checkout</SelectItem>
                <SelectItem value="Search">Search</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
                <SelectItem value="SRE">SRE</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
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
      </div>
    </nav>
  );
}
