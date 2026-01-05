# Dead Code Analysis Summary

## Overview

This PR provides a comprehensive analysis of dead and unused code in the Perceptacle repository. The analysis identified **approximately 4,038 lines** of potentially unused code across 40 items.

## What's Included

### 📄 Documentation

1. **DEAD_CODE_ANALYSIS.md** - Comprehensive analysis document with:
   - Detailed breakdown of all dead code findings
   - Evidence and verification for each item
   - Line count estimates
   - Prioritized recommendations for cleanup
   - Category-by-category analysis

### 🤖 Automation

2. **scripts/detect-dead-code.sh** - Automated detection script that:
   - Scans the codebase for unused files and functions
   - Provides both summary and verbose output modes
   - Can be integrated into CI/CD pipelines
   - Exit code 0 (informational, won't fail builds)

3. **scripts/README.md** - Documentation for using the detection script

## Key Findings

### High-Impact Items (Safe to Remove)

| Category | Count | Lines | Impact |
|----------|-------|-------|--------|
| Unused UI Components | 25 files | ~2,650 | Reduces bundle size, improves maintainability |
| Unused Vite Server | 1 file | ~83 | Removes obsolete code from architecture change |
| Unused Utilities | 2 files | ~90 | Cleanup |
| Duplicate Config Files | 2 files | ~90 | Prevents confusion |

**Total High-Impact:** ~2,913 lines that can be safely removed

### Development Files (Consider Relocating)

| Category | Count | Lines | Recommendation |
|----------|-------|-------|----------------|
| Demo Files | 7 files | ~1,055 | Move to `/examples` directory |

### Low-Impact Items (Optional)

| Category | Count | Lines | Note |
|----------|-------|-------|------|
| Unused Type Guards | 7 functions | ~70 | May be used in future, small footprint |

## Top Recommendations

### 1. Remove Unused UI Components (Highest Priority)

**Impact:** ~2,650 lines, reduced bundle size

The following ShadCN UI components are installed but never imported:
- accordion, alert-dialog, alert, aspect-ratio, avatar
- breadcrumb, calendar, chart, collapsible, context-menu
- drawer, form, hover-card, input-otp, menubar
- navigation-menu, pagination, radio-group, resizable
- sidebar, slider, table, toaster, toggle-group, toggle

**Rationale:**
- These can be easily regenerated with `npx shadcn-ui@latest add [component]` if needed
- Currently bloating the codebase unnecessarily
- Clear win for code cleanup

### 2. Delete vite.ts (High Priority)

**Impact:** ~83 lines, removes obsolete code

The `packages/server/vite.ts` file is not used anywhere. The project uses a separate client/server architecture where:
- Client runs on its own Vite dev server (port 5173)
- Server is a standalone Express API (port 3000)

This file appears to be leftover from a previous monolithic setup.

### 3. Remove Unused Utility Files (High Priority)

**Impact:** ~90 lines

- `packages/client/src/utils/gcp-components.ts` - GCP support not currently implemented
- `packages/client/src/utils/mock-log-generator.ts` - Not used in production

### 4. Clean Up Duplicate Configuration (Medium Priority)

**Impact:** ~90 lines, reduces confusion

Root-level database files are duplicates:
- `/db/schema.ts` - Server has its own at `packages/server/db/schema.ts`
- `/drizzle.config.ts` - Server has its own at `packages/server/drizzle.config.ts`

### 5. Reorganize Demo Files (Medium Priority)

**Impact:** Better project organization

Move demo files to `/examples` directory:
- demo.ts, github-demo.ts, kubernetes-demo.ts
- test-azure.ts, verify-rag.ts

Keep for reference but separate from production code.

## How to Use

### View the Analysis

```bash
# Read the comprehensive analysis
cat DEAD_CODE_ANALYSIS.md
```

### Run Automated Detection

```bash
# Quick scan
./scripts/detect-dead-code.sh

# Detailed output
./scripts/detect-dead-code.sh --verbose
```

### Example Cleanup

```bash
# Remove a specific unused component
rm packages/client/src/components/ui/accordion.tsx

# Remove all unused UI components at once
cd packages/client/src/components/ui
rm accordion.tsx alert-dialog.tsx alert.tsx aspect-ratio.tsx avatar.tsx \
   breadcrumb.tsx calendar.tsx chart.tsx collapsible.tsx context-menu.tsx \
   drawer.tsx form.tsx hover-card.tsx input-otp.tsx menubar.tsx \
   navigation-menu.tsx pagination.tsx radio-group.tsx resizable.tsx \
   sidebar.tsx slider.tsx table.tsx toaster.tsx toggle-group.tsx toggle.tsx
```

## Next Steps

This analysis is **informational only**. No code has been modified or deleted in this PR.

Recommended workflow:
1. Review the `DEAD_CODE_ANALYSIS.md` document
2. Decide which items to remove based on your project needs
3. Create separate PRs for cleanup:
   - PR 1: Remove unused UI components
   - PR 2: Remove vite.ts and unused utilities
   - PR 3: Reorganize demo files
   - PR 4: Remove duplicate config files

## Notes

- The automated script can be integrated into CI/CD to track dead code over time
- All findings have been verified with multiple search patterns
- Line counts are estimates based on file sizes
- Not all detected items may be truly "dead" - manual review recommended

## Questions?

Refer to:
- `DEAD_CODE_ANALYSIS.md` for detailed analysis
- `scripts/README.md` for script documentation
