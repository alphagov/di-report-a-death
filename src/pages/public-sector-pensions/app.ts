import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, Session, updateSession } from './common/session';
import { withErrorHandling } from './common/routing';
import { Form, GatewayResult, parseForm } from './common/forms/forms';
import { ErrorCollection } from './common/forms/errors';
import { PensionProviders } from './common/answer';
import { publicSectorPensionsMapping } from './common/mappings';

const pensionsToTellKey: keyof PensionProviders = 'pensions-to-tell';
const tellPensionKey = 'tell-pension';
const templateKey = 'template';

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

function nationalInsuranceNumberGiven(
    session: Session,
): session is Session & Required<Pick<Session, 'national-insurance-number'>> {
    return session['national-insurance-number-known'] === 'yes' && session['national-insurance-number'] !== undefined;
}

const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const session = await getSession(event);
    if (!nationalInsuranceNumberGiven(session)) {
        return {
            statusCode: 303,
            headers: {
                location: '/national-insurance-number',
            },
            body: '',
        };
    }

    // TODO: Replace with real pension logic
    const nationalInsuranceNumber = session['national-insurance-number'];
    if (nationalInsuranceNumber[0] === 'A') {
        return renderAsHtmlResponse(event, 'pension-found.njk', { session, publicSectorPensionsMapping });
    }
    if (nationalInsuranceNumber[0] === 'B') {
        return renderAsHtmlResponse(event, 'multiple-pensions-found.njk', { session, publicSectorPensionsMapping });
    }
    return renderAsHtmlResponse(event, 'no-pension-found.njk', { session, publicSectorPensionsMapping });
};

const post = (event: APIGatewayProxyEvent): GatewayResult =>
    parseForm(event, processForm(event), [tellPensionKey, pensionsToTellKey, 'template']);

export const processForm =
    (event: APIGatewayProxyEvent) =>
    async (form: Form): Promise<APIGatewayProxyResult> => {
        if (form['template'] === 'pension-found.njk') {
            return processSingleForm(event, form);
        }
        if (form['template'] === 'multiple-pensions-found.njk') {
            return processMultipleForms(event, form);
        }
        if (form['template'] === 'no-pension-found.njk') {
            return processNoPensionFound(event);
        }
        return {
            statusCode: 303,
            headers: {
                location: '/public-sector-pensions',
            },
            body: '',
        };
    };

const processSingleForm = async (event: APIGatewayProxyEvent, form: Form): Promise<APIGatewayProxyResult> => {
    const errors: ErrorCollection = {};
    function renderPageWithErrors() {
        return renderAsHtmlResponse(event, form['template']!, { form, errors, publicSectorPensionsMapping });
    }

    if (form[tellPensionKey] === undefined) {
        errors[tellPensionKey] = { text: 'Select an option' };
        return renderPageWithErrors();
    }
    const partialSession: Partial<Session> = {
        [pensionsToTellKey]: form[tellPensionKey] === 'yes' ? ['croydon'] : [],
    };

    await updateSession(event, partialSession);
    return {
        statusCode: 303,
        headers: {
            location: '/tasklist',
        },
        body: '',
    };
};
const processMultipleForms = async (event: APIGatewayProxyEvent, form: Form): Promise<APIGatewayProxyResult> => {
    const errors: ErrorCollection = {};
    function renderPageWithErrors() {
        return renderAsHtmlResponse(event, form[templateKey]!, { form, errors, publicSectorPensionsMapping });
    }

    if (form[pensionsToTellKey] === undefined) {
        errors[pensionsToTellKey] = { text: 'Select pension providers or ‘None’' };
        return renderPageWithErrors();
    }
    const pensionsList = form[pensionsToTellKey].split(',');

    if (pensionsList.length > 1 && pensionsList.includes('none')) {
        errors[pensionsToTellKey] = { text: 'Select the pension providers to tell, or select ‘None’' };
        return renderPageWithErrors();
    }

    if (pensionsList.includes('none')) {
        // represent 'none' as empty list
        pensionsList.pop();
    }

    const partialSession = { [pensionsToTellKey]: pensionsList };

    await updateSession(event, partialSession);
    return {
        statusCode: 303,
        headers: {
            location: '/tasklist',
        },
        body: '',
    };
};

const processNoPensionFound = async (event: APIGatewayProxyEvent) => {
    await updateSession(event, { 'pensions-to-tell': [] });
    return {
        statusCode: 303,
        headers: {
            location: '/tasklist',
        },
        body: '',
    };
};
