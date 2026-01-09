import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GitBranch, BarChart, Ticket, MessageSquare } from "lucide-react";

export const TabNavigation = () => (
  <TabsList className="grid w-full grid-cols-4">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="cicd" className="p-2">
            <GitBranch className="h-4 w-4" />
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>CI/CD</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="observability" className="p-2">
            <BarChart className="h-4 w-4" />
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Observability</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="tickets" className="p-2">
            <Ticket className="h-4 w-4" />
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tickets</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="aichat" className="p-2">
            <MessageSquare className="h-4 w-4" />
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TabsList>
);

export default TabNavigation;
