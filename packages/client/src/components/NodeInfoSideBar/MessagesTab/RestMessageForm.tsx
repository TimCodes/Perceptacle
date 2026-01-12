import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Upload, FileJson, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface RestMessageFormProps {
    defaultEndpoint?: string;
    nodeLabel: string;
}

interface RequestResult {
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    timestamp: string;
}

interface BatchRequestItem {
    method: string;
    endpoint: string;
    headers?: Record<string, string>;
    body?: any;
}

export function RestMessageForm({ defaultEndpoint = "", nodeLabel }: RestMessageFormProps) {
    const { toast } = useToast();
    const [method, setMethod] = useState("GET");
    const [endpoint, setEndpoint] = useState(defaultEndpoint);
    const [headers, setHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
    const [body, setBody] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RequestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Batch processing state
    const [batchFile, setBatchFile] = useState<File | null>(null);
    const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; results: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let parsedHeaders = {};
            try {
                parsedHeaders = JSON.parse(headers);
            } catch (e) {
                throw new Error("Invalid Headers JSON");
            }

            let parsedBody = undefined;
            if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    throw new Error("Invalid Body JSON");
                }
            }

            const response = await fetch("/api/actions/http/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: endpoint,
                    method,
                    headers: parsedHeaders,
                    body: parsedBody,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to execute request");
            }

            setResult({
                status: data.status,
                statusText: data.statusText,
                data: data.data,
                headers: data.headers,
                timestamp: new Date().toLocaleTimeString(),
            });

            toast({
                title: "Request Sent",
                description: `${method} request to ${endpoint} completed.`,
            });

        } catch (err: any) {
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== "application/json") {
                toast({
                    variant: "destructive",
                    title: "Invalid File",
                    description: "Please upload a JSON file.",
                });
                return;
            }
            setBatchFile(file);
        }
    };

    const processBatch = async () => {
        if (!batchFile) return;

        setIsLoading(true);
        setBatchProgress({ current: 0, total: 0, results: [] });

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const batchData = JSON.parse(content);

                if (!Array.isArray(batchData)) {
                    throw new Error("Batch file must contain an array of requests");
                }

                const requests: BatchRequestItem[] = batchData;
                const total = requests.length;
                const results = [];

                setBatchProgress({ current: 0, total, results: [] });

                for (let i = 0; i < total; i++) {
                    const req = requests[i];
                    try {
                        // Execute request logic (reuse fetch logic or simple call)
                        const response = await fetch("/api/actions/http/execute", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                url: req.endpoint,
                                method: req.method || "GET",
                                headers: req.headers,
                                body: req.body
                            })
                        });
                        const data = await response.json();
                        results.push({ success: response.ok, status: data.status, endpoint: req.endpoint });
                    } catch (err) {
                        results.push({ success: false, error: err, endpoint: req.endpoint });
                    }

                    setBatchProgress({ current: i + 1, total, results: [...results] });
                }

                toast({
                    title: "Batch Processing Complete",
                    description: `Processed ${total} requests.`,
                });

            } catch (err: any) {
                toast({
                    variant: "destructive",
                    title: "Batch Processing Failed",
                    description: err.message,
                });
            } finally {
                setIsLoading(false);
                // Don't clear batchProgress immediately so user can see results
            }
        };
        reader.readAsText(batchFile);
    };

    return (
        <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Request</TabsTrigger>
                <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label>HTTP Method & Endpoint</Label>
                    <div className="flex gap-2">
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            value={endpoint}
                            onChange={(e) => setEndpoint(e.target.value)}
                            placeholder="https://api.example.com/resource"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Headers (JSON)</Label>
                    <Textarea
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                        className="font-mono text-xs h-20"
                    />
                </div>

                {(method === "POST" || method === "PUT" || method === "PATCH") && (
                    <div className="space-y-2">
                        <Label>Body (JSON)</Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="font-mono text-xs h-32"
                            placeholder="{}"
                        />
                    </div>
                )}

                <Button onClick={handleSend} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Send Request
                </Button>

                {error && (
                    <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm flex items-center gap-2 dark:bg-red-900/30 dark:text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {result && (
                    <Card>
                        <CardHeader className="py-3 px-4 bg-muted/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Badge variant={result.status >= 200 && result.status < 300 ? "default" : "destructive"}>
                                        {result.status} {result.statusText}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="body" className="w-full">
                                <div className="border-b px-4">
                                    <TabsList className="h-9 -mb-px bg-transparent p-0">
                                        <TabsTrigger value="body" className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none">Body</TabsTrigger>
                                        <TabsTrigger value="headers" className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none">Headers</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="body" className="p-4 m-0">
                                    <pre className="text-xs font-mono overflow-auto max-h-60 whitespace-pre-wrap">
                                        {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </TabsContent>
                                <TabsContent value="headers" className="p-4 m-0">
                                    <div className="grid grid-cols-[1fr_2fr] gap-2 text-xs font-mono">
                                        {Object.entries(result.headers).map(([key, value]) => (
                                            <div key={key} className="contents">
                                                <span className="font-semibold text-muted-foreground">{key}:</span>
                                                <span className="break-all">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="batch" className="space-y-4 pt-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors pointer-cursor" onClick={() => fileInputRef.current?.click()}>
                    <FileJson className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-1">
                        {batchFile ? batchFile.name : "Upload Batch JSON"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Drag & drop or click to select
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="application/json"
                        onChange={handleFileUpload}
                    />
                </div>

                {batchFile && (
                    <Button onClick={processBatch} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Process Batch
                    </Button>
                )}

                {batchProgress && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{batchProgress.current} / {batchProgress.total}</span>
                        </div>
                        {/* Progress Bar could go here */}

                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                            {batchProgress.results.map((res, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs p-2 border-b last:border-0">
                                    {res.success ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
                                    <span className="font-mono flex-1 truncate">{res.endpoint}</span>
                                    <Badge variant="outline" className="text-[10px] h-5">{res.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground pt-4 border-t">
                    <p className="font-semibold mb-1">Batch Format:</p>
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        {`[
  {
    "method": "POST",
    "endpoint": "http://api...",
    "body": { ... }
  },
  ...
]`}
                    </pre>
                </div>

            </TabsContent>
        </Tabs>
    );
}
