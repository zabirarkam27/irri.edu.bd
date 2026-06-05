import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.parse({ body: req.body, query: req.query, params: req.params });
    req.body = parsed.body ?? req.body;
    req.query = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;
    next();
  };
}
