import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import {
  PipelineType,
  Pipeline,
  ExecutionMode,
} from "aws-cdk-lib/aws-codepipeline";
import { Construct } from "constructs";
import { Stage } from "./stage";
import { Stack, StackProps } from "aws-cdk-lib";
import { getScope } from "../utils/scope";
import { BaseEnvironment, Props } from "../types";
import { DEPLOY_SCOPE } from "../constants";
import { join } from "path";
import { withEnvContext } from "../utils/app-context";

const ACTION_NAME = "pipeline_pr_action";

export class MainPipeline<TEnvironment extends BaseEnvironment> extends Stack {
  props: Props<TEnvironment>;

  constructor(
    scope: Construct,
    id: string,
    props: Props<TEnvironment> & StackProps,
  ) {
    super(scope, id, props);

    this.props = props;
    const envScope = getScope(this);

    const pipeline = new Pipeline(this, "pipeline", {
      crossAccountKeys: this.isCrossRegion,
      pipelineType: PipelineType.V2,
      pipelineName: id,
      executionMode: ExecutionMode.SUPERSEDED,
      restartExecutionOnUpdate: true,
    });

    const codePipeline = new CodePipeline(this, "code-pipeline", {
      codePipeline: pipeline,
      selfMutation: true,
      synth: this.createShellStep(),
    });

    if (envScope !== DEPLOY_SCOPE) {
      this.createStages(codePipeline);
    }
  }

  private get isCrossRegion() {
    const regions = new Set<string>();
    for (const wave of Object.values(this.props.waves)) {
      for (const environment of Object.values(wave)) {
        regions.add(environment.region);
      }
    }

    return regions.size > 1;
  }

  private createShellStep() {
    return new ShellStep("synth", {
      commands: this.props.commands!,
      installCommands: this.props.installCommands,
      primaryOutputDirectory: join(this.props.path, "cdk.out"),
      input: CodePipelineSource.connection(
        this.props.repositoryName,
        this.props.mainBranch,
        {
          actionName: ACTION_NAME,
          triggerOnPush: true,
          codeBuildCloneOutput: true,
          connectionArn: this.props.connectionArn,
        },
      ),
    });
  }

  private createStages(codePipeline: CodePipeline) {
    for (const [waveName, waveValue] of Object.entries(this.props.waves)) {
      const wave = codePipeline.addWave(waveName);

      for (const [stageName, envValue] of Object.entries(waveValue)) {
        wave.addStage(
          withEnvContext(envValue, () => {
            return new Stage(
              this,
              `${this.props.projectName}-${waveName}-${stageName}`,
              {
                ...this.props,
                env: {
                  account: envValue.account,
                  region: envValue.region,
                },
                envValue: envValue,
                envName: `${waveName}-${stageName}`,
              },
            );
          }),
        );
      }
    }
  }
}
