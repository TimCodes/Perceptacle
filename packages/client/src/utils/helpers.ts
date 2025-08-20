export const getStatusColor = (status) => {
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

export const getPriorityColor = (priority) => {
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

export const getStatusBadgeVariant = (status) => {
  switch (status.toLowerCase()) {
    case "open":
      return "destructive";
    case "in-progress":
      return "warning";
    case "closed":
      return "success";
    default:
      return "secondary";
  }
};
