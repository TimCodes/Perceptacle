# GitHub API Integration

This directory contains the GitHub API integration for the Perceptacle backend server.

## Files Created

### Service Files
- **`services/github.ts`** - Main GitHub service implementation using Octokit
- **`services/github.mock.ts`** - Mock GitHub service for testing and development
- **`services/service-factory.ts`** - Updated to include GitHub service factory methods
- **`services/index.ts`** - Updated to export GitHub service types and classes

### Route Files
- **`routes/github.ts`** - Express routes for GitHub API endpoints
- **`routes.ts`** - Updated to register GitHub routes

### Documentation
- **`GITHUB_SERVICE.md`** - Complete documentation of the GitHub service
- **`github-demo.ts`** - Demo script showing how to use the GitHub service

## Quick Start

### 1. Install Dependencies
```bash
cd packages/server
npm install
```

### 2. Configure Environment
Add to your `.env` file:
```bash
# GitHub Personal Access Token
GITHUB_TOKEN=your_github_token_here

# Use mock services for development (optional)
USE_MOCK_SERVICES=true
```

### 3. Run the Demo
```bash
# With mock data
USE_MOCK_SERVICES=true npm run dev github-demo.ts

# With real GitHub API (requires valid token)
npm run dev github-demo.ts
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api/github`:

### Pull Requests
- `GET /api/github/repos/:owner/:repo/pulls` - List pull requests
- `GET /api/github/repos/:owner/:repo/pulls/:number` - Get specific PR

### GitHub Actions
- `GET /api/github/repos/:owner/:repo/actions/runs` - List workflow runs
- `GET /api/github/repos/:owner/:repo/actions/runs/:id` - Get specific run
- `GET /api/github/repos/:owner/:repo/actions/workflows` - List workflows

### Branches
- `GET /api/github/repos/:owner/:repo/branches` - List branches
- `GET /api/github/repos/:owner/:repo/branches/:name` - Get specific branch

### Issues
- `GET /api/github/repos/:owner/:repo/issues` - List issues
- `GET /api/github/repos/:owner/:repo/issues/:number` - Get specific issue
- `POST /api/github/repos/:owner/:repo/issues` - Create new issue

## Example Usage

### Get Pull Requests
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/pulls?state=open
```

### Get Workflow Runs
```bash
curl http://localhost:5000/api/github/repos/octocat/Hello-World/actions/runs
```

### Create an Issue
```bash
curl -X POST http://localhost:5000/api/github/repos/octocat/Hello-World/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Report",
    "body": "Found a bug in the application",
    "labels": ["bug"]
  }'
```

## Features Implemented

✅ **Pull Requests**
- Get all pull requests with filtering
- Get individual pull request details
- Includes PR metadata (status, changes, comments, etc.)

✅ **GitHub Actions / Workflows**
- Get workflow runs with status filtering
- Get individual workflow run details
- List all workflows in a repository

✅ **Branches**
- List all branches
- Filter by protection status
- Get branch protection details

✅ **Issues**
- List issues with filtering
- Get individual issue details
- Create new issues
- Support for labels, assignees, and milestones

✅ **Mock Service**
- Full mock implementation for testing
- No API calls required
- Realistic sample data

## Architecture

The GitHub service follows the same pattern as existing Azure and Kubernetes services:

1. **Service Layer** (`services/github.ts`)
   - Handles all GitHub API interactions
   - Uses Octokit REST client
   - Type-safe interfaces

2. **Mock Layer** (`services/github.mock.ts`)
   - Provides test data
   - No external API calls
   - Same interface as real service

3. **Service Factory** (`services/service-factory.ts`)
   - Creates service instances
   - Switches between real and mock
   - Environment-based configuration

4. **Routes Layer** (`routes/github.ts`)
   - Express endpoint definitions
   - Request validation
   - Error handling

## Configuration Options

### Environment Variables
- `GITHUB_TOKEN` - GitHub personal access token (required for real API)
- `USE_MOCK_SERVICES` - Set to `true` to use mock data

### Service Factory
```typescript
import { serviceFactory } from './services/service-factory';

// Get GitHub service (automatically configured)
const githubService = serviceFactory.createGitHubService();

// Check if using mocks
if (serviceFactory.isUsingMocks()) {
  console.log('Using mock data');
}
```

## Testing

### Run with Mock Data
```bash
USE_MOCK_SERVICES=true npm run dev
```

### Run Demo Script
```bash
USE_MOCK_SERVICES=true tsx github-demo.ts
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit tokens** to version control
2. Store `GITHUB_TOKEN` in `.env` file
3. Add `.env` to `.gitignore`
4. Use tokens with minimal required permissions
5. Rotate tokens regularly
6. Monitor token usage in GitHub settings

## Rate Limits

GitHub API rate limits:
- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

The service uses authenticated requests when a token is provided.

## Future Enhancements

Possible additions:
- [ ] Repository management
- [ ] Commit history
- [ ] Release management
- [ ] Code review comments
- [ ] Webhook integration
- [ ] GraphQL API support
- [ ] Organization/team management
- [ ] Projects and milestones

## Troubleshooting

### "Failed to initialize GitHub service"
- Check that `GITHUB_TOKEN` is set in `.env`
- Verify the token has required permissions
- Try using mock mode: `USE_MOCK_SERVICES=true`

### Rate limit errors
- Wait for rate limit to reset
- Use mock service for development
- Consider caching responses

### Authentication errors
- Verify token is valid
- Check token permissions/scopes
- Regenerate token if necessary

## Documentation

For complete API documentation, see:
- [`GITHUB_SERVICE.md`](./GITHUB_SERVICE.md) - Full service documentation
- [`github-demo.ts`](./github-demo.ts) - Usage examples

## Support

For issues or questions:
1. Check the documentation
2. Review the demo script
3. Try mock mode for testing
4. Check GitHub API status page
