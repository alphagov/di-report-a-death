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
    return renderAsHtmlResponse(event, 'template.njk', { ...publicSectorPensionsStatus(session), session });
};

export const publicSectorPensionsStatus = (session: Session): { publicSectorPensionStatus: string } => {
    if (session['national-insurance-number'] === undefined) {
        return { publicSectorPensionStatus: 'cannot-start-yet' };
    }
    if (session['pension-providers'] === undefined) {
        return { publicSectorPensionStatus: 'not-started' };
    }
    if (session['pension-providers'] && session['tell-civil-service-pension']) {
        return { publicSectorPensionStatus: 'completed' };
    }
    return { publicSectorPensionStatus: 'in-progress' };
};
