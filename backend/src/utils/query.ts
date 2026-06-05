export function getPagination(query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit
  };
}

export function getSort(query: Record<string, unknown>, allowedFields = ["createdAt"]) {
  const requestedSortBy = String(query.sortBy ?? "createdAt");
  const sortBy = allowedFields.includes(requestedSortBy) ? requestedSortBy : "createdAt";
  const sortOrder = String(query.sortOrder ?? "desc") === "asc" ? "asc" : "desc";
  return { [sortBy]: sortOrder };
}
