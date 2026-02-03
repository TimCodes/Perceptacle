import { ScrollArea } from "@/components/ui/scroll-area";
import { useDiagramStore } from "@/utils/diagram-store";
import { MessageSquare } from "lucide-react";
import { RestMessageForm } from "./MessagesTab/RestMessageForm";
import { KafkaMessageForm } from "./MessagesTab/KafkaMessageForm";
import { ServiceBusMessageForm } from "./MessagesTab/ServiceBusMessageForm";
import { NodeTypeHelper } from "@/utils/nodeTypeHelpers";
import { NodeTypeDefinition } from "@/types/nodeTypes";

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

    const nodeTypeValue = selectedNode.data.type || selectedNode.type;
    const nodeLabel = selectedNode.data.label || selectedNode.id;

    // Convert to NodeTypeDefinition if needed
    const nodeType: NodeTypeDefinition = typeof nodeTypeValue === 'string'
        ? NodeTypeHelper.fromLegacyType(nodeTypeValue)
        : nodeTypeValue || { type: 'azure', subtype: 'application' };

    // Use NodeTypeHelper to determine message protocol
    const messageProtocol = NodeTypeHelper.getMessageProtocol(nodeType);
    const capabilities = NodeTypeHelper.getCapabilities(nodeType);

    const isServiceBusNode = messageProtocol === 'service-bus' ||
        (NodeTypeHelper.isAzure(nodeType) && nodeType.subtype === 'service-bus');
    const isTopic = (nodeType.subtype === 'service-bus' && nodeType.variant === 'topic') || nodeType.subtype === 'topic';
    const isHttpNode = messageProtocol === 'http' && !isServiceBusNode;

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col h-full p-4">
                <div className="mb-6">
                    <h3 className="text-sm font-medium leading-none mb-1">Send & Receive Messages</h3>
                    <p className="text-xs text-muted-foreground">
                        Interact with {selectedNode.data.label || "this node"} via supported protocols.
                    </p>
                </div>

                {isHttpNode && (
                    <RestMessageForm
                        nodeLabel={selectedNode.data.label}
                        defaultEndpoint={selectedNode.data.endpoint || ""}
                    />
                )}

                {isServiceBusNode && (
                    <ServiceBusMessageForm
                        queueOrTopicName={selectedNode.data.queueName || selectedNode.data.topicName || nodeLabel}
                        isTopic={isTopic}
                    />
                )}

                {!isHttpNode && !isServiceBusNode && (
                    <div className="rounded-md border p-4 bg-muted/20 text-center text-sm text-muted-foreground">
                        <p className="mb-2">Messaging interface for <strong>{NodeTypeHelper.getDisplayName(nodeType)}</strong></p>
                        {!capabilities.hasMessages ? (
                            <p className="text-xs">No messaging protocol supported for this node type.</p>
                        ) : (
                            <p className="text-xs">Protocol: {messageProtocol || 'Not configured'}</p>
                        )}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
