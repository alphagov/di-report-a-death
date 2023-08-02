import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCookie } from './cookie';
import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { downcaseHeaders } from './headers';
import { randomUUID } from 'crypto';
import { Answer } from './answer';

const sessionTable = process.env.SESSION_TABLE;
const client = new DynamoDBClient({
    endpoint: process.env.DYNAMO_DB_ENDPOINT_OVERRIDE,
});
const dynamo = DynamoDBDocument.from(client);

const sessionCookieName = 'session';
export type SessionId = `${string}-${string}-${string}-${string}-${string}`;

export interface BaseSession {
    SessionId: SessionId;
    CreatedAt: number;
    UpdatedAt: number;
    Sub?: string;
}

export type Session = BaseSession & Answer;

export const NO_SESSION_ERROR_MESSAGE = 'No session.';

export async function getSession(event: APIGatewayProxyEvent): Promise<Session> {
    const sessionId = getSessionId(event);
    const response = await dynamo.send(
        new GetCommand({
            TableName: sessionTable,
            Key: { SessionId: sessionId },
        }),
    );
    if (response.Item === undefined) {
        throw new Error(NO_SESSION_ERROR_MESSAGE);
    }
    return response.Item as Session;
}

export async function checkOrCreateSessionId(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let sessionId: SessionId;
    try {
        sessionId = getSessionId(event);
        await writeSessionFieldForSessionId(sessionId, 'UpdatedAt', Date.now());
    } catch (e) {
        if (e instanceof Error && e.message === NO_SESSION_ERROR_MESSAGE) {
            const session = createNewSession();
            sessionId = session.SessionId;
            await writeNewSession(session);
        } else {
            throw e;
        }
    }

    return {
        statusCode: 200,
        headers: { 'set-cookie': `${sessionCookieName}=${sessionId}` },
        body: '',
    };
}

function createNewSession() {
    const timestamp = Date.now();
    const session: Session = {
        SessionId: randomUUID(),
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
    };
    return session;
}

function getSessionId(event: APIGatewayProxyEvent): SessionId {
    downcaseHeaders(event);
    const cookies = event.headers['cookie'];
    const sessionId = getCookie(cookies, sessionCookieName);
    if (sessionId == undefined) {
        throw new Error(NO_SESSION_ERROR_MESSAGE);
    }
    return sessionId as SessionId;
}

async function writeNewSession(session: Session) {
    return await dynamo.send(
        new PutCommand({
            TableName: sessionTable,
            Item: session,
            ConditionExpression: 'attribute_not_exists(SessionId)',
        }),
    );
}

export async function writeSessionField(
    event: APIGatewayProxyEvent,
    fieldName: keyof Session,
    fieldValue: Exclude<Session[keyof Session], undefined>,
): Promise<void> {
    const sessionId = getSessionId(event);
    await writeSessionFieldForSessionId(sessionId, fieldName, fieldValue);
}

async function writeSessionFieldForSessionId(
    sessionId: SessionId,
    fieldName: keyof Session,
    fieldValue: Session[keyof Session],
) {
    try {
        const updateExpression =
            fieldName === 'UpdatedAt' ? 'SET #FIELD = :value' : 'SET #FIELD = :value, UpdatedAt = :timestamp';
        const timestampValue = fieldName === 'UpdatedAt' ? {} : { ':timestamp': Date.now() };
        await dynamo.send(
            new UpdateCommand({
                TableName: sessionTable,
                Key: { SessionId: sessionId },
                ExpressionAttributeNames: {
                    '#FIELD': fieldName,
                },
                ExpressionAttributeValues: {
                    ':value': fieldValue,
                    ':id': sessionId,
                    ...timestampValue,
                },
                UpdateExpression: updateExpression,
                ConditionExpression: 'SessionId = :id',
                ReturnValues: 'NONE',
            }),
        );
    } catch (e) {
        if (e instanceof ConditionalCheckFailedException) {
            throw Error(NO_SESSION_ERROR_MESSAGE, { cause: e });
        } else {
            throw e;
        }
    }
}
