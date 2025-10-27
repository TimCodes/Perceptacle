import { GitHubService } from '../services/github';

// Mock the Octokit library
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      pulls: {
        list: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              number: 100,
              state: 'open',
              title: 'Test PR',
              body: 'Test PR body',
              user: {
                login: 'testuser',
                avatar_url: 'https://avatar.url',
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              closed_at: null,
              merged_at: null,
              head: {
                ref: 'feature-branch',
                sha: 'abc123',
              },
              base: {
                ref: 'main',
                sha: 'def456',
              },
              html_url: 'https://github.com/test/repo/pull/100',
              draft: false,
              mergeable: true,
              mergeable_state: 'clean',
              merged: false,
              comments: 5,
              review_comments: 3,
              commits: 10,
              additions: 100,
              deletions: 50,
              changed_files: 5,
            },
          ],
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            number: 100,
            state: 'open',
            title: 'Test PR',
            body: 'Test PR body',
            user: {
              login: 'testuser',
              avatar_url: 'https://avatar.url',
            },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            closed_at: null,
            merged_at: null,
            head: {
              ref: 'feature-branch',
              sha: 'abc123',
            },
            base: {
              ref: 'main',
              sha: 'def456',
            },
            html_url: 'https://github.com/test/repo/pull/100',
            draft: false,
            mergeable: true,
            mergeable_state: 'clean',
            merged: false,
            comments: 5,
            review_comments: 3,
            commits: 10,
            additions: 100,
            deletions: 50,
            changed_files: 5,
          },
        }),
      },
      actions: {
        listWorkflowRuns: jest.fn().mockResolvedValue({
          data: {
            total_count: 1,
            workflow_runs: [
              {
                id: 1,
                name: 'CI',
                head_branch: 'main',
                head_sha: 'abc123',
                status: 'completed',
                conclusion: 'success',
                workflow_id: 123,
                url: 'https://api.github.com/repos/test/repo/actions/runs/1',
                html_url: 'https://github.com/test/repo/actions/runs/1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:05:00Z',
                run_started_at: '2024-01-01T00:00:00Z',
                event: 'push',
                run_number: 1,
                run_attempt: 1,
              },
            ],
          },
        }),
        listWorkflowRunsForRepo: jest.fn().mockResolvedValue({
          data: {
            total_count: 1,
            workflow_runs: [
              {
                id: 1,
                name: 'CI',
                head_branch: 'main',
                head_sha: 'abc123',
                status: 'completed',
                conclusion: 'success',
                workflow_id: 123,
                url: 'https://api.github.com/repos/test/repo/actions/runs/1',
                html_url: 'https://github.com/test/repo/actions/runs/1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:05:00Z',
                run_started_at: '2024-01-01T00:00:00Z',
                event: 'push',
                run_number: 1,
                run_attempt: 1,
              },
            ],
          },
        }),
        getWorkflowRun: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'CI',
            head_branch: 'main',
            head_sha: 'abc123',
            status: 'completed',
            conclusion: 'success',
            workflow_id: 123,
            url: 'https://api.github.com/repos/test/repo/actions/runs/1',
            html_url: 'https://github.com/test/repo/actions/runs/1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:05:00Z',
            run_started_at: '2024-01-01T00:00:00Z',
            event: 'push',
            run_number: 1,
            run_attempt: 1,
          },
        }),
      },
      repos: {
        listBranches: jest.fn().mockResolvedValue({
          data: [
            {
              name: 'main',
              commit: {
                sha: 'abc123',
                url: 'https://api.github.com/repos/test/repo/commits/abc123',
              },
              protected: true,
            },
          ],
        }),
        getBranch: jest.fn().mockResolvedValue({
          data: {
            name: 'main',
            commit: {
              sha: 'abc123',
              url: 'https://api.github.com/repos/test/repo/commits/abc123',
            },
            protected: true,
            protection: {
              enabled: true,
            },
          },
        }),
      },
      issues: {
        listForRepo: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              number: 1,
              state: 'open',
              title: 'Test Issue',
              body: 'Test issue body',
              user: {
                login: 'testuser',
                avatar_url: 'https://avatar.url',
              },
              labels: [
                {
                  id: 1,
                  name: 'bug',
                  color: 'ff0000',
                  description: 'Bug report',
                },
              ],
              assignees: [
                {
                  login: 'assignee1',
                  avatar_url: 'https://assignee.url',
                },
              ],
              milestone: {
                id: 1,
                number: 1,
                title: 'v1.0',
              },
              comments: 3,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              closed_at: null,
              html_url: 'https://github.com/test/repo/issues/1',
            },
          ],
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            number: 1,
            state: 'open',
            title: 'Test Issue',
            body: 'Test issue body',
            user: {
              login: 'testuser',
              avatar_url: 'https://avatar.url',
            },
            labels: [
              {
                id: 1,
                name: 'bug',
                color: 'ff0000',
                description: 'Bug report',
              },
            ],
            assignees: [
              {
                login: 'assignee1',
                avatar_url: 'https://assignee.url',
              },
            ],
            milestone: {
              id: 1,
              number: 1,
              title: 'v1.0',
            },
            comments: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            closed_at: null,
            html_url: 'https://github.com/test/repo/issues/1',
          },
        }),
        create: jest.fn().mockResolvedValue({
          data: {
            id: 2,
            number: 2,
            state: 'open',
            title: 'New Issue',
            body: 'New issue body',
            user: {
              login: 'testuser',
              avatar_url: 'https://avatar.url',
            },
            labels: [],
            assignees: [],
            milestone: null,
            comments: 0,
            created_at: '2024-01-03T00:00:00Z',
            updated_at: '2024-01-03T00:00:00Z',
            closed_at: null,
            html_url: 'https://github.com/test/repo/issues/2',
          },
        }),
      },
    })),
  };
});

