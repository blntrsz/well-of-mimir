import { Construct } from "constructs";

export type BaseEnvironment = {
  account: string;
  region: string;
};

/**
 * Props for the Asgard Application
 */
export type Props<TEnvironment extends BaseEnvironment> = {
  /**
   * Install commands used for the CodeBuild.
   * @default ["n auto", "corepack enable", "pnpm i"]
   */
  installCommands?: string[];
  devCommands?: string[];
  projectName: string;
  repositoryName: string;
  connectionArn: string;
  mainBranch: string;
  create(
    construct: Construct,
    getScopedName: (name: string) => string,
    wave: TEnvironment,
  ): void;
  commands?: string[];
  path: string;
  waves: {
    dev: Record<string, TEnvironment>;
    [waveName: string]: Record<string, TEnvironment>;
  };
  envValue?: TEnvironment;
  envName?: string;
  pipelineEnv: BaseEnvironment;
};
