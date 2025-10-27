import {
  GitHubCredentials,
  PullRequestParams,
  WorkflowRunParams,
  BranchParams,
  IssueParams,
  CreateIssueParams,
  PullRequest,
  WorkflowRun,
  Branch,
  Issue,
} from "./github";

/**
 * Mock GitHub Service for testing and development
 */
export class MockGitHubService {
  private credentials: GitHubCredentials;
  private mockIssues: Issue[] = [];
  private issueIdCounter = 1000;

  constructor(credentials: GitHubCredentials) {
    this.credentials = credentials;
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some mock issues
    this.mockIssues = [
      {
        id: 1,
        number: 1,
        state: "open",
        title: "Bug: Application crashes on startup",
        body: "The application crashes when starting up on Windows 11",
        user: {
          login: "user1",
          avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
        },
        labels: [
          {
            id: 1,
            name: "bug",
            color: "d73a4a",
            description: "Something isn't working",
          },
          {
            id: 2,
            name: "high-priority",
            color: "ff0000",
            description: "High priority issue",
          },
        ],
        assignees: [
          {
            login: "developer1",
            avatar_url: "https://avatars.githubusercontent.com/u/2?v=4",
          },
        ],
        milestone: {
          id: 1,
          number: 1,
          title: "v1.0.0",
        },
        comments: 5,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        closed_at: null,
        html_url: "https://github.com/owner/repo/issues/1",
      },
      {
        id: 2,
        number: 2,
        state: "closed",
        title: "Feature: Add dark mode support",
        body: "Users have requested dark mode support",
        user: {
          login: "user2",
          avatar_url: "https://avatars.githubusercontent.com/u/3?v=4",
        },
        labels: [
          {
            id: 3,
            name: "enhancement",
            color: "a2eeef",
            description: "New feature or request",
          },
        ],
        assignees: [],
        milestone: null,
        comments: 12,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        closed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        html_url: "https://github.com/owner/repo/issues/2",
      },
    ];
  }

  async getPullRequests(params: PullRequestParams): Promise<PullRequest[]> {
    console.log("Mock: Getting pull requests", params);

    const mockPRs: PullRequest[] = [
      {
        id: 1001,
        number: 10,
        state: "open",
        title: "Add GitHub API integration",
        body: "This PR adds GitHub API integration with support for PRs, issues, branches, and workflows",
        user: {
          login: "developer1",
          avatar_url: "https://avatars.githubusercontent.com/u/10?v=4",
        },
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        closed_at: null,
        merged_at: null,
        head: {
          ref: "feature/github-api",
          sha: "abc123def456",
        },
        base: {
          ref: "main",
          sha: "def456abc123",
        },
        html_url: "https://github.com/owner/repo/pull/10",
        draft: false,
        mergeable: true,
        mergeable_state: "clean",
        merged: false,
        comments: 3,
        review_comments: 5,
        commits: 8,
        additions: 450,
        deletions: 120,
        changed_files: 12,
      },
      {
        id: 1002,
        number: 9,
        state: "closed",
        title: "Fix authentication bug",
        body: "Fixes #1 - Application crashing on startup",
        user: {
          login: "developer2",
          avatar_url: "https://avatars.githubusercontent.com/u/11?v=4",
        },
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        closed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        merged_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        head: {
          ref: "fix/auth-bug",
          sha: "xyz789uvw012",
        },
        base: {
          ref: "main",
          sha: "def456abc123",
        },
        html_url: "https://github.com/owner/repo/pull/9",
        draft: false,
        mergeable: null,
        mergeable_state: "unknown",
        merged: true,
        comments: 2,
        review_comments: 8,
        commits: 4,
        additions: 85,
        deletions: 42,
        changed_files: 5,
      },
    ];

    // Filter by state
    return mockPRs.filter((pr) => {
      if (params.state === "all") return true;
      return pr.state === (params.state || "open");
    });
  }

