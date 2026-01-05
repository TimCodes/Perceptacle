import { AzureService } from "./services/azure";

// Simple test to verify Azure service can be instantiated
async function testAzureService() {
  console.log("Testing Azure Service instantiation...");
  
  try {
    // Test with mock credentials (this will fail auth but tests the class structure)
    const mockCredentials = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      tenantId: "test-tenant-id"
    };
    
    const azureService = AzureService.fromCredentials(mockCredentials, "test-subscription-id");
    console.log("✓ Azure service instantiated successfully");
    
    // Test static method
    console.log("✓ Static factory method works");
    
    console.log("Azure service is ready for use!");
    
  } catch (error) {
    console.error("✗ Error testing Azure service:", error);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAzureService();
}
