import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, writeSessionField } from './common/session';
import { Form, GatewayResult, parseForm } from './common/forms/forms';
import { ErrorCollection } from './common/forms/errors';
import {withErrorHandling} from "./common/routing";

const form_key = 'where-do-you-live';
const valid_options = ['england', 'scotland', 'wales', 'northern-ireland'];

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
    try {
        return renderAsHtmlResponse(event, 'template.njk', { session });
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

const post = (event: APIGatewayProxyEvent): GatewayResult => {
    try {
        return parseForm(event, processForm(event));
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
};

const processForm =
    (event: APIGatewayProxyEvent) =>
    async (form: Form): Promise<APIGatewayProxyResult> => {
        const errors: ErrorCollection = {};
        function renderPageWithErrors() {
            return renderAsHtmlResponse(event, 'template.njk', { form, errors });
        }

        if (!(form[form_key] && valid_options.includes(form[form_key]))) {
            errors[form_key] = { text: 'Select the country where you live' };
            return renderPageWithErrors();
        }
        await writeSessionField(event, form_key, form[form_key]);
        return {
            statusCode: 303,
            headers: {
                location: '/check-answers',
            },
            body: '',
        };
    };
