import { AIChatService } from '../services/aichat';
import { MockAIChatService } from '../services/aichat.mock';

// Mock the langchain libraries
jest.mock('@langchain/openai');
jest.mock('@langchain/anthropic');
jest.mock('@langchain/google-genai');

describe('AIChatService', () => {
  let service: AIChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock ChatOpenAI
    const { ChatOpenAI } = require('@langchain/openai');
    ChatOpenAI.mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({
        content: 'Mock OpenAI response',
        response_metadata: {
          usage: {
            prompt_tokens: 50,
            completion_tokens: 100,
            total_tokens: 150,
          },
        },
      }),
    }));

    // Mock ChatAnthropic
    const { ChatAnthropic } = require('@langchain/anthropic');
    ChatAnthropic.mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({
        content: 'Mock Claude response',
        response_metadata: {
          usage: {
            input_tokens: 50,
            output_tokens: 100,
          },
        },
      }),
    }));

    // Mock ChatGoogleGenerativeAI
    const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
    ChatGoogleGenerativeAI.mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({
        content: 'Mock Gemini response',
        response_metadata: {
          usage: {
            prompt_token_count: 50,
            candidates_token_count: 100,
            total_token_count: 150,
          },
        },
      }),
    }));

    service = new AIChatService({
      openaiApiKey: 'test-openai-key',
      anthropicApiKey: 'test-anthropic-key',
      geminiApiKey: 'test-gemini-key',
      deepseekApiKey: 'test-deepseek-key',
    });
  });

  describe('OpenAI', () => {
    it('should chat with OpenAI successfully', async () => {
      const response = await service.chat({
        model: 'openai',
        query: 'Hello, how are you?',
      });

      expect(response.content).toBe('Mock OpenAI response');
      expect(response.model).toBe('openai');
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBe(50);
      expect(response.usage?.completionTokens).toBe(100);
      expect(response.usage?.totalTokens).toBe(150);
    });

    it('should throw error if OpenAI API key is missing', async () => {
      const serviceWithoutKey = new AIChatService({
        anthropicApiKey: 'test-key',
      });

      await expect(
        serviceWithoutKey.chat({
          model: 'openai',
          query: 'Hello',
        })
      ).rejects.toThrow('OpenAI API key is required');
    });

    it('should chat with OpenAI with context', async () => {
      const response = await service.chat({
        model: 'openai',
        query: 'What is the answer?',
        context: 'The answer to everything is 42.',
      });

      expect(response.content).toBe('Mock OpenAI response');
      expect(response.model).toBe('openai');
    });

    it('should chat with OpenAI with system prompt', async () => {
      const response = await service.chat({
        model: 'openai',
        query: 'Tell me a joke',
        systemPrompt: 'You are a helpful comedian.',
      });

      expect(response.content).toBe('Mock OpenAI response');
      expect(response.model).toBe('openai');
    });

    it('should chat with OpenAI with custom parameters', async () => {
      const response = await service.chat({
        model: 'openai',
        query: 'Generate text',
        temperature: 0.9,
        maxTokens: 500,
      });

      expect(response.content).toBe('Mock OpenAI response');
      expect(response.model).toBe('openai');
    });
  });

  describe('Claude (Anthropic)', () => {
    it('should chat with Claude successfully', async () => {
      const response = await service.chat({
        model: 'claude',
        query: 'Hello, Claude!',
      });

      expect(response.content).toBe('Mock Claude response');
      expect(response.model).toBe('claude');
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBe(50);
      expect(response.usage?.completionTokens).toBe(100);
      expect(response.usage?.totalTokens).toBe(150);
    });

    it('should throw error if Anthropic API key is missing', async () => {
      const serviceWithoutKey = new AIChatService({
        openaiApiKey: 'test-key',
      });

      await expect(
        serviceWithoutKey.chat({
          model: 'claude',
          query: 'Hello',
        })
      ).rejects.toThrow('Anthropic API key is required');
    });

    it('should chat with Claude with context and system prompt', async () => {
      const response = await service.chat({
        model: 'claude',
        query: 'Explain this code',
        context: 'const x = 5;',
        systemPrompt: 'You are a code expert.',
      });

      expect(response.content).toBe('Mock Claude response');
      expect(response.model).toBe('claude');
    });
  });

  describe('Gemini', () => {
    it('should chat with Gemini successfully', async () => {
      const response = await service.chat({
        model: 'gemini',
        query: 'Hello, Gemini!',
      });

      expect(response.content).toBe('Mock Gemini response');
      expect(response.model).toBe('gemini');
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBe(50);
      expect(response.usage?.completionTokens).toBe(100);
      expect(response.usage?.totalTokens).toBe(150);
    });

    it('should throw error if Gemini API key is missing', async () => {
      const serviceWithoutKey = new AIChatService({
        openaiApiKey: 'test-key',
      });

      await expect(
        serviceWithoutKey.chat({
          model: 'gemini',
          query: 'Hello',
        })
      ).rejects.toThrow('Gemini API key is required');
    });
  });

  describe('Deepseek', () => {
    it('should chat with Deepseek successfully', async () => {
      const response = await service.chat({
        model: 'deepseek',
        query: 'Hello, Deepseek!',
      });

      expect(response.content).toBe('Mock OpenAI response');
      expect(response.model).toBe('deepseek');
    });

    it('should throw error if Deepseek API key is missing', async () => {
      const serviceWithoutKey = new AIChatService({
        openaiApiKey: 'test-key',
      });

      await expect(
        serviceWithoutKey.chat({
          model: 'deepseek',
          query: 'Hello',
        })
      ).rejects.toThrow('Deepseek API key is required');
    });
  });

  describe('Error handling', () => {
    it('should throw error for unsupported model', async () => {
      await expect(
        service.chat({
          model: 'unsupported-model' as any,
          query: 'Hello',
        })
      ).rejects.toThrow('Unsupported model');
    });

    it('should handle API errors gracefully', async () => {
      const { ChatOpenAI } = require('@langchain/openai');
      ChatOpenAI.mockImplementation(() => ({
        invoke: jest.fn().mockRejectedValue(new Error('API Error')),
      }));

      const errorService = new AIChatService({
        openaiApiKey: 'test-key',
      });

      await expect(
        errorService.chat({
          model: 'openai',
          query: 'Hello',
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('Stream chat', () => {
    it('should stream chat responses', async () => {
      const chunks: string[] = [];
      const response = await service.streamChat(
        {
          model: 'openai',
          query: 'Tell me a story',
        },
        (chunk) => chunks.push(chunk)
      );

      expect(response.content).toBe('Mock OpenAI response');
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});

describe('MockAIChatService', () => {
  let mockService: MockAIChatService;

  beforeEach(() => {
    mockService = new MockAIChatService({
      openaiApiKey: 'test-openai-key',
      anthropicApiKey: 'test-anthropic-key',
      geminiApiKey: 'test-gemini-key',
      deepseekApiKey: 'test-deepseek-key',
    });
  });

  it('should return mock response for OpenAI', async () => {
    const response = await mockService.chat({
      model: 'openai',
      query: 'Test query',
    });

    expect(response.content).toContain('[Mock OpenAI Response]');
    expect(response.content).toContain('Test query');
    expect(response.model).toBe('openai');
    expect(response.usage).toBeDefined();
  });

  it('should return mock response for Claude', async () => {
    const response = await mockService.chat({
      model: 'claude',
      query: 'Test query',
    });

    expect(response.content).toContain('[Mock Claude Response]');
    expect(response.content).toContain('Test query');
    expect(response.model).toBe('claude');
  });

  it('should return mock response for Gemini', async () => {
    const response = await mockService.chat({
      model: 'gemini',
      query: 'Test query',
    });

    expect(response.content).toContain('[Mock Gemini Response]');
    expect(response.content).toContain('Test query');
    expect(response.model).toBe('gemini');
  });

  it('should return mock response for Deepseek', async () => {
    const response = await mockService.chat({
      model: 'deepseek',
      query: 'Test query',
    });

    expect(response.content).toContain('[Mock Deepseek Response]');
    expect(response.content).toContain('Test query');
    expect(response.model).toBe('deepseek');
  });

  it('should include context in mock response', async () => {
    const response = await mockService.chat({
      model: 'openai',
      query: 'Test query',
      context: 'Test context',
    });

    expect(response.content).toContain('Test query');
  });

  it('should simulate streaming', async () => {
    const chunks: string[] = [];
    const response = await mockService.streamChat(
      {
        model: 'openai',
        query: 'Test query',
      },
      (chunk) => chunks.push(chunk)
    );

    expect(response.content).toContain('[Mock OpenAI Response]');
    expect(chunks.length).toBeGreaterThan(0);
  });
});
