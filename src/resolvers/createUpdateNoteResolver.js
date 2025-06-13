export function request(ctx) {
  const { args } = ctx;
  const message = {
    title: args.title,
    content: args.content,
  };
  if (args.id) {
    message.id = args.id;
    message.operation = "UpdateNote";
  } else {
    message.operation = "CreateNote";
  }

  const encodedMessage = encodeURI(message);
  return {
    version: "2018-05-29",
    method: "POST",
    resourcePath: "/",
    params: {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body:
        "Action=SendMessage&Version=2012-11-05&MessageBody=" + encodedMessage,
    },
  };
}

export function response(ctx) {
  console.log("Response from SQS:", ctx.result);
  return {};
}
