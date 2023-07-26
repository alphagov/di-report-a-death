import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { configure } from 'nunjucks';
import { ErrorCollection } from './forms/errors';

export function renderAsHtmlResponse(
    event: APIGatewayProxyEvent,
    templateName: string,
    templateVars: object = {},
): APIGatewayProxyResult {
    const headers: { [header: string]: boolean | number | string } = {
        'Content-Type': 'text/html',
    };

    return {
        statusCode: 200,
        headers: headers,
        body: render(templateName, templateVars, event),
    };
}

function render(templateName: string, templateVars: object, event: APIGatewayProxyEvent): string {
    const nunjucks = configure(['.', './common/templates', '../../node_modules/govuk-frontend/']);
    nunjucks.addFilter('summariseErrors', summariseErrors);

    nunjucks.addGlobal('assetPath', process.env.ASSET_PATH);

    return nunjucks.render(templateName, templateVars);
}

function summariseErrors(errors: ErrorCollection) {
    return Object.keys(errors).map((key) => {
        return {
            ...errors[key],
            href: errors[key].href ?? `#${key}`,
        };
    });
}
