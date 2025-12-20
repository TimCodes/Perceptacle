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

// Mount sub-routers with middleware
router.use(ensureGitHubService, (req, res, next) => {
  if (!githubService) {
    return res.status(500).json({ error: 'GitHub service not initialized' });
  }
  
  // Combine all routers
  const pullRequestsRouter = createPullRequestsRouter(githubService);
  const workflowsRouter = createWorkflowsRouter(githubService);
  const branchesRouter = createBranchesRouter(githubService);
  const issuesRouter = createIssuesRouter(githubService);
  
  // Try each router in sequence
  pullRequestsRouter(req, res, (err?: any) => {
    if (err) return next(err);
    workflowsRouter(req, res, (err?: any) => {
      if (err) return next(err);
      branchesRouter(req, res, (err?: any) => {
        if (err) return next(err);
        issuesRouter(req, res, next);
      });
    });
  });
});

export default router;
