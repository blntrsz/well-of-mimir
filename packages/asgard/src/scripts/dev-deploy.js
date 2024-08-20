#!/usr/bin/env node

import {
  CodePipelineClient,
  GetPipelineExecutionCommand,
  ListActionExecutionsCommand,
} from "@aws-sdk/client-codepipeline";
import { execSync } from "child_process";
import { z } from "zod";

const codePipelineClient = new CodePipelineClient();

function getPipelineName() {
  return process.env.CODEBUILD_INITIATOR?.replace("codepipeline/", "");
}

// PULL_REQUEST_UPDATED example:
// {"connectionArn":"arn:aws:codeconnections:eu-central-1:021891617269:connection/b8d174cd-4d30-4f76-835d-cf554eb319c9","repositoryId":"blntrsz/asgard","pullRequestId":"13","pullRequestEvent":"UPDATED","source":"add-db-stack","destination":"main","type":"PULL_REQUEST_UPDATED"}

// PULL_REQUEST_MERGED exmaple:
// {"connectionArn":"arn:aws:codeconnections:eu-central-1:021891617269:connection/b8d174cd-4d30-4f76-835d-cf554eb319c9","repositoryId":"blntrsz/asgard","pullRequestId":"13","pullRequestEvent":"MERGED","source":"add-db-stack","destination":"main","type":"PULL_REQUEST_MERGED"}

const triggerDetailSchema = z.object({
  type: z.enum([
    "PULL_REQUEST_UPDATED",
    "PULL_REQUEST_MERGED",
    "PULL_REQUEST_CREATED",
  ]),
  pullRequestId: z.string(),
});

export async function getTrigger() {
  const buildID = process.env.CODEBUILD_BUILD_ID?.trim();
  const pipelineName = getPipelineName();

  const listActionExecutionsCommand = new ListActionExecutionsCommand({
    pipelineName,
  });
  const listActionExecutions = await codePipelineClient.send(
    listActionExecutionsCommand,
  );

  const actionExecutionDetail =
    listActionExecutions.actionExecutionDetails?.find(
      (action) =>
        action.output?.executionResult?.externalExecutionId === buildID,
    );

  const getPipelineExecutionCommand = new GetPipelineExecutionCommand({
    pipelineName,
    pipelineExecutionId: actionExecutionDetail?.pipelineExecutionId,
  });
  const getPipelineExecution = await codePipelineClient.send(
    getPipelineExecutionCommand,
  );

  const triggerDetail =
    getPipelineExecution.pipelineExecution?.trigger?.triggerDetail;

  if (triggerDetail?.startsWith("arn")) {
    return {
      /**
       * @type {"MANUAL_EXECUTION"}
       */
      type: "MANUAL_EXECUTION",
    };
  }

  return triggerDetailSchema.parse(JSON.parse(triggerDetail ?? "{}"));
}

export async function runDevCommand() {
  const trigger = await getTrigger();

  if (trigger.type === "MANUAL_EXECUTION") {
    const pipelineName = getPipelineName();
    execSync(
      `pnpm cdk deploy -c scope=deploy ${pipelineName} --require-approval=never`,
    );
    return;
  }

  const scope = `pr-${trigger.pullRequestId}`;

  if (trigger.type === "PULL_REQUEST_MERGED") {
    execSync(`pnpm cdk destroy --all --force -c scope=${scope}`, {
      stdio: "inherit",
    });
    return;
  }

  if (
    trigger.type === "PULL_REQUEST_UPDATED" ||
    trigger.type === "PULL_REQUEST_CREATED"
  ) {
    execSync(
      `pnpm cdk deploy --all --require-approval=never -c scope=${scope}`,
      {
        stdio: "inherit",
      },
    );
    return;
  }
}

(async () => {
  await runDevCommand();
})();
