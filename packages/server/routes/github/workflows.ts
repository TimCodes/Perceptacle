import { Router, type Request, Response } from "express";
import { GitHubService, MockGitHubService } from "../../services";

const router = Router();

export function createWorkflowsRouter(githubService: GitHubService | MockGitHubService) {
  // Get workflow runs for a repository
  router.get("/repos/:owner/:repo/actions/runs", async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const { workflow_id, status, per_page, page } = req.query;

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }

      const workflowRuns = await githubService.getWorkflowRuns({
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
  router.get("/repos/:owner/:repo/actions/runs/:run_id", async (req: Request, res: Response) => {
    try {
      const { owner, repo, run_id } = req.params;

      if (!owner || !repo || !run_id) {
        return res.status(400).json({ error: 'Owner, repo, and run_id are required' });
      }

      const workflowRun = await githubService.getWorkflowRun(
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
  router.get("/repos/:owner/:repo/actions/workflows", async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }

      const workflows = await githubService.getWorkflows(owner, repo);

      res.json({ workflows });
    } catch (error: any) {
      console.error('Error getting workflows:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve workflows',
        details: error.message 
      });
    }
  });

  return router;
}

export default createWorkflowsRouter;
