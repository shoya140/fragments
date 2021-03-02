module.exports = handleSchedule;

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

/**
 * handle "schedule" event
 */
async function handleSchedule() {
  const octokit = new Octokit();
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const eventPayload = require(process.env.GITHUB_EVENT_PATH);

  const mergeMethod = process.env.INPUT_MERGE_METHOD

  core.info(`Loading open pull request`);
  const pullRequests = await octokit.paginate(
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open",
    },
    (response) => {
      return response.data
        .filter((pullRequest) => isntFromFork(pullRequest))
        .map((pullRequest) => {
          return {
            number: pullRequest.number,
            html_url: pullRequest.html_url,
            ref: pullRequest.head.sha,
          };
        });
    }
  );

  core.info(`${pullRequests.length} scheduled pull requests found`);

  if (pullRequests.length === 0) {
    return;
  }

  for await (const pullRequest of pullRequests) {
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullRequest.number,
      merge_method: mergeMethod
    });

    // find check runs by the Merge schedule action
    const checkRuns = await octokit.paginate(octokit.checks.listForRef, {
      owner: eventPayload.repository.owner.login,
      repo: eventPayload.repository.name,
      ref: pullRequest.ref,
    });

    const checkRun = checkRuns.pop();
    if (!checkRun) continue;

    await octokit.checks.update({
      check_run_id: checkRun.id,
      owner: eventPayload.repository.owner.login,
      repo: eventPayload.repository.name,
      name: "Merge Schedule",
      head_sha: eventPayload.pull_request.head.sha,
      status: "completed",
      output: {
        title: "Scheduled pull request",
        summary: "Merged successfully",
      },
    });

    core.info(`${pullRequest.html_url} merged`);
  }
}

function isntFromFork(pullRequest) {
  return !pullRequest.head.repo.fork;
}
