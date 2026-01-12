import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Square, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceBusMessageFormProps {
    queueOrTopicName: string;
    defaultSubscription?: string;
    isTopic?: boolean;
}

interface ServiceBusMessage {
    body: any;
    messageId: string;
    contentType: string;
    enqueuedTimeUtc: string;
    deliveryCount: number;
}

export function ServiceBusMessageForm({ queueOrTopicName, defaultSubscription, isTopic = false }: ServiceBusMessageFormProps) {
    const { toast } = useToast();
    const [subscriptionName, setSubscriptionName] = useState(defaultSubscription || "");
    const [messageBody, setMessageBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<ServiceBusMessage[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleSend = async () => {
        if (!messageBody) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Message body is required",
            });
            return;
        }

        setIsSending(true);
        try {
            let parsedBody = messageBody;
            try {
                parsedBody = JSON.parse(messageBody);
            } catch (e) {
                // Did not parse as JSON, send as string
            }

            const response = await fetch("/api/azure/service-bus/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    queueOrTopicName: queueOrTopicName,
                    message: parsedBody
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || "Failed to send message");
            }

            toast({
                title: "Message Sent",
                description: `Message sent to ${queueOrTopicName}`,
            });
            setMessageBody(""); // Clear input on success
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Send Failed",
                description: error.message,
            });
        } finally {
            setIsSending(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            // Stop listening
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setIsListening(false);
        } else {
            // Start listening
            setIsListening(true);
            let url = `/api/azure/service-bus/stream?queueOrTopicName=${encodeURIComponent(queueOrTopicName)}`;
            if (subscriptionName) {
                url += `&subscriptionName=${encodeURIComponent(subscriptionName)}`;
            }
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, data]);
                } catch (e) {
                    console.error("Failed to parse SSE message", e);
                }
            };

            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
            };
        }
    };

    const clearLogs = () => {
        setMessages([]);
    };

    return (
        <Tabs defaultValue="consume" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="consume">Consume Messages</TabsTrigger>
                <TabsTrigger value="send">Send Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-4 pt-4">
                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                    </h4>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sb-body">Message Body (JSON/Text)</Label>
                            <Textarea
                                id="sb-body"
                                placeholder='{"orderId": "123", "status": "pending"}'
                                className="font-mono text-xs"
                                rows={6}
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleSend} disabled={isSending} className="w-full">
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send to {queueOrTopicName}
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="consume" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <RefreshCw className={`h-4 w-4 ${isListening ? "animate-spin" : ""}`} />
                        Live Stream
                    </h4>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={clearLogs} title="Clear Logs">
                            Clear
                        </Button>
                        <Button
                            variant={isListening ? "destructive" : "default"}
                            size="sm"
                            onClick={toggleListening}
                            className="w-24"
                        >
                            {isListening ? (
                                <>
                                    <Square className="mr-2 h-3 w-3 fill-current" /> Stop
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-3 w-3 fill-current" /> Listen
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {isTopic && (
                    <div className="flex gap-2 items-center">
                        <Label htmlFor="sub-name" className="text-xs whitespace-nowrap">Subscription (for listening):</Label>
                        <Input
                            id="sub-name"
                            className="h-7 text-xs"
                            placeholder="Subscription Name"
                            value={subscriptionName}
                            onChange={(e) => setSubscriptionName(e.target.value)}
                            disabled={isListening}
                        />
                    </div>
                )}

                <div className="border rounded-md bg-black text-blue-400 font-mono text-xs h-[350px] flex flex-col">
                    <div className="p-2 border-b border-gray-800 bg-gray-900 flex justify-between items-center text-gray-400">
                        <span>Entity: {queueOrTopicName}</span>
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                            {messages.length} messages
                        </Badge>
                    </div>
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-auto p-2 space-y-2"
                    >
                        {messages.length === 0 && (
                            <div className="text-gray-600 italic text-center mt-32">
                                {isListening ? "Waiting for messages..." : "Start listening to see messages"}
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className="border-b border-gray-800 pb-2 last:border-0 hover:bg-gray-900/50 p-1 rounded">
                                <div className="flex gap-2 text-gray-500 mb-1 text-[10px]">
                                    <span>[{new Date(msg.enqueuedTimeUtc).toLocaleTimeString()}]</span>
                                    <span className="text-gray-600">ID: {msg.messageId}</span>
                                </div>
                                <div className="whitespace-pre-wrap break-all text-gray-300">
                                    {typeof msg.body === 'object' ? JSON.stringify(msg.body, null, 2) : msg.body}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
