export function request(ctx) {
  return {
    operation: "Scan",
  };
}

export function response(ctx) {
  const { result } = ctx;
  if (!result || !result.items) {
    return [];
  }
  return result.items.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}
