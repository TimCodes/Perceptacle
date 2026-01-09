import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const Messages = () => {
  const [messageType, setMessageType] = useState<'rest' | 'servicebus'>('rest');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.example.com/v1/users');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer token');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Service Bus specific state
  const [queueName, setQueueName] = useState('');
  const [serviceBusMessage, setServiceBusMessage] = useState('');

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse('');
    
    try {
      if (messageType === 'rest') {
        // Parse headers
        const headersObj: Record<string, string> = {};
        headers.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length) {
            headersObj[key.trim()] = valueParts.join(':').trim();
          }
        });

        const options: RequestInit = {
          method,
          headers: headersObj,
        };

        if (method !== 'GET' && method !== 'HEAD' && body) {
          options.body = body;
        }

        const res = await fetch(url, options);
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        // Service Bus message
        const res = await fetch('/api/azure/servicebus/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            queueName,
            message: serviceBusMessage,
          }),
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] w-screen bg-background p-6 flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Send className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Send Messages</h1>
        </div>
      </div>

      <Tabs value={messageType} onValueChange={(v) => setMessageType(v as 'rest' | 'servicebus')} className="w-full flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="rest">REST Request</TabsTrigger>
          <TabsTrigger value="servicebus">Service Bus</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Request Panel */}
          <div className="border rounded-lg p-6 bg-card flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Request</h2>

            <TabsContent value="rest" className="mt-0 space-y-4 flex-1 flex flex-col overflow-auto">
              {/* Method and URL */}
              <div className="flex gap-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="flex-1"
                />
              </div>

              {/* Headers */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-sm font-medium mb-2 block">Headers</label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                  className="font-mono text-sm flex-1 min-h-[100px]"
                />
              </div>

              {/* Body (only for non-GET requests) */}
              {method !== 'GET' && method !== 'HEAD' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <label className="text-sm font-medium mb-2 block">Body</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="font-mono text-sm flex-1 min-h-[150px]"
                  />
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSendRequest}
                disabled={loading}
                className="w-full mt-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
            </TabsContent>

            <TabsContent value="servicebus" className="mt-0 space-y-4 flex-1 flex flex-col">
              {/* Queue/Topic Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Queue/Topic Name</label>
                <Input
                  value={queueName}
                  onChange={(e) => setQueueName(e.target.value)}
                  placeholder="my-queue-name"
                />
              </div>

              {/* Message */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  value={serviceBusMessage}
                  onChange={(e) => setServiceBusMessage(e.target.value)}
                  placeholder='{"eventType": "UserCreated", "data": {...}}'
                  className="font-mono text-sm flex-1"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendRequest}
                disabled={loading}
                className="w-full mt-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </TabsContent>
          </div>

          {/* Response Panel */}
          <div className="border rounded-lg p-6 bg-card flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Response</h2>
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {response ? (
                <pre className="w-full h-full p-4 bg-muted rounded-md overflow-auto text-sm font-mono">
                  {response}
                </pre>
              ) : (
                <p className="text-muted-foreground">
                  Send a {messageType === 'rest' ? 'request' : 'message'} to see the response
                </p>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Messages;
