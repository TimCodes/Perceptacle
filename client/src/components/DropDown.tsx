import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cloudComponents } from "@/utils/cloudComponents";

interface CloudComponent {
  type: string;
  label: string;
  icon: any;
  category: string;
}

interface DropDownProps {
  onComponentSelect: (component: CloudComponent) => void;
}

function DropDown({ onComponentSelect }: DropDownProps) {
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] =
    useState<CloudComponent | null>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start" sideOffset={5}>
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <CommandInput
                placeholder="Search components..."
                className="py-3 h-12 text-sm"
              />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto p-2">
              <CommandEmpty>No components found.</CommandEmpty>
              <CommandGroup
                heading="Cloud Components"
                className="text-xs text-muted-foreground"
              >
                {cloudComponents.map((component) => {
                  const Icon = component.icon;
                  return (
                    <CommandItem
                      key={component.type}
                      onSelect={() => {
                        setSelectedComponent(component);
                        onComponentSelect(component);
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md cursor-grab"
                      draggable
                      onDragStart={(e) => onDragStart(e, component.type)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium truncate">
                          {component.label}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {component.category}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedComponent && (
        <div className="fixed top-20 left-6 max-w-sm p-6 bg-card rounded-lg shadow-lg border">
          <h2 className="text-2xl font-semibold mb-2">
            {selectedComponent.label}
          </h2>
          <p className="text-muted-foreground">
            Category: {selectedComponent.category}
          </p>
        </div>
      )}
    </div>
  );
}

export default DropDown;
