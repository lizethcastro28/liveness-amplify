import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { myApiFunction } from "./functions/api-function/resource";
import { oauthFunction } from "./functions/oauth-function/resource";
import { configFunction } from "./functions/config-function/resource";

const backend = defineBackend({
  auth,
  data,
  myApiFunction,
  oauthFunction,
  configFunction,
});

//=============create a new API stack==============
const apiStack = backend.createStack("api-stack");

// create a new REST API
const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "firmaBiometricaApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS, 
  },
});

// ==============Create resource session============
// create a new Lambda integration
const lambdaIntegration = new LambdaIntegration(
  backend.myApiFunction.resources.lambda
);
// create a new resource path with IAM authorization
const sessionPath = myRestApi.root.addResource("session", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});
// add methods you would like to create to the resource path
sessionPath.addMethod("GET", lambdaIntegration);
sessionPath.addMethod("POST", lambdaIntegration);
// add a proxy resource path to the API
sessionPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});

// ==============Create resource getConfig============
// create a new Lambda integration
const lambdaConfigIntegration = new LambdaIntegration(
  backend.configFunction.resources.lambda
);
// create a new resource path with IAM authorization
const configPath = myRestApi.root.addResource("config", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});
// add methods you would like to create to the resource path
configPath.addMethod("GET", lambdaConfigIntegration);
// add a proxy resource path to the API
configPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaConfigIntegration,
});

// ==============Create resource oauth============
// create a new Lambda integration
const lambdaOauthIntegration = new LambdaIntegration(
  backend.oauthFunction.resources.lambda
);
// create a new resource path with IAM authorization
const oauthPath = myRestApi.root.addResource("oauth", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});
// add methods you would like to create to the resource path
oauthPath.addMethod("POST", lambdaOauthIntegration);
// add a proxy resource path to the API
oauthPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaOauthIntegration,
});

//================create a new Cognito User Pools authorizer
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

// create a new resource path with Cognito authorization
const booksPath = myRestApi.root.addResource("cognito-auth-path");
booksPath.addMethod("GET", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/session", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/session/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/data", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/data/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/cognito-auth-path", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/oauth", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/oauth/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/config", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/config/*", "dev")}`,
      ],
    })
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// create a new policy for Rekognition and S3 access
const rekognitionAndS3Policy = new Policy(apiStack, "RekognitionAndS3Policy", {
  statements: [
    new PolicyStatement({
      actions: [
        "rekognition:CreateFaceLivenessSession",
        "rekognition:StartFaceLivenessSession",
        "rekognition:GetFaceLivenessSessionResults",
      ],
      resources: ["*"],
    }),
    new PolicyStatement({
      actions: [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
      ],
      resources: ["arn:aws:s3:::video-signature3-images/*"],
    }),
  ],
});

// attach the policy to the Lambda execution role
const lambdaRole = backend.myApiFunction.resources.lambda.role as Role;
lambdaRole.attachInlinePolicy(rekognitionAndS3Policy);

const invokeLambdaPolicy = new Policy(apiStack, "InvokeLambdaPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: [
        "*"
      ],
    }),
  ],
});

// attach the policy to the Lambda execution role
const lambdaConfigRole = backend.configFunction.resources.lambda.role as Role;
lambdaConfigRole.attachInlinePolicy(invokeLambdaPolicy);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});
const livenessStack = backend.createStack("liveness-stack");

const livenessPolicy = new Policy(livenessStack, "LivenessPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["rekognition:StartFaceLivenessSession"],
      resources: ["*"],
    }),
  ],
});
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows guest user access
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(livenessPolicy);