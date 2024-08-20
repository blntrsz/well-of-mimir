import {
  PipelineType,
  Pipeline,
  ExecutionMode,
  ProviderType,
  GitPullRequestEvent,
  ActionCategory,
  Artifact,
} from "aws-cdk-lib/aws-codepipeline";
import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { Rule } from "aws-cdk-lib/aws-events";
import {
  CodeStarConnectionsSourceAction,
  CodeBuildAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import { BaseEnvironment, Props } from "../types";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

const ACTION_NAME = "pipeline_pr_action";

export class DevPipeline<TEnvironment extends BaseEnvironment> extends Stack {
  private props: Props<TEnvironment>;

  constructor(
    scope: Construct,
    id: string,
    props: Props<TEnvironment> & StackProps,
  ) {
    super(scope, id, props);
    this.props = props;

    const pipeline = this.createPipeline(id);
    this.addTriggerToPipeline(pipeline);
  }

  private createPipeline(name: string) {
    return new Pipeline(this, "pipeline", {
      pipelineType: PipelineType.V2,
      pipelineName: name,
      executionMode: ExecutionMode.PARALLEL,
      restartExecutionOnUpdate: true,
      stages: this.createStages(),
    });
  }

  private createStages() {
    const [owner, repository] = this.props.repositoryName.split("/");
    const artifact = new Artifact();
    const role = this.createRole();

    const source = [
      new CodeStarConnectionsSourceAction({
        owner,
        repo: repository,
        output: artifact,
        actionName: ACTION_NAME,
        triggerOnPush: false,
        codeBuildCloneOutput: true,
        connectionArn: this.props.connectionArn,
      }),
    ];

    const deploy = [
      new CodeBuildAction({
        actionName: "deploy",
        input: artifact,
        project: new PipelineProject(this, "project", {
          role,
          environment: {
            buildImage: LinuxBuildImage.STANDARD_7_0,
          },
          buildSpec: BuildSpec.fromObject({
            version: "0.2",
            phases: {
              install: {
                commands: this.props.installCommands,
              },
              build: {
                commands: this.props.devCommands,
              },
            },
          }),
        }),
      }),
    ];

    return [
      {
        stageName: "source",
        actions: source,
      },
      {
        stageName: "deploy",
        actions: deploy,
      },
    ];
  }

  private addTriggerToPipeline(pipeline: Pipeline) {
    pipeline.addTrigger({
      providerType: ProviderType.CODE_STAR_SOURCE_CONNECTION,
      gitConfiguration: {
        sourceAction: {
          actionProperties: {
            artifactBounds: {
              minOutputs: 0,
              maxOutputs: 1,
              minInputs: 0,
              maxInputs: 1,
            },
            category: ActionCategory.BUILD,
            provider: "CodeStarSourceConnection",
            actionName: ACTION_NAME,
          },
          bind() {
            return {};
          },
          onStateChange() {
            return new Rule(this, "rule");
          },
        },
        pullRequestFilter: [
          {
            branchesIncludes: ["*"],
            events: [
              GitPullRequestEvent.OPEN,
              GitPullRequestEvent.UPDATED,
              GitPullRequestEvent.CLOSED,
            ],
          },
        ],
      },
    });
  }

  private createRole() {
    const role = new Role(this, "dev-pipeline-role", {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
    });

    role.addToPolicy(
      new PolicyStatement({
        actions: [
          "ssm:GetParameter",
          "s3:*",
          "cloudformation:*",
          "iam:PassRole",
          "codepipeline:ListActionExecutions",
          "codepipeline:GetPipelineExecution",
        ],
        resources: ["*"],
      }),
    );

    return role;
  }
}
