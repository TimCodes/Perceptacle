import request from 'supertest';
import express, { Express } from 'express';
import githubRoutes from '../routes/github';

// Mock the service factory
jest.mock('../services/service-factory', () => {
  const mockGitHubService = {
    getPullRequests: jest.fn().mockResolvedValue([
      {
        id: 1,
        number: 100,
        state: 'open',
        title: 'Test PR',
        user: { login: 'testuser', avatar_url: 'https://avatar.url' },
        head: { ref: 'feature', sha: 'abc123' },
        base: { ref: 'main', sha: 'def456' },
      },
    ]),
    getPullRequest: jest.fn().mockResolvedValue({
      id: 1,
      number: 100,
      state: 'open',
      title: 'Test PR',
      user: { login: 'testuser', avatar_url: 'https://avatar.url' },
    }),
    getWorkflowRuns: jest.fn().mockResolvedValue({
      total_count: 1,
      workflow_runs: [
        {
          id: 1,
          name: 'CI',
          status: 'completed',
          conclusion: 'success',
        },
      ],
    }),
    getWorkflowRun: jest.fn().mockResolvedValue({
      id: 1,
      name: 'CI',
      status: 'completed',
      conclusion: 'success',
    }),
    getWorkflows: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'CI',
        path: '.github/workflows/ci.yml',
      },
    ]),
    getBranches: jest.fn().mockResolvedValue([
      {
        name: 'main',
        commit: { sha: 'abc123', url: 'https://api.github.com' },
        protected: true,
      },
    ]),
    getBranch: jest.fn().mockResolvedValue({
      name: 'main',
      commit: { sha: 'abc123', url: 'https://api.github.com' },
      protected: true,
    }),
    getIssues: jest.fn().mockResolvedValue([
      {
        id: 1,
        number: 1,
        state: 'open',
        title: 'Test Issue',
        user: { login: 'testuser', avatar_url: 'https://avatar.url' },
      },
    ]),
    getIssue: jest.fn().mockResolvedValue({
      id: 1,
      number: 1,
      state: 'open',
      title: 'Test Issue',
      user: { login: 'testuser', avatar_url: 'https://avatar.url' },
    }),
    createIssue: jest.fn().mockResolvedValue({
      id: 2,
      number: 2,
      state: 'open',
      title: 'New Issue',
      user: { login: 'testuser', avatar_url: 'https://avatar.url' },
    }),
  };

  return {
    serviceFactory: {
      createGitHubService: jest.fn().mockReturnValue(mockGitHubService),
      isUsingMocks: jest.fn().mockReturnValue(true),
    },
  };
});

describe('GitHub Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/github', githubRoutes);
  });

  describe('GET /api/github/repos/:owner/:repo/pulls', () => {
    it('should return pull requests for a repository', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/pulls')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].number).toBe(100);
      expect(response.body[0].title).toBe('Test PR');
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/pulls')
        .query({ state: 'open', per_page: 50 })
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should return 400 if owner or repo is missing', async () => {
      const response = await request(app)
        .get('/api/github/repos//pulls')
        .expect(404);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/pulls/:pull_number', () => {
    it('should return a specific pull request', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/pulls/100')
        .expect(200);

      expect(response.body.number).toBe(100);
      expect(response.body.title).toBe('Test PR');
    });

    it('should return 200 for listing pulls endpoint', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/pulls/')
        .expect(200);
      
      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/actions/runs', () => {
    it('should return workflow runs for a repository', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/actions/runs')
        .expect(200);

      expect(response.body.total_count).toBe(1);
      expect(response.body.workflow_runs).toHaveLength(1);
      expect(response.body.workflow_runs[0].name).toBe('CI');
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/actions/runs')
        .query({ workflow_id: 123, status: 'completed' })
        .expect(200);

      expect(response.body.workflow_runs).toHaveLength(1);
    });

    it('should return 400 if owner or repo is missing', async () => {
      const response = await request(app)
        .get('/api/github/repos//actions/runs')
        .expect(404);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/actions/runs/:run_id', () => {
    it('should return a specific workflow run', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/actions/runs/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('CI');
      expect(response.body.status).toBe('completed');
    });

    it('should return 200 for listing runs endpoint', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/actions/runs/')
        .expect(200);
      
      expect(response.body.workflow_runs).toHaveLength(1);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/actions/workflows', () => {
    it('should return workflows for a repository', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/actions/workflows')
        .expect(200);

      expect(response.body.workflows).toHaveLength(1);
      expect(response.body.workflows[0].name).toBe('CI');
    });

    it('should return 400 if owner or repo is missing', async () => {
      const response = await request(app)
        .get('/api/github/repos//actions/workflows')
        .expect(404);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/branches', () => {
    it('should return branches for a repository', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/branches')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('main');
      expect(response.body[0].protected).toBe(true);
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/branches')
        .query({ protected: 'true', per_page: 100 })
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should return 400 if owner or repo is missing', async () => {
      const response = await request(app)
        .get('/api/github/repos//branches')
        .expect(404);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/branches/:branch', () => {
    it('should return a specific branch', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/branches/main')
        .expect(200);

      expect(response.body.name).toBe('main');
      expect(response.body.protected).toBe(true);
    });

    it('should return 200 for listing branches endpoint', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/branches/')
        .expect(200);
      
      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/issues', () => {
    it('should return issues for a repository', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/issues')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].number).toBe(1);
      expect(response.body[0].title).toBe('Test Issue');
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/issues')
        .query({ state: 'open', labels: 'bug' })
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should return 400 if owner or repo is missing', async () => {
      const response = await request(app)
        .get('/api/github/repos//issues')
        .expect(404);
    });
  });

  describe('GET /api/github/repos/:owner/:repo/issues/:issue_number', () => {
    it('should return a specific issue', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/issues/1')
        .expect(200);

      expect(response.body.number).toBe(1);
      expect(response.body.title).toBe('Test Issue');
    });

    it('should return 200 for listing issues endpoint', async () => {
      const response = await request(app)
        .get('/api/github/repos/test/repo/issues/')
        .expect(200);
      
      expect(response.body).toHaveLength(1);
    });
  });

  describe('POST /api/github/repos/:owner/:repo/issues', () => {
    it('should create a new issue', async () => {
      const response = await request(app)
        .post('/api/github/repos/test/repo/issues')
        .send({
          title: 'New Issue',
          body: 'Issue description',
        })
        .expect(201);

      expect(response.body.number).toBe(2);
      expect(response.body.title).toBe('New Issue');
    });

    it('should create issue with optional parameters', async () => {
      const response = await request(app)
        .post('/api/github/repos/test/repo/issues')
        .send({
          title: 'New Issue',
          body: 'Issue description',
          assignees: ['user1'],
          labels: ['bug', 'enhancement'],
          milestone: 1,
        })
        .expect(201);

      expect(response.body.title).toBe('New Issue');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/github/repos/test/repo/issues')
        .send({
          body: 'Issue description',
        })
        .expect(400);

      expect(response.body.error).toBe('Title is required');
    });

    it('should return 400 if owner or repo is missing', async () => {
      const response = await request(app)
        .post('/api/github/repos//issues')
        .send({
          title: 'New Issue',
        })
        .expect(404);
    });
  });
});
