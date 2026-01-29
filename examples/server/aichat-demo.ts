/**
 * AIChat Service Demo
 * 
 * This demo shows how to use the AIChat service to interact with
 * multiple AI models (OpenAI, Claude, Gemini, Deepseek) using langchain.js
 */

import { AIChatService } from './services/aichat.js';
import { MockAIChatService } from './services/aichat.mock.js';
import { serviceFactory } from './services/service-factory.js';

async function demoRealService() {
  console.log('=== AIChat Service Demo (Real Services) ===\n');

  // Create service with API keys (from environment variables)
  const service = new AIChatService({
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  });

  // Example 1: Simple query with OpenAI
  console.log('1. Simple query with OpenAI:');
  try {
    const response1 = await service.chat({
      model: 'openai',
      query: 'What is TypeScript?',
    });
    console.log(`Response: ${response1.content.substring(0, 100)}...`);
    console.log(`Tokens used: ${response1.usage?.totalTokens}\n`);
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
  }

  // Example 2: Query with system prompt and context
  console.log('2. Query with system prompt and context (Claude):');
  try {
    const response2 = await service.chat({
      model: 'claude',
      query: 'How do I handle errors in async functions?',
      systemPrompt: 'You are a helpful JavaScript expert.',
      context: 'The user is learning modern JavaScript and working with promises.',
      temperature: 0.7,
    });
    console.log(`Response: ${response2.content.substring(0, 100)}...`);
    console.log(`Tokens used: ${response2.usage?.totalTokens}\n`);
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
  }

  // Example 3: Technical query with Gemini
  console.log('3. Technical query with Gemini:');
  try {
    const response3 = await service.chat({
      model: 'gemini',
      query: 'Explain the difference between SQL and NoSQL databases',
      temperature: 0.5,
      maxTokens: 300,
    });
    console.log(`Response: ${response3.content.substring(0, 100)}...`);
    console.log(`Tokens used: ${response3.usage?.totalTokens}\n`);
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
  }

  // Example 4: Coding question with Deepseek
  console.log('4. Coding question with Deepseek:');
  try {
    const response4 = await service.chat({
      model: 'deepseek',
      query: 'Write a function to find the longest palindrome in a string',
      systemPrompt: 'You are an expert programmer specializing in algorithms.',
    });
    console.log(`Response: ${response4.content.substring(0, 100)}...`);
    console.log(`Tokens used: ${response4.usage?.totalTokens}\n`);
  } catch (error: any) {
    console.log(`Error: ${error.message}\n`);
  }
}

async function demoMockService() {
  console.log('=== AIChat Service Demo (Mock Service) ===\n');

  // Create mock service (no API keys required)
  const mockService = new MockAIChatService({});

  // Example 1: Mock OpenAI
  console.log('1. Mock OpenAI response:');
  const response1 = await mockService.chat({
    model: 'openai',
    query: 'What is TypeScript?',
  });
  console.log(`Response: ${response1.content}`);
  console.log(`Tokens used: ${response1.usage?.totalTokens}\n`);

  // Example 2: Mock Claude
  console.log('2. Mock Claude response:');
  const response2 = await mockService.chat({
    model: 'claude',
    query: 'How do I handle errors?',
    context: 'JavaScript programming',
  });
  console.log(`Response: ${response2.content}`);
  console.log(`Tokens used: ${response2.usage?.totalTokens}\n`);

  // Example 3: Mock Gemini
  console.log('3. Mock Gemini response:');
  const response3 = await mockService.chat({
    model: 'gemini',
    query: 'Explain databases',
  });
  console.log(`Response: ${response3.content}`);
  console.log(`Tokens used: ${response3.usage?.totalTokens}\n`);

  // Example 4: Mock Deepseek
  console.log('4. Mock Deepseek response:');
  const response4 = await mockService.chat({
    model: 'deepseek',
    query: 'Write a sorting function',
  });
  console.log(`Response: ${response4.content}`);
  console.log(`Tokens used: ${response4.usage?.totalTokens}\n`);

  // Example 5: Mock streaming
  console.log('5. Mock streaming response:');
  let streamedContent = '';
  await mockService.streamChat(
    {
      model: 'openai',
      query: 'Tell me about React',
    },
    (chunk) => {
      streamedContent += chunk;
      process.stdout.write(chunk);
    }
  );
  console.log('\n');
}

async function demoServiceFactory() {
  console.log('=== AIChat Service via Service Factory ===\n');

  // Create service using factory (automatically uses mocks in development)
  const service = serviceFactory.createAIChatService();

  console.log(`Using mock services: ${serviceFactory.isUsingMocks()}\n`);

  // Example: Chat with the service
  console.log('Chatting with AI:');
  const response = await service.chat({
    model: 'openai',
    query: 'What are the key principles of clean code?',
    systemPrompt: 'You are a software engineering mentor.',
  });

  console.log(`Response: ${response.content}`);
  console.log(`Tokens: ${response.usage?.totalTokens}\n`);
}

async function main() {
  // Choose which demo to run based on environment
  const useMocks = process.env.USE_MOCK_SERVICES === 'true' || 
                   (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_SERVICES !== 'false');

  try {
    if (useMocks) {
      await demoMockService();
    } else {
      console.log('Note: Real service demos require API keys in environment variables\n');
      await demoRealService();
    }

    // Always demonstrate service factory
    await demoServiceFactory();
  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { demoRealService, demoMockService, demoServiceFactory };
