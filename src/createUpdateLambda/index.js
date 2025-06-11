
const handler = async (event, context) => {
    console.log("Event: ", JSON.stringify(event, null, 2));
    console.log("Context: ", JSON.stringify(context, null, 2));

    // Simulate some processing
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "Lambda function executed successfully",
            input: event
        }),
    };

    return response;
}

module.exports = {
    handler
}