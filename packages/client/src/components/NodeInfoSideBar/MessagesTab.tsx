import { ScrollArea } from "@/components/ui/scroll-area";
import { useDiagramStore } from "@/utils/diagram-store";
import { MessageSquare } from "lucide-react";

export function MessagesTab() {
    const { selectedNode } = useDiagramStore();

    if (!selectedNode) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                <p>Select a node to view messaging options</p>
            </div>
        );
    }

    // Determine node type for rendering appropriate form
    // This will be expanded in future stories
    const nodeType = selectedNode.data.type || selectedNode.type;

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-sm font-medium leading-none mb-1">Send & Receive Messages</h3>
                <p className="text-xs text-muted-foreground">
                    Interact with {selectedNode.data.label || "this node"} via supported protocols.
                </p>
            </div>

            <div className="rounded-md border p-4 bg-muted/20 text-center text-sm text-muted-foreground">
                <p className="mb-2">Messaging interface for <strong>{nodeType}</strong></p>
                <p className="text-xs">Select a protocol to start (Coming soon)</p>
            </div>
        </div>
    );
}
