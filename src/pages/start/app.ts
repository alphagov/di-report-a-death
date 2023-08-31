import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { withErrorHandling } from './common/routing';
import { checkOrCreateSessionId } from './common/session';

export const lambdaHandler = withErrorHandling(async (event) => {
    const method = event.httpMethod.toUpperCase();
    switch (method) {
        case 'GET':
            return get(event);
        case 'POST':
            return post(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({
                    message: 'Method not allowed: ' + method,
                }),
            };
    }
});
const get = async (event: APIGatewayProxyEvent) => renderAsHtmlResponse(event, 'template.njk');

const post = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const response = await checkOrCreateSessionId(event);
    response.statusCode = 303;
    response.headers = { ...response.headers, location: '/check-answers' };
    return response;
};
