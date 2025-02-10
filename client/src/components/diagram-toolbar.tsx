import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Plus, Download, Search } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useDiagramStore } from "@/lib/diagram-store";
import { useToast } from "@/hooks/use-toast";
import Fuse from 'fuse.js';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export default function DiagramToolbar() {
  const toast = useToast();
  const { saveDiagram, loadDiagram, clearDiagram, nodes, setSelectedNode } = useDiagramStore();
  const [open, setOpen] = useState(false);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);

  // Initialize Fuse instance when nodes change
  useEffect(() => {
    const fuseOptions = {
      keys: ['data.label', 'data.description', 'data.type'],
      threshold: 0.3,
      includeScore: true
    };
    setFuse(new Fuse(nodes, fuseOptions));
  }, [nodes]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (value: string) => {
    if (!fuse || !value) return [];
    return fuse.search(value);
  };

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node);
    // Center view on the selected node if needed
    setOpen(false);
  };

  const handleSave = useCallback(() => {
    saveDiagram();
    toast({
      title: "Diagram saved",
      description: "Your diagram has been saved to local storage",
    });
  }, [saveDiagram, toast]);

  const handleNew = useCallback(() => {
    if (window.confirm("Are you sure you want to create a new diagram? All unsaved changes will be lost.")) {
      clearDiagram();
    }
  }, [clearDiagram]);

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <div className="flex gap-2">
          <Button
            onClick={handleNew}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>

          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button
            onClick={loadDiagram}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Load
          </Button>

          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 ml-2"
          >
            <Search className="h-4 w-4" />
            Search Nodes
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="mr-20">
          <Button
            onClick={clearDiagram}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Canvas
          </Button>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search nodes..." />
        <CommandList>
          <CommandEmpty>No nodes found.</CommandEmpty>
          <CommandGroup heading="Nodes">
            {nodes.map((node) => (
              <CommandItem
                key={node.id}
                value={node.data.label}
                onSelect={() => handleNodeSelect(node)}
              >
                <div className="flex items-center">
                  {node.data.label}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({node.data.type})
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}