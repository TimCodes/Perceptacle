import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GitHubIssues from "@/components/GitHubIssues";

export const CICDTab = ({ editedNode, handleChange }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Repository URL</Label>
      <Input
        value={editedNode.data.repositoryUrl || ""}
        onChange={(e) => handleChange("repositoryUrl", e.target.value)}
        placeholder="https://github.com/username/repo"
      />
    </div>

    <div className="space-y-2">
      <Label>Branch</Label>
      <Input
        value={editedNode.data.branch || ""}
        onChange={(e) => handleChange("branch", e.target.value)}
        placeholder="main"
      />
    </div>

    <GitHubIssues issues={editedNode.data.issues || []} />
  </div>
);
