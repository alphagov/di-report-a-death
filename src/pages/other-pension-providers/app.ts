import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, updateSession } from './common/session';
import { Form, GatewayResult, parseForm } from './common/forms/forms';
import { ErrorCollection } from './common/forms/errors';
import { withErrorHandling } from './common/routing';
import { otherPensionProviderOptions, OtherPensionProviders } from './common/answer';

const otherPensionProvidersKey: keyof OtherPensionProviders = 'other-pension-providers';

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
    const session = await getSession(event);
    return renderAsHtmlResponse(event, 'template.njk', { session });
};

const post = (event: APIGatewayProxyEvent): GatewayResult =>
    parseForm(event, processForm(event), [otherPensionProvidersKey]);

const isValid = (options: string[], values: string[]) =>
    values.every((option) => {
        return options.includes(option);
    });

export const processForm =
    (event: APIGatewayProxyEvent) =>
    async (form: Form): Promise<APIGatewayProxyResult> => {
        const errors: ErrorCollection = {};

        function renderPageWithErrors() {
            return renderAsHtmlResponse(event, 'template.njk', { form, errors });
        }

        let otherPensionProvidersArray = form[otherPensionProvidersKey]?.split(',') || [];
        if (!(form[otherPensionProvidersKey] && isValid(otherPensionProviderOptions, otherPensionProvidersArray))) {
            errors[otherPensionProvidersKey] = { text: 'Select at least one pension or None' };
            return renderPageWithErrors();
        }

        const otherPensionProviders = new OtherProviders();
        otherPensionProviders[otherPensionProvidersKey] = otherPensionProvidersArray;

        // @ts-ignore
        await updateSession(event, otherPensionProviders);
        return {
            statusCode: 303,
            headers: {
                location: '/tasklist',
            },
            body: '',
        };
    };

class OtherProviders {
    'other-pension-providers': string[];
}
