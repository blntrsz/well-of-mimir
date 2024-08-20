import { Construct } from "constructs";

export const SCOPE_CONTEXT_NAME = "scope";

export const getScope = (scope: Construct): string => {
  const projectName: string | undefined =
    scope.node.tryGetContext(SCOPE_CONTEXT_NAME);

  if (!projectName) {
    throw new Error(`Context parameter "${SCOPE_CONTEXT_NAME}" not found`);
  }

  return projectName;
};

export function getScopedName(construct: Construct, projectName: string) {
  return function (name: string) {
    const scope = getScope(construct);

    return `${projectName}-${name}-${scope}`;
  };
}
