import { Octokit } from "@octokit/rest";

// Types for the service
export interface GitHubCredentials {
  token: string;
}

export interface PullRequestParams {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  sort?: "created" | "updated" | "popularity" | "long-running";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface WorkflowRunParams {
  owner: string;
  repo: string;
  workflow_id?: string | number;
  status?: "queued" | "in_progress" | "completed";
  per_page?: number;
  page?: number;
}

export interface BranchParams {
  owner: string;
  repo: string;
  protected?: boolean;
  per_page?: number;
  page?: number;
}

export interface IssueParams {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  labels?: string;
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  since?: string;
  per_page?: number;
  page?: number;
}

export interface CreateIssueParams {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  assignees?: string[];
  milestone?: number;
  labels?: string[];
}

export interface PullRequest {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  html_url: string;
  draft: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merged: boolean;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  workflow_id: number;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  event: string;
  run_number: number;
  run_attempt: number;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection?: {
    enabled: boolean;
    required_status_checks?: {
      enforcement_level: string;
      contexts: string[];
    };
  };
}

export interface Issue {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  milestone: {
    id: number;
    number: number;
    title: string;
  } | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

/**
 * GitHub Service for interacting with GitHub API
 */
export class GitHubService {
  private octokit: Octokit;

  constructor(credentials: GitHubCredentials) {
    this.octokit = new Octokit({
      auth: credentials.token,
    });
  }

