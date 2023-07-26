import {APIGatewayProxyEvent} from 'aws-lambda';
import {getCookie} from './cookie';
import {AttributeValue, DynamoDBClient, GetItemCommand, UpdateItemCommand} from '@aws-sdk/client-dynamodb';
import {downcaseHeaders} from './headers';

const sessionTable = process.env.SESSION_TABLE;
const client = new DynamoDBClient({
    endpoint: process.env.DYNAMO_DB_ENDPOINT_OVERRIDE,
});

export async function getSession(event: APIGatewayProxyEvent): Promise<Record<string, AttributeValue>> {
    const sessionId = getSessionId(event);
    const input = {
        TableName: sessionTable,
        Key: {
            SessionId: {
                S: sessionId,
            },
        },
    };
    const command = new GetItemCommand(input);
    const response = await client.send(command);
    return response.Item ?? {};
}

function getSessionId(event: APIGatewayProxyEvent): string {
    downcaseHeaders(event);
    const cookies = event.headers['cookie'];
    const sessionId = getCookie(cookies, 'session');
    if (sessionId == undefined) {
        throw new Error(NO_SESSION_ERROR_MESSAGE);
    }
    return sessionId;
}

export const NO_SESSION_ERROR_MESSAGE = 'No session.';

export async function writeSessionField(
    event: APIGatewayProxyEvent,
    fieldName: string,
    fieldValue: string,
): Promise<void> {
    const sessionId = getSessionId(event);
    const command = new UpdateItemCommand({
        TableName: sessionTable,
        Key: {
            SessionId: {
                S: sessionId,
            },
        },
        ExpressionAttributeNames: {
            '#FIELD': fieldName,
        },
        ExpressionAttributeValues: {
            ':value': {
                S: fieldValue,
            },
        },
        UpdateExpression: 'SET #FIELD = :value',
        ReturnValues: 'NONE',
    });
    await client.send(command);
    return;
}
