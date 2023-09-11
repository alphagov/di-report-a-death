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

export interface DeceasedDetails {
    DeceasedName?: string;
}

export type Session = BaseSession & DeceasedDetails & Answer;

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
        await updateSessionWithId(sessionId, { UpdatedAt: Date.now() });
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
        DeceasedName: 'John Smith',
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

export async function updateSession(event: APIGatewayProxyEvent, partialSession: Partial<Session>) {
    const sessionId = getSessionId(event);
    await updateSessionWithId(sessionId, partialSession);
}

async function updateSessionWithId(sessionId: SessionId, partialSession: Partial<Session>) {
    partialSession.UpdatedAt ??= Date.now();
    const { expressionAttributeNames, expressionAttributeValues, updateExpression } = buildQueryParameters(
        sessionId,
        partialSession,
    );
    try {
        await dynamo.send(
            new UpdateCommand({
                TableName: sessionTable,
                Key: { SessionId: sessionId },
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
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

type ExpressionAttributeNames = Record<string, string>;
type ExpressionAttributeValues = Record<string, Session[keyof Session]>;
type UpdateExpression = string;
type QueryParameters = {
    expressionAttributeNames: ExpressionAttributeNames;
    expressionAttributeValues: ExpressionAttributeValues;
    updateExpression: UpdateExpression;
};

/**
 * Generate DynamoDB update query parameters from a partial session object
 * @param sessionId Primary key of the record to update
 * @param partialSession Field name: value pairs to update. Undefined values will be removed
 *
 * Given a partial session object, construct SET statements for all present values and REMOVE statements for all
 * undefined values.
 *
 * For example, given a sessionId of 1234, and a partial session of {a:1, b:undefined, c: 3}, this will return:
 * expressionAttributeNames: {'#F0': 'a', '#F1': 'b', '#F2': 'c'}
 * expressionAttributeValues: {':v0': 1, ':v2': 3}
 * updateExpression: "SET #F0 = :v0, #F2 = :v2, REMOVE #F1"
 */
function buildQueryParameters(sessionId: SessionId, partialSession: Partial<Session>): QueryParameters {
    const { expressionAttributeNames, expressionAttributeValues, updateAttributes, removeAttributes } = Object.entries(
        partialSession,
    ).reduce(
        (acc, [key, value], idx) => {
            const fieldName = `#F${idx}`;
            acc.expressionAttributeNames[fieldName] = key;
            if (value === undefined) {
                acc.removeAttributes.push(fieldName);
            } else {
                const valueName = `:v${idx}`;
                acc.expressionAttributeValues[valueName] = value;
                acc.updateAttributes.push(`${fieldName} = ${valueName}`);
            }
            return acc;
        },
        {
            expressionAttributeNames: {} as ExpressionAttributeNames,
            expressionAttributeValues: { ':id': sessionId } as ExpressionAttributeValues,
            updateAttributes: [] as string[],
            removeAttributes: [] as string[],
        },
    );
    const updateExpression = buildUpdateExpression(updateAttributes, removeAttributes);
    return { expressionAttributeNames, expressionAttributeValues, updateExpression };
}

function buildUpdateExpression(updateAttributes: string[], removeAttributes: string[]): string {
    // we can assume that updateAttributes is never empty because we always set UpdatedAt
    const updateClause = 'SET ' + updateAttributes.join(', ');
    return [updateClause, removeAttributes.join(', ')].filter((x) => x).join(' REMOVE ');
}
