#!/usr/bin/env node
import "source-map-support/register";
import { AsgardApp } from "@well-of-mimir/asgard";
import { ApiStack } from "../stacks/api-stack";
import { SpaStack } from "../stacks/spa-stack";
import { DbStack } from "../stacks/db-stack";

const CONNECTION_ARN =
  "arn:aws:codeconnections:eu-central-1:021891617269:connection/b8d174cd-4d30-4f76-835d-cf554eb319c9";

export const app = new AsgardApp({
  projectName: "asgard",
  repositoryName: "blntrsz/asgard",
  mainBranch: "main",
  connectionArn: CONNECTION_ARN,
  path: "apps/infra",
  pipelineEnv: {
    account: "021891617269",
    region: "eu-central-1",
  },
  waves: {
    dev: {
      eu: {
        account: "021891617269",
        region: "eu-central-1",
      },
    },
    prod: {
      eu: {
        account: "021891617269",
        region: "eu-central-1",
      },
    },
  },
  create(scope, getScopedName) {
    new DbStack(scope, "db", {
      stackName: getScopedName("db"),
    });
    new ApiStack(scope, "api", {
      stackName: getScopedName("api"),
    });
    new SpaStack(scope, "spa", {
      stackName: getScopedName("spa"),
    });
  },
});
