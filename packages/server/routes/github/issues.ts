import { Router, type Request, Response } from "express";
import { GitHubService, MockGitHubService } from "../../services";

const router = Router();

export function createIssuesRouter(githubService: GitHubService | MockGitHubService) {
  // Get issues for a repository
  router.get("/repos/:owner/:repo/issues", async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const { state, labels, sort, direction, since, per_page, page } = req.query;

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }

      const issues = await githubService.getIssues({
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
  router.get("/repos/:owner/:repo/issues/:issue_number", async (req: Request, res: Response) => {
    try {
      const { owner, repo, issue_number } = req.params;

      if (!owner || !repo || !issue_number) {
        return res.status(400).json({ error: 'Owner, repo, and issue_number are required' });
      }

      const issue = await githubService.getIssue(
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
  router.post("/repos/:owner/:repo/issues", async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const { title, body, assignees, milestone, labels } = req.body;

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
      }

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const issue = await githubService.createIssue({
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

  return router;
}

export default createIssuesRouter;
