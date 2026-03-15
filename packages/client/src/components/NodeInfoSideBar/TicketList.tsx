import { TicketCard } from "./TicketCard";

export const TicketList = ({ tickets }: { tickets: any[] }) => (
  <div className="space-y-4">
    {tickets.map((ticket: any, index: number) => (
      <TicketCard key={index} ticket={ticket} />
    ))}
  </div>
);

export default TicketList;
