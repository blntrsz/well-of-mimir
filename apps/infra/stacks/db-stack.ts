import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";

export class DbStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new Table(this, "table", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });
  }
}
