import React from "react";
import { TicketCard } from "./TicketCard";

export const TicketList = ({ tickets }) => (
  <div className="space-y-4">
    {tickets.map((ticket, index) => (
      <TicketCard key={index} ticket={ticket} />
    ))}
  </div>
);

export default TicketList;
