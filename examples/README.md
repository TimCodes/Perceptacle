# Examples Directory

This directory contains demo and test files that are not part of the production codebase but are useful for development and testing purposes.

## Server Examples

### Demo Files

- **`aichat-demo.ts`** - Demonstrates AI chat service functionality
  - Run with: `npm run demo:aichat` (from packages/server)
  
- **`test-mocked-services.ts`** - Tests service factory with mock implementations
  - Run with: `npm run test:mocks` (from packages/server)

- **`demo.ts`** - General demo showcasing various features

- **`github-demo.ts`** - Demonstrates GitHub API integration

- **`kubernetes-demo.ts`** - Shows Kubernetes service capabilities

- **`test-azure.ts`** - Azure service integration testing

- **`verify-rag.ts`** - RAG (Retrieval-Augmented Generation) service verification

## Usage

These files are referenced in package.json scripts where needed:

```json
"test:mocks": "USE_MOCK_SERVICES=true tsx ../../examples/server/test-mocked-services.ts",
"demo:aichat": "USE_MOCK_SERVICES=true tsx ../../examples/server/aichat-demo.ts"
```

Other demo files can be run directly with tsx:

```bash
cd packages/server
npx tsx ../../examples/server/demo.ts
npx tsx ../../examples/server/github-demo.ts
npx tsx ../../examples/server/kubernetes-demo.ts
```

## Note

These files are maintained for:
- Development reference
- Manual testing
- Integration verification
- Learning/documentation purposes

They are not included in production builds.
