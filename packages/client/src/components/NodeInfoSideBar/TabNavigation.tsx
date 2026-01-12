import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, GitBranch, BarChart, MessageSquare } from "lucide-react";

export const TabNavigation = () => (
  <TabsList className="inline-flex h-9 items-center gap-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="cicd" className="p-2 h-8 w-8">
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
          <TabsTrigger value="observability" className="p-2 h-8 w-8">
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
          <TabsTrigger value="aichat" className="p-2 h-8 w-8">
            <MessageSquare className="h-4 w-4" />
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger value="configuration" className="p-2 h-8 w-8">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Configuration</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TabsList>
);

export default TabNavigation;
