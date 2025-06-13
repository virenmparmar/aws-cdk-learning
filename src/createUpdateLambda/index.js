import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const createNote = async (messageBody) => {
  const ddbObject = {
    title: messageBody.title,
    content: messageBody.content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: uuidv4(),
  };

  const params = {
    TableName: process.env.NOTES_TABLE_NAME,
    Item: ddbObject,
  };

  try {
    await client.send(new PutCommand(params));
    console.log("Item successfully put in DDB:", ddbObject);
    return { statusCode: 200, body: JSON.stringify({ ddbObject }) };
  } catch (err) {
    console.error("Error putting item in DDB:", err);
    return { statusCode: 400, error: err.message };
  }
};

const updateNode = async (messageBody) => {
  const ddbObject = {
    title: messageBody.title,
    content: messageBody.content,
    updatedAt: new Date().toISOString(),
  };

  const params = {
    TableName: process.env.NOTES_TABLE_NAME,
    Key: { id: messageBody.id },
    UpdateExpression:
      "set #title = :title, #content = :content, #updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#title": "title",
      "#content": "content",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":title": ddbObject.title,
      ":content": ddbObject.content,
      ":updatedAt": ddbObject.updatedAt,
    },
  };
  console.log("Update params:", JSON.stringify(params, null, 2));
  try {
    await client.send(new UpdateCommand(params));
    console.log("Item successfully updated in DDB:", ddbObject);
    return { statusCode: 200, body: JSON.stringify({ ddbObject }) };
  } catch (err) {
    console.error("Error updating item in DDB:", err);
    return { statusCode: 400, error: err.message };
  }
};

const handler = async (event, context) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  const { Records } = event;

  if (!Records || Records.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No records found in the event",
      }),
    };
  }

  for (const record of Records) {
    console.log("Processing record:", record);
    const messageBody = JSON.parse(record.body);
    console.log("Message Body:", messageBody);

    switch (messageBody.operation) {
      case "CreateNote":
        await createNote(messageBody);
        break;
      case "UpdateNote":
        await updateNode(messageBody);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No records found in the event",
          }),
        };
    }
  }

  // Simulate some processing

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Lambda function executed successfully",
      input: event,
    }),
  };

  return response;
};

module.exports = {
  handler,
};
