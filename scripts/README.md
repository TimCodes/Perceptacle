# Dead Code Detection Script

This script automatically detects potentially unused or dead code in the Perceptacle repository.

## Usage

Run the script from the project root:

```bash
./scripts/detect-dead-code.sh
```

For detailed information about each finding:

```bash
./scripts/detect-dead-code.sh --verbose
```

## What It Checks

The script analyzes the following categories:

1. **Demo Files** - Standalone demo files not imported or referenced in package.json scripts
2. **UI Components** - ShadCN UI components that are not imported anywhere
3. **Utility Files** - Helper files that are not imported in the codebase
4. **Duplicate Config** - Root-level configuration files duplicated in package subdirectories
5. **Type Guards** - Type guard functions that are defined but never used

## Exit Codes

- `0` - Script completed successfully (informational only, doesn't fail)

## Output

The script will output:
- List of detected dead code items
- Total count of potentially dead code items
- Reference to `DEAD_CODE_ANALYSIS.md` for detailed recommendations

## Example Output

```
==================================================
  Dead Code Detection - Perceptacle
==================================================

1. Checking for unused demo files in server package...
---------------------------------------------------
[DEAD CODE] Demo File: packages/server/github-demo.ts
[DEAD CODE] Demo File: packages/server/kubernetes-demo.ts

2. Checking for unused UI components in client package...
--------------------------------------------------------
[DEAD CODE] Unused UI Component: packages/client/src/components/ui/accordion.tsx
[DEAD CODE] Unused UI Component: packages/client/src/components/ui/alert-dialog.tsx

...

==================================================
  Dead Code Detection Complete
==================================================

⚠ Found 40 potentially dead code items

Review DEAD_CODE_ANALYSIS.md for detailed information and recommendations.
```

## CI/CD Integration

You can add this to your CI pipeline to track dead code over time:

```yaml
# .github/workflows/code-quality.yml
- name: Check for dead code
  run: ./scripts/detect-dead-code.sh
```

## Notes

- The script is informational and won't fail CI builds
- Not all detected items are necessarily dead code - manual review is recommended
- See `DEAD_CODE_ANALYSIS.md` for detailed analysis and cleanup recommendations
