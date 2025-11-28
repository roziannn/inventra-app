import prisma from "@/lib/prisma";
import { CreateOutboundDto, OutboundStatus } from "@/types/outbound";

export const outboundService = {
  getAll: async () => {
    return await prisma.outbound.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
  },

  create: async (payload: CreateOutboundDto) => {
    const status: OutboundStatus = payload.isShipping ? "SHIPPED" : payload.isPickup ? "PICKED_UP" : payload.status ?? "PROCESSING";

    return await prisma.outbound.create({
      data: {
        productId: payload.product,
        qty: payload.qty ?? 0,
        sellingPrice: payload.sellingPrice,
        operationalCost: payload.operationalCost,
        status,
        note: payload.note,
        createdBy: payload.createdBy ?? "administrator",

        // shipping info
        isShipping: payload.isShipping,
        shippingDate: payload.shippingDate ? new Date(payload.shippingDate) : null,
        courier: payload.courier,
        isResi: payload.isResi ?? false,
        resiImg: payload.resiImg,
        resiUploadDate: payload.resiUploadDate ? new Date(payload.resiUploadDate) : null,

        // pickup info
        isPickup: payload.isPickup,
        pickupDate: payload.pickupDate ? new Date(payload.pickupDate) : null,
        pickupBy: payload.pickupBy,
      },
      include: { product: true },
    });
  },

  delete: async (id: number) => {
    return await prisma.outbound.delete({
      where: { id },
    });
  },

  cancel: async (id: number, canceledNote?: string, updatedBy?: string) => {
    return await prisma.outbound.update({
      where: { id },
      data: {
        status: "CANCELED",
        note: canceledNote ?? "Canceled via system",
        updateBy: updatedBy ?? "administrator",
      },
      include: { product: true },
    });
  },
};
