import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Internal types for handling langchain response metadata
interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
}

interface GeminiUsage {
  prompt_token_count?: number;
  candidates_token_count?: number;
  total_token_count?: number;
}

interface LangChainResponse {
  content: string;
  response_metadata?: {
    usage?: OpenAIUsage | AnthropicUsage | GeminiUsage;
  };
}

// Types for the service
export interface AIChatCredentials {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  model: "gemini" | "claude" | "deepseek" | "openai";
  query: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * AIChat Service for interacting with multiple AI models
 * Supports: Gemini, Claude, Deepseek, and OpenAI
 */
export class AIChatService {
  private credentials: AIChatCredentials;

  constructor(credentials: AIChatCredentials) {
    this.credentials = credentials;
  }

  /**
   * Send a chat request to the specified AI model
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      switch (request.model) {
        case "gemini":
          return await this.chatWithGemini(request);
        case "claude":
          return await this.chatWithClaude(request);
        case "deepseek":
          return await this.chatWithDeepseek(request);
        case "openai":
          return await this.chatWithOpenAI(request);
        default:
          throw new Error(`Unsupported model: ${request.model}`);
      }
    } catch (error) {
      console.error(`Error chatting with ${request.model}:`, error);
      throw error;
    }
  }

  /**
   * Chat with OpenAI models
   */
  private async chatWithOpenAI(request: ChatRequest): Promise<ChatResponse> {
    if (!this.credentials.openaiApiKey) {
      throw new Error("OpenAI API key is required");
    }

    const model = new ChatOpenAI({
      apiKey: this.credentials.openaiApiKey,
      modelName: "gpt-4",
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens,
    });

    const messages = this.buildMessages(request);
    const response = await model.invoke(messages) as unknown as LangChainResponse;

    return {
      content: response.content as string,
      model: "openai",
      usage: response.response_metadata?.usage
        ? {
            promptTokens: (response.response_metadata.usage as OpenAIUsage).prompt_tokens,
            completionTokens: (response.response_metadata.usage as OpenAIUsage).completion_tokens,
            totalTokens: (response.response_metadata.usage as OpenAIUsage).total_tokens,
          }
        : undefined,
    };
  }

  /**
   * Chat with Claude (Anthropic) models
   */
  private async chatWithClaude(request: ChatRequest): Promise<ChatResponse> {
    if (!this.credentials.anthropicApiKey) {
      throw new Error("Anthropic API key is required");
    }

    const model = new ChatAnthropic({
      apiKey: this.credentials.anthropicApiKey,
      model: "claude-3-5-sonnet-20241022",
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 4096,
    }) as any; // Type assertion needed due to langchain type version mismatch

    const messages = this.buildMessages(request);
    const response = await model.invoke(messages) as unknown as LangChainResponse;

    return {
      content: response.content as string,
      model: "claude",
      usage: response.response_metadata?.usage
        ? {
            promptTokens: (response.response_metadata.usage as AnthropicUsage).input_tokens,
            completionTokens: (response.response_metadata.usage as AnthropicUsage).output_tokens,
            totalTokens:
              ((response.response_metadata.usage as AnthropicUsage).input_tokens || 0) +
              ((response.response_metadata.usage as AnthropicUsage).output_tokens || 0),
          }
        : undefined,
    };
  }

  /**
   * Chat with Gemini (Google) models
   */
  private async chatWithGemini(request: ChatRequest): Promise<ChatResponse> {
    if (!this.credentials.geminiApiKey) {
      throw new Error("Gemini API key is required");
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: this.credentials.geminiApiKey,
      model: "gemini-1.5-pro",
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens,
    }) as any; // Type assertion needed due to langchain type version mismatch

    const messages = this.buildMessages(request);
    const response = await model.invoke(messages) as unknown as LangChainResponse;

    return {
      content: response.content as string,
      model: "gemini",
      usage: response.response_metadata?.usage
        ? {
            promptTokens: (response.response_metadata.usage as GeminiUsage).prompt_token_count,
            completionTokens: (response.response_metadata.usage as GeminiUsage).candidates_token_count,
            totalTokens: (response.response_metadata.usage as GeminiUsage).total_token_count,
          }
        : undefined,
    };
  }

  /**
   * Chat with Deepseek models (using OpenAI-compatible API)
   */
  private async chatWithDeepseek(request: ChatRequest): Promise<ChatResponse> {
    if (!this.credentials.deepseekApiKey) {
      throw new Error("Deepseek API key is required");
    }

    const model = new ChatOpenAI({
      apiKey: this.credentials.deepseekApiKey,
      modelName: "deepseek-chat",
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens,
      configuration: {
        baseURL: "https://api.deepseek.com/v1",
      },
    });

    const messages = this.buildMessages(request);
    const response = await model.invoke(messages) as unknown as LangChainResponse;

    return {
      content: response.content as string,
      model: "deepseek",
      usage: response.response_metadata?.usage
        ? {
            promptTokens: (response.response_metadata.usage as OpenAIUsage).prompt_tokens,
            completionTokens: (response.response_metadata.usage as OpenAIUsage).completion_tokens,
            totalTokens: (response.response_metadata.usage as OpenAIUsage).total_tokens,
          }
        : undefined,
    };
  }

  /**
   * Build messages array from request
   * Note: Context is added as a separate SystemMessage. If you need context
   * to be part of the main system prompt, combine them before calling this method.
   */
  private buildMessages(request: ChatRequest): BaseMessage[] {
    const messages: BaseMessage[] = [];

    // Add system prompt if provided
    if (request.systemPrompt) {
      messages.push(new SystemMessage(request.systemPrompt));
    }

    // Add context if provided (as a separate system message)
    if (request.context) {
      const contextMessage = `Context:\n${request.context}\n\n`;
      messages.push(new SystemMessage(contextMessage));
    }

    // Add user query
    messages.push(new HumanMessage(request.query));

    return messages;
  }

  /**
   * Stream chat responses (PLACEHOLDER: Currently returns full response)
   * 
   * Note: This is a placeholder implementation that returns the complete response at once.
   * Proper streaming support will be added in a future update. The onChunk callback
   * is called once with the full response content.
   * 
   * @param request - The chat request
   * @param onChunk - Callback function called with response chunks
   * @returns The complete chat response
   */
  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    // For now, just call regular chat and return the full response
    // TODO: Implement proper streaming support using langchain's streaming capabilities
    const response = await this.chat(request);
    onChunk(response.content);
    return response;
  }
}
