# aichat.ts

**Path**: `packages/server/services/aichat.ts`

## Overview

Service layer for external system integration

### Purpose
This file is part of the server application.

### Dependencies
- import { ChatOpenAI } from "@langchain/openai";
- import { ChatAnthropic } from "@langchain/anthropic";
- import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
- import type { BaseMessage } from "@langchain/core/messages";
- import { HumanMessage, SystemMessage } from "@langchain/core/messages";

### Exports
- `export interface AIChatCredentials {`
- `export interface ChatMessage {`
- `export interface ChatRequest {`
- `export interface ChatResponse {`
- `export class AIChatService {`

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 273  
**Last Updated**: January 2026
