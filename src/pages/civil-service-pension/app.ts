import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, updateSession } from './common/session';
import { Form, GatewayResult, parseForm } from './common/forms/forms';
import { ErrorCollection } from './common/forms/errors';
import { withErrorHandling } from './common/routing';
import { includes, TellCivilServicePension } from './common/answer';

const form_key: keyof TellCivilServicePension = 'tell-civil-service-pension';
const valid_options: ReadonlyArray<TellCivilServicePension['tell-civil-service-pension']> = ['yes', 'no'];

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

const post = (event: APIGatewayProxyEvent): GatewayResult => {
    return parseForm(event, processForm(event), [form_key]);
};

const processForm =
    (event: APIGatewayProxyEvent) =>
    async (form: Form): Promise<APIGatewayProxyResult> => {
        const errors: ErrorCollection = {};
        function renderPageWithErrors() {
            return renderAsHtmlResponse(event, 'template.njk', { form, errors });
        }

        if (!(form[form_key] && includes(valid_options, form[form_key]))) {
            errors[form_key] = { text: 'Choose either Yes, No or Skip for now' };
            return renderPageWithErrors();
        }
        await updateSession(event, form);
        return {
            statusCode: 303,
            headers: {
                location: '/check-answers',
            },
            body: '',
        };
    };
