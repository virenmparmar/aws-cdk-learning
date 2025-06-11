# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


# CDK Prep Challenge
 
Developers are often asked to build infrastructure in AWS. This challenge is designed to help developers learn and earn experience around developing infrastructure with CDK.
 
## Description
 
This challenge will help you learn about the following:
 
* How to use CDK to build infrastructure
* How to use CDK to deploy infrastructure
* Configuring and deploying commonly used resources such as:
    * Lambda Functions
    * DynamoDB Tables
    * AppSync GraphQL APIs
    * IAM Roles
    * SQS Queues
    * CloudWatch Logs
 
## Requirements
 
Build and Deploy a CDK APP that matches the following requirements
 
* Create at least one DynamoDB table
* Create at least one Lambda function
* Create one AppSync GraphQL API
* Create one SQS Queue
* The AppSync API should have two different operations:
    * One operation that pushes a message to SQS, which will eventually trigger a Lambda function to store the message in DynamoDB
    * One operation that relies on a JS resolver to retrieve the DynamoDB items
* Resources should be created using L1 or L2 Constructs
* Configure cdk-nag at the root of the CDK Application
* Your application should be compliant with the AWS Solutions rule pack
* All resources should be tagged with:
    * `Challenge: CDK Prep Challenge`
    * `Developer: <Your Name>`
* The Assets (Code) required for the Lambda functions and JS resolvers should be correctly bundled and minified