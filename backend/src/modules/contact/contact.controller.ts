import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import { getPagination } from "@/utils/query";

export const createContactMessage = catchAsync(async (req, res) => {
  const message = await prisma.contactMessage.create({ data: req.body });
  sendResponse(res, 201, { success: true, message: "Message submitted", data: { id: message.id } });
});

export const getContactMessages = catchAsync(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const [data, total] = await Promise.all([
    prisma.contactMessage.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.count()
  ]);

  sendResponse(res, 200, {
    success: true,
    message: "Messages fetched",
    data,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) }
  });
});
