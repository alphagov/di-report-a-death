import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getSessionId } from './common/cookie';
import { renderAsHtmlResponse } from './common/templating';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod.toUpperCase();
    if (method === 'GET') {
        return get(event);
    } else if (method == 'POST') {
        return post(event);
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({
                message: 'Method not allowed: ' + method,
            }),
        };
    }
};

const get = (event: APIGatewayProxyEvent): APIGatewayProxyResult => {
    const cookies = event.headers['Cookie'];
    const sessionId = getSessionId(cookies);
    try {
        return renderAsHtmlResponse(event, 'template.njk', { sessionId: 'static-value', answer: 'scotland' });
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};

const post = (event: APIGatewayProxyEvent): APIGatewayProxyResult => {
    const answer = event.body?.split('=')[1];
    try {
        return {
            statusCode: 303,
            headers: {
                location: 'hello',
                'set-cookie': `answer=${answer}; Secure; HttpOnly`,
            },
            body: '',
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
