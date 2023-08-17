import { APIGatewayRequestAuthorizerEvent, Callback, Context } from 'aws-lambda';
import { APIGatewayAuthorizerResult } from 'aws-lambda/trigger/api-gateway-authorizer';

export const lambdaHandler = async (event: APIGatewayRequestAuthorizerEvent, _context: Context, callback: Callback) => {
    callback(null, buildAllowAllPolicy(event));
};

function buildAllowAllPolicy(event: APIGatewayRequestAuthorizerEvent): APIGatewayAuthorizerResult {
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
