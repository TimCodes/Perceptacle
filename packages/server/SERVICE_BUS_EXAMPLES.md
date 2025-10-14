# Service Bus Enhancement Examples

This document provides examples of the new Service Bus functionality added to the Azure service.

## Service Bus Namespace Summary

The namespace summary provides a comprehensive overview of all Service Bus entities in a namespace.

### Example Response

```json
{
  "namespaceName": "my-servicebus-namespace",
  "totalQueues": 5,
  "totalTopics": 3,
  "totalSubscriptions": 8,
  "totalActiveMessages": 42,
  "totalDeadLetterMessages": 3,
  "totalScheduledMessages": 2,
  "queues": [
    {
      "name": "orders-queue",
      "activeMessageCount": 15,
      "deadLetterMessageCount": 1,
      "scheduledMessageCount": 0,
      "transferMessageCount": 0,
      "transferDeadLetterMessageCount": 0,
      "totalMessageCount": 16,
      "status": "Active",
      "sizeInBytes": 2048,
      "maxSizeInMegabytes": 1024,
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-09T15:30:00Z"
    },
    {
      "name": "payments-queue",
      "activeMessageCount": 8,
      "deadLetterMessageCount": 0,
      "scheduledMessageCount": 1,
      "transferMessageCount": 0,
      "transferDeadLetterMessageCount": 0,
      "totalMessageCount": 9,
      "status": "Active",
      "sizeInBytes": 1024,
      "maxSizeInMegabytes": 1024,
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-09T15:30:00Z"
    }
  ],
  "topics": [
    {
      "name": "order-events",
      "activeMessageCount": 12,
      "deadLetterMessageCount": 1,
      "scheduledMessageCount": 1,
      "transferMessageCount": 0,
      "transferDeadLetterMessageCount": 0,
      "totalMessageCount": 14,
      "status": "Active",
      "sizeInBytes": 1536,
      "maxSizeInMegabytes": 1024,
      "subscriptionCount": 3,
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-09T15:30:00Z"
    }
  ],
  "subscriptions": [
    {
      "name": "email-processor",
      "topicName": "order-events",
      "activeMessageCount": 4,
      "deadLetterMessageCount": 0,
      "scheduledMessageCount": 0,
      "transferMessageCount": 0,
      "transferDeadLetterMessageCount": 0,
      "totalMessageCount": 4,
      "status": "Active",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-09T15:30:00Z"
    },
    {
      "name": "sms-processor",
      "topicName": "order-events",
      "activeMessageCount": 3,
      "deadLetterMessageCount": 1,
      "scheduledMessageCount": 0,
      "transferMessageCount": 0,
      "transferDeadLetterMessageCount": 0,
      "totalMessageCount": 4,
      "status": "Active",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-09T15:30:00Z"
    }
  ]
}
```

## API Usage Examples

### 1. Get Complete Namespace Summary

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/summary" \
  -H "Content-Type: application/json"
```

This endpoint provides:
- Total counts for queues, topics, and subscriptions
- Aggregated message counts across all entities
- Detailed information for each queue, topic, and subscription

### 2. Get All Queues in Namespace

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/queues" \
  -H "Content-Type: application/json"
```

Returns an array of queue information objects.

### 3. Get Specific Queue Information

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/queues/orders-queue" \
  -H "Content-Type: application/json"
```

### 4. Get All Topics in Namespace

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/topics" \
  -H "Content-Type: application/json"
```

### 5. Get Specific Topic Information

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/topics/order-events" \
  -H "Content-Type: application/json"
```

### 6. Get All Subscriptions in Namespace

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/subscriptions" \
  -H "Content-Type: application/json"
```

### 7. Get Specific Subscription Information

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/my-rg/my-servicebus-namespace/topics/order-events/subscriptions/email-processor" \
  -H "Content-Type: application/json"
```

## Message Count Types

Each Service Bus entity provides the following message count information:

- **activeMessageCount**: Messages available for processing
- **deadLetterMessageCount**: Messages that failed processing and moved to dead letter queue
- **scheduledMessageCount**: Messages scheduled for future delivery
- **transferMessageCount**: Messages in transfer queue (for forwarding scenarios)
- **transferDeadLetterMessageCount**: Failed transfer messages
- **totalMessageCount**: Sum of active, dead letter, and scheduled messages

## Use Cases

### Monitoring Dashboard
Use the namespace summary endpoint to create a comprehensive monitoring dashboard showing:
- Total message backlog across all entities
- Dead letter message alerts
- Queue/topic utilization

### Alerting
Set up alerts based on:
- High active message counts indicating processing delays
- Dead letter message counts indicating processing failures
- Queue size approaching limits

### Capacity Planning
Monitor:
- Message size trends
- Queue utilization patterns
- Subscription processing efficiency

### Troubleshooting
- Identify problematic queues/topics with high dead letter counts
- Monitor subscription processing patterns
- Track message flow through topics and subscriptions

## Error Handling

The Service Bus endpoints include comprehensive error handling for:
- Invalid resource group or namespace names
- Non-existent queues, topics, or subscriptions
- Authentication and authorization failures
- Azure Service Bus service unavailability

All errors return structured JSON responses with error details and HTTP status codes.
