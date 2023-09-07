import { updateSession } from '../session';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBDocument, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const event = { headers: { cookie: 'session=1234' } } as unknown as APIGatewayProxyEvent;
const dynamoMock = mockClient(DynamoDBDocument);

beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2023-01-05') });
});
afterAll(() => {
    jest.useRealTimers();
});

beforeEach(() => {
    dynamoMock.reset();
});

describe('updateSession', () => {
    it('generates the correct update parameters', () => {
        updateSession(event, {
            'national-insurance-number-known': 'no',
            'national-insurance-number': undefined,
            'other-pension-providers': 'war',
        });
        const updateCommand: UpdateCommand = dynamoMock.calls()[0].args[0] as unknown as UpdateCommand;
        expect(updateCommand.input.ExpressionAttributeNames).toEqual({
            '#F0': 'national-insurance-number-known',
            '#F1': 'national-insurance-number',
            '#F2': 'other-pension-providers',
            '#F3': 'UpdatedAt',
        });
        expect(updateCommand.input.ExpressionAttributeValues).toEqual({
            ':id': '1234',
            ':v0': 'no',
            ':v2': 'war',
            ':v3': Date.now(),
        });
        expect(updateCommand.input.UpdateExpression).toEqual('SET #F0 = :v0, #F2 = :v2, #F3 = :v3, REMOVE #F1');
    });

    it('allows setting UpdatedAt', () => {
        updateSession(event, { UpdatedAt: 123456 });
        const updateCommand: UpdateCommand = dynamoMock.calls()[0].args[0] as unknown as UpdateCommand;
        expect(updateCommand.input.ExpressionAttributeNames).toEqual({ '#F0': 'UpdatedAt' });
        expect(updateCommand.input.ExpressionAttributeValues).toEqual({ ':v0': 123456, ':id': '1234' });
        expect(updateCommand.input.UpdateExpression).toEqual('SET #F0 = :v0');
    });
});
