import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  diagramContext: {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: string[];
    nodes: Array<{
      id: string;
      type?: string;
      label?: string;
      status?: string;
    }>;
  };
  conversationHistory: ChatMessage[];
}

// POST /api/ai/chat - Send a message to AI assistant
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, diagramContext, conversationHistory }: ChatRequest = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // For now, provide intelligent mock responses based on the diagram context
    // In production, this would integrate with OpenAI, Anthropic, or another LLM service
    const response = generateMockAIResponse(message, diagramContext);

    return res.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing AI chat:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
});

// Helper function to generate contextual responses
function generateMockAIResponse(
  message: string,
  context: ChatRequest["diagramContext"]
): string {
  const lowerMessage = message.toLowerCase();

  // Analyze the diagram
  if (
    lowerMessage.includes("analyze") ||
    lowerMessage.includes("overview") ||
    lowerMessage.includes("summary")
  ) {
    const nodeTypeList = context.nodeTypes.join(", ");
    return `I've analyzed your architecture diagram. You have ${context.nodeCount} components with ${context.edgeCount} connections. Your diagram includes: ${nodeTypeList}. 

This appears to be a ${getArchitectureType(context.nodeTypes)} architecture. ${getArchitectureAdvice(context.nodeTypes)}`;
  }

  // Security questions
  if (lowerMessage.includes("security") || lowerMessage.includes("secure")) {
    const hasSecurityComponents = context.nodeTypes.some(
      (type) =>
        type.includes("firewall") ||
        type.includes("security") ||
        type.includes("identity") ||
        type.includes("key-vault")
    );

    if (hasSecurityComponents) {
      return "Your diagram includes security components which is great! Consider these additional security measures:\n\n1. Implement network segmentation between tiers\n2. Enable encryption in transit and at rest\n3. Use managed identities for service-to-service authentication\n4. Implement proper logging and monitoring\n5. Regular security assessments and penetration testing";
    } else {
      return "I notice your diagram doesn't include explicit security components. Consider adding:\n\n1. Azure Firewall or Network Security Groups for network protection\n2. Azure Key Vault for secrets management\n3. Azure Active Directory for identity management\n4. DDoS Protection for public-facing services\n5. Application Gateway with WAF for web application security";
    }
  }

  // Scalability questions
  if (
    lowerMessage.includes("scale") ||
    lowerMessage.includes("scalability") ||
    lowerMessage.includes("performance")
  ) {
    return `For optimal scalability in your ${context.nodeCount}-component architecture:\n\n1. Implement auto-scaling for compute resources\n2. Use load balancers to distribute traffic\n3. Consider caching strategies (Redis/CDN) for frequently accessed data\n4. Implement horizontal scaling for stateless services\n5. Use message queues for asynchronous processing\n6. Monitor performance metrics and set up alerts`;
  }

  // Cost optimization
  if (lowerMessage.includes("cost") || lowerMessage.includes("optimize")) {
    return "Here are cost optimization strategies for your architecture:\n\n1. Right-size your resources based on actual usage\n2. Use reserved instances for predictable workloads\n3. Implement auto-scaling to match demand\n4. Use serverless options where appropriate\n5. Clean up unused resources regularly\n6. Enable cost monitoring and set up budgets\n7. Consider using spot instances for non-critical workloads";
  }

  // Availability and reliability
  if (
    lowerMessage.includes("availability") ||
    lowerMessage.includes("reliable") ||
    lowerMessage.includes("redundancy")
  ) {
    return "To improve availability and reliability:\n\n1. Deploy across multiple availability zones\n2. Implement health checks and automatic failover\n3. Use managed services with built-in high availability\n4. Set up proper backup and disaster recovery procedures\n5. Implement circuit breakers for external dependencies\n6. Use retry policies with exponential backoff\n7. Monitor SLAs and set up alerts for downtime";
  }

  // Monitoring and observability
  if (
    lowerMessage.includes("monitor") ||
    lowerMessage.includes("observability") ||
    lowerMessage.includes("logging")
  ) {
    return "For comprehensive monitoring and observability:\n\n1. Implement centralized logging (e.g., Azure Monitor, ELK stack)\n2. Set up distributed tracing for microservices\n3. Define and track key performance indicators (KPIs)\n4. Create dashboards for real-time visibility\n5. Configure alerts for critical metrics\n6. Implement synthetic monitoring for user journeys\n7. Use APM tools for application performance insights";
  }

  // Best practices
  if (
    lowerMessage.includes("best practice") ||
    lowerMessage.includes("recommendation")
  ) {
    return `Based on your architecture with ${context.nodeCount} components, here are key recommendations:\n\n1. Follow the well-architected framework principles\n2. Implement proper separation of concerns\n3. Use infrastructure as code (Terraform, ARM templates)\n4. Implement CI/CD pipelines for automated deployments\n5. Document your architecture and maintain diagrams\n6. Regular security audits and compliance checks\n7. Performance testing and optimization\n8. Disaster recovery planning and testing`;
  }

  // Missing components
  if (
    lowerMessage.includes("missing") ||
    lowerMessage.includes("add") ||
    lowerMessage.includes("suggest")
  ) {
    const suggestions = [];
    
    if (!context.nodeTypes.some(type => type.includes("load-balancer") || type.includes("gateway"))) {
      suggestions.push("Load Balancer for traffic distribution");
    }
    
    if (!context.nodeTypes.some(type => type.includes("database") || type.includes("storage"))) {
      suggestions.push("Database or Storage service for data persistence");
    }
    
    if (!context.nodeTypes.some(type => type.includes("cache") || type.includes("redis"))) {
      suggestions.push("Cache layer (Redis) for improved performance");
    }
    
    if (!context.nodeTypes.some(type => type.includes("monitor") || type.includes("insights"))) {
      suggestions.push("Monitoring service (Application Insights) for observability");
    }

    if (suggestions.length > 0) {
      return `Based on your current architecture, consider adding:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    } else {
      return "Your diagram appears to have good coverage of essential components. Consider reviewing security, monitoring, and backup strategies.";
    }
  }

  // Help or general questions
  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("can you") ||
    lowerMessage.includes("what")
  ) {
    return `I can help you with:\n\n• Analyzing your architecture diagram\n• Security recommendations\n• Scalability and performance advice\n• Cost optimization strategies\n• Best practices and patterns\n• Identifying missing components\n• High availability guidance\n• Monitoring and observability setup\n\nYour current diagram has ${context.nodeCount} components and ${context.edgeCount} connections. What would you like to explore?`;
  }

  // Default response
  return `I understand you're asking about "${message}". Based on your diagram with ${context.nodeCount} components, I can provide insights about architecture, security, scalability, and best practices. Could you be more specific about what you'd like to know?`;
}

function getArchitectureType(nodeTypes: string[]): string {
  const hasAPI = nodeTypes.some(
    (t) => t.includes("api") || t.includes("gateway")
  );
  const hasCompute = nodeTypes.some(
    (t) => t.includes("compute") || t.includes("vm") || t.includes("container")
  );
  const hasDatabase = nodeTypes.some(
    (t) => t.includes("database") || t.includes("sql") || t.includes("cosmos")
  );
  const hasStorage = nodeTypes.some((t) => t.includes("storage"));
  const hasServerless = nodeTypes.some(
    (t) => t.includes("function") || t.includes("lambda")
  );

  if (hasServerless && hasAPI) return "serverless";
  if (hasAPI && hasCompute && hasDatabase) return "three-tier";
  if (hasCompute && hasDatabase) return "two-tier";
  if (hasAPI || hasCompute) return "compute-focused";
  if (hasStorage || hasDatabase) return "data-focused";
  return "cloud";
}

function getArchitectureAdvice(nodeTypes: string[]): string {
  const type = getArchitectureType(nodeTypes);

  switch (type) {
    case "serverless":
      return "Serverless architectures offer excellent scalability and cost-efficiency. Ensure proper monitoring and consider cold start optimization.";
    case "three-tier":
      return "Three-tier architecture provides good separation of concerns. Consider implementing load balancing and auto-scaling for each tier.";
    case "two-tier":
      return "Consider adding an API layer to improve security and scalability. This would allow you to scale your application and database independently.";
    case "compute-focused":
      return "Your compute-heavy setup would benefit from proper load balancing and auto-scaling. Consider adding caching and CDN for better performance.";
    case "data-focused":
      return "Strong focus on data services. Ensure proper backup strategies, replication, and access controls are in place.";
    default:
      return "Consider organizing your architecture into clear tiers for better maintainability and scalability.";
  }
}

export default router;
