import type { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
};

export function sendResponse<T>(res: Response, statusCode: number, payload: ApiResponse<T>) {
  res.status(statusCode).json(payload);
}
