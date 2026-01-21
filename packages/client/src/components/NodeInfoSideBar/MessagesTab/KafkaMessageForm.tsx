import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Square, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KafkaMessageFormProps {
    topicName: string;
}

interface KafkaMessage {
    topic: string;
    partition: number;
    key: string | null;
    value: string;
    timestamp: string;
    offset: string;
}

export function KafkaMessageForm({ topicName }: KafkaMessageFormProps) {
    const { toast } = useToast();
    const [messageKey, setMessageKey] = useState("");
    const [messageValue, setMessageValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<KafkaMessage[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleSend = async () => {
        if (!messageValue) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Message value is required",
            });
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch("/api/kafka/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: topicName,
                    messages: [{ key: messageKey, value: messageValue }]
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || "Failed to send message");
            }

            toast({
                title: "Message Sent",
                description: `Message sent to topic ${topicName}`,
            });
            setMessageValue(""); // Clear log on success
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
            const url = `/api/kafka/stream?topic=${encodeURIComponent(topicName)}`;
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
                        Publish to Topic
                    </h4>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="key">Key (Optional)</Label>
                            <Input
                                id="key"
                                placeholder="msg-key-123"
                                value={messageKey}
                                onChange={(e) => setMessageKey(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value (JSON/Text)</Label>
                            <Textarea
                                id="value"
                                placeholder='{"event": "login", "userId": 1}'
                                className="font-mono text-xs"
                                rows={6}
                                value={messageValue}
                                onChange={(e) => setMessageValue(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleSend} disabled={isSending} className="w-full">
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send to {topicName}
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

                <div className="border rounded-md bg-black text-green-400 font-mono text-xs h-[350px] flex flex-col">
                    <div className="p-2 border-b border-gray-800 bg-gray-900 flex justify-between items-center text-gray-400">
                        <span>Topic: {topicName}</span>
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
                                    <span>[{new Date(Number(msg.timestamp)).toLocaleTimeString()}]</span>
                                    <span>P:{msg.partition}</span>
                                    <span>Off:{msg.offset}</span>
                                    {msg.key && <span className="text-yellow-600">Key: {msg.key}</span>}
                                </div>
                                <div className="whitespace-pre-wrap break-all">
                                    {msg.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
