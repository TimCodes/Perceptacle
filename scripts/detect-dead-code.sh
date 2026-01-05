#!/bin/bash

# Dead Code Detection Script for Perceptacle
# This script analyzes the codebase to identify potentially unused code
# Usage: ./scripts/detect-dead-code.sh [--verbose]

VERBOSE=false
if [[ "$1" == "--verbose" ]]; then
  VERBOSE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=================================================="
echo "  Dead Code Detection - Perceptacle"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

dead_code_count=0

# Function to report dead code
report_dead_code() {
  local category="$1"
  local file="$2"
  local reason="$3"
  
  echo -e "${RED}[DEAD CODE]${NC} $category: $file"
  if [[ "$VERBOSE" == "true" ]]; then
    echo "  Reason: $reason"
  fi
  ((dead_code_count++))
}

# Function to check if a file is imported
is_file_imported() {
  local file_pattern="$1"
  local search_dir="$2"
  
  # Search for imports of this file
  local count=$(grep -r "$file_pattern" --include="*.ts" --include="*.tsx" "$search_dir" 2>/dev/null | grep -v "$file_pattern:" | wc -l)
  
  if [ "$count" -eq "0" ]; then
    return 1 # Not imported
  else
    return 0 # Is imported
  fi
}

cd "$PROJECT_ROOT"

echo "1. Checking for unused demo files in server package..."
echo "---------------------------------------------------"

SERVER_DIR="$PROJECT_ROOT/packages/server"
if [ -d "$SERVER_DIR" ]; then
  # Check demo files
  for demo_file in demo.ts github-demo.ts kubernetes-demo.ts test-azure.ts verify-rag.ts; do
    if [ -f "$SERVER_DIR/$demo_file" ]; then
      # Check if it's referenced in package.json scripts
      if ! grep -q "$demo_file" "$SERVER_DIR/package.json"; then
        report_dead_code "Demo File" "packages/server/$demo_file" "Not imported and not in package.json scripts"
      fi
    fi
  done
  
  # Check vite.ts
  if [ -f "$SERVER_DIR/vite.ts" ]; then
    if ! is_file_imported "vite.ts" "$SERVER_DIR"; then
      report_dead_code "Unused Server File" "packages/server/vite.ts" "Not imported anywhere in server code"
    fi
  fi
fi

echo ""
echo "2. Checking for unused UI components in client package..."
echo "--------------------------------------------------------"

CLIENT_DIR="$PROJECT_ROOT/packages/client/src"
if [ -d "$CLIENT_DIR/components/ui" ]; then
  # List of known unused components
  unused_components=(
    "accordion" "alert-dialog" "alert" "aspect-ratio" "avatar"
    "breadcrumb" "calendar" "chart" "collapsible" "context-menu"
    "drawer" "form" "hover-card" "input-otp" "menubar"
    "navigation-menu" "pagination" "radio-group" "resizable"
    "sidebar" "slider" "table" "toaster" "toggle-group" "toggle"
  )
  
  for component in "${unused_components[@]}"; do
    if [ -f "$CLIENT_DIR/components/ui/$component.tsx" ]; then
      # Check if component is imported (more precise pattern matching)
      # Matches: from "@/components/ui/COMPONENT" or from "./ui/COMPONENT" or from "../ui/COMPONENT"
      import_count=$(grep -r "from ['\"].*ui/$component['\"]" --include="*.tsx" --include="*.ts" "$CLIENT_DIR" 2>/dev/null | wc -l)
      
      if [ "$import_count" -eq "0" ]; then
        report_dead_code "Unused UI Component" "packages/client/src/components/ui/$component.tsx" "No imports found"
      fi
    fi
  done
fi

echo ""
echo "3. Checking for unused utility files..."
echo "---------------------------------------"

# Check client utilities
if [ -d "$CLIENT_DIR/utils" ]; then
  # Check gcp-components
  if [ -f "$CLIENT_DIR/utils/gcp-components.ts" ]; then
    if ! is_file_imported "gcp-components" "$CLIENT_DIR"; then
      report_dead_code "Unused Utility" "packages/client/src/utils/gcp-components.ts" "Not imported"
    fi
  fi
  
  # Check mock-log-generator
  if [ -f "$CLIENT_DIR/utils/mock-log-generator.ts" ]; then
    if ! is_file_imported "mock-log-generator" "$CLIENT_DIR"; then
      report_dead_code "Unused Utility" "packages/client/src/utils/mock-log-generator.ts" "Not imported"
    fi
  fi
fi

echo ""
echo "4. Checking for duplicate configuration files..."
echo "------------------------------------------------"

# Check for root-level database files
if [ -f "$PROJECT_ROOT/db/schema.ts" ]; then
  # Check if root schema is imported (excluding server package imports)
  root_schema_imports=$(grep -r "from.*db/schema" --include="*.ts" "$PROJECT_ROOT" 2>/dev/null | grep -v "packages/server" | grep -v "db/schema.ts:" | wc -l)
  
  if [ "$root_schema_imports" -eq "0" ]; then
    report_dead_code "Duplicate Schema" "db/schema.ts" "Root-level schema not imported (server has its own)"
  fi
fi

if [ -f "$PROJECT_ROOT/drizzle.config.ts" ]; then
  # Server has its own drizzle config
  if [ -f "$PROJECT_ROOT/packages/server/drizzle.config.ts" ]; then
    report_dead_code "Duplicate Config" "drizzle.config.ts" "Root-level config exists while server has its own"
  fi
fi

echo ""
echo "5. Checking for unused type guard functions..."
echo "----------------------------------------------"

if [ -f "$SERVER_DIR/services/service-factory.ts" ]; then
  # List of type guards to check
  type_guards=(
    "isOracleService" "isMockOracleService"
    "isMongoDBService" "isMockMongoDBService"
    "isRagService" "isMockRagService"
    "isKafkaService"
  )
  
  for guard in "${type_guards[@]}"; do
    # First check if the function is defined in service-factory.ts
    if grep -q "export function $guard" "$SERVER_DIR/services/service-factory.ts" 2>/dev/null; then
      # Check if function is used outside its definition
      # Excludes: export function NAME, function NAME(, const NAME =
      usage_count=$(grep -r "\b$guard\b" --include="*.ts" "$SERVER_DIR" 2>/dev/null | \
                    grep -v "export function $guard" | \
                    grep -v "function $guard(" | \
                    grep -v "const $guard =" | \
                    wc -l)
      
      if [ "$usage_count" -eq "0" ]; then
        report_dead_code "Unused Type Guard" "packages/server/services/service-factory.ts::$guard()" "Function defined but never called"
      fi
    fi
  done
fi

echo ""
echo "=================================================="
echo "  Dead Code Detection Complete"
echo "=================================================="
echo ""

if [ $dead_code_count -eq 0 ]; then
  echo -e "${GREEN}✓ No dead code detected!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ Found $dead_code_count potentially dead code items${NC}"
  echo ""
  echo "Review DEAD_CODE_ANALYSIS.md for detailed information and recommendations."
  echo ""
  echo "To see more details, run: $0 --verbose"
  exit 0  # Don't fail CI - this is informational
fi
