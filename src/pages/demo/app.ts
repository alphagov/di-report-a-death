import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {renderAsHtmlResponse} from './common/templating';
import {getSession} from "./common/session";

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

const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const session = await getSession(event)
    try {
        return renderAsHtmlResponse(
            event,
            'template.njk',
            { session: JSON.stringify(session), answer: 'scotland' }
        );
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
