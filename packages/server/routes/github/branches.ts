import { Router, type Request, Response } from "express";
import { GitHubService, MockGitHubService } from "../../services";

const router = Router();

export function createBranchesRouter(githubService: GitHubService | MockGitHubService) {
  // Get branches for a repository
  router.get("/repos/:owner/:repo/branches", async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const { protected: isProtected, per_page, page } = req.query;

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }

      const branches = await githubService.getBranches({
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
  router.get("/repos/:owner/:repo/branches/:branch", async (req: Request, res: Response) => {
    try {
      const { owner, repo, branch } = req.params;

      if (!owner || !repo || !branch) {
        return res.status(400).json({ error: 'Owner, repo, and branch are required' });
      }

      const branchInfo = await githubService.getBranch(owner, repo, branch);

      res.json(branchInfo);
    } catch (error: any) {
      console.error('Error getting branch:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve branch',
        details: error.message 
      });
    }
  });

  return router;
}

export default createBranchesRouter;
