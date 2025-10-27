# GitHub Service Documentation

This document describes the GitHub API integration service for Perceptacle.

## Overview

The GitHub service provides integration with GitHub's REST API, allowing you to interact with repositories, pull requests, issues, branches, and GitHub Actions workflows.

## Features

1. **Pull Requests**: Get pull requests and their details
2. **GitHub Actions**: Get workflow runs and build information
3. **Branches**: Get repository branches and their protection status
4. **Issues**: Get and create issues
5. **Workflows**: List available workflows in a repository

## Configuration

### Environment Variables

Set the following environment variable in your `.env` file:

```bash
# GitHub Personal Access Token
GITHUB_TOKEN=your_github_personal_access_token

# Optional: Use mock services for development/testing
USE_MOCK_SERVICES=true
```

### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows
   - `read:org` - Read org and team membership (if accessing org repos)
4. Generate and copy the token
5. Add it to your `.env` file

## API Endpoints

All endpoints are prefixed with `/api/github`

### Pull Requests

#### Get Pull Requests
```http
GET /api/github/repos/:owner/:repo/pulls
```

Query Parameters:
- `state` (optional): "open", "closed", or "all" (default: "open")
- `sort` (optional): "created", "updated", "popularity", or "long-running"
- `direction` (optional): "asc" or "desc"
- `per_page` (optional): Results per page (default: 30)
- `page` (optional): Page number (default: 1)

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/pulls?state=all
```

#### Get Single Pull Request
```http
GET /api/github/repos/:owner/:repo/pulls/:pull_number
```

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/pulls/1
```

### GitHub Actions / Workflows

#### Get Workflow Runs
```http
GET /api/github/repos/:owner/:repo/actions/runs
```

Query Parameters:
- `workflow_id` (optional): Filter by specific workflow ID or filename
- `status` (optional): "queued", "in_progress", or "completed"
- `per_page` (optional): Results per page (default: 30)
- `page` (optional): Page number (default: 1)

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/actions/runs?status=completed
```

#### Get Single Workflow Run
```http
GET /api/github/repos/:owner/:repo/actions/runs/:run_id
```

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/actions/runs/12345
```

#### Get Workflows
```http
GET /api/github/repos/:owner/:repo/actions/workflows
```

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/actions/workflows
```

### Branches

#### Get Branches
```http
GET /api/github/repos/:owner/:repo/branches
```

Query Parameters:
- `protected` (optional): "true" or "false" to filter by protection status
- `per_page` (optional): Results per page (default: 30)
- `page` (optional): Page number (default: 1)

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/branches
```

#### Get Single Branch
```http
GET /api/github/repos/:owner/:repo/branches/:branch
```

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/branches/main
```

### Issues

#### Get Issues
```http
GET /api/github/repos/:owner/:repo/issues
```

Query Parameters:
- `state` (optional): "open", "closed", or "all" (default: "open")
- `labels` (optional): Comma-separated list of label names
- `sort` (optional): "created", "updated", or "comments"
- `direction` (optional): "asc" or "desc"
- `since` (optional): ISO 8601 timestamp
- `per_page` (optional): Results per page (default: 30)
- `page` (optional): Page number (default: 1)

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/issues?state=open&labels=bug
```

#### Get Single Issue
```http
GET /api/github/repos/:owner/:repo/issues/:issue_number
```

Example:
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/issues/1
```

#### Create Issue
```http
POST /api/github/repos/:owner/:repo/issues
Content-Type: application/json

{
  "title": "Issue title",
  "body": "Issue description",
  "assignees": ["username1", "username2"],
  "milestone": 1,
  "labels": ["bug", "high-priority"]
}
```

Example:
```bash
curl -X POST http://localhost:5000/api/github/repos/octocat/Hello-World/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Found a bug",
    "body": "Description of the bug",
    "labels": ["bug"]
  }'
