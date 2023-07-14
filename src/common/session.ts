import {APIGatewayProxyEvent} from "aws-lambda";
import {getSessionId} from "./cookie";
import {AttributeValue, DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";

export async function getSession(event: APIGatewayProxyEvent): Promise<Record<string, AttributeValue>> {
    const cookies = event.headers['Cookie'];
    const sessionId = getSessionId(cookies);
    const sessionTable = process.env.SESSION_TABLE
    const client = new DynamoDBClient({})
    const input = {
        TableName: sessionTable,
        Key: {
            "SessionId": {
                "S": sessionId
            }
        }
    }
    const command = new GetItemCommand(input)
    const response = await client.send(command)
    return response.Item ?? {}
}