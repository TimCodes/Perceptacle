import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { cn } from "@/utils/cn";

export const GitHubIssues = ({ issues }) => (
  <div className="mt-8 space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium">GitHub Issues</h3>
      <Badge variant="secondary">{issues.length} issues</Badge>
    </div>

    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 p-2 rounded-md",
              issue.state === "open" ? "bg-destructive/10" : "bg-success/10",
            )}
          >
            <Bug
              className={cn(
                "h-4 w-4",
                issue.state === "open" ? "text-destructive" : "text-success",
              )}
            />
            <div className="flex flex-col gap-0.5 flex-1">
              <Button
                variant="link"
                className="h-auto p-0 text-sm font-medium text-left justify-start"
                onClick={() => window.open(issue.url, "_blank")}
              >
                {issue.title}
              </Button>
              <Badge
                variant={issue.state === "open" ? "destructive" : "success"}
                className="w-fit"
              >
                {issue.state}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);

export default GitHubIssues;