```

## Response Examples

### Pull Request Response
```json
{
  "id": 1001,
  "number": 10,
  "state": "open",
  "title": "Add GitHub API integration",
  "body": "This PR adds GitHub API integration...",
  "user": {
    "login": "developer1",
    "avatar_url": "https://avatars.githubusercontent.com/u/10?v=4"
  },
  "created_at": "2025-10-26T12:00:00Z",
  "updated_at": "2025-10-27T08:00:00Z",
  "head": {
    "ref": "feature/github-api",
    "sha": "abc123def456"
  },
  "base": {
    "ref": "main",
    "sha": "def456abc123"
  },
  "html_url": "https://github.com/owner/repo/pull/10",
  "draft": false,
  "mergeable": true,
  "merged": false,
  "comments": 3,
  "commits": 8,
  "additions": 450,
  "deletions": 120,
  "changed_files": 12
}
```

### Workflow Run Response
```json
{
  "id": 2001,
  "name": "CI",
  "head_branch": "feature/github-api",
  "head_sha": "abc123def456",
  "status": "completed",
  "conclusion": "success",
  "workflow_id": 5001,
  "url": "https://api.github.com/repos/owner/repo/actions/runs/2001",
  "html_url": "https://github.com/owner/repo/actions/runs/2001",
  "created_at": "2025-10-27T06:00:00Z",
  "updated_at": "2025-10-27T06:15:00Z",
  "run_number": 125,
  "event": "push"
}
```

### Branch Response
```json
{
  "name": "main",
  "commit": {
    "sha": "def456abc123",
    "url": "https://api.github.com/repos/owner/repo/commits/def456abc123"
  },
  "protected": true,
  "protection": {
    "enabled": true,
    "required_status_checks": {
      "enforcement_level": "non_admins",
      "contexts": ["ci/tests", "ci/build"]
    }
  }
}
```

### Issue Response
```json
{
  "id": 1,
  "number": 1,
  "state": "open",
  "title": "Bug: Application crashes on startup",
  "body": "The application crashes when starting up...",
  "user": {
    "login": "user1",
    "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4"
  },
  "labels": [
    {
      "id": 1,
      "name": "bug",
      "color": "d73a4a",
      "description": "Something isn't working"
    }
  ],
  "assignees": [
    {
      "login": "developer1",
      "avatar_url": "https://avatars.githubusercontent.com/u/2?v=4"
    }
  ],
  "milestone": {
    "id": 1,
    "number": 1,
    "title": "v1.0.0"
  },
  "comments": 5,
  "created_at": "2025-10-25T12:00:00Z",
  "html_url": "https://github.com/owner/repo/issues/1"
}
```

## Mock Service

The GitHub service includes a mock implementation for development and testing. To enable mock mode:

```bash
USE_MOCK_SERVICES=true
```

The mock service provides realistic sample data without making actual API calls to GitHub.

### Mock Data Includes:
- 2 sample pull requests (1 open, 1 merged)
- 3 workflow runs with different statuses
- 4 branches (2 protected, 2 feature branches)
- 2 sample issues (1 open, 1 closed)
- 3 workflows

## Usage in Code

### Creating a Service Instance

```typescript
import { GitHubService } from './services/github';

const githubService = new GitHubService({
  token: process.env.GITHUB_TOKEN!
});
```

### Using the Service Factory

```typescript
import { serviceFactory } from './services/service-factory';

// Get service instance (real or mock based on configuration)
const githubService = serviceFactory.createGitHubService();

// Get pull requests
const pullRequests = await githubService.getPullRequests({
  owner: 'octocat',
  repo: 'Hello-World',
  state: 'open'
});

// Create an issue
const newIssue = await githubService.createIssue({
  owner: 'octocat',
  repo: 'Hello-World',
  title: 'Bug found',
  body: 'Description of the bug',
  labels: ['bug']
});
```

## Error Handling

The service handles errors gracefully and returns appropriate HTTP status codes:

- `400 Bad Request` - Missing required parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Service errors

Example error response:
```json
{
  "error": "Failed to retrieve pull requests",
  "details": "Not Found"
}
```

## Rate Limiting

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

The service uses authenticated requests via the personal access token.

## Security Considerations

1. **Never commit tokens** to version control
2. Store tokens in environment variables
3. Use tokens with minimal required permissions
4. Rotate tokens regularly
5. Monitor token usage in GitHub settings

## Testing

Run the mock service for testing:

```bash
USE_MOCK_SERVICES=true npm run dev
```

Test endpoints with curl or Postman without requiring a real GitHub token.

## Integration Example

Here's a complete example of integrating the GitHub service:

```typescript
import express from 'express';
import { serviceFactory } from './services/service-factory';

const app = express();
const githubService = serviceFactory.createGitHubService();

app.get('/repos/:owner/:repo/status', async (req, res) => {
  const { owner, repo } = req.params;
  
  try {
    // Get open pull requests
    const pullRequests = await githubService.getPullRequests({
      owner,
      repo,
      state: 'open'
    });
    
    // Get recent workflow runs
    const workflowRuns = await githubService.getWorkflowRuns({
      owner,
      repo,
      status: 'completed'
    });
    
    // Get open issues
    const issues = await githubService.getIssues({
      owner,
      repo,
      state: 'open'
    });
    
    res.json({
      pull_requests_count: pullRequests.length,
      recent_builds: workflowRuns.workflow_runs.slice(0, 5),
      open_issues_count: issues.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get repository status' });
  }
});
```

## Future Enhancements

Potential features to add:
- Repository management (create, update, delete)
- Commit history
- Release management
- Code review comments
- Team and organization management
- Webhook integration
- GraphQL API support for more efficient queries
