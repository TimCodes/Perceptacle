import { AIChatCredentials, ChatRequest, ChatResponse } from "./aichat";

/**
 * Mock AIChat Service for testing and development
 */
export class MockAIChatService {
  private credentials: AIChatCredentials;

  constructor(credentials: AIChatCredentials) {
    this.credentials = credentials;
  }

  /**
   * Mock chat method that returns simulated responses
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    console.log(`MockAIChatService: Simulating chat with ${request.model}`);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock response based on model
    const mockContent = this.generateMockResponse(request);

    return {
      content: mockContent,
      model: request.model,
      usage: {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      },
    };
  }

  /**
   * Generate mock response based on request
   */
  private generateMockResponse(request: ChatRequest): string {
    const modelResponses: Record<string, string> = {
      openai: `[Mock OpenAI Response] I understand your query: "${request.query}". ${
        request.context ? `Given the context provided, ` : ""
      }Here's a helpful response from GPT-4.`,
      claude: `[Mock Claude Response] Thank you for your question: "${request.query}". ${
        request.context ? `Based on the context you've shared, ` : ""
      }I'm Claude, and I'd be happy to help you with this.`,
      gemini: `[Mock Gemini Response] Your query was: "${request.query}". ${
        request.context ? `Considering the context, ` : ""
      }As Google's Gemini, I can provide you with comprehensive information.`,
      deepseek: `[Mock Deepseek Response] Processing query: "${request.query}". ${
        request.context ? `With the provided context, ` : ""
      }Deepseek AI is here to assist you with coding and technical questions.`,
    };

    return modelResponses[request.model] || "Mock response from AI model.";
  }

  /**
   * Mock stream chat method
   */
  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    console.log(`MockAIChatService: Simulating stream chat with ${request.model}`);

    const response = await this.chat(request);
    
    // Simulate streaming by sending chunks
    const words = response.content.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      onChunk(words[i] + (i < words.length - 1 ? " " : ""));
    }

    return response;
  }
}
