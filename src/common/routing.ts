import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { NO_SESSION_ERROR_MESSAGE } from './session';
import { renderAsHtmlResponse } from './templating';

export type PromiseHandler<TEvent, TResult> = (event: TEvent, context: Context) => Promise<TResult>;

export type APIGatewayProxyPromiseHandler = PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>;

export function withErrorHandling(inner: APIGatewayProxyPromiseHandler): APIGatewayProxyPromiseHandler {
    return (event, context) =>
        inner(event, context).catch((e) => {
            console.log(e);
            switch (e.message) {
                case NO_SESSION_ERROR_MESSAGE:
                    return noSessionErrorResponse(event);
                default:
                    return internalServerErrorResponse(event);
            }
        });
}

function noSessionErrorResponse(event: APIGatewayProxyEvent): APIGatewayProxyResult {
    const response = renderAsHtmlResponse(event, 'no-session.njk');
    response.statusCode = 400;
    return response;
}

function internalServerErrorResponse(event: APIGatewayProxyEvent): APIGatewayProxyResult {
    const response = renderAsHtmlResponse(event, 'internal-server-error.njk');
    response.statusCode = 500;
    return response;
}
