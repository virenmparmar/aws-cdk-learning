import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
export class AwsCdkLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const region = cdk.Stack.of(this).region

    const SQS_ENDPOINT = `https://sqs.${region}.amazonaws.com/`;
    const QUEUE_NAME = 'create-update-note-sqs.fifo';
    // Define an appsync api
    const api = new appsync.GraphqlApi(this, 'MyNoteApp', {
      name: 'my-note-app',
      definition: appsync.Definition.fromSchema(
        appsync.SchemaFile.fromAsset('graphql/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
        excludeVerboseContent: false,
      },
      environmentVariables: {
        QUEUE_NAME: QUEUE_NAME,
        ACCOUNT_ID: cdk.Stack.of(this).account,
      }
    });

    // create a DynamoDB Table  
    const notesTable = new dynamodb.Table(this, 'NotesTable', {
      tableName: 'my-notes-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const getNoteFunction = new appsync.AppsyncFunction(this, 'getNoteResolver', {
      name: 'getNoteResolver',
      api,
      dataSource: api.addDynamoDbDataSource('note-table-ds', notesTable),
      code: appsync.Code.fromAsset('src/resolvers/build/getNoteResolver.js'),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });

    new appsync.Resolver(this, 'pipeline-resolver-get-post', {
      api,
      typeName: 'Query',
      fieldName: 'getNote',
      code: appsync.Code.fromAsset('src/resolvers/build/pipelineResolver.js'),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNoteFunction],
    })

    const createUpdateNoteSqs = new sqs.Queue(this, 'CreateupdateNoteSqs', {
      queueName: QUEUE_NAME,
      fifo: true,
      contentBasedDeduplication: true,
      visibilityTimeout: cdk.Duration.seconds(30),
      retentionPeriod: cdk.Duration.days(4),
    });

    const createUpdateNoteDataSource = api.addHttpDataSource('create-update-note-ds', SQS_ENDPOINT, {
      authorizationConfig: {
        signingRegion: region,
        signingServiceName: 'sqs',
      },
    });

    const createUpdateNoteFunction = new appsync.AppsyncFunction(this, 'createUpdateNoteResolver', {
      name: 'createUpdateNoteResolver',
      api,
      dataSource: createUpdateNoteDataSource,
      code: appsync.Code.fromAsset('src/resolvers/build/createUpdateNoteResolver.js'),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });

    createUpdateNoteDataSource.node.addDependency(createUpdateNoteSqs);
    createUpdateNoteSqs.grantSendMessages(createUpdateNoteDataSource.grantPrincipal);

    new appsync.Resolver(this, 'pipeline-resolver-create-note', {
      api,
      typeName: 'Mutation',
      fieldName: 'createNote',
      code: appsync.Code.fromAsset('src/resolvers/build/pipelineResolver.js'),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [createUpdateNoteFunction],
    });

    new appsync.Resolver(this, 'pipeline-resolver-update-note', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateNote',
      code: appsync.Code.fromAsset('src/resolvers/build/pipelineResolver.js'),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [createUpdateNoteFunction],
    });

    const createUpdateLambda = new NodejsFunction(this, 'CreateUpdateNoteLambda', {
      functionName: 'create-update-note-lambda',
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'src/createUpdateLambda/index.js',
      handler: 'handler',
      environment: {
        NOTES_TABLE_NAME: notesTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      bundling: {
        minify: true,
        target: 'node22',
      }
    });

    createUpdateLambda.addEventSource(new eventSources.SqsEventSource(createUpdateNoteSqs));

    // Roles and permissions
    createUpdateNoteSqs.grantSendMessages(createUpdateLambda);
    notesTable.grantReadWriteData(createUpdateLambda);

    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
    });

    new cdk.CfnOutput(this, 'SqsQueueURL', {
      value: createUpdateNoteSqs.queueUrl,
    });
  }
}