  async getPullRequest(
    owner: string,
    repo: string,
    pull_number: number
  ): Promise<PullRequest> {
    console.log("Mock: Getting pull request", { owner, repo, pull_number });

    const prs = await this.getPullRequests({ owner, repo });
    const pr = prs.find((p) => p.number === pull_number);

    if (!pr) {
      throw new Error(`Pull request #${pull_number} not found`);
    }

    return pr;
  }

  async getWorkflowRuns(params: WorkflowRunParams): Promise<{
    total_count: number;
    workflow_runs: WorkflowRun[];
  }> {
    console.log("Mock: Getting workflow runs", params);

    const mockRuns: WorkflowRun[] = [
      {
        id: 2001,
        name: "CI",
        head_branch: "feature/github-api",
        head_sha: "abc123def456",
        status: "completed",
        conclusion: "success",
        workflow_id: 5001,
        url: "https://api.github.com/repos/owner/repo/actions/runs/2001",
        html_url: "https://github.com/owner/repo/actions/runs/2001",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        run_started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        event: "push",
        run_number: 125,
        run_attempt: 1,
      },
      {
        id: 2002,
        name: "Tests",
        head_branch: "feature/github-api",
        head_sha: "abc123def456",
        status: "in_progress",
        conclusion: null,
        workflow_id: 5002,
        url: "https://api.github.com/repos/owner/repo/actions/runs/2002",
        html_url: "https://github.com/owner/repo/actions/runs/2002",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 60000).toISOString(),
        run_started_at: new Date(Date.now() - 3600000).toISOString(),
        event: "push",
        run_number: 89,
        run_attempt: 1,
      },
      {
        id: 2003,
        name: "Deploy",
        head_branch: "main",
        head_sha: "def456abc123",
        status: "completed",
        conclusion: "failure",
        workflow_id: 5003,
        url: "https://api.github.com/repos/owner/repo/actions/runs/2003",
        html_url: "https://github.com/owner/repo/actions/runs/2003",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000 + 600000).toISOString(),
        run_started_at: new Date(Date.now() - 86400000).toISOString(),
        event: "workflow_dispatch",
        run_number: 45,
        run_attempt: 2,
      },
    ];

    // Filter by status
    const filteredRuns = mockRuns.filter((run) => {
      if (params.status) return run.status === params.status;
      return true;
    });

    return {
      total_count: filteredRuns.length,
      workflow_runs: filteredRuns,
    };
  }

  async getWorkflowRun(
    owner: string,
    repo: string,
    run_id: number
  ): Promise<WorkflowRun> {
    console.log("Mock: Getting workflow run", { owner, repo, run_id });

    const result = await this.getWorkflowRuns({ owner, repo });
    const run = result.workflow_runs.find((r) => r.id === run_id);

    if (!run) {
      throw new Error(`Workflow run #${run_id} not found`);
    }

    return run;
  }

  async getBranches(params: BranchParams): Promise<Branch[]> {
    console.log("Mock: Getting branches", params);

    const mockBranches: Branch[] = [
      {
        name: "main",
        commit: {
          sha: "def456abc123",
          url: "https://api.github.com/repos/owner/repo/commits/def456abc123",
        },
        protected: true,
        protection: {
          enabled: true,
          required_status_checks: {
            enforcement_level: "non_admins",
            contexts: ["ci/tests", "ci/build"],
          },
        },
      },
      {
        name: "develop",
        commit: {
          sha: "ghi789jkl012",
          url: "https://api.github.com/repos/owner/repo/commits/ghi789jkl012",
        },
        protected: true,
        protection: {
          enabled: true,
          required_status_checks: {
            enforcement_level: "non_admins",
            contexts: ["ci/tests"],
          },
        },
      },
      {
        name: "feature/github-api",
        commit: {
          sha: "abc123def456",
          url: "https://api.github.com/repos/owner/repo/commits/abc123def456",
        },
        protected: false,
      },
      {
        name: "fix/auth-bug",
        commit: {
          sha: "xyz789uvw012",
          url: "https://api.github.com/repos/owner/repo/commits/xyz789uvw012",
        },
        protected: false,
      },
    ];

    // Filter by protected status
    return mockBranches.filter((branch) => {
      if (params.protected !== undefined) {
        return branch.protected === params.protected;
      }
      return true;
    });
  }

  async getBranch(owner: string, repo: string, branch: string): Promise<Branch> {
    console.log("Mock: Getting branch", { owner, repo, branch });

    const branches = await this.getBranches({ owner, repo });
    const foundBranch = branches.find((b) => b.name === branch);

    if (!foundBranch) {
      throw new Error(`Branch '${branch}' not found`);
    }

    return foundBranch;
  }

  async getIssues(params: IssueParams): Promise<Issue[]> {
    console.log("Mock: Getting issues", params);

    // Filter by state
    return this.mockIssues.filter((issue) => {
      if (params.state === "all") return true;
      return issue.state === (params.state || "open");
    });
  }

  async getIssue(owner: string, repo: string, issue_number: number): Promise<Issue> {
    console.log("Mock: Getting issue", { owner, repo, issue_number });

    const issue = this.mockIssues.find((i) => i.number === issue_number);

    if (!issue) {
      throw new Error(`Issue #${issue_number} not found`);
    }

    return issue;
  }

  async createIssue(params: CreateIssueParams): Promise<Issue> {
    console.log("Mock: Creating issue", params);

    const newIssue: Issue = {
      id: this.issueIdCounter++,
      number: this.mockIssues.length + 1,
      state: "open",
      title: params.title,
      body: params.body || null,
      user: {
        login: "authenticated-user",
        avatar_url: "https://avatars.githubusercontent.com/u/999?v=4",
      },
      labels: params.labels
        ? params.labels.map((label, index) => ({
            id: 1000 + index,
            name: label,
            color: "ededed",
            description: null,
          }))
        : [],
      assignees: params.assignees
        ? params.assignees.map((assignee) => ({
            login: assignee,
            avatar_url: `https://avatars.githubusercontent.com/u/${Math.random()}?v=4`,
          }))
        : [],
      milestone: params.milestone
        ? {
            id: params.milestone,
            number: params.milestone,
            title: `Milestone ${params.milestone}`,
          }
        : null,
      comments: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
      html_url: `https://github.com/${params.owner}/${params.repo}/issues/${this.mockIssues.length + 1}`,
    };

    this.mockIssues.push(newIssue);
    return newIssue;
  }

  async getWorkflows(owner: string, repo: string): Promise<any[]> {
    console.log("Mock: Getting workflows", { owner, repo });

    return [
      {
        id: 5001,
        name: "CI",
        path: ".github/workflows/ci.yml",
        state: "active",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        url: "https://api.github.com/repos/owner/repo/actions/workflows/5001",
        html_url: "https://github.com/owner/repo/actions/workflows/ci.yml",
        badge_url:
          "https://github.com/owner/repo/workflows/CI/badge.svg",
      },
      {
        id: 5002,
        name: "Tests",
        path: ".github/workflows/tests.yml",
        state: "active",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        url: "https://api.github.com/repos/owner/repo/actions/workflows/5002",
        html_url: "https://github.com/owner/repo/actions/workflows/tests.yml",
        badge_url:
          "https://github.com/owner/repo/workflows/Tests/badge.svg",
      },
      {
        id: 5003,
        name: "Deploy",
        path: ".github/workflows/deploy.yml",
        state: "active",
        created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        url: "https://api.github.com/repos/owner/repo/actions/workflows/5003",
        html_url: "https://github.com/owner/repo/actions/workflows/deploy.yml",
        badge_url:
          "https://github.com/owner/repo/workflows/Deploy/badge.svg",
      },
    ];
  }
}
