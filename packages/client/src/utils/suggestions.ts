import { Node } from 'reactflow';
import { cloudComponents } from './cloudComponents';

interface Suggestion {
  type: string;
  reason: string;
}

// Helper function to find missing common components
function findMissingCommonComponents(nodes: Node[]): Suggestion[] {
  const existingTypes = nodes.map(node => node.data.type);
  const suggestions: Suggestion[] = [];

  // If there's a compute engine without storage
  if (existingTypes.includes('compute-engine') && !existingTypes.includes('cloud-storage')) {
    suggestions.push({
      type: 'cloud-storage',
      reason: 'Consider adding Cloud Storage for persistent data storage with your Compute Engine instances.'
    });
  }

  // If there's a database without load balancer
  if (existingTypes.includes('cloud-sql') && !existingTypes.includes('load-balancer')) {
    suggestions.push({
      type: 'load-balancer',
      reason: 'Add a Load Balancer to distribute traffic across your database instances for better scalability.'
    });
  }

  // If there's a load balancer without security
  if (existingTypes.includes('load-balancer') && !existingTypes.includes('cloud-armor')) {
    suggestions.push({
      type: 'cloud-armor',
      reason: 'Protect your load balancer with Cloud Armor for enhanced security against DDoS attacks.'
    });
  }

  // Suggest Cloud Functions for event-driven architectures
  if (!existingTypes.includes('cloud-functions') && existingTypes.includes('cloud-storage')) {
    suggestions.push({
      type: 'cloud-functions',
      reason: 'Cloud Functions can help automate tasks when files are uploaded to Cloud Storage.'
    });
  }

  // Suggest Kubernetes Engine for containerized applications
  if (existingTypes.includes('compute-engine') && !existingTypes.includes('kubernetes-engine')) {
    suggestions.push({
      type: 'kubernetes-engine',
      reason: 'Consider using Kubernetes Engine for better container orchestration and scalability.'
    });
  }

  // Default suggestions if diagram is empty or very simple
  if (nodes.length < 2) {
    suggestions.push(
      {
        type: 'compute-engine',
        reason: 'Start with a Compute Engine instance as your core compute resource.'
      },
      {
        type: 'cloud-storage',
        reason: 'Add Cloud Storage for scalable object storage capabilities.'
      }
    );
  }

  return suggestions;
}

export async function getComponentSuggestions(nodes: Node[]): Promise<Array<{ type: string; reason: string }>> {
  try {
    // Get contextual suggestions based on current diagram
    const suggestions = findMissingCommonComponents(nodes);

    // Filter suggestions to only include valid component types
    return suggestions.filter(suggestion => 
      cloudComponents.some(component => component.type === suggestion.type)
    );
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
}