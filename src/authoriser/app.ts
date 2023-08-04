import { APIGatewayTokenAuthorizerEvent, Callback, Context } from 'aws-lambda';
import { APIGatewayAuthorizerResult } from 'aws-lambda/trigger/api-gateway-authorizer';

export const lambdaHandler = async (
    event: APIGatewayTokenAuthorizerEvent,
    _context: Context,
    callback: Callback<void>,
) => {
    if (process.env.Environment === 'prod') {
        return buildAllowAllPolicy(event);
    }

    if (event.authorizationToken === 'Basic dXNlcjpwYXNz') {
        // These credentials are in no way secret. Having them in the code is not an issue.
        // The purpose of protecting the non-production environments is so that people don't mistake them for a real service.
        // This is in line with advice around prototypes: https://prototype-kit.service.gov.uk/docs/publishing#setting-a-password
        return buildAllowAllPolicy(event);
    }
    console.log(event.authorizationToken);
    return callback('Unauthorized');
};

function buildAllowAllPolicy(event: APIGatewayTokenAuthorizerEvent): APIGatewayAuthorizerResult {
    const methodArnParts = event.methodArn.split(':');
    const apiGatewayArnParts = methodArnParts[5].split('/');
    const awsAccountId = methodArnParts[4];
    const awsRegion = methodArnParts[3];
    const restApiId = apiGatewayArnParts[0];
    const stage = apiGatewayArnParts[1];
    const apiArn = 'arn:aws:execute-api:' + awsRegion + ':' + awsAccountId + ':' + restApiId + '/' + stage + '/*/*';
    return {
        principalId: 'anon-with-basic-auth',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: [apiArn],
                },
            ],
        },
    };
}
