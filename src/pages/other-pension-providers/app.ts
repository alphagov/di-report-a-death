import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, updateSession } from './common/session';
import { Form, GatewayResult, parseForm } from './common/forms/forms';
import { ErrorCollection } from './common/forms/errors';
import { withErrorHandling } from './common/routing';
import {
    includes,
    OtherPensionProviderOptions,
    OtherPensionProviders,
    OtherPensionProvidersMap,
} from './common/answer';

const otherPensionProvidersKey: keyof OtherPensionProviders = 'other-pension-providers';

const items: object[] = Object.entries(OtherPensionProvidersMap).map(([value, text]) => ({ value, text }));
items.push({ divider: 'or' });
items.push({ value: 'none', text: 'None', behaviour: 'exclusive' });

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
    return renderAsHtmlResponse(event, 'template.njk', { items, session });
};

const post = (event: APIGatewayProxyEvent): GatewayResult =>
    parseForm(event, processForm(event), ['other-pension-providers']);

export const processForm =
    (event: APIGatewayProxyEvent) =>
    async (form: Form): Promise<APIGatewayProxyResult> => {
        const errors: ErrorCollection = {};

        function renderPageWithErrors() {
            return renderAsHtmlResponse(event, 'template.njk', { form, errors, items });
        }
        const otherPensionProvidersArray = form[otherPensionProvidersKey]?.split(',') || [];

        if (otherPensionProvidersArray.length == 0 || !optionsAreValid(otherPensionProvidersArray)) {
            errors[otherPensionProvidersKey] = { text: 'Select at least one pension or "None"' };
            return renderPageWithErrors();
        }

        if (includes(otherPensionProvidersArray, 'none') && otherPensionProvidersArray.length > 1) {
            errors[otherPensionProvidersKey] = { text: 'Please select either "None" or one other pension' };
            return renderPageWithErrors();
        }

        if (includes(otherPensionProvidersArray, 'none')) {
            otherPensionProvidersArray.pop();
        }

        await updateSession(event, {
            'other-pension-providers': otherPensionProvidersArray,
        });
        return {
            statusCode: 303,
            headers: {
                location: '/tasklist',
            },
            body: '',
        };
    };

const optionsAreValid = (
    otherPensionProvidersArray: string[],
): otherPensionProvidersArray is OtherPensionProviderOptions[] => {
    return otherPensionProvidersArray.every((option) => {
        return includes(Object.values(OtherPensionProviderOptions), option);
    });
};
