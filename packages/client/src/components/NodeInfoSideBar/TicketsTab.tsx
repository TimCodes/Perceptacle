import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { getStatusBadgeVariant, getPriorityColor } from "./utils";
import TicketList from "@/components/NodeInfoSideBar/TicketList";

export const TicketsTab = ({ editedNode }) => {
  const tickets = editedNode.data.tickets || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Trouble Tickets</h3>
        <Badge variant="secondary">{tickets.length} tickets</Badge>
      </div>
      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No trouble tickets found
        </p>
      ) : (
        <TicketList tickets={tickets} />
      )}
    </div>
  );
};

export default TicketsTab;
