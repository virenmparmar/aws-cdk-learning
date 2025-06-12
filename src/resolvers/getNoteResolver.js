import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const {
    arguments: { id },
  } = ctx;
  if (!id) {
    util.error("Missing required field: name", "BadRequest");
  }
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ id }),
  };
}

export function response(ctx) {
  return ctx.result.items;
}
