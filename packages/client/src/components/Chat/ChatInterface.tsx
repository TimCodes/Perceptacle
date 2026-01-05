import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/utils/cn";
import { ChatService } from "@/services/chatService";
import { useDiagramStore } from "@/utils/diagram-store";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
}

export default function ChatInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { selectedNode } = useDiagramStore();

    // Initial load: Fetch recent session
    useEffect(() => {
        const loadRecentSession = async () => {
            // Only load if we haven't loaded yet
            if (sessionId) return;

            try {
                const sessions = await ChatService.getSessions();
                if (sessions.length > 0) {
                    const lastSession = sessions[0];
                    setSessionId(lastSession.id);

                    const history = await ChatService.getHistory(lastSession.id);
                    setMessages(history.map(msg => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.createdAt)
                    })));
                } else {
                    // Default welcome message
                    setMessages([{
                        id: "initial",
                        role: "assistant",
                        content: "Hello! I'm your AI assistant. I can help you troubleshoot issues, query logs, or explain the architecture. How can I help you today?",
                        timestamp: new Date()
                    }]);
                }
            } catch (err) {
                console.error("Failed to load session:", err);
            }
        };

        if (isOpen) {
            loadRecentSession();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
        setIsTyping(true);

        // Add placeholder for assistant
        const assistantId = (Date.now() + 1).toString();
        const botMessage: Message = {
            id: assistantId,
            role: "assistant",
            content: "", // Start empty
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        try {
            await ChatService.streamMessage(
                inputValue,
                sessionId || undefined,
                (chunk) => {
                    // 1. Session Init
                    if (chunk.type === 'session_init' && chunk.session_id) {
                        setSessionId(chunk.session_id);
                    }
                    // 2. Content
                    else if (chunk.type === 'content' && chunk.data) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === assistantId
                                ? { ...msg, content: msg.content + chunk.data }
                                : msg
                        ));
                        setIsTyping(false); // Stop typing visual once we have content
                    }
                },
                // Context
                selectedNode ? {
                    type: 'selected_node',
                    node: {
                        id: selectedNode.id,
                        label: selectedNode.data.label,
                        type: selectedNode.data.type || selectedNode.type,
                        status: selectedNode.data.status,
                        metrics: selectedNode.data.metrics,
                        // Add logs if important, but maybe keep it light for now
                    }
                } : undefined
            );

        } catch (error) {
            console.error("Failed to send message:", error);
            // Remove the empty assistant message and show error
            setMessages((prev) => prev.filter(msg => msg.id !== assistantId));
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: "system",
                content: "Error sending message. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[400px] h-[600px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">AI Assistant</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex gap-3 max-w-[90%]",
                                        message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div className={cn(
                                        "rounded-lg p-3 text-sm",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted/50 border"
                                    )}>
                                        {message.role === "user" ? (
                                            message.content
                                        ) : (
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, "")}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={cn("bg-muted px-1.5 py-0.5 rounded font-mono text-xs", className)} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        )}
                                        <div className="text-[10px] opacity-50 mt-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-3 mr-auto">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="bg-muted/50 border rounded-lg p-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t bg-background">
                        <div className="flex items-center gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                disabled={isTyping}
                                className="flex-1"
                            />
                            <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground text-center mt-2">
                            AI can make mistakes. Check important info.
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageSquare className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
}
