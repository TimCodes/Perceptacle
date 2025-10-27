# GitHub Service Integration Examples

## Basic Usage in Your Application

### 1. Using the Service Factory (Recommended)

```typescript
import { serviceFactory } from './services/service-factory';

// Get GitHub service (automatically uses real or mock based on env)
const githubService = serviceFactory.createGitHubService();

// Fetch pull requests
const prs = await githubService.getPullRequests({
  owner: 'myorg',
  repo: 'myrepo',
  state: 'open'
});
```

### 2. Direct Service Instantiation

```typescript
import { GitHubService } from './services/github';

const githubService = new GitHubService({
  token: process.env.GITHUB_TOKEN!
});

const workflows = await githubService.getWorkflows('owner', 'repo');
```

### 3. Using Mock Service for Testing

```typescript
import { MockGitHubService } from './services/github.mock';

const mockService = new MockGitHubService({
  token: 'mock-token'
});

// All methods work the same, but return mock data
const issues = await mockService.getIssues({
  owner: 'test',
  repo: 'test',
  state: 'open'
});
```

## Frontend Integration Examples

### React Component - Pull Requests Dashboard

```typescript
import React, { useEffect, useState } from 'react';

interface PullRequest {
  number: number;
  title: string;
  state: string;
  user: { login: string };
  created_at: string;
}

export function PullRequestsDashboard() {
  const [prs, setPRs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPRs() {
      try {
        const response = await fetch(
          '/api/github/repos/owner/repo/pulls?state=all'
        );
        const data = await response.json();
        setPRs(data);
      } catch (error) {
        console.error('Failed to fetch PRs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPRs();
  }, []);

  if (loading) return <div>Loading pull requests...</div>;

  return (
    <div>
      <h2>Pull Requests</h2>
      {prs.map(pr => (
        <div key={pr.number}>
          <h3>#{pr.number}: {pr.title}</h3>
          <p>State: {pr.state}</p>
          <p>Author: {pr.user.login}</p>
          <p>Created: {new Date(pr.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### React Component - Workflow Runs Status

```typescript
import React, { useEffect, useState } from 'react';

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
}

export function WorkflowStatus({ owner, repo }: { owner: string; repo: string }) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);

  useEffect(() => {
    async function fetchRuns() {
      const response = await fetch(
        `/api/github/repos/${owner}/${repo}/actions/runs?status=completed`
      );
      const data = await response.json();
      setRuns(data.workflow_runs.slice(0, 5));
    }
    fetchRuns();
  }, [owner, repo]);

  const getStatusIcon = (conclusion: string | null) => {
    if (conclusion === 'success') return '✅';
    if (conclusion === 'failure') return '❌';
    return '⏳';
  };

  return (
    <div>
      <h2>Recent Builds</h2>
      {runs.map(run => (
        <div key={run.id}>
          {getStatusIcon(run.conclusion)} {run.name}
          <a href={run.html_url} target="_blank" rel="noopener noreferrer">
            View Run
          </a>
        </div>
      ))}
    </div>
  );
}
```

### React Component - Create Issue Form

```typescript
import React, { useState } from 'react';

