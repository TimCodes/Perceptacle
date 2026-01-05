/**
 * GitHub Service Demo
 * 
 * This file demonstrates how to use the GitHub service.
 * Run with: USE_MOCK_SERVICES=true tsx github-demo.ts
 */

import { serviceFactory } from './services/service-factory';

async function main() {
  console.log('=== GitHub Service Demo ===\n');

  // Get GitHub service (will use mock data if USE_MOCK_SERVICES=true)
  const githubService = serviceFactory.createGitHubService();
  const usingMocks = serviceFactory.isUsingMocks();
  console.log(`Using ${usingMocks ? 'MOCK' : 'REAL'} GitHub service\n`);

  try {
    // Example repository
    const owner = 'octocat';
    const repo = 'Hello-World';

    console.log(`Repository: ${owner}/${repo}\n`);

    // 1. Get Pull Requests
    console.log('--- Pull Requests ---');
    const pullRequests = await githubService.getPullRequests({
      owner,
      repo,
      state: 'all'
    });
    console.log(`Found ${pullRequests.length} pull requests:`);
    pullRequests.forEach(pr => {
      console.log(`  #${pr.number}: ${pr.title} (${pr.state})`);
      console.log(`    Branch: ${pr.head.ref} → ${pr.base.ref}`);
      console.log(`    Author: ${pr.user.login}`);
      console.log(`    Changes: +${pr.additions} -${pr.deletions} in ${pr.changed_files} files`);
    });
    console.log();

    // 2. Get Workflow Runs
    console.log('--- GitHub Actions Workflow Runs ---');
    const workflowRuns = await githubService.getWorkflowRuns({
      owner,
      repo
    });
    console.log(`Found ${workflowRuns.total_count} workflow runs:`);
    workflowRuns.workflow_runs.slice(0, 5).forEach(run => {
      console.log(`  #${run.run_number}: ${run.name} (${run.status})`);
      console.log(`    Branch: ${run.head_branch}`);
      console.log(`    Conclusion: ${run.conclusion || 'pending'}`);
      console.log(`    Started: ${new Date(run.run_started_at).toLocaleString()}`);
    });
    console.log();

    // 3. Get Workflows
    console.log('--- Available Workflows ---');
    const workflows = await githubService.getWorkflows(owner, repo);
    console.log(`Found ${workflows.length} workflows:`);
    workflows.forEach(workflow => {
      console.log(`  ${workflow.name} (${workflow.state})`);
      console.log(`    Path: ${workflow.path}`);
      console.log(`    ID: ${workflow.id}`);
    });
    console.log();

    // 4. Get Branches
    console.log('--- Branches ---');
    const branches = await githubService.getBranches({
      owner,
      repo
    });
    console.log(`Found ${branches.length} branches:`);
    branches.forEach(branch => {
      const protection = branch.protected ? '🔒 Protected' : '🔓 Unprotected';
      console.log(`  ${branch.name} ${protection}`);
      console.log(`    SHA: ${branch.commit.sha.substring(0, 7)}`);
      if (branch.protection?.required_status_checks) {
        console.log(`    Required checks: ${branch.protection.required_status_checks.contexts.join(', ')}`);
      }
    });
    console.log();

    // 5. Get Issues
    console.log('--- Issues ---');
    const issues = await githubService.getIssues({
      owner,
      repo,
      state: 'all'
    });
    console.log(`Found ${issues.length} issues:`);
    issues.forEach(issue => {
      console.log(`  #${issue.number}: ${issue.title} (${issue.state})`);
      console.log(`    Author: ${issue.user.login}`);
      console.log(`    Comments: ${issue.comments}`);
      if (issue.labels.length > 0) {
        console.log(`    Labels: ${issue.labels.map(l => l.name).join(', ')}`);
      }
      if (issue.assignees.length > 0) {
        console.log(`    Assignees: ${issue.assignees.map(a => a.login).join(', ')}`);
      }
    });
    console.log();

    // 6. Create an Issue (demonstration)
    if (usingMocks) {
      console.log('--- Creating New Issue (Mock) ---');
      const newIssue = await githubService.createIssue({
        owner,
        repo,
        title: 'Test Issue from Demo',
        body: 'This is a test issue created by the GitHub service demo.',
        labels: ['test', 'demo']
      });
      console.log(`Created issue #${newIssue.number}: ${newIssue.title}`);
      console.log(`  URL: ${newIssue.html_url}`);
      console.log(`  Labels: ${newIssue.labels.map(l => l.name).join(', ')}`);
      console.log();
    } else {
      console.log('--- Skipping Issue Creation (Real API) ---');
      console.log('To create an issue with the real API, uncomment the code in this demo.\n');
    }

    // Summary
    console.log('=== Summary ===');
    console.log(`Pull Requests: ${pullRequests.length}`);
    console.log(`Workflow Runs: ${workflowRuns.total_count}`);
    console.log(`Workflows: ${workflows.length}`);
    console.log(`Branches: ${branches.length}`);
    console.log(`Issues: ${issues.length}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

// Run the demo
main().catch(console.error);
