import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Cpu, HardDrive, Network, AlertCircle, CheckCircle2 } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from "recharts";

// Mock Data
const trafficData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    inbound: Math.floor(Math.random() * 1000) + 500,
    outbound: Math.floor(Math.random() * 800) + 200,
}));

const cpuData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    usage: Math.floor(Math.random() * 40) + 30,
}));

const healthStatus = [
    { name: "Healthy", value: 12, color: "#22c55e" },
    { name: "Warning", value: 3, color: "#eab308" },
    { name: "Critical", value: 1, color: "#ef4444" },
];

const resentLogs = [
    { id: 1, level: 'error', message: 'Connection timeout: redis-primary-0', time: '10:42 AM' },
    { id: 2, level: 'warning', message: 'High memory usage: worker-node-3', time: '10:40 AM' },
    { id: 3, level: 'info', message: 'Deployment completed: auth-service-v2', time: '10:38 AM' },
    { id: 4, level: 'info', message: 'Backup started: daily-full-backup', time: '10:35 AM' },
    { id: 5, level: 'error', message: 'Failed to process job: #88219', time: '10:30 AM' },
];

const MetricCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <Card className="bg-card/50 backdrop-blur-sm border-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
                    {trend > 0 ? "+" : ""}{trend}%
                </span>
                {subtext}
            </p>
        </CardContent>
    </Card>
);



// ... existing imports ...

export default function DashboardPage() {


    const filteredLogs = resentLogs;

    return (
        <div className="p-8 space-y-8 min-h-screen bg-stone-950/50">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-stone-200 to-stone-400 bg-clip-text text-transparent">
                        System Dashboard
                    </h2>
                    <p className="text-muted-foreground">Overview of system health and performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        System Operational
                    </Badge>
                    <span className="text-sm text-muted-foreground">Last updated: Just now</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={Activity} title="Total Requests" value="2.4M" subtext="from last hour" trend={12} />
                <MetricCard icon={Cpu} title="Avg. CPU Usage" value="42%" subtext="across all nodes" trend={-5} />
                <MetricCard icon={HardDrive} title="Memory Usage" value="64%" subtext="12GB free" trend={2} />
                <MetricCard icon={Network} title="Network I/O" value="1.2GB/s" subtext="peak traffic" trend={8} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-muted/20">
                    <CardHeader>
                        <CardTitle>Network Traffic</CardTitle>
                        <CardDescription>Inbound vs Outbound traffic over the last 24h</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficData}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}MB`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <Area type="monotone" dataKey="inbound" stroke="#8884d8" fillOpacity={1} fill="url(#colorIn)" />
                                    <Area type="monotone" dataKey="outbound" stroke="#82ca9d" fillOpacity={1} fill="url(#colorOut)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-muted/20">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Node Status Distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={healthStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {healthStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {healthStatus.map((status) => (
                                <div key={status.name} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                                    {status.name} ({status.value})
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2 bg-card/50 backdrop-blur-sm border-muted/20">
                    <CardHeader>
                        <CardTitle>Realtime CPU Load (Aggregated)</CardTitle>
                        <CardDescription>Load average across all active clusters</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cpuData}>
                                    <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 bg-card/50 backdrop-blur-sm border-muted/20">
                    <CardHeader>
                        <CardTitle>Recent Alerts & Logs</CardTitle>
                        <CardDescription>Latest system events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px] w-full pr-4">
                            <div className="space-y-4">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-4 text-sm pb-4 border-b border-muted/20 last:border-0 last:pb-0">
                                            <div className="mt-1">
                                                {log.level === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                                {log.level === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                                                {log.level === 'info' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium leading-none">{log.message}</p>
                                                <p className="text-xs text-muted-foreground">{log.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        No logs found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
