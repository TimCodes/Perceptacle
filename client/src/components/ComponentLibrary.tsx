import { useState } from 'react';
import { Search } from 'lucide-react';
import { cloudComponents } from '@/lib/cloudComponents';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ComponentLibraryProps {
  setNodes: (updater: (nodes: any[]) => any[]) => void;
}

export default function ComponentLibrary({ setNodes }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = cloudComponents.filter(
    component => component.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full p-4">
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

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="space-y-2">
          {filteredComponents.map((component) => (
            <div
              key={component.type}
              className={cn(
                "p-2 border rounded-md cursor-grab",
                "hover:bg-accent hover:text-accent-foreground",
                "flex items-center gap-2"
              )}
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
            >
              <component.icon className="h-5 w-5" />
              <span className="text-sm">{component.label}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}