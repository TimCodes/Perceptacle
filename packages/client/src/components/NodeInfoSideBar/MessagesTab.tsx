import { ScrollArea } from "@/components/ui/scroll-area";
import { useDiagramStore } from "@/utils/diagram-store";
import { MessageSquare } from "lucide-react";
import { RestMessageForm } from "./MessagesTab/RestMessageForm";
import { KafkaMessageForm } from "./MessagesTab/KafkaMessageForm";
import { ServiceBusMessageForm } from "./MessagesTab/ServiceBusMessageForm";

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

    const nodeType = selectedNode.data.type || selectedNode.type;
    const nodeLabel = selectedNode.data.label || selectedNode.id;

    const isKafkaNode = nodeType === "KafkaTopic" || nodeType.toLowerCase().includes("kafka") || nodeLabel.toLowerCase().includes("kafka");
    const isServiceBusNode = nodeType === "ServiceBusQueue" || nodeType === "ServiceBusTopic" || nodeType.toLowerCase().includes("servicebus") || nodeLabel.toLowerCase().includes("service-bus") || nodeLabel.toLowerCase().includes("service bus") || nodeLabel.toLowerCase().includes("servicebus");
    const isTopic = nodeType === "ServiceBusTopic" || nodeLabel.toLowerCase().includes("topic");

    const isHttpNode = (
        [
            "AzureFunction",
            "GoogleCloudFunction",
            "KubernetesService",
            "KubernetesPod",
            "AppGateway",
            "Pod",
            "Service"
        ].includes(nodeType) ||
        nodeType.toLowerCase().includes("function") ||
        (nodeType.toLowerCase().includes("service") && !nodeType.toLowerCase().includes("servicebus") && !nodeType.toLowerCase().includes("service-bus"))
    ) && !isKafkaNode && !isServiceBusNode;

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

                {isKafkaNode && (
                    <KafkaMessageForm
                        topicName={selectedNode.data.topicName || nodeLabel}
                    />
                )}

                {isServiceBusNode && (
                    <ServiceBusMessageForm
                        queueOrTopicName={selectedNode.data.queueName || selectedNode.data.topicName || nodeLabel}
                        isTopic={isTopic}
                    />
                )}

                {!isHttpNode && !isKafkaNode && !isServiceBusNode && (
                    <div className="rounded-md border p-4 bg-muted/20 text-center text-sm text-muted-foreground">
                        <p className="mb-2">Messaging interface for <strong>{nodeType}</strong></p>
                        <p className="text-xs">No messaging protocol supported for this node type.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
