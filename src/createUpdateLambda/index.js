import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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
    return { statusCode: 200, body: JSON.stringify({ ddbObject }) };
  } catch (err) {
    console.error("Error putting item in DDB:", err);
    return { statusCode: 400, error: err.message };
  }
};

const handler = async (event, context) => {
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

    // Here you can add your logic to handle each record
    // For example, you might want to parse the message body
    const messageBody = JSON.parse(record.body);
    console.log("Message Body:", messageBody);

    switch (messageBody.operation) {
      case "CreateNote":
        // Add your logic to create a note
        createNote(messageBody);
        break;
      case "UpdateNote":
        // Add your logic to update a note
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
