import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { getStatusBadgeVariant, getPriorityColor } from "@/utils/helpers";

export const TicketCard = ({ ticket }) => (
  <div className="p-4 border rounded-lg bg-card">
    <div className="flex items-start justify-between mb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{ticket.id}</span>
          <Badge variant={getStatusBadgeVariant(ticket.status)}>
            {ticket.status}
          </Badge>
        </div>
        <h4 className="text-sm font-semibold">{ticket.title}</h4>
      </div>
      <span
        className={cn("text-xs font-medium", getPriorityColor(ticket.priority))}
      >
        {ticket.priority.toUpperCase()}
      </span>
    </div>

    <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>

    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>Assignee: {ticket.assignee}</span>
      <span>Created: {new Date(ticket.created).toLocaleString()}</span>
    </div>
  </div>
);
