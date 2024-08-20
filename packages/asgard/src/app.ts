import { App, type AppProps } from "aws-cdk-lib";
import type { Props, BaseEnvironment } from "./types";
import { DevPipeline } from "./stacks/dev-pipeline";
import { MainPipeline } from "./stacks/main-pipeline";
import { getScope, getScopedName } from "./utils/scope";
import { DEPLOY_SCOPE } from "./constants";
import { withAppContext, withEnvContext } from "./utils/app-context";

export const DEV_PIPELINE_SUFFIX = "pipeline-dev";
export const MAIN_PIPELINE_SUFFIX = "pipeline-main";
export const MAIN_SCOPE = "main";

/**
 * An Instance of an Asgard application. Use as the main entry point for the CDK App, as the bin.
 */
export class AsgardApp<TEnvironment extends BaseEnvironment> extends App {
  props: AppProps & Props<TEnvironment>;

  constructor(_props: AppProps & Props<TEnvironment>) {
    super(_props);

    this.props = this.createPropsWithDefaultValues(_props);

    withAppContext(this.props, () => {
      const config = this.getDeployConfiguration();

      if (config.main) {
        this.createMainPipeline();
      }

      if (config.deploy) {
        this.createDevPipeline();
      }

      if (config.dev) {
        this.createStacks();
      }
    });
  }

  private getDeployConfiguration() {
    const scope = getScope(this);

    const isMain = scope === MAIN_SCOPE;
    const isDeploy = scope === DEPLOY_SCOPE;
    const isDev = !isMain && !isDeploy;

    return {
      deploy: isDeploy,
      dev: isDev,
      main: isMain || isDeploy,
    };
  }

  private createMainPipeline() {
    new MainPipeline(
      this,
      `${this.props.projectName}-${MAIN_PIPELINE_SUFFIX}`,
      {
        ...this.props,
        env: {
          account: this.props.pipelineEnv.account,
          region: this.props.pipelineEnv.region,
        },
      },
    );
  }

  private createDevPipeline() {
    new DevPipeline(
      this,
      `${this.props.projectName}-${DEV_PIPELINE_SUFFIX}`,
      this.props,
    );
  }

  private createStacks() {
    for (const wave of Object.values(this.props.waves.dev)) {
      withEnvContext(wave, () => {
        this.props.create(
          this,
          getScopedName(this, this.props.projectName),
          wave,
        );
      });
    }
  }

  private createPropsWithDefaultValues(
    props: AppProps & Props<TEnvironment>,
  ): AppProps & Props<TEnvironment> {
    const baseInstallCommands = ["n auto", "corepack enable", "pnpm i"];
    const baseCommands = ["pnpm cdk synth -c scope=main"];
    const baseDevCommands = ["pnpm asgard_dev_command"];
    const cdToPath = `cd ${props.path}`;

    return {
      ...props,
      installCommands: props.installCommands ?? baseInstallCommands,
      commands: [cdToPath, ...(props.commands ?? baseCommands)],
      devCommands: [cdToPath, ...(props.commands ?? baseDevCommands)],
    };
  }
}
