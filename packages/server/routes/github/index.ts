import { Router, type Request, Response } from "express";
import { serviceFactory } from "../../services/service-factory";
import { GitHubService, MockGitHubService } from "../../services";
import { createPullRequestsRouter } from "./pull-requests";
import { createWorkflowsRouter } from "./workflows";
import { createBranchesRouter } from "./branches";
import { createIssuesRouter } from "./issues";

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

// Apply middleware globally
router.use(ensureGitHubService);

// Lazy initialization wrapper
const getPullRequestsRouter = () => {
  if (!githubService) throw new Error('GitHub service not initialized');
  return createPullRequestsRouter(githubService);
};

const getWorkflowsRouter = () => {
  if (!githubService) throw new Error('GitHub service not initialized');
  return createWorkflowsRouter(githubService);
};

const getBranchesRouter = () => {
  if (!githubService) throw new Error('GitHub service not initialized');
  return createBranchesRouter(githubService);
};

const getIssuesRouter = () => {
  if (!githubService) throw new Error('GitHub service not initialized');
  return createIssuesRouter(githubService);
};

// Mount all routers at root level - they each define their own paths
router.use((req, res, next) => {
  try {
    const pullRequestsRouter = getPullRequestsRouter();
    const workflowsRouter = getWorkflowsRouter();
    const branchesRouter = getBranchesRouter();
    const issuesRouter = getIssuesRouter();
    
    // Try each router in sequence until one handles the request
    pullRequestsRouter(req, res, (err?: any) => {
      if (err) return next(err);
      if (res.headersSent) return;
      workflowsRouter(req, res, (err?: any) => {
        if (err) return next(err);
        if (res.headersSent) return;
        branchesRouter(req, res, (err?: any) => {
          if (err) return next(err);
          if (res.headersSent) return;
          issuesRouter(req, res, next);
        });
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
