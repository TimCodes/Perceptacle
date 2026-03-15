export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "hsl(var(--success))";
    case "warning":
      return "hsl(var(--warning))";
    case "error":
      return "hsl(var(--destructive))";
    case "inactive":
      return "hsl(var(--muted))";
    default:
      return "hsl(var(--border))";
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "text-destructive";
    case "medium":
      return "text-warning";
    case "low":
      return "text-success";
    default:
      return "text-muted-foreground";
  }
};

export const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (status.toLowerCase()) {
    case "open":
      return "destructive";
    case "in-progress":
      return "outline";
    case "closed":
      return "secondary";
    default:
      return "secondary";
  }
};