export function CreateIssueForm({ owner, repo }: { owner: string; repo: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/github/repos/${owner}/${repo}/issues`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            body,
            labels: labels.split(',').map(l => l.trim()).filter(Boolean)
          })
        }
      );

      if (response.ok) {
        const issue = await response.json();
        alert(`Issue #${issue.number} created!`);
        setTitle('');
        setBody('');
        setLabels('');
      }
    } catch (error) {
      console.error('Failed to create issue:', error);
      alert('Failed to create issue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Issue</h2>
      <div>
        <label>Title:</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </div>
      <div>
        <label>Labels (comma-separated):</label>
        <input
          value={labels}
          onChange={e => setLabels(e.target.value)}
          placeholder="bug, enhancement"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Issue'}
      </button>
    </form>
  );
}
```

## Backend Route Examples

### Custom Aggregate Endpoint

```typescript
// In routes/github.ts or a custom route file
router.get("/repos/:owner/:repo/summary", ensureGitHubService, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Fetch multiple resources in parallel
    const [prs, issues, workflows, branches] = await Promise.all([
      githubService!.getPullRequests({ owner, repo, state: 'open' }),
      githubService!.getIssues({ owner, repo, state: 'open' }),
      githubService!.getWorkflows(owner, repo),
      githubService!.getBranches({ owner, repo })
    ]);

    // Return aggregated data
    res.json({
      repository: `${owner}/${repo}`,
      open_prs: prs.length,
      open_issues: issues.length,
      total_workflows: workflows.length,
      total_branches: branches.length,
      details: {
        pull_requests: prs,
        issues: issues,
        workflows: workflows,
        branches: branches
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

### Repository Health Check

```typescript
router.get("/repos/:owner/:repo/health", ensureGitHubService, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Get recent workflow runs
    const { workflow_runs } = await githubService!.getWorkflowRuns({
      owner,
      repo,
      status: 'completed'
    });

    // Calculate success rate
    const recentRuns = workflow_runs.slice(0, 10);
    const successCount = recentRuns.filter(r => r.conclusion === 'success').length;
    const successRate = (successCount / recentRuns.length) * 100;

    // Get open issues and PRs
    const [issues, prs] = await Promise.all([
      githubService!.getIssues({ owner, repo, state: 'open' }),
      githubService!.getPullRequests({ owner, repo, state: 'open' })
    ]);

    res.json({
      health_score: successRate,
      recent_builds: {
        total: recentRuns.length,
        successful: successCount,
        failed: recentRuns.filter(r => r.conclusion === 'failure').length
      },
      open_items: {
        issues: issues.length,
        pull_requests: prs.length
      },
      status: successRate > 80 ? 'healthy' : successRate > 50 ? 'warning' : 'critical'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

## Advanced Usage Examples

### Polling for Workflow Updates

```typescript
import { GitHubService } from './services/github';

class WorkflowMonitor {
  private githubService: GitHubService;
  private interval: NodeJS.Timeout | null = null;

  constructor(githubService: GitHubService) {
    this.githubService = githubService;
  }

  startMonitoring(owner: string, repo: string, onUpdate: (runs: any[]) => void) {
    this.interval = setInterval(async () => {
      try {
        const { workflow_runs } = await this.githubService.getWorkflowRuns({
          owner,
          repo,
          status: 'in_progress'
        });
        onUpdate(workflow_runs);
      } catch (error) {
        console.error('Error monitoring workflows:', error);
      }
    }, 30000); // Poll every 30 seconds
  }

  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
```

### Batch Issue Creation

```typescript
async function createBulkIssues(
  githubService: GitHubService,
  owner: string,
  repo: string,
  issues: Array<{ title: string; body?: string; labels?: string[] }>
) {
  const results = [];
  
  for (const issue of issues) {
    try {
      const created = await githubService.createIssue({
        owner,
        repo,
        ...issue
      });
      results.push({ success: true, issue: created });
      
      // Rate limit protection - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ success: false, error: error.message, issue });
    }
  }
  
  return results;
}
```

### Filtering and Searching

```typescript
async function findStaleIssues(
  githubService: GitHubService,
  owner: string,
  repo: string,
  daysStale: number = 30
) {
  const issues = await githubService.getIssues({
    owner,
    repo,
    state: 'open',
    sort: 'updated',
    direction: 'asc'
  });

  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - daysStale);

  return issues.filter(issue => {
    const lastUpdate = new Date(issue.updated_at);
    return lastUpdate < staleDate;
  });
}
```

## Testing Examples

### Unit Test with Mock Service

```typescript
import { MockGitHubService } from './services/github.mock';

describe('GitHub Service', () => {
  let service: MockGitHubService;

  beforeEach(() => {
    service = new MockGitHubService({ token: 'test-token' });
  });

  test('should fetch pull requests', async () => {
    const prs = await service.getPullRequests({
      owner: 'test',
      repo: 'test',
      state: 'open'
    });

    expect(prs).toHaveLength(1);
    expect(prs[0].state).toBe('open');
  });

  test('should create issue', async () => {
    const issue = await service.createIssue({
      owner: 'test',
      repo: 'test',
      title: 'Test Issue',
      labels: ['test']
    });

    expect(issue.title).toBe('Test Issue');
    expect(issue.labels).toHaveLength(1);
  });
});
```

### Integration Test with Routes

```typescript
import request from 'supertest';
import app from './app';

describe('GitHub Routes', () => {
  test('GET /api/github/repos/:owner/:repo/pulls', async () => {
    const response = await request(app)
      .get('/api/github/repos/octocat/Hello-World/pulls')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/github/repos/:owner/:repo/issues', async () => {
    const response = await request(app)
      .post('/api/github/repos/octocat/Hello-World/issues')
      .send({
        title: 'Test Issue',
        body: 'Test description',
        labels: ['bug']
      })
      .expect(201);

    expect(response.body.title).toBe('Test Issue');
  });
});
```

## Error Handling Examples

```typescript
async function safeGitHubCall<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.status === 404) {
      console.warn('Resource not found, using fallback');
      return fallback;
    }
    if (error.status === 403) {
      console.error('Rate limit exceeded or forbidden');
      throw new Error('GitHub API rate limit exceeded');
    }
    throw error;
  }
}

// Usage
const issues = await safeGitHubCall(
  () => githubService.getIssues({ owner, repo, state: 'open' }),
  [] // fallback to empty array
);
```

## WebSocket Real-time Updates

```typescript
import { WebSocket } from 'ws';

function setupGitHubWebSocket(wss: WebSocket.Server, githubService: GitHubService) {
  wss.on('connection', (ws) => {
    let interval: NodeJS.Timeout;

    ws.on('message', async (message) => {
      const { action, owner, repo } = JSON.parse(message.toString());

      if (action === 'subscribe') {
        // Send updates every 30 seconds
        interval = setInterval(async () => {
          try {
            const { workflow_runs } = await githubService.getWorkflowRuns({
              owner,
              repo,
              status: 'in_progress'
            });
            ws.send(JSON.stringify({ type: 'workflow_update', data: workflow_runs }));
          } catch (error) {
            ws.send(JSON.stringify({ type: 'error', error: error.message }));
          }
        }, 30000);
      }
    });

    ws.on('close', () => {
      if (interval) clearInterval(interval);
    });
  });
}
```

## Tips and Best Practices

1. **Use the Service Factory**: Automatically handles environment switching
2. **Implement Caching**: Reduce API calls by caching responses
3. **Handle Rate Limits**: GitHub has strict rate limits, monitor usage
4. **Error Handling**: Always wrap calls in try-catch blocks
5. **Mock for Development**: Use mock service to avoid hitting rate limits
6. **Batch Requests**: Use Promise.all() for parallel requests
7. **Pagination**: Handle large result sets with pagination
8. **Security**: Never expose tokens to frontend, proxy through backend
