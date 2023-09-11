import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, Session, updateSession } from './common/session';
import { withErrorHandling } from './common/routing';
import { Form, GatewayResult, parseForm } from './common/forms/forms';
import { ErrorCollection } from './common/forms/errors';
import { includes, NationalInsuranceNumber, NationalInsuranceNumberKnown } from './common/answer';

const nationalInsuranceNumberKnownKey: keyof NationalInsuranceNumberKnown = 'national-insurance-number-known';
const nationalInsuranceNumberKey: keyof NationalInsuranceNumber = 'national-insurance-number';
const valid_options: ReadonlyArray<NationalInsuranceNumberKnown['national-insurance-number-known']> = ['yes', 'no'];

export const lambdaHandler = withErrorHandling(async (event) => {
    const method = event.httpMethod.toUpperCase();
    if (method === 'GET') {
        return get(event);
    } else if (method === 'POST') {
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
    parseForm(event, processForm(event), [nationalInsuranceNumberKey, nationalInsuranceNumberKnownKey]);

export const processForm =
    (event: APIGatewayProxyEvent) =>
    async (form: Form): Promise<APIGatewayProxyResult> => {
        const sessionPromise = getSession(event);

        const errors: ErrorCollection = {};
        function renderPageWithErrors() {
            return renderAsHtmlResponse(event, 'template.njk', { form, errors });
        }

        if (
            !(form[nationalInsuranceNumberKnownKey] && includes(valid_options, form[nationalInsuranceNumberKnownKey]))
        ) {
            errors[nationalInsuranceNumberKnownKey] = { text: 'Select an option' };
            return renderPageWithErrors();
        }
        if (form[nationalInsuranceNumberKnownKey] === 'yes' && !form[nationalInsuranceNumberKey]) {
            errors[nationalInsuranceNumberKey] = { text: 'Enter a National Insurance number' };
            return renderPageWithErrors();
        }

        if (form[nationalInsuranceNumberKnownKey] === 'yes') {
            const nationalInsuranceNumberRegex = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z][0-9]{6}[A-DFM]?$/;
            form[nationalInsuranceNumberKey] = form[nationalInsuranceNumberKey]!.toUpperCase().replaceAll(
                /[^A-Z0-9]/g,
                '',
            );
            if (!form[nationalInsuranceNumberKey].match(nationalInsuranceNumberRegex)) {
                errors[nationalInsuranceNumberKey] = {
                    text: 'Enter a valid National Insurance number, like ‘QQ 12 34 56 A’',
                };
                return renderPageWithErrors();
            }
        }

        const unsetOptions: Partial<Session> = {};

        if (form[nationalInsuranceNumberKnownKey] === 'no') {
            unsetOptions[nationalInsuranceNumberKey] = undefined;
        }

        const session = await sessionPromise;
        if (
            form[nationalInsuranceNumberKey] &&
            form[nationalInsuranceNumberKey] !== session[nationalInsuranceNumberKey]
        ) {
            // Changed national insurance number so clear pension options
            unsetOptions['pensions-to-tell'] = undefined;
        }

        await updateSession(event, { ...form, ...unsetOptions });
        return {
            statusCode: 303,
            headers: {
                location: '/public-sector-pensions',
            },
            body: '',
        };
    };
