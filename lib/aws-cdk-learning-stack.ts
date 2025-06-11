import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
export class AwsCdkLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define an appsync api
    const api = new appsync.GraphqlApi(this, 'MyNoteApp', {
      name: 'my-note-app',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
    });

    // create a DynamoDB Table  
    const notesTable = new dynamodb.Table(this, 'NotesTable', {
      tableName: 'notes-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // const createUpdateNoteSqs = new sqs.Queue(this, 'CreateupdateNoteSqs', {
    //   queueName: 'create-update-note-sqs.fifo',
    //   fifo: true,
    //   contentBasedDeduplication: true,
    //   visibilityTimeout: cdk.Duration.seconds(30),
    //   retentionPeriod: cdk.Duration.days(4),
    // })

    // const createUpdateLambda = new lambda.Function(this, 'CreateUpdateNoteLambda', {
    //   functionName: 'create-update-note-lambda',
    //   runtime: lambda.Runtime.NODEJS_22_X,
    //   code: lambda.Code.fromAsset('src/createUpdateLambda'),
    //   handler: 'index.handler',
    //   environment: {
    //     NOTES_TABLE_NAME: notesTable.tableName,
    //   },
    //   timeout: cdk.Duration.seconds(30),
    // });

    // createUpdateLambda.addEventSource(new eventSources.SqsEventSource(createUpdateNoteSqs));

    // // Roles and permissions
    // createUpdateNoteSqs.grantSendMessages(createUpdateLambda);
    // notesTable.grantReadWriteData(createUpdateLambda);
    
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
    });
  }
}
