import { Stage as CDKStage, type StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import type { BaseEnvironment, Props } from "../types";
import { getScope, getScopedName } from "../utils/scope";

export class Stage<TEnvironment extends BaseEnvironment> extends CDKStage {
  constructor(
    scope: Construct,
    id: string,
    props: Props<TEnvironment> & StageProps,
  ) {
    super(scope, id, props);

    const s = getScope(this);
    this.node.setContext("scope", `${s}-${props.envName}`);

    props.create(this, getScopedName(this, props.projectName), props.envValue!);
  }
}
