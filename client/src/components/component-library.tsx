import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { getCloudComponents } from '@/lib/cloudComponents';

interface ComponentLibraryProps {
  setNodes?: (updater: (nodes: any[]) => any[]) => void;
}

export default function ComponentLibrary({ setNodes }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const components = getCloudComponents();

  const filteredComponents = components.filter(
    component => component.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Components</h2>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="grid grid-cols-2 gap-2">
          {filteredComponents.map((component) => {
            const Icon = component.icon;
            return (
              <div
                key={component.type}
                className="flex flex-col items-center p-2 border rounded-md cursor-grab hover:bg-accent hover:text-accent-foreground"
                draggable
                onDragStart={(e) => onDragStart(e, component.type)}
              >
                <Icon className="w-8 h-8 mb-1" />
                <span className="text-sm text-center">{component.label}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}