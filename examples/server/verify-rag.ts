
import { RagService } from './services/rag';
import { MockRagService } from './services/rag.mock';
import { ServiceFactory } from './services/service-factory';

async function testRagService() {
    console.log('Testing RAG Service Integration...');

    // Test 1: Mock Service Instantiation
    console.log('\n1. Testing MockRagService...');
    const mockService = new MockRagService();
    const health = await mockService.checkHealth();
    console.log('Health Check:', health);

    const searchResults = await mockService.search('kubernetes');
    console.log(`Search 'kubernetes' results: ${searchResults.length} documents found`);
    if (searchResults.length > 0) {
        console.log('First result:', searchResults[0].id);
    }

    // Test 2: Service Factory Integration
    console.log('\n2. Testing ServiceFactory Integration...');
    const factory = new ServiceFactory({
        useMocks: true,
        rag: {
            baseUrl: 'http://test-rag:8080'
        }
    });

    if (factory.isUsingMocks()) {
        console.log('Factory is configured to use mocks');
    }

    const ragServiceFromFactory = factory.createRagService();
    const isMock = ragServiceFromFactory instanceof MockRagService;
    console.log('Created service is MockRagService:', isMock);

    // Test 3: Real Service Instantiation (just checking class structure, not calling external API)
    console.log('\n3. Testing RagService structure...');
    const realService = new RagService('http://localhost:8080');
    console.log('Real service instantiated with URL:', 'http://localhost:8080');

    console.log('\nVerification Complete!');
}

testRagService().catch(console.error);
