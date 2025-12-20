import { Router, type Request, Response } from "express";
import { GitHubService, MockGitHubService } from "../../services";

const router = Router();

export function createPullRequestsRouter(githubService: GitHubService | MockGitHubService) {
  // Get pull requests for a repository
  router.get("/repos/:owner/:repo/pulls", async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const { state, sort, direction, per_page, page } = req.query;

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }

      const pullRequests = await githubService.getPullRequests({
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
  router.get("/repos/:owner/:repo/pulls/:pull_number", async (req: Request, res: Response) => {
    try {
      const { owner, repo, pull_number } = req.params;

      if (!owner || !repo || !pull_number) {
        return res.status(400).json({ error: 'Owner, repo, and pull_number are required' });
      }

      const pullRequest = await githubService.getPullRequest(
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

  return router;
}

export default createPullRequestsRouter;
