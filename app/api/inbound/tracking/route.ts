import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateInboundDto } from "@/types/inbound";
import { apiResponse } from "@/helper/apiResponse";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return apiResponse.badRequest("ID required");

  const inbound = await prisma.inbound.findUnique({ where: { id } });
  if (!inbound) return apiResponse.notFound("Inbound not found");

  return apiResponse.success(inbound);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, receiveDate, itemCheckingDate, storedDate, canceledDate, updatedBy } = body;

    if (!id) return apiResponse.badRequest("Inbound ID is required");

    const existing = await prisma.inbound.findUnique({ where: { id } });
    if (!existing) return apiResponse.notFound("Inbound not found");

    const updatedData: UpdateInboundDto = {
      updatedBy: updatedBy ?? "administrator",
    };

    if (receiveDate) updatedData.receiveDate = new Date(receiveDate).toISOString();
    if (itemCheckingDate) updatedData.itemCheckingDate = new Date(itemCheckingDate).toISOString();
    if (storedDate) updatedData.storedDate = new Date(storedDate).toISOString();
    if (canceledDate) {
      updatedData.canceledDate = new Date(canceledDate).toISOString();
      updatedData.status = "CANCELED";
    } else {
      if (storedDate) updatedData.status = "STORED";
      else if (itemCheckingDate) updatedData.status = "CHECKING";
      else if (receiveDate) updatedData.status = "RECEIVED";
    }

    const updated = await prisma.inbound.update({
      where: { id },
      data: updatedData,
      include: { product: true, supplier: true },
    });

    return apiResponse.success(updated);
  } catch (err) {
    console.error(err);
    return apiResponse.error("Failed to update tracking");
  }
}
