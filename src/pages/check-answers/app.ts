import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession } from './common/session';
import { withErrorHandling } from './common/routing';

export const lambdaHandler = withErrorHandling(async (event) => {
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
});

const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const session = await getSession(event);
        return renderAsHtmlResponse(event, 'template.njk', {
            session,
            mapping: {
                'where-do-you-live': {
                    england: 'England',
                    scotland: 'Scotland',
                    'northern-ireland': 'Northern Ireland',
                    wales: 'Wales',
                },
                'tell-civil-service-pension': {
                    yes: 'Yes',
                    no: 'No',
                },
            },
        });
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
    try {
        return {
            statusCode: 303,
            headers: {
                location: '/submitted',
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
