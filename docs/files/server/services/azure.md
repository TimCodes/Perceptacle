# azure.ts

**Path**: `packages/server/services/azure.ts`

## Overview

Service layer for external system integration

### Purpose
This file is part of the server application.

### Dependencies
- import { ResourceManagementClient } from "@azure/arm-resources";
- import { MonitorClient } from "@azure/arm-monitor";
- import { OperationalInsightsManagementClient } from "@azure/arm-operationalinsights";
- import { ServiceBusAdministrationClient, ServiceBusClient } from "@azure/service-bus";
- import { ServiceBusManagementClient } from "@azure/arm-servicebus";
- import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
- import { LogsQueryClient } from "@azure/monitor-query-logs";
- import { MetricsClient } from "@azure/monitor-query-metrics";

### Exports
- `export interface AzureCredentials {`
- `export interface ResourceQueryParams {`
- `export interface MetricQueryParams {`
- `export interface LogQueryParams {`
- `export interface ResourceMetric {`

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 715  
**Last Updated**: January 2026
