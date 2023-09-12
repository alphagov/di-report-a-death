import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession } from './common/session';
import { withErrorHandling } from './common/routing';
import { OtherPensionProviderOptions } from 'common/answer';

export const OtherPensionProvidersMap: { [k in OtherPensionProviderOptions]: string } = {
    civil: 'Civil Service Pension Scheme',
    armed: 'Armed Forces Pension Scheme',
    compensation: 'Armed Forces Compensation Scheme',
    war: 'War Pension Scheme',
    none: 'None',
};
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
            answers: {
                'other-pension-providers': session['other-pension-providers']?.map(
                    (provider) => OtherPensionProvidersMap[provider],
                ),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const post = (_event: APIGatewayProxyEvent): APIGatewayProxyResult => {
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
