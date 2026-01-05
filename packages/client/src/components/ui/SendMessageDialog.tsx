
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface SendMessageDialogProps {
    queueOrTopicName: string;
}

export function SendMessageDialog({ queueOrTopicName }: SendMessageDialogProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!message.trim()) return;

        setSending(true);
        try {
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch {
                parsedMessage = { text: message };
            }

            const response = await fetch('/api/azure/service-bus/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    queueOrTopicName,
                    message: parsedMessage,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            toast({
                title: "Message Sent",
                description: `Successfully sent message to ${queueOrTopicName}`,
            });
            setOpen(false);
            setMessage('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"),
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Message to Service Bus</DialogTitle>
                    <DialogDescription>
                        Send a message to <strong>{queueOrTopicName}</strong>.
                        If the input is valid JSON, it will be sent as an object, otherwise as text.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder='{"key": "value"} or plain text'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[150px] font-mono"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSend} disabled={sending || !message.trim()}>
                        {sending ? "Sending..." : "Send"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
