# Dead Code Analysis for Perceptacle

**Analysis Date:** 2025-01-05  
**Analyzed By:** GitHub Copilot Code Analysis

## Executive Summary

This document provides a comprehensive analysis of dead and unused code in the Perceptacle repository. The analysis identifies files, functions, and components that are not actively used in the production codebase.

## Categories of Dead Code

### 1. Demo and Test Utility Files (Server Package)

The following files in `/packages/server/` are standalone demo/test files not imported by the main application:

#### 🔴 Confirmed Unused Files

| File | Purpose | Lines of Code | Recommendation |
|------|---------|---------------|----------------|
| `demo.ts` | General demo file | ~200 | Consider moving to `/examples` or deleting |
| `aichat-demo.ts` | AI chat service demo | ~180 | Keep as npm script `demo:aichat`, or move to `/examples` |
| `github-demo.ts` | GitHub service demo | ~145 | Consider moving to `/examples` or deleting |
| `kubernetes-demo.ts` | Kubernetes service demo | ~260 | Consider moving to `/examples` or deleting |
| `test-azure.ts` | Azure service testing | ~30 | Consider moving to `/examples` or deleting |
| `test-mocked-services.ts` | Mock service testing | ~190 | Keep as npm script `test:mocks`, or move to `/examples` |
| `verify-rag.ts` | RAG service verification | ~50 | Consider moving to `/examples` or deleting |

**Note:** `aichat-demo.ts` and `test-mocked-services.ts` are referenced in package.json scripts:
- `"test:mocks": "USE_MOCK_SERVICES=true tsx test-mocked-services.ts"`
- `"demo:aichat": "USE_MOCK_SERVICES=true tsx aichat-demo.ts"`

These can be kept for development purposes but should be in a separate directory.

### 2. Unused Vite Development Server (Server Package)

#### 🔴 `vite.ts` - Completely Unused (83 lines)

**Location:** `/packages/server/vite.ts`

**Description:** This file contains functions for setting up Vite development server and serving static files in production. However, it's not imported or used anywhere in the current server implementation.

**Analysis:**
- Exports `setupVite()` and `serveStatic()` functions
- Not imported in `index.ts` or any other production file
- The current server (`index.ts`) uses a standalone API server without Vite integration
- Client runs on separate port (5173) with its own Vite server

**Evidence:**
```bash
# No imports found except self-reference
grep -r "setupVite\|serveStatic\|from.*vite.ts" packages/server/ --include="*.ts"
# Returns: Only declarations in vite.ts itself
```

**Recommendation:** DELETE - The project uses a separate client/server architecture. This file appears to be leftover from a previous monolithic setup.

### 3. Unused Type Guard Functions (Server Package)

#### 🟡 Partially Unused Type Guards in `service-factory.ts`

**Location:** `/packages/server/services/service-factory.ts`

The following type guard functions are exported but never used anywhere in the codebase:

| Function | Purpose | Used |
|----------|---------|------|
| `isKubernetesService()` | Type guard for Kubernetes service | ✅ Yes |
| `isMockKubernetesService()` | Type guard for mock Kubernetes | ✅ Yes |
| `isAzureService()` | Type guard for Azure service | ✅ Yes |
| `isMockAzureService()` | Type guard for mock Azure | ✅ Yes |
| `isGitHubService()` | Type guard for GitHub service | ✅ Yes |
| `isMockGitHubService()` | Type guard for mock GitHub | ✅ Yes |
| `isOracleService()` | Type guard for Oracle service | ❌ No |
| `isMockOracleService()` | Type guard for mock Oracle | ❌ No |
| `isAIChatService()` | Type guard for AI Chat service | ✅ Yes |
| `isMockAIChatService()` | Type guard for mock AI Chat | ✅ Yes |
| `isMongoDBService()` | Type guard for MongoDB service | ❌ No |
| `isMockMongoDBService()` | Type guard for mock MongoDB | ❌ No |
| `isRagService()` | Type guard for RAG service | ❌ No |
| `isMockRagService()` | Type guard for mock RAG | ❌ No |
| `isKafkaService()` | Type guard for Kafka service | ❌ No |

**Evidence:**
```bash
# Search results show these are never used outside their declarations
grep -r "isOracleService\|isMockOracleService" packages/server/ --include="*.ts"
# Returns: Only export declarations
```

**Recommendation:** 
- **KEEP for now** - These may be used for future runtime type checking
- **OPTIONAL:** Remove if not planning to use them, or mark as internal-only exports

### 4. Unused UI Components (Client Package)

#### 🔴 ShadCN UI Components Never Imported

**Location:** `/packages/client/src/components/ui/`

The following ShadCN UI components are defined but never imported anywhere in the application:

| Component | File | Estimated LOC |
|-----------|------|---------------|
| Accordion | `accordion.tsx` | ~80 |
| Alert Dialog | `alert-dialog.tsx` | ~120 |
| Alert | `alert.tsx` | ~60 |
| Aspect Ratio | `aspect-ratio.tsx` | ~20 |
| Avatar | `avatar.tsx` | ~60 |
| Breadcrumb | `breadcrumb.tsx` | ~150 |
| Calendar | `calendar.tsx` | ~60 |
| Chart | `chart.tsx` | ~200 |
| Collapsible | `collapsible.tsx` | ~40 |
| Context Menu | `context-menu.tsx` | ~180 |
| Drawer | `drawer.tsx` | ~150 |
| Form | `form.tsx` | ~150 |
| Hover Card | `hover-card.tsx` | ~50 |
| Input OTP | `input-otp.tsx` | ~100 |
| Menubar | `menubar.tsx` | ~200 |
| Navigation Menu | `navigation-menu.tsx` | ~150 |
| Pagination | `pagination.tsx` | ~120 |
| Radio Group | `radio-group.tsx` | ~60 |
| Resizable | `resizable.tsx` | ~80 |
| Sidebar | `sidebar.tsx` | ~400 |
| Slider | `slider.tsx` | ~50 |
| Table | `table.tsx` | ~150 |
| Toaster | `toaster.tsx` | ~40 |
| Toggle Group | `toggle-group.tsx` | ~80 |
| Toggle | `toggle.tsx` | ~50 | (only imported by unused toggle-group) |

