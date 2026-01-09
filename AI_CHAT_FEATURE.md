# AI Chat Assistant Feature

## Overview
The AI Chat Assistant is an intelligent conversational interface that provides contextual help, architecture analysis, and recommendations based on your diagram's current state.

## Location
- **Floating Button**: Bottom right corner of the canvas (green rectangle in the mockup)
- **Chat Window**: Overlays the canvas when opened, positioned above the floating button

## Features

### 1. **Contextual Understanding**
The AI assistant has full access to your diagram context:
- Total number of nodes and edges
- Types of components used
- Component labels and statuses
- Overall architecture pattern

### 2. **Intelligent Responses**
The assistant can help with:

#### Architecture Analysis
- Overview of your current architecture
- Identification of architecture patterns (serverless, three-tier, etc.)
- Structural recommendations

#### Security Guidance
- Security best practices
- Identification of missing security components
- Recommendations for Azure/GCP/Kubernetes security features

#### Scalability & Performance
- Auto-scaling recommendations
- Load balancing strategies
- Caching and CDN suggestions
- Performance optimization tips

#### Cost Optimization
- Resource right-sizing
- Reserved instance recommendations
- Cost monitoring strategies
- Serverless alternatives

#### Reliability & Availability
- High availability patterns
- Multi-zone deployment strategies
- Backup and disaster recovery
- Health checks and failover

#### Monitoring & Observability
- Centralized logging setup
- Distributed tracing
- Key performance indicators
- Alert configuration

#### Missing Components
- Identifies gaps in your architecture
- Suggests complementary services
- Best practice recommendations

### 3. **User Interface**

#### Floating Chat Button
- Always visible in the bottom right corner
- Animated entrance on page load
- Shows message icon when closed
- Shows X icon when open
- Smooth scale transition on click

#### Chat Window
- 400px wide × 600px tall
- Smooth fade and scale animation
- Fixed position above the floating button
- Three sections:
  1. **Header**: Title and close button
  2. **Messages**: Scrollable message history
  3. **Input**: Message input and send button

#### Message Display
- User messages: Right-aligned, primary color background
- Assistant messages: Left-aligned, muted background
- Timestamp display on each message
- Auto-scroll to latest message
- Loading indicator while processing

### 4. **Conversation Flow**
1. Welcome message greets the user on first open
2. User types a question or request
3. Message is sent to the backend with full diagram context
4. AI analyzes the request and diagram state
5. Contextual response is generated and displayed
6. Conversation history is maintained for context

### 5. **Example Queries**

**Analysis**
- "Analyze my architecture"
- "Give me an overview of my diagram"
- "What type of architecture is this?"

**Security**
- "How can I improve security?"
- "What security components am I missing?"
- "Security best practices for this architecture"

**Scalability**
- "How can I scale this system?"
- "What are scalability recommendations?"
- "Performance optimization tips"

**Cost**
- "How can I optimize costs?"
- "Cost saving recommendations"
- "Right-sizing suggestions"

**Components**
- "What components am I missing?"
- "Suggest additional services"
- "Do I need a load balancer?"

**Best Practices**
- "What are the best practices?"
- "Recommendations for this architecture"
- "How to improve reliability?"

## Technical Implementation

### Frontend Component
**Location**: `packages/client/src/components/AIChat/AIChat.tsx`

**Key Features**:
- React functional component with hooks
- State management for messages, input, and loading
- Integration with Zustand diagram store
- Framer Motion animations
- Responsive design with Tailwind CSS

**Dependencies**:
- `framer-motion`: Smooth animations
- `lucide-react`: Icons (MessageSquare, X, Send, Loader2)
- `@/components/ui/*`: shadcn/ui components
- `@/utils/diagram-store`: Access to diagram state

### Backend API
**Location**: `packages/server/routes/ai.ts`

**Endpoint**: `POST /api/ai/chat`

**Request Body**:
```json
{
  "message": "User's question",
  "diagramContext": {
    "nodeCount": 5,
    "edgeCount": 4,
    "nodeTypes": ["compute-engine", "cloud-storage", "cloud-sql"],
    "nodes": [
      {
        "id": "1",
        "type": "compute-engine",
        "label": "Web Server",
        "status": "active"
      }
    ]
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2025-10-29T10:00:00Z"
    }
  ]
}
```

**Response**:
```json
{
  "message": "AI assistant's response",
  "timestamp": "2025-10-29T10:00:01Z"
}
```

**Intelligence Engine**:
- Pattern matching for common queries
- Context-aware response generation
- Architecture type detection
- Component analysis and recommendations

### Integration Points

1. **Diagram Store Integration**
   - Real-time access to nodes and edges
   - Automatic context updates as diagram changes

2. **API Communication**
   - Async fetch requests to backend
   - Error handling with fallback responses
   - Loading states during API calls

3. **UI Integration**
   - Positioned in Home page layout
   - Z-index management to stay on top
   - Responsive to screen size changes

## Future Enhancements

### Short Term
1. **OpenAI Integration**: Replace mock responses with actual LLM
2. **Conversation Export**: Save chat history
3. **Quick Actions**: Clickable suggestions that modify diagram
4. **Voice Input**: Speech-to-text support

### Long Term
1. **Multi-language Support**: Internationalization
2. **Custom Prompts**: User-defined AI personalities
3. **Learning Mode**: Interactive tutorials
4. **Code Generation**: Generate IaC from diagrams
5. **Documentation Generation**: Auto-create architecture docs
6. **Compliance Checking**: Verify against standards

## Styling
- **Colors**: Uses theme variables for dark/light mode
- **Animations**: Spring-based, natural feeling
- **Shadows**: Elevated appearance with shadow-lg and shadow-xl
- **Borders**: Subtle borders matching app theme
- **Spacing**: Consistent padding and gaps

## Accessibility
- Keyboard navigation support (Enter to send)
- Clear focus states
- Semantic HTML structure
- ARIA labels for screen readers
- Sufficient color contrast

## Performance Considerations
- Lazy loading of message history
- Debounced API calls (future)
- Conversation history limited to last 10 messages
- Efficient re-renders with React memo (future)
- Message virtualization for long conversations (future)

## Testing Recommendations
1. Unit tests for message formatting
2. Integration tests for API communication
3. E2E tests for user flows
4. Performance tests for long conversations
5. Accessibility audits

## Usage Instructions for Users
1. Click the chat icon in the bottom right corner
2. Type your question about your architecture
3. Press Enter or click Send
4. Review the AI's response and suggestions
5. Continue the conversation as needed
6. Click X or the chat icon to close

## Troubleshooting
- **No response**: Check network connection and server status
- **Generic responses**: Backend may be using fallback mode
- **Slow responses**: Large diagrams take longer to analyze
- **Missing context**: Ensure diagram has saved data

## Related Files
- `/packages/client/src/components/AIChat/AIChat.tsx` - Main component
- `/packages/client/src/components/AIChat/index.ts` - Export
- `/packages/server/routes/ai.ts` - Backend API
- `/packages/server/routes.ts` - Route registration
- `/packages/client/src/pages/home.tsx` - Integration point