  /**
   * Get pull requests for a repository
   */
  async getPullRequests(params: PullRequestParams): Promise<PullRequest[]> {
    try {
      const { data } = await this.octokit.pulls.list({
        owner: params.owner,
        repo: params.repo,
        state: params.state || "open",
        sort: params.sort,
        direction: params.direction,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });

      return data.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        state: pr.state,
        title: pr.title,
        body: pr.body,
        user: {
          login: pr.user.login,
          avatar_url: pr.user.avatar_url,
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        merged_at: pr.merged_at,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
        },
        html_url: pr.html_url,
        draft: pr.draft || false,
        mergeable: pr.mergeable,
        mergeable_state: pr.mergeable_state,
        merged: pr.merged,
        comments: pr.comments,
        review_comments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
      }));
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      throw error;
    }
  }

  /**
   * Get a specific pull request
   */
  async getPullRequest(
    owner: string,
    repo: string,
    pull_number: number
  ): Promise<PullRequest> {
    try {
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number,
      });

      return {
        id: pr.id,
        number: pr.number,
        state: pr.state,
        title: pr.title,
        body: pr.body,
        user: {
          login: pr.user.login,
          avatar_url: pr.user.avatar_url,
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        merged_at: pr.merged_at,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
        },
        html_url: pr.html_url,
        draft: pr.draft || false,
        mergeable: pr.mergeable,
        mergeable_state: pr.mergeable_state,
        merged: pr.merged,
        comments: pr.comments,
        review_comments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
      };
    } catch (error) {
      console.error("Error fetching pull request:", error);
      throw error;
    }
  }

  /**
   * Get workflow runs for a repository
   */
  async getWorkflowRuns(params: WorkflowRunParams): Promise<{
    total_count: number;
    workflow_runs: WorkflowRun[];
  }> {
    try {
      let data;

      if (params.workflow_id) {
        const response = await this.octokit.actions.listWorkflowRuns({
          owner: params.owner,
          repo: params.repo,
          workflow_id: params.workflow_id,
          status: params.status,
          per_page: params.per_page || 30,
          page: params.page || 1,
        });
        data = response.data;
      } else {
        const response = await this.octokit.actions.listWorkflowRunsForRepo({
          owner: params.owner,
          repo: params.repo,
          status: params.status,
          per_page: params.per_page || 30,
          page: params.page || 1,
        });
        data = response.data;
      }

      return {
        total_count: data.total_count,
        workflow_runs: data.workflow_runs.map((run: any) => ({
          id: run.id,
          name: run.name || 'Unnamed Workflow',
          head_branch: run.head_branch || 'unknown',
          head_sha: run.head_sha,
          status: run.status || 'unknown',
          conclusion: run.conclusion,
          workflow_id: run.workflow_id,
          url: run.url,
          html_url: run.html_url,
          created_at: run.created_at,
          updated_at: run.updated_at,
          run_started_at: run.run_started_at || run.created_at,
          event: run.event,
          run_number: run.run_number,
          run_attempt: run.run_attempt || 1,
        })),
      };
    } catch (error) {
      console.error("Error fetching workflow runs:", error);
      throw error;
    }
  }

  /**
   * Get a specific workflow run
   */
  async getWorkflowRun(
    owner: string,
    repo: string,
    run_id: number
  ): Promise<WorkflowRun> {
    try {
      const { data: run } = await this.octokit.actions.getWorkflowRun({
        owner,
        repo,
        run_id,
      });

      return {
        id: run.id,
        name: run.name || 'Unnamed Workflow',
        head_branch: run.head_branch || 'unknown',
        head_sha: run.head_sha,
        status: run.status || 'unknown',
        conclusion: run.conclusion,
        workflow_id: run.workflow_id,
        url: run.url,
        html_url: run.html_url,
        created_at: run.created_at,
        updated_at: run.updated_at,
        run_started_at: run.run_started_at || run.created_at,
        event: run.event,
        run_number: run.run_number,
        run_attempt: run.run_attempt || 1,
      };
    } catch (error) {
      console.error("Error fetching workflow run:", error);
      throw error;
    }
  }

  /**
   * Get branches for a repository
   */
  async getBranches(params: BranchParams): Promise<Branch[]> {
    try {
      const { data } = await this.octokit.repos.listBranches({
        owner: params.owner,
        repo: params.repo,
        protected: params.protected,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });

      return data.map((branch: Octokit.ReposListBranchesResponseData[number]) => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url,
        },
        protected: branch.protected,
        protection: branch.protection,
      }));
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  }

  /**
   * Get a specific branch
   */
  async getBranch(owner: string, repo: string, branch: string): Promise<Branch> {
    try {
      const { data } = await this.octokit.repos.getBranch({
        owner,
        repo,
        branch,
      });

      return {
        name: data.name,
        commit: {
          sha: data.commit.sha,
          url: data.commit.url,
        },
        protected: data.protected,
        protection: data.protection as any,
      };
    } catch (error) {
      console.error("Error fetching branch:", error);
      throw error;
    }
  }

  /**
   * Get issues for a repository
   */
  async getIssues(params: IssueParams): Promise<Issue[]> {
    try {
      const { data } = await this.octokit.issues.listForRepo({
        owner: params.owner,
        repo: params.repo,
        state: params.state || "open",
        labels: params.labels,
        sort: params.sort,
        direction: params.direction,
        since: params.since,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });

      // Filter out pull requests (GitHub API includes PRs in issues endpoint)
      const issues = data.filter((issue: any) => !issue.pull_request);

      return issues.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        state: issue.state,
        title: issue.title,
        body: issue.body || null,
        user: {
          login: issue.user?.login || 'unknown',
          avatar_url: issue.user?.avatar_url || '',
        },
        labels: issue.labels.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color,
          description: label.description,
        })),
        assignees: (issue.assignees || []).map((assignee: any) => ({
          login: assignee.login,
          avatar_url: assignee.avatar_url,
        })),
        milestone: issue.milestone
          ? {
              id: issue.milestone.id,
              number: issue.milestone.number,
              title: issue.milestone.title,
            }
          : null,
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        html_url: issue.html_url,
      }));
    } catch (error) {
      console.error("Error fetching issues:", error);
      throw error;
    }
  }

  /**
   * Get a specific issue
   */
  async getIssue(owner: string, repo: string, issue_number: number): Promise<Issue> {
    try {
      const { data: issue } = await this.octokit.issues.get({
        owner,
        repo,
        issue_number,
      });

      return {
        id: issue.id,
        number: issue.number,
        state: issue.state,
        title: issue.title,
        body: issue.body || null,
        user: {
          login: issue.user?.login || 'unknown',
          avatar_url: issue.user?.avatar_url || '',
        },
        labels: issue.labels.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color,
          description: label.description,
        })),
        assignees: (issue.assignees || []).map((assignee: any) => ({
          login: assignee.login,
          avatar_url: assignee.avatar_url,
        })),
        milestone: issue.milestone
          ? {
              id: issue.milestone.id,
              number: issue.milestone.number,
              title: issue.milestone.title,
            }
          : null,
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        html_url: issue.html_url,
      };
    } catch (error) {
      console.error("Error fetching issue:", error);
      throw error;
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(params: CreateIssueParams): Promise<Issue> {
    try {
      const { data: issue } = await this.octokit.issues.create({
        owner: params.owner,
        repo: params.repo,
        title: params.title,
        body: params.body,
        assignees: params.assignees,
        milestone: params.milestone,
        labels: params.labels,
      });

      return {
        id: issue.id,
        number: issue.number,
        state: issue.state,
        title: issue.title,
        body: issue.body || null,
        user: {
          login: issue.user?.login || 'unknown',
          avatar_url: issue.user?.avatar_url || '',
        },
        labels: issue.labels.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color,
          description: label.description,
        })),
        assignees: (issue.assignees || []).map((assignee: any) => ({
          login: assignee.login,
          avatar_url: assignee.avatar_url,
        })),
        milestone: issue.milestone
          ? {
              id: issue.milestone.id,
              number: issue.milestone.number,
              title: issue.milestone.title,
            }
          : null,
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        html_url: issue.html_url,
      };
    } catch (error) {
      console.error("Error creating issue:", error);
      throw error;
    }
  }

  /**
   * List all workflows for a repository
   */
  async getWorkflows(owner: string, repo: string): Promise<any[]> {
    try {
      const { data } = await this.octokit.actions.listRepoWorkflows({
        owner,
        repo,
      });

      return data.workflows.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        path: workflow.path,
        state: workflow.state,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        url: workflow.url,
        html_url: workflow.html_url,
        badge_url: workflow.badge_url,
      }));
    } catch (error) {
      console.error("Error fetching workflows:", error);
      throw error;
    }
  }
}