**Total Estimated Dead Code:** ~2,650+ lines

**Note:** The following UI components ARE currently used in the application:
- button, card, badge, dialog, input, label, checkbox, toast, select, separator, scroll-area, tabs, textarea, switch, dropdown-menu, popover, skeleton, tooltip, progress, sheet, command

**Evidence:**
```bash
cd packages/client/src
# For each component, searching for imports yields 0 results
grep -r "from.*ui/accordion" --include="*.tsx" --include="*.ts" .
# No matches found (except in the file itself)
```

**Analysis:**
- These are ShadCN UI component library files
- Likely scaffolded during project setup
- Only a subset of UI components are actually used (Button, Card, Badge, Dialog, etc.)
- The unused ones add unnecessary bundle size and maintenance overhead

**Recommendation:** 
- **DELETE UNUSED COMPONENTS** - They can be easily regenerated if needed in the future
- ShadCN components can be re-added using `npx shadcn-ui@latest add [component]`
- This would reduce codebase size by ~2,600 lines

### 5. Unused Utility Files

#### 🔴 GCP Components - Unused

**Location:** `/packages/client/src/utils/gcp-components.ts` (1,220 bytes)

**Analysis:**
- Defines Google Cloud Platform component types and icons
- Not imported anywhere in the codebase
- Application currently only supports Azure and Kubernetes integrations

**Evidence:**
```bash
grep -r "gcp-components" packages/client/src/ --include="*.ts" --include="*.tsx"
# No imports found
```

**Recommendation:** DELETE - Can be re-added if GCP support is implemented in the future

#### 🔴 Mock Log Generator - Unused

**Location:** `/packages/client/src/utils/mock-log-generator.ts` (1,864 bytes)

**Analysis:**
- Generates mock log entries for testing/demo purposes
- Not imported anywhere in the production code
- May have been used during development

**Evidence:**
```bash
grep -r "mock-log-generator" packages/client/src/ --include="*.ts" --include="*.tsx"
# No imports found
```

**Recommendation:** DELETE or move to `/examples` - Not needed for production

#### 🟢 Log Formatter - Used Only in Tests

**Location:** `/packages/server/utils/log-formatter.ts` (2,795 bytes)

**Analysis:**
- Used in test file: `__tests__/log-ingestion.test.ts`
- Not used in production code
- May be intended for future log ingestion features

**Recommendation:** KEEP - Used in tests, may be needed for future features

### 6. Duplicate Database Schema Files

#### 🟡 Potential Duplication

**Root Level:**
- `/drizzle.config.ts` (321 bytes)
- `/db/schema.ts` (3,446 bytes)

**Server Package:**
- `/packages/server/drizzle.config.ts` (377 bytes)
- `/packages/server/db/schema.ts` (types/tables)

**Analysis:**
- Root-level database files exist but are not referenced in the codebase
- Server package has its own `db/` directory with schema
- Only the server package schema is actually used (`packages/server/db/schema.ts`)

**Evidence:**
```bash
# Root schema not imported
grep -r "from.*db/schema" . --include="*.ts" | grep -v packages/server
# Only packages/server/db/schema imports found
```

**Recommendation:** 
- **DELETE** root-level `/db/schema.ts` and `/drizzle.config.ts`
- These appear to be duplicates or artifacts from project restructuring

## Summary Statistics

| Category | Files | Estimated LOC |
|----------|-------|---------------|
| Demo/Test Files | 7 | ~1,055 |
| Unused Vite Server | 1 | ~83 |
| Unused Type Guards | 7 functions | ~70 |
| Unused UI Components | 25 | ~2,650 |
| Unused Utils | 2 | ~90 |
| Duplicate Schema Files | 2 | ~90 |
| **TOTAL** | **~37 items** | **~4,038 lines** |

## Recommendations by Priority

### High Priority (Safe to Remove)

1. **Delete unused UI components** (25 files, ~2,650 LOC)
   - Can be regenerated with ShadCN if needed
   - Reduces bundle size and maintenance

2. **Delete `vite.ts`** (83 LOC)
   - Not used in current architecture
   - Clear dead code

3. **Delete unused utility files** (2 files, ~90 LOC)
   - `gcp-components.ts` - No GCP support currently
   - `mock-log-generator.ts` - Not used

4. **Delete root-level database files** (2 files, ~90 LOC)
   - Duplicates of server package files

### Medium Priority (Consider Reorganizing)

1. **Move demo files to `/examples` directory** (7 files, ~1,055 LOC)
   - Keep for development reference
   - Separate from production code
   - Update package.json script paths

### Low Priority (Keep for Now)

1. **Unused type guards** (~70 LOC)
   - May be used in future
   - Small code footprint
   - Good to have for type safety

## Conclusion

The Perceptacle codebase contains approximately **4,038 lines** of dead or unused code, primarily consisting of:
- Unused ShadCN UI component library files (~65% of dead code)
- Demo and test utility files (~26%)
- Duplicate configuration files and unused utilities (~9%)

Removing the high-priority items would:
- Reduce codebase by ~2,913 lines
- Improve bundle size
- Reduce maintenance overhead
- Clarify project structure

The demo files should be preserved in an `/examples` directory for development reference.
