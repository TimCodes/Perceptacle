import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Bell } from "lucide-react";
import { getCloudComponents } from "@/utils/cloudComponents";
import { cn } from "@/utils/cn";

// Helper for status colors
const getStatusClasses = (status: string, activeAlerts: number, alertSeverity: string) => {
    // Alert overrides everything
    if (activeAlerts > 0) {
        return alertSeverity === 'critical'
            ? 'border-destructive shadow-[0_0_10px_hsl(var(--destructive)/0.5)] animate-pulse'
            : 'border-yellow-500 shadow-sm';
    }

    switch (status) {
        case 'active':
            return 'border-[1px]  border-green-300 outline-0'; // Success/Active
        case 'warning':
            return 'border-[1px] border-yellow-500 outline-0';
        case 'error':
            return 'border-[1px] border-destructive outline-2 border-dashed';
        case 'offline':
        case 'inactive':
            return 'border-muted opacity-80 grayscale';
        default:
            return 'border-border';
    }
};

const CustomNode = ({ data }: { data: any }) => {
    const components = getCloudComponents();
    const Component = components.find((comp) => comp.type === data.type)?.icon;

    // Data extraction
    const activeAlerts = data.metrics?.activeAlerts || 0;
    const alertSeverity = data.metrics?.alertSeverity || 'warning';
    const status = data.status || 'active';

    const borderClasses = getStatusClasses(status, activeAlerts, alertSeverity);

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "relative p-3 rounded-md bg-background border-2 text-foreground min-w-[180px] transition-all duration-300 bg-sky-900",
                        borderClasses
                    )}>

                        {/* Alert Badge */}
                        {activeAlerts > 0 && (
                            <div className={cn(
                                "absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm",
                                alertSeverity === 'critical'
                                    ? "bg-destructive text-white border-destructive-foreground"
                                    : "bg-yellow-500 text-white border-yellow-600"
                            )}>
                                <Bell className="h-3 w-3 fill-current" />
                            </div>
                        )}

                        <Handle
                            type="target"
                            position={Position.Left}
                            className="!w-3 !h-3 !left-0 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !border-2 !bg-background hover:!bg-muted"
                        />

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                {Component && <Component className="w-5 h-5" />}
                                <span className="text-sm font-medium">{data.label}</span>
                            </div>

                            {/* Only show field preview if no alerts, or compacted */}
                            {data.customFields && data.customFields.length > 0 && (
                                <div className="border-t pt-2 mt-1 space-y-1">
                                    {data.customFields.slice(0, 2).map((field: any, index: number) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <span className="text-muted-foreground">{field.name}:</span>
                                            <span className="font-medium truncate max-w-[100px]">{field.value || "-"}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Handle
                            type="source"
                            position={Position.Right}
                            className="!w-3 !h-3 !right-0 !top-1/2 !translate-x-1/2 !-translate-y-1/2 !border-2 !bg-background hover:!bg-muted"
                        />
                    </div>
                </TooltipTrigger>

                {/* Tooltip Content */}
                {(activeAlerts > 0 || status !== 'active') && (
                    <TooltipContent className={cn(
                        "border",
                        activeAlerts > 0 ? "bg-destructive text-destructive-foreground border-destructive/50" : "bg-popover text-popover-foreground"
                    )}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-semibold">
                                {activeAlerts > 0 ? <AlertCircle className="h-4 w-4" /> : null}
                                <span>
                                    {activeAlerts > 0 ? `Active Alerts (${activeAlerts})` : `Status: ${status}`}
                                </span>
                            </div>
                            {activeAlerts > 0 && (
                                <ul className="text-xs list-disc pl-4 space-y-0.5">
                                    <li>CPU usage high ({'>'}90%)</li>
                                    {activeAlerts > 1 && <li>Latency signal degradation</li>}
                                </ul>
                            )}
                        </div>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};

export default memo(CustomNode);
