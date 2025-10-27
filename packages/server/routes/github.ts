import { Router, type Request, Response } from "express";
import { serviceFactory } from "../services/service-factory";
import { GitHubService, MockGitHubService } from "../services";

const router = Router();

// Get GitHub service instance (real or mock based on configuration)
let githubService: GitHubService | MockGitHubService | null = null;

// Middleware to ensure GitHub service is initialized
const ensureGitHubService = (req: Request, res: Response, next: any) => {
  if (!githubService) {
    try {
      githubService = serviceFactory.createGitHubService();
      console.log(`GitHub service initialized (using ${serviceFactory.isUsingMocks() ? 'mock' : 'real'} implementation)`);
    } catch (error) {
      console.error('Failed to initialize GitHub service:', error);
      return res.status(500).json({ 
        error: 'Failed to initialize GitHub service. Check your configuration.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  next();
};

// Get pull requests for a repository
router.get("/repos/:owner/:repo/pulls", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { state, sort, direction, per_page, page } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const pullRequests = await githubService!.getPullRequests({
      owner,
      repo,
      state: state as any,
      sort: sort as any,
      direction: direction as any,
      per_page: per_page ? parseInt(per_page as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    });

    res.json(pullRequests);
  } catch (error: any) {
    console.error('Error getting pull requests:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pull requests',
      details: error.message 
    });
  }
});

// Get a specific pull request
router.get("/repos/:owner/:repo/pulls/:pull_number", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo, pull_number } = req.params;

    if (!owner || !repo || !pull_number) {
      return res.status(400).json({ error: 'Owner, repo, and pull_number are required' });
    }

    const pullRequest = await githubService!.getPullRequest(
      owner,
      repo,
      parseInt(pull_number)
    );

    res.json(pullRequest);
  } catch (error: any) {
    console.error('Error getting pull request:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pull request',
      details: error.message 
    });
  }
});

// Get workflow runs for a repository
router.get("/repos/:owner/:repo/actions/runs", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { workflow_id, status, per_page, page } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const workflowRuns = await githubService!.getWorkflowRuns({
      owner,
      repo,
      workflow_id: workflow_id ? (isNaN(Number(workflow_id)) ? workflow_id as string : parseInt(workflow_id as string)) : undefined,
      status: status as any,
      per_page: per_page ? parseInt(per_page as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    });

    res.json(workflowRuns);
  } catch (error: any) {
    console.error('Error getting workflow runs:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve workflow runs',
      details: error.message 
    });
  }
});

// Get a specific workflow run
router.get("/repos/:owner/:repo/actions/runs/:run_id", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo, run_id } = req.params;

    if (!owner || !repo || !run_id) {
      return res.status(400).json({ error: 'Owner, repo, and run_id are required' });
    }

    const workflowRun = await githubService!.getWorkflowRun(
      owner,
      repo,
      parseInt(run_id)
    );

    res.json(workflowRun);
  } catch (error: any) {
    console.error('Error getting workflow run:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve workflow run',
      details: error.message 
    });
  }
});

// Get workflows for a repository
router.get("/repos/:owner/:repo/actions/workflows", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const workflows = await githubService!.getWorkflows(owner, repo);

    res.json({ workflows });
  } catch (error: any) {
    console.error('Error getting workflows:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve workflows',
      details: error.message 
    });
  }
});

// Get branches for a repository
router.get("/repos/:owner/:repo/branches", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { protected: isProtected, per_page, page } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const branches = await githubService!.getBranches({
      owner,
      repo,
      protected: isProtected === 'true' ? true : isProtected === 'false' ? false : undefined,
      per_page: per_page ? parseInt(per_page as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    });

    res.json(branches);
  } catch (error: any) {
    console.error('Error getting branches:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve branches',
      details: error.message 
    });
  }
});

// Get a specific branch
router.get("/repos/:owner/:repo/branches/:branch", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo, branch } = req.params;

    if (!owner || !repo || !branch) {
      return res.status(400).json({ error: 'Owner, repo, and branch are required' });
    }

    const branchInfo = await githubService!.getBranch(owner, repo, branch);

    res.json(branchInfo);
  } catch (error: any) {
    console.error('Error getting branch:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve branch',
      details: error.message 
    });
  }
});

// Get issues for a repository
router.get("/repos/:owner/:repo/issues", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { state, labels, sort, direction, since, per_page, page } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const issues = await githubService!.getIssues({
      owner,
      repo,
      state: state as any,
      labels: labels as string,
      sort: sort as any,
      direction: direction as any,
      since: since as string,
      per_page: per_page ? parseInt(per_page as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    });

    res.json(issues);
  } catch (error: any) {
    console.error('Error getting issues:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve issues',
      details: error.message 
    });
  }
});

// Get a specific issue
router.get("/repos/:owner/:repo/issues/:issue_number", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo, issue_number } = req.params;

    if (!owner || !repo || !issue_number) {
      return res.status(400).json({ error: 'Owner, repo, and issue_number are required' });
    }

    const issue = await githubService!.getIssue(
      owner,
      repo,
      parseInt(issue_number)
    );

    res.json(issue);
  } catch (error: any) {
    console.error('Error getting issue:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve issue',
      details: error.message 
    });
  }
});

// Create a new issue
router.post("/repos/:owner/:repo/issues", ensureGitHubService, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { title, body, assignees, milestone, labels } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const issue = await githubService!.createIssue({
      owner,
      repo,
      title,
      body,
      assignees,
      milestone,
      labels,
    });

    res.status(201).json(issue);
  } catch (error: any) {
    console.error('Error creating issue:', error);
    res.status(500).json({ 
      error: 'Failed to create issue',
      details: error.message 
    });
  }
});

export default router;
