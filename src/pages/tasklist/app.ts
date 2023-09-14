import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { renderAsHtmlResponse } from './common/templating';
import { getSession, Session } from './common/session';
import { withErrorHandling } from './common/routing';

export const lambdaHandler = withErrorHandling(async (event) => {
    const method = event.httpMethod.toUpperCase();
    if (method === 'GET') {
        return get(event);
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
    return renderAsHtmlResponse(event, 'template.njk', {
        ...publicSectorPensionsStatus(session),
        ...checkAnswersStatus(session),
        session,
    });
};

export const publicSectorPensionsStatus = (session: Session): { publicSectorPensionStatus: string } => {
    if (session['national-insurance-number-known'] === undefined) {
        return { publicSectorPensionStatus: 'cannot-start-yet' };
    }
    if (session['pensions-to-tell'] === undefined) {
        return { publicSectorPensionStatus: 'not-started' };
    }
    if (session['pensions-to-tell'] && session['other-pension-providers']) {
        return { publicSectorPensionStatus: 'completed' };
    }
    return { publicSectorPensionStatus: 'in-progress' };
};

export const checkAnswersStatus = (session: Session): { checkAnswersStatus: string } => {
    if (session['national-insurance-number-known'] === undefined) {
        return { checkAnswersStatus: 'cannot-start-yet' };
    }
    if (session['pensions-to-tell'] === undefined && session['other-pension-providers'] == undefined) {
        return { checkAnswersStatus: 'not-started' };
    }
    if (
        session['national-insurance-number-known'] &&
        session['pensions-to-tell'] &&
        session['other-pension-providers']
    ) {
        return { checkAnswersStatus: 'completed' };
    }
    return { checkAnswersStatus: 'in-progress' };
};