describe('GitHubService', () => {
  let githubService: GitHubService;
  const mockToken = 'test-github-token';

  beforeEach(() => {
    githubService = new GitHubService({ token: mockToken });
  });

  describe('Service Initialization', () => {
    it('should create service instance with token', () => {
      expect(githubService).toBeInstanceOf(GitHubService);
    });
  });

  describe('Pull Request Operations', () => {
    it('should fetch pull requests for a repository', async () => {
      const pullRequests = await githubService.getPullRequests({
        owner: 'test',
        repo: 'repo',
      });

      expect(pullRequests).toHaveLength(1);
      expect(pullRequests[0].number).toBe(100);
      expect(pullRequests[0].title).toBe('Test PR');
      expect(pullRequests[0].state).toBe('open');
    });

    it('should fetch a specific pull request', async () => {
      const pullRequest = await githubService.getPullRequest('test', 'repo', 100);

      expect(pullRequest.number).toBe(100);
      expect(pullRequest.title).toBe('Test PR');
      expect(pullRequest.user.login).toBe('testuser');
    });

    it('should handle pull request parameters', async () => {
      const pullRequests = await githubService.getPullRequests({
        owner: 'test',
        repo: 'repo',
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: 50,
        page: 1,
      });

      expect(pullRequests).toHaveLength(1);
    });
  });

  describe('Workflow Run Operations', () => {
    it('should fetch workflow runs for a repository', async () => {
      const result = await githubService.getWorkflowRuns({
        owner: 'test',
        repo: 'repo',
      });

      expect(result.total_count).toBe(1);
      expect(result.workflow_runs).toHaveLength(1);
      expect(result.workflow_runs[0].name).toBe('CI');
      expect(result.workflow_runs[0].status).toBe('completed');
    });

    it('should fetch workflow runs with workflow_id', async () => {
      const result = await githubService.getWorkflowRuns({
        owner: 'test',
        repo: 'repo',
        workflow_id: 123,
      });

      expect(result.workflow_runs).toHaveLength(1);
      expect(result.workflow_runs[0].workflow_id).toBe(123);
    });

    it('should fetch a specific workflow run', async () => {
      const workflowRun = await githubService.getWorkflowRun('test', 'repo', 1);

      expect(workflowRun.id).toBe(1);
      expect(workflowRun.name).toBe('CI');
      expect(workflowRun.conclusion).toBe('success');
    });
  });

  describe('Branch Operations', () => {
    it('should fetch branches for a repository', async () => {
      const branches = await githubService.getBranches({
        owner: 'test',
        repo: 'repo',
      });

      expect(branches).toHaveLength(1);
      expect(branches[0].name).toBe('main');
      expect(branches[0].protected).toBe(true);
    });

    it('should fetch a specific branch', async () => {
      const branch = await githubService.getBranch('test', 'repo', 'main');

      expect(branch.name).toBe('main');
      expect(branch.protected).toBe(true);
      expect(branch.commit.sha).toBe('abc123');
    });
  });

  describe('Issue Operations', () => {
    it('should fetch issues for a repository', async () => {
      const issues = await githubService.getIssues({
        owner: 'test',
        repo: 'repo',
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].number).toBe(1);
      expect(issues[0].title).toBe('Test Issue');
      expect(issues[0].state).toBe('open');
    });

    it('should fetch a specific issue', async () => {
      const issue = await githubService.getIssue('test', 'repo', 1);

      expect(issue.number).toBe(1);
      expect(issue.title).toBe('Test Issue');
      expect(issue.user.login).toBe('testuser');
    });

    it('should create a new issue', async () => {
      const newIssue = await githubService.createIssue({
        owner: 'test',
        repo: 'repo',
        title: 'New Issue',
        body: 'New issue body',
      });

      expect(newIssue.number).toBe(2);
      expect(newIssue.title).toBe('New Issue');
      expect(newIssue.state).toBe('open');
    });

    it('should create issue with optional parameters', async () => {
      const newIssue = await githubService.createIssue({
        owner: 'test',
        repo: 'repo',
        title: 'New Issue',
        body: 'New issue body',
        assignees: ['user1', 'user2'],
        labels: ['bug', 'enhancement'],
        milestone: 1,
      });

      expect(newIssue.title).toBe('New Issue');
    });
  });

  describe('Data Type Validation', () => {
    it('should validate PullRequest structure', async () => {
      const pullRequest = await githubService.getPullRequest('test', 'repo', 100);

      expect(pullRequest).toHaveProperty('id');
      expect(pullRequest).toHaveProperty('number');
      expect(pullRequest).toHaveProperty('state');
      expect(pullRequest).toHaveProperty('title');
      expect(pullRequest).toHaveProperty('user');
      expect(pullRequest).toHaveProperty('head');
      expect(pullRequest).toHaveProperty('base');
      expect(pullRequest.user).toHaveProperty('login');
      expect(pullRequest.user).toHaveProperty('avatar_url');
    });

    it('should validate WorkflowRun structure', async () => {
      const workflowRun = await githubService.getWorkflowRun('test', 'repo', 1);

      expect(workflowRun).toHaveProperty('id');
      expect(workflowRun).toHaveProperty('name');
      expect(workflowRun).toHaveProperty('status');
      expect(workflowRun).toHaveProperty('conclusion');
      expect(workflowRun).toHaveProperty('workflow_id');
      expect(workflowRun).toHaveProperty('html_url');
    });

    it('should validate Branch structure', async () => {
      const branch = await githubService.getBranch('test', 'repo', 'main');

      expect(branch).toHaveProperty('name');
      expect(branch).toHaveProperty('commit');
      expect(branch).toHaveProperty('protected');
      expect(branch.commit).toHaveProperty('sha');
      expect(branch.commit).toHaveProperty('url');
    });

    it('should validate Issue structure', async () => {
      const issue = await githubService.getIssue('test', 'repo', 1);

      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('number');
      expect(issue).toHaveProperty('state');
      expect(issue).toHaveProperty('title');
      expect(issue).toHaveProperty('user');
      expect(issue).toHaveProperty('labels');
      expect(issue).toHaveProperty('assignees');
      expect(issue).toHaveProperty('comments');
    });
  });
});
