import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import * as nunjucks from "nunjucks"
import fs from "fs"

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

nunjucks.configure([".", "node_modules/govuk-frontend/"], {autoescape: true})

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(fs.readdirSync("."))
    try {
        return {
            statusCode: 200,
            headers: {"content-type": "text/html"},
            body: nunjucks.render("template.njk"),
        };
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
