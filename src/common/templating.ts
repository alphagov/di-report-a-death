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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function render(templateName: string, templateVars: object, _event: APIGatewayProxyEvent): string {
    const nunjucks = configure(['.', './common/templates', '../../node_modules/govuk-frontend/']);
    nunjucks.addFilter('summariseErrors', summariseErrors);
    nunjucks.addFilter('formatNationalInsuranceNumber', formatNationalInsuranceNumber);

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

export function formatNationalInsuranceNumber(nationalInsuranceNumber: string | undefined): string | undefined {
    if (nationalInsuranceNumber === undefined) {
        return;
    }
    return nationalInsuranceNumber.match(/.{1,2}/g)!.join(' ');
}
