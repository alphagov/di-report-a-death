import { APIGatewayProxyEvent } from 'aws-lambda';
import { getSessionId } from './cookie';
import { AttributeValue, DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { downcaseHeaders } from './headers';

const sessionTable = process.env.SESSION_TABLE;
const client = new DynamoDBClient({
    endpoint: process.env.DYNAMO_DB_ENDPOINT_OVERRIDE,
});

export async function getSession(event: APIGatewayProxyEvent): Promise<Record<string, AttributeValue>> {
    downcaseHeaders(event);
    const cookies = event.headers['cookie'];
    const sessionId = getSessionId(cookies);
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

export async function writeSessionField(
    event: APIGatewayProxyEvent,
    fieldName: string,
    fieldValue: string,
): Promise<void> {
    downcaseHeaders(event);
    const cookies = event.headers['cookie'];
    const sessionId = getSessionId(cookies);
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
