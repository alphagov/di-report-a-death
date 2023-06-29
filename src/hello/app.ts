import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import * as nunjucks from "nunjucks"
import {getSessionId, getCookie} from "./common/cookie";

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
    if (event.httpMethod === "GET") {
        return get(event)
    }
    return post(event)
};

const get = (event: APIGatewayProxyEvent): APIGatewayProxyResult => {
    const cookies = event.headers["Cookie"]
    const sessionId = getSessionId(cookies);
    try {
        return {
            statusCode: 200,
            headers: {
                "content-type": "text/html"
            },
            multiValueHeaders: {
                "set-cookie": [`session=${sessionId}; Max-Age=120; Secure; HttpOnly`, "other=5"]
            },
            body: nunjucks.render("template.njk", {sessionId: sessionId, answer: getCookie(cookies, "answer")}),
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
}

const post = (event: APIGatewayProxyEvent): APIGatewayProxyResult => {
    const answer = event.body?.split("=")[1]
    try {
        return {
            statusCode: 303,
            headers: {
                "location": "/hello",
                "set-cookie": `answer=${answer}`
            },
            body: ""
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
}